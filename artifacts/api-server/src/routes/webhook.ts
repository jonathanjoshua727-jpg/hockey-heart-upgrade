import { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { db, donationsTable } from "@workspace/db";
import { and, eq, ne } from "drizzle-orm";
import { getFlutterwaveWebhookHash } from "../lib/flutterwave";
import { verifyAndSettle } from "./donations";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type RawBodyRequest = Request & { rawBody?: Buffer };

// Flutterwave webhook. Authenticated via the `verif-hash` header, which must
// match the secret hash the admin configured in the Flutterwave dashboard
// (FLUTTERWAVE_SECRET_HASH). Never trust the payload alone — re-verify with
// Flutterwave's API before settling.
router.post("/flutterwave/webhook", async (req: RawBodyRequest, res) => {
  const secretHash = getFlutterwaveWebhookHash();
  if (!secretHash) {
    logger.warn("Flutterwave webhook received but FLUTTERWAVE_SECRET_HASH is not set");
    res.status(503).json({ error: "Webhook not configured" });
    return;
  }
  const signature = req.headers["verif-hash"];
  if (typeof signature !== "string" || signature.length === 0) {
    res.status(401).json({ error: "Missing signature" });
    return;
  }
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(secretHash);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    logger.warn("Flutterwave webhook: invalid signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body as {
    event?: string;
    "event.type"?: string;
    data?: {
      tx_ref?: string;
      txRef?: string;
      status?: string;
      complete_message?: string;
    };
  };
  const eventType = event.event ?? event["event.type"] ?? "";
  const reference = event.data?.tx_ref ?? event.data?.txRef ?? "";

  try {
    if (/charge/i.test(eventType) && reference) {
      // Re-verify with Flutterwave directly — never trust the webhook payload.
      const { status } = await verifyAndSettle(reference);
      if (status >= 500) {
        // Transient failure (Flutterwave/API unavailable) — retry later.
        res.sendStatus(500);
        return;
      }
    } else if (/refund/i.test(eventType) && reference) {
      const refundStatus = (event.data?.status ?? "").toLowerCase();
      if (refundStatus === "completed" || refundStatus === "processed" || /completed/i.test(eventType)) {
        const now = new Date();
        await db
          .update(donationsTable)
          .set({
            status: "refunded",
            refundedAt: now,
            refundReason: event.data?.complete_message ?? "Refund processed via payment provider",
            updatedAt: now,
          })
          .where(
            and(
              eq(donationsTable.reference, reference),
              // Idempotent: never re-stamp an already-refunded record, so a
              // duplicate refund event can't overwrite refundedAt/reason.
              ne(donationsTable.status, "refunded"),
            ),
          );
      }
    }
  } catch (err) {
    logger.error({ err, eventType, reference }, "Webhook processing error");
    // Processing is idempotent — return 5xx so the provider retries later.
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

export default router;
