import { logger } from "./logger";

export interface DonationEmailData {
  to: string;
  donorName: string;
  amountUsd: number;
  causeLabel: string;
  reference: string;
  date: string;
}

/**
 * Sends the donation confirmation email.
 *
 * No email provider is currently connected. This logs the intent and
 * returns false so that `email_sent_at` stays null — meaning the email
 * can be sent later once a provider (e.g. Resend) is configured,
 * without risking duplicates for donations that were already emailed.
 */
export async function sendDonationConfirmation(
  data: DonationEmailData,
): Promise<boolean> {
  logger.info(
    { reference: data.reference },
    "Donation confirmation email requested (no email provider configured; skipping send)",
  );
  return false;
}
