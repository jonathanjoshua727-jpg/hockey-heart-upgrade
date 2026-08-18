import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, donationsTable, adminCredentialsTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { issueAdminToken, requireAdmin } from "../lib/adminToken";
import { logger } from "../lib/logger";
import { sendDonationConfirmationDetailed } from "../lib/mailer";

const router: IRouter = Router();

// ── Salted scrypt password hashing ────────────────────────────────────────
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts[0] !== "scrypt" || parts.length !== 3) return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = crypto.scryptSync(password, parts[1], 64);
  return (
    expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  );
}

// ── Simple in-memory login rate limiting ──────────────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

// ── Login (bootstraps the first admin account) ────────────────────────────
router.post("/admin/login", async (req, res) => {
  if (rateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }
  const parsed = z
    .object({
      username: z.string().min(1).max(100),
      password: z.string().min(8).max(200),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials." });
    return;
  }
  const username = parsed.data.username.toLowerCase().trim();

  const existing = await db.select().from(adminCredentialsTable).limit(1);

  if (existing.length === 0) {
    // First login bootstraps the server-side admin account. The insert is
    // guarded by the unique constraint + re-check to avoid a bootstrap race.
    try {
      await db
        .insert(adminCredentialsTable)
        .values({ username, passwordHash: hashPassword(parsed.data.password) });
      logger.warn({ username }, "Bootstrapped server-side admin account (first login)");
      res.json({ token: issueAdminToken(username) });
      return;
    } catch {
      // Someone else bootstrapped concurrently — fall through to verification.
    }
  }

  const [account] = await db.select().from(adminCredentialsTable).limit(1);
  const ok =
    !!account &&
    account.username === username &&
    verifyPassword(parsed.data.password, account.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }
  res.json({ token: issueAdminToken(username) });
});

// ── Update credentials (requires valid session) ───────────────────────────
router.post("/admin/credentials", requireAdmin, async (req, res) => {
  const parsed = z
    .object({
      username: z.string().min(1).max(100),
      password: z.string().min(8).max(200),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials." });
    return;
  }
  const username = parsed.data.username.toLowerCase().trim();
  const passwordHash = hashPassword(parsed.data.password);
  const existing = await db.select().from(adminCredentialsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(adminCredentialsTable).values({ username, passwordHash });
  } else {
    await db
      .update(adminCredentialsTable)
      .set({ username, passwordHash })
      .where(eq(adminCredentialsTable.id, existing[0].id));
  }
  res.json({ ok: true, token: issueAdminToken(username) });
});

// ── List donations with search/filter ─────────────────────────────────────
router.get("/admin/donations", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const causeId = typeof req.query.causeId === "string" ? req.query.causeId : "";
  const limit = Math.min(Number(req.query.limit) || 200, 500);

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(donationsTable.status, status as never));
  }
  if (causeId) conditions.push(eq(donationsTable.causeId, causeId));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(donationsTable.donorName, pattern),
        ilike(donationsTable.donorEmail, pattern),
        ilike(donationsTable.reference, pattern),
      ),
    );
  }

  const rows = await db
    .select()
    .from(donationsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(donationsTable.createdAt))
    .limit(limit);

  res.json({
    donations: rows.map((d) => ({
      id: d.id,
      reference: d.reference,
      amount: (d.paidAmountCents ?? d.amountCents) / 100,
      currency: d.currency,
      status: d.status,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      anonymous: d.anonymous,
      causeId: d.causeId,
      causeLabel: d.causeLabel,
      message: d.message,
      method: d.channel ?? d.method,
      verifiedAt: d.verifiedAt,
      refundedAt: d.refundedAt,
      refundReason: d.refundReason,
      date: (d.paidAt ?? d.createdAt).toISOString(),
    })),
  });
});

// ── Aggregate stats ────────────────────────────────────────────────────────
router.get("/admin/donations/stats", requireAdmin, async (_req, res) => {
  const [totals] = await db
    .select({
      totalRaisedCents: sql<number>`coalesce(sum(case when ${donationsTable.status} = 'successful' then coalesce(${donationsTable.paidAmountCents}, ${donationsTable.amountCents}) else 0 end), 0)`,
      successfulCount: sql<number>`count(*) filter (where ${donationsTable.status} = 'successful')`,
      pendingCount: sql<number>`count(*) filter (where ${donationsTable.status} = 'pending')`,
      failedCount: sql<number>`count(*) filter (where ${donationsTable.status} = 'failed')`,
      cancelledCount: sql<number>`count(*) filter (where ${donationsTable.status} = 'cancelled')`,
      refundedCount: sql<number>`count(*) filter (where ${donationsTable.status} = 'refunded')`,
    })
    .from(donationsTable);

  const byCause = await db
    .select({
      causeId: donationsTable.causeId,
      causeLabel: donationsTable.causeLabel,
      totalCents: sql<number>`sum(coalesce(${donationsTable.paidAmountCents}, ${donationsTable.amountCents}))`,
      count: sql<number>`count(*)`,
    })
    .from(donationsTable)
    .where(eq(donationsTable.status, "successful"))
    .groupBy(donationsTable.causeId, donationsTable.causeLabel)
    .orderBy(desc(sql`sum(coalesce(${donationsTable.paidAmountCents}, ${donationsTable.amountCents}))`));

  const byMethod = await db
    .select({
      method: sql<string>`coalesce(${donationsTable.channel}, ${donationsTable.method})`,
      totalCents: sql<number>`sum(coalesce(${donationsTable.paidAmountCents}, ${donationsTable.amountCents}))`,
      count: sql<number>`count(*)`,
    })
    .from(donationsTable)
    .where(eq(donationsTable.status, "successful"))
    .groupBy(sql`coalesce(${donationsTable.channel}, ${donationsTable.method})`);

  const byCurrency = await db
    .select({
      currency: donationsTable.currency,
      totalCents: sql<number>`sum(coalesce(${donationsTable.paidAmountCents}, ${donationsTable.amountCents}))`,
      count: sql<number>`count(*)`,
    })
    .from(donationsTable)
    .where(eq(donationsTable.status, "successful"))
    .groupBy(donationsTable.currency);

  res.json({
    totalRaised: Number(totals.totalRaisedCents) / 100,
    counts: {
      successful: Number(totals.successfulCount),
      pending: Number(totals.pendingCount),
      failed: Number(totals.failedCount),
      cancelled: Number(totals.cancelledCount),
      refunded: Number(totals.refundedCount),
    },
    byCause: byCause.map((c) => ({
      causeId: c.causeId,
      causeLabel: c.causeLabel,
      total: Number(c.totalCents) / 100,
      count: Number(c.count),
    })),
    byMethod: byMethod.map((m) => ({
      method: m.method,
      total: Number(m.totalCents) / 100,
      count: Number(m.count),
    })),
    byCurrency: byCurrency.map((c) => ({
      currency: c.currency,
      total: Number(c.totalCents) / 100,
      count: Number(c.count),
    })),
  });
});

// ── Send a test donation confirmation email ───────────────────────────────
router.post("/admin/test-email", requireAdmin, async (req, res) => {
  // Tolerant parsing: accept `to` as a string, trim whitespace, then validate.
  const parsed = z
    .object({ to: z.string().trim().max(320).pipe(z.email()) })
    .safeParse(req.body);
  if (!parsed.success) {
    const received =
      typeof (req.body as { to?: unknown })?.to === "string"
        ? String((req.body as { to: string }).to).slice(0, 100)
        : undefined;
    logger.warn({ received }, "Test email request had an invalid recipient");
    res.status(400).json({
      error: received
        ? `"${received}" is not a valid email address. Use a plain address like name@example.com.`
        : "Missing recipient — send a JSON body like { \"to\": \"name@example.com\" }.",
    });
    return;
  }
  const to = parsed.data.to;
  const testRef = "HHI-TEST-" + Date.now().toString(36).toUpperCase();
  const result = await sendDonationConfirmationDetailed({
    to,
    donorName: "Test Donor",
    amountUsd: 100,
    causeLabel: "General Support",
    reference: testRef,
    date: new Date().toISOString(),
  }).catch(() => ({ ok: false as const, error: "Unexpected error while sending." }));

  if (result.ok) {
    logger.info(
      { to, reference: testRef, resendId: (result as { id?: string }).id ?? null },
      "Test donation confirmation email sent by admin",
    );
    res.json({ ok: true, message: `Test email sent to ${to} (reference: ${testRef})` });
  } else {
    logger.warn({ to, error: result.error }, "Test email send failed");
    res.status(502).json({ ok: false, error: result.error ?? "Sending failed." });
  }
});

// ── Check Resend domain verification status ───────────────────────────────
router.get("/admin/email-domain-status", requireAdmin, async (_req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "RESEND_API_KEY is not configured." });
    return;
  }
  try {
    // Attempt to list domains — this requires a full API key (not a sending-only key).
    // If the key is scoped to sending only, the 403 response says so explicitly.
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;

    if (!response.ok) {
      const message =
        response.status === 403
          ? "API key does not have permission to list domains. Open https://resend.com/domains in the Resend dashboard to verify hockeyheartinitiative.com."
          : `Resend API returned ${response.status}.`;
      res.status(200).json({ canListDomains: false, status: response.status, message, raw: body });
      return;
    }

    // Find our domain in the list
    type ResendDomain = { id: string; name: string; status: string; records?: unknown[] };
    const domains: ResendDomain[] = Array.isArray((body as { data?: unknown[] })?.data)
      ? ((body as { data: ResendDomain[] }).data)
      : [];
    const ours = domains.find((d) => d.name === "hockeyheartinitiative.com");
    res.json({
      canListDomains: true,
      domain: ours ?? null,
      allDomains: domains.map((d) => ({ id: d.id, name: d.name, status: d.status })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to query Resend domains");
    res.status(502).json({ error: "Could not reach Resend API." });
  }
});

export default router;
