import { logger } from "./logger";

export interface DonationEmailData {
  to: string;
  donorName: string;
  amountUsd: number;
  causeLabel: string;
  reference: string;
  date: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

const FROM_ADDRESS =
  process.env.DONATION_EMAIL_FROM ??
  "Hockey Heart Initiative <donations@hockeyheartinitiative.com>";
const REPLY_TO = "hockeyheartinitiative@gmail.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: DonationEmailData): string {
  const name = escapeHtml(data.donorName);
  const cause = escapeHtml(data.causeLabel);
  const ref = escapeHtml(data.reference);
  const dateStr = new Date(data.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
    <div style="background: #0a1f44; padding: 28px 32px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Hockey Heart Initiative</h1>
    </div>
    <div style="border: 1px solid #e2e6ee; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
      <h2 style="font-size: 20px; margin: 0 0 16px;">Thank You${name && name !== "Anonymous" ? `, ${name}` : ""}!</h2>
      <p style="line-height: 1.6; font-size: 15px;">Your donation to Hockey Heart Initiative has been received and verified.</p>
      <table style="width: 100%; font-size: 14px; margin: 20px 0; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #6b7280;">Amount</td><td style="text-align: right; font-weight: bold;">$${data.amountUsd.toLocaleString()} USD</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Designation</td><td style="text-align: right;">${cause}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="text-align: right;">${dateStr}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; border-top: 1px solid #e2e6ee;">Reference</td><td style="text-align: right; font-family: monospace; border-top: 1px solid #e2e6ee;">${ref}</td></tr>
      </table>
      <p style="line-height: 1.6; font-size: 14px; color: #4b5563;">Thank you for believing in the power of hockey to create opportunity, build confidence, and bring communities together. Your generosity helps Hockey Heart Initiative turn that belief into meaningful support for players, families, coaches, and communities. Every contribution matters, and we are deeply grateful for your support.</p>
      <p style="line-height: 1.6; font-size: 14px; font-weight: bold;">Thank you for being part of the Hockey Heart Initiative community.</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Hockey Heart Initiative — empowering youth through hockey.<br/>Questions? Reply to this email or contact ${REPLY_TO}.</p>
    </div>
  </div>`;
}

/**
 * Sends the donation confirmation email via the Resend API, authenticated
 * with the RESEND_API_KEY secret. Returns true only when Resend accepted the
 * email — callers use this to keep the one-time `email_sent_at` claim, so no
 * duplicates are possible.
 */
export async function sendDonationConfirmation(
  data: DonationEmailData,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error(
      { reference: data.reference },
      "RESEND_API_KEY is not set; cannot send donation confirmation email",
    );
    return false;
  }
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [data.to],
        reply_to: REPLY_TO,
        subject: `Thank you for your donation — ${data.reference}`,
        html: buildHtml(data),
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      logger.error(
        { reference: data.reference, status: response.status, body: text.slice(0, 300) },
        "Resend rejected donation confirmation email",
      );
      return false;
    }
    const resendBody = (await response.json().catch(() => null)) as { id?: string } | null;
    logger.info(
      { reference: data.reference, resendId: resendBody?.id ?? null },
      "Donation confirmation email sent",
    );
    return true;
  } catch (err) {
    logger.error({ err, reference: data.reference }, "Failed to send donation confirmation email");
    return false;
  }
}
