import { Router, type IRouter } from "express";
import { sendContactMessage } from "../lib/mailer";
import { logger } from "../lib/logger";
import { contactMessageSchema } from "./contactValidation";

const router: IRouter = Router();
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (attempts.size > 10_000) {
      for (const [key, value] of attempts) {
        if (value.resetAt <= now) attempts.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

router.post("/contact", async (req, res) => {
  if (isRateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many messages. Please try again later." });
    return;
  }

  const parsed = contactMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Please provide a name, valid email address, and message.",
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(503).json({ error: "The contact form is temporarily unavailable." });
    return;
  }

  const result = await sendContactMessage(parsed.data);
  if (!result.ok) {
    logger.error(
      { status: result.status, error: result.error },
      "Contact form delivery failed",
    );
    res.status(502).json({
      error: "We couldn't send your message. Please try again or email us directly.",
    });
    return;
  }

  res.status(202).json({ ok: true });
});

export default router;
