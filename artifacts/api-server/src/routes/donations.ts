import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { z } from "zod/v4";
import { db, donationsTable, type Donation } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { paystackVerify } from "../lib/paystack";
import { sendDonationConfirmation } from "../lib/mailer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const MIN_AMOUNT_USD = 50;

// Canonical seeded programs. If a donation targets a known program id, the
// label is forced to the canonical one server-side so a tampered client
// cannot mislabel an allocation. Unknown ids are still accepted (admins can
// configure additional programs), but their labels are stored as provided.
const CANONICAL_CAUSES: Record<string, string> = {
  general: "Where Needed Most",
  "winter-equipment": "Winter Equipment Drive 2026",
  "rink-access": "Community Rink Access Fund",
  "coaching-cert": "Youth Coaching Certification Program",
  education: "Hockey Education Initiative",
  "mobile-outreach": "Community Outreach Mobile Program",
  "family-support": "Hockey Family Emergency Support",
  "girls-women": "Girls & Women in Hockey Initiative",
  "community-dev": "Hockey Community Development Fund",
};

// ── Minimal in-memory rate limiter for public donation routes ─────────────
function makeRateLimiter(maxHits: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function rateLimit(
    req: Parameters<Parameters<IRouter["post"]>[1]>[0],
    res: Parameters<Parameters<IRouter["post"]>[1]>[1],
    next: () => void,
  ) {
    const ip = req.ip ?? "unknown";
    const nowMs = Date.now();
    const entry = hits.get(ip);
    if (!entry || nowMs > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: nowMs + windowMs });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (nowMs > v.resetAt) hits.delete(k);
      }
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > maxHits) {
      res.status(429).json({ error: "Too many requests. Please try again shortly." });
      return;
    }
    next();
  };
}

const initializeLimiter = makeRateLimiter(15, 10 * 60 * 1000);
const verifyLimiter = makeRateLimiter(60, 10 * 60 * 1000);

const initializeSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: z.literal("USD"),
  causeId: z.string().min(1).max(100),
  causeLabel: z.string().min(1).max(200),
  donorName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  anonymous: z.boolean().default(false),
  message: z.string().max(2000).optional(),
  method: z.enum(["card", "bank_transfer"]),
});

function newReference(): string {
  return (
    "HHI-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

function publicDonation(d: Donation) {
  return {
    reference: d.reference,
    status: d.status,
    amount: (d.paidAmountCents ?? d.amountCents) / 100,
    currency: d.currency,
    causeLabel: d.causeLabel,
    method: d.channel ?? d.method,
    date: (d.paidAt ?? d.createdAt).toISOString(),
  };
}

// ── Initialize: create a pending record server-side ───────────────────────
router.post("/donations/initialize", initializeLimiter, async (req, res) => {
  const parsed = initializeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid donation details." });
    return;
  }
  const input = parsed.data;
  if (input.amount < MIN_AMOUNT_USD) {
    res.status(400).json({ error: "Minimum donation is $50 USD." });
    return;
  }
  const amountCents = Math.round(input.amount * 100);
  const reference = newReference();

  await db.insert(donationsTable).values({
    reference,
    amountCents,
    currency: "USD",
    status: "pending",
    donorName: input.anonymous ? "Anonymous" : input.donorName,
    donorEmail: input.email.toLowerCase(),
    anonymous: input.anonymous,
    causeId: input.causeId,
    causeLabel: CANONICAL_CAUSES[input.causeId] ?? input.causeLabel,
    message: input.message || null,
    method: input.method,
  });

  res.json({ reference, amountCents, email: input.email.toLowerCase() });
});

// ── Shared verification logic (used by verify endpoint + webhook) ─────────
export async function verifyAndSettle(
  reference: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const [record] = await db
    .select()
    .from(donationsTable)
    .where(eq(donationsTable.reference, reference))
    .limit(1);

  if (!record) return { status: 404, body: { error: "Unknown donation reference." } };

  // Idempotent: already settled
  if (record.status === "successful" || record.status === "refunded") {
    return { status: 200, body: { verified: true, donation: publicDonation(record) } };
  }

  const result = await paystackVerify(reference);
  if (!result.ok || !result.data) {
    return {
      status: 502,
      body: {
        verified: false,
        error:
          "We couldn't complete your donation. No successful donation was recorded. Please try again.",
      },
    };
  }

  const data = result.data;
  const now = new Date();

  if (data.status === "success") {
    // Amount/currency tamper check — the paid amount must cover the pledge.
    const amountOk =
      data.currency === record.currency && data.amount >= record.amountCents;
    if (!amountOk) {
      await db
        .update(donationsTable)
        .set({
          status: "failed",
          paidAmountCents: data.amount,
          gatewayResponse: `Amount/currency mismatch (paid ${data.amount} ${data.currency}, expected ${record.amountCents} ${record.currency})`,
          paystackId: String(data.id),
          updatedAt: now,
        })
        .where(
          and(
            eq(donationsTable.reference, reference),
            eq(donationsTable.status, "pending"),
          ),
        );
      logger.warn({ reference }, "Donation amount mismatch on verification");
      return {
        status: 409,
        body: {
          verified: false,
          error:
            "We couldn't complete your donation. No successful donation was recorded. Please try again.",
        },
      };
    }

    // Atomic transition pending -> successful (guards concurrent webhook +
    // verify, and never overwrites a terminal refunded/failed state).
    const updated = await db
      .update(donationsTable)
      .set({
        status: "successful",
        paidAmountCents: data.amount,
        channel: data.channel,
        gatewayResponse: data.gateway_response,
        paystackId: String(data.id),
        verifiedAt: now,
        paidAt: data.paid_at ? new Date(data.paid_at) : now,
        updatedAt: now,
      })
      .where(
        and(
          eq(donationsTable.reference, reference),
          eq(donationsTable.status, "pending"),
        ),
      )
      .returning();

    // If we lost the race, re-read the settled record.
    const donation =
      updated[0] ??
      (
        await db
          .select()
          .from(donationsTable)
          .where(eq(donationsTable.reference, reference))
          .limit(1)
      )[0] ??
      record;

    if (donation.status !== "successful" && donation.status !== "refunded") {
      return {
        status: 409,
        body: {
          verified: false,
          error:
            "We couldn't complete your donation. No successful donation was recorded. Please try again.",
        },
      };
    }

    // Confirmation email — claim atomically so only one sender wins.
    const claimed = await db
      .update(donationsTable)
      .set({ emailSentAt: now, updatedAt: now })
      .where(
        and(
          eq(donationsTable.reference, reference),
          isNull(donationsTable.emailSentAt),
        ),
      )
      .returning({ id: donationsTable.id });
    if (claimed.length > 0) {
      const sent = await sendDonationConfirmation({
        to: donation.donorEmail,
        donorName: donation.donorName,
        amountUsd: (donation.paidAmountCents ?? donation.amountCents) / 100,
        causeLabel: donation.causeLabel,
        reference: donation.reference,
        date: now.toISOString(),
      }).catch(() => false);
      if (!sent) {
        // Release the claim so the email can be sent once a provider exists.
        await db
          .update(donationsTable)
          .set({ emailSentAt: null, updatedAt: new Date() })
          .where(eq(donationsTable.reference, reference));
      }
    }

    return { status: 200, body: { verified: true, donation: publicDonation(donation) } };
  }

  // Not successful — record failure (abandoned/failed/etc.)
  const failedStatus = data.status === "abandoned" ? "cancelled" : "failed";
  await db
    .update(donationsTable)
    .set({
      status: failedStatus,
      gatewayResponse: data.gateway_response,
      paystackId: String(data.id),
      updatedAt: now,
    })
    .where(
      and(
        eq(donationsTable.reference, reference),
        eq(donationsTable.status, "pending"),
      ),
    );

  return {
    status: 402,
    body: {
      verified: false,
      error:
        "We couldn't complete your donation. No successful donation was recorded. Please try again.",
    },
  };
}

// ── Verify: called by the frontend after Paystack popup callback ──────────
router.post("/donations/verify", verifyLimiter, async (req, res) => {
  const parsed = z.object({ reference: z.string().min(1).max(200) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing reference." });
    return;
  }
  try {
    const { status, body } = await verifyAndSettle(parsed.data.reference);
    res.status(status).json(body);
  } catch (err) {
    logger.error({ err }, "Donation verification error");
    res.status(500).json({
      verified: false,
      error:
        "We couldn't complete your donation. No successful donation was recorded. Please try again.",
    });
  }
});

export default router;
