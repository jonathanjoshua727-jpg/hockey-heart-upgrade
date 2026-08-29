import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { z } from "zod/v4";
import { db, donationsTable, type Donation } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import {
  flutterwaveCreatePayment,
  flutterwaveVerifyByTxRef,
} from "../lib/flutterwave";
import { sendDonationConfirmation } from "../lib/mailer";
import { logger } from "../lib/logger";
import { getPaymentSettings } from "../lib/paymentSettings";

const router: IRouter = Router();

const MIN_AMOUNT_USD = 50;

/**
 * Production website origin.
 *
 * IMPORTANT:
 * Never use Replit domains, request Host headers, REPLIT_DOMAINS,
 * REPLIT_DEV_DOMAIN, or any development URL for donor redirects.
 */
const PUBLIC_ORIGIN = "https://hockeyheartinitiative.com";

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
      hits.set(ip, {
        count: 1,
        resetAt: nowMs + windowMs,
      });

      if (hits.size > 10_000) {
        for (const [key, value] of hits) {
          if (nowMs > value.resetAt) {
            hits.delete(key);
          }
        }
      }

      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxHits) {
      res
        .status(429)
        .json({ error: "Too many requests. Please try again shortly." });
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
  redirectPath: z
    .string()
    .max(300)
    .regex(/^\/(?!\/)/)
    .optional(),
});

/**
 * Always return the real production website.
 *
 * There is intentionally NO Replit fallback.
 */
export function getCanonicalOrigin(): string {
  return PUBLIC_ORIGIN;
}

function newReference(): string {
  return (
    "HHI-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

function publicDonation(donation: Donation) {
  return {
    reference: donation.reference,
    status: donation.status,
    amount:
      (donation.paidAmountCents ?? donation.amountCents) / 100,
    currency: donation.currency,
    causeLabel: donation.causeLabel,
    method: donation.channel ?? donation.method,
    date: (
      donation.paidAt ?? donation.createdAt
    ).toISOString(),
  };
}

/**
 * Initialize donation.
 */
router.post(
  "/donations/initialize",
  initializeLimiter,
  async (req, res) => {
    const parsed = initializeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid donation details.",
      });
      return;
    }

    const input = parsed.data;

    if (input.amount < MIN_AMOUNT_USD) {
      res.status(400).json({
        error: "Minimum donation is $50 USD.",
      });
      return;
    }

    const paymentSettings = await getPaymentSettings();

    const methodEnabled =
      input.method === "card"
        ? paymentSettings.cardEnabled
        : paymentSettings.bankTransferEnabled;

    if (!methodEnabled) {
      res.status(503).json({
        error:
          input.method === "card"
            ? "Card donations are temporarily unavailable."
            : "Bank transfer donations are temporarily unavailable.",
      });
      return;
    }

    const amountCents = Math.round(input.amount * 100);
    const reference = newReference();

    await db.insert(donationsTable).values({
      reference,
      amountCents,
      currency: "USD",
      status: "pending",
      donorName: input.anonymous
        ? "Anonymous"
        : input.donorName,
      donorEmail: input.email.toLowerCase(),
      anonymous: input.anonymous,
      causeId: input.causeId,
      causeLabel:
        CANONICAL_CAUSES[input.causeId] ??
        input.causeLabel,
      message: input.message || null,
      method: input.method,
    });

    /**
     * ONLY the official Hockey Heart Initiative domain
     * is used for the Flutterwave return URL.
     */
    const redirectUrl =
      `${getCanonicalOrigin()}${input.redirectPath ?? "/donate"}`;

    const payment = await flutterwaveCreatePayment({
      txRef: reference,
      amountUsd: input.amount,
      email: input.email.toLowerCase(),
      name: input.anonymous
        ? "Anonymous Donor"
        : input.donorName,
      redirectUrl,
      paymentOptions:
        input.method === "bank_transfer"
          ? "banktransfer, card"
          : "card",
    });

    if (!payment.ok || !payment.link) {
      logger.error(
        {
          reference,
          error: payment.error,
        },
        "Payment initialization failed",
      );

      await db
        .update(donationsTable)
        .set({
          status: "failed",
          gatewayResponse:
            "Payment initialization failed",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(
              donationsTable.reference,
              reference,
            ),
            eq(
              donationsTable.status,
              "pending",
            ),
          ),
        );

      res.status(502).json({
        error:
          "We couldn't start your donation. Please try again in a moment.",
      });

      return;
    }

    res.json({
      reference,
      amountCents,
      email: input.email.toLowerCase(),
      paymentLink: payment.link,
    });
  },
);

/**
 * Verify and settle a donation.
 */
export async function verifyAndSettle(
  reference: string,
): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  const [record] = await db
    .select()
    .from(donationsTable)
    .where(
      eq(
        donationsTable.reference,
        reference,
      ),
    )
    .limit(1);

  if (!record) {
    return {
      status: 404,
      body: {
        error: "Unknown donation reference.",
      },
    };
  }

  if (
    record.status === "successful" ||
    record.status === "refunded"
  ) {
    return {
      status: 200,
      body: {
        verified: true,
        donation: publicDonation(record),
      },
    };
  }

  const result =
    await flutterwaveVerifyByTxRef(reference);

  const now = new Date();

  if (result.notFound) {
    return {
      status: 402,
      body: {
        verified: false,
        retryable: true,
        error:
          "We couldn't complete your donation. No successful donation was recorded. Please try again.",
      },
    };
  }

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
  const paidCents = Math.round(
    data.amount * 100,
  );

  if (data.status === "successful") {
    const amountOk =
      data.currency === record.currency &&
      paidCents >= record.amountCents;

    if (!amountOk) {
      await db
        .update(donationsTable)
        .set({
          status: "failed",
          paidAmountCents: paidCents,
          gatewayResponse:
            `Amount/currency mismatch (paid ${data.amount} ${data.currency}, expected ${record.amountCents / 100} ${record.currency})`,
          updatedAt: now,
        })
        .where(
          and(
            eq(
              donationsTable.reference,
              reference,
            ),
            eq(
              donationsTable.status,
              "pending",
            ),
          ),
        );

      logger.warn(
        { reference },
        "Donation amount mismatch",
      );

      return {
        status: 409,
        body: {
          verified: false,
          error:
            "We couldn't complete your donation. No successful donation was recorded. Please try again.",
        },
      };
    }

    /**
     * IMPORTANT:
     * No Paystack ID is written here.
     *
     * The existing database column can remain temporarily
     * for migration compatibility, but the application no
     * longer uses it.
     */
    const updated = await db
      .update(donationsTable)
      .set({
        status: "successful",
        paidAmountCents: paidCents,
        channel: data.payment_type,
        gatewayResponse:
          data.processor_response,
        verifiedAt: now,
        paidAt: data.created_at
          ? new Date(data.created_at)
          : now,
        updatedAt: now,
      })
      .where(
        and(
          eq(
            donationsTable.reference,
            reference,
          ),
          eq(
            donationsTable.status,
            "pending",
          ),
        ),
      )
      .returning();

    const donation =
      updated[0] ??
      (
        await db
          .select()
          .from(donationsTable)
          .where(
            eq(
              donationsTable.reference,
              reference,
            ),
          )
          .limit(1)
      )[0] ??
      record;

    if (
      donation.status !== "successful" &&
      donation.status !== "refunded"
    ) {
      return {
        status: 409,
        body: {
          verified: false,
          error:
            "We couldn't complete your donation. No successful donation was recorded. Please try again.",
        },
      };
    }

    /**
     * Send confirmation email once.
     */
    const claimed = await db
      .update(donationsTable)
      .set({
        emailSentAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(
            donationsTable.reference,
            reference,
          ),
          isNull(
            donationsTable.emailSentAt,
          ),
        ),
      )
      .returning({
        id: donationsTable.id,
      });

    if (claimed.length > 0) {
      const sent =
        await sendDonationConfirmation({
          to: donation.donorEmail,
          donorName: donation.donorName,
          amountUsd:
            (donation.paidAmountCents ??
              donation.amountCents) /
            100,
          causeLabel:
            donation.causeLabel,
          reference:
            donation.reference,
          date: now.toISOString(),
        }).catch(() => false);

      if (!sent) {
        await db
          .update(donationsTable)
          .set({
            emailSentAt: null,
            updatedAt: new Date(),
          })
          .where(
            eq(
              donationsTable.reference,
              reference,
            ),
          );
      }
    }

    return {
      status: 200,
      body: {
        verified: true,
        donation: publicDonation(donation),
      },
    };
  }

  if (data.status === "pending") {
    return {
      status: 402,
      body: {
        verified: false,
        retryable: true,
        error:
          "Your payment is still processing. If it completes, your donation will be confirmed by email.",
      },
    };
  }

  const failedStatus = /cancel|abandon/i.test(
    data.status,
  )
    ? "cancelled"
    : "failed";

  await db
    .update(donationsTable)
    .set({
      status: failedStatus,
      gatewayResponse:
        data.processor_response,
      updatedAt: now,
    })
    .where(
      and(
        eq(
          donationsTable.reference,
          reference,
        ),
        eq(
          donationsTable.status,
          "pending",
        ),
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

/**
 * Frontend verification after returning from checkout.
 */
router.post(
  "/donations/verify",
  verifyLimiter,
  async (req, res) => {
    const parsed = z
      .object({
        reference: z
          .string()
          .min(1)
          .max(200),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Missing reference.",
      });
      return;
    }

    try {
      const { status, body } =
        await verifyAndSettle(
          parsed.data.reference,
        );

      res.status(status).json(body);
    } catch (err) {
      logger.error(
        { err },
        "Donation verification error",
      );

      res.status(500).json({
        verified: false,
        error:
          "We couldn't complete your donation. No successful donation was recorded. Please try again.",
      });
    }
  },
);

export default router;
