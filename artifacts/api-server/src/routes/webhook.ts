import { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { db, donationsTable } from "@workspace/db";
import { and, eq, ne } from "drizzle-orm";
import { getPaystackSecret } from "../lib/paystack";
import { verifyAndSettle } from "./donations";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type RawBodyRequest = Request & { rawBody?: Buffer };

router.post("/paystack/webhook", async (req: RawBodyRequest, res) => {
  const signature = req.headers["x-paystack-signature"];
  const raw = req.rawBody;
  if (!raw || typeof signature !== "string") {
    res.status(401).json({ error: "Missing signature" });
    return;
  }
  const expected = crypto
    .createHmac("sha512", getPaystackSecret())
    .update(raw)
    .digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    logger.warn("Paystack webhook: invalid signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body as {
    event?: string;
    data?: { reference?: string; transaction_reference?: string; merchant_note?: string; status?: string };
  };
  const eventType = event.event ?? "";
  const reference =
    event.data?.reference ?? event.data?.transaction_reference ?? "";

  try {
    if (eventType === "charge.success" && reference) {
      // Re-verify with Paystack directly — never trust the webhook payload alone.
      const { status } = await verifyAndSettle(reference);
      if (status >= 500) {
        // Transient failure (Paystack/API unavailable) — ask Paystack to retry.
        res.sendStatus(500);
        return;
      }
    } else if (eventType.startsWith("refund.") && reference) {
      if (event.data?.status === "processed" || eventType === "refund.processed") {
        const now = new Date();
        await db
          .update(donationsTable)
          .set({
            status: "refunded",
            refundedAt: now,
            refundReason: event.data?.merchant_note ?? "Refund processed via Paystack",
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
    // Processing is idempotent — return 5xx so Paystack retries later.
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

export default router;
