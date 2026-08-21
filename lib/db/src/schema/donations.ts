import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const DONATION_STATUSES = [
  "pending",
  "successful",
  "failed",
  "cancelled",
  "refunded",
] as const;
export type DonationStatus = (typeof DONATION_STATUSES)[number];

export const donationsTable = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull(),
    /** Amount in cents (USD minor units) as requested by the donor. */
    amountCents: integer("amount_cents").notNull(),
    /** Amount actually paid according to payment-provider verification (cents). */
    paidAmountCents: integer("paid_amount_cents"),
    currency: text("currency").notNull().default("USD"),
    status: text("status", { enum: DONATION_STATUSES })
      .notNull()
      .default("pending"),
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email").notNull(),
    anonymous: boolean("anonymous").notNull().default(false),
    causeId: text("cause_id").notNull(),
    causeLabel: text("cause_label").notNull(),
    message: text("message"),
    /** Requested payment method: card | bank_transfer */
    method: text("method").notNull(),
    /** Actual channel reported by the payment provider after verification. */
    channel: text("channel"),
    paystackId: text("paystack_id"),
    gatewayResponse: text("gateway_response"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundReason: text("refund_reason"),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("donations_reference_unique").on(t.reference),
    index("donations_email_idx").on(t.donorEmail),
    index("donations_status_idx").on(t.status),
    index("donations_cause_idx").on(t.causeId),
    index("donations_created_idx").on(t.createdAt),
  ],
);

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;

export const adminCredentialsTable = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  /** SHA-256 hex of the admin password. */
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export type AdminCredential = typeof adminCredentialsTable.$inferSelect;

/**
 * Singleton payment configuration row (id = 1).
 * Gateway credentials are never stored here; they remain in Replit Secrets.
 */
export const paymentSettingsTable = pgTable("payment_settings", {
  id: integer("id").primaryKey(),
  cardEnabled: boolean("card_enabled").notNull().default(true),
  bankTransferEnabled: boolean("bank_transfer_enabled").notNull().default(false),
  cryptoEnabled: boolean("crypto_enabled").notNull().default(false),
  bitcoinWallet: text("bitcoin_wallet").notNull().default(""),
  ethereumWallet: text("ethereum_wallet").notNull().default(""),
  usdtTrc20Wallet: text("usdt_trc20_wallet").notNull().default(""),
  usdtErc20Wallet: text("usdt_erc20_wallet").notNull().default(""),
  solanaWallet: text("solana_wallet").notNull().default(""),
  bankName: text("bank_name").notNull().default(""),
  accountName: text("account_name").notNull().default("Hockey Heart Initiative"),
  accountNumber: text("account_number").notNull().default(""),
  routingNumber: text("routing_number").notNull().default(""),
  swiftCode: text("swift_code").notNull().default(""),
  bankInstructions: text("bank_instructions")
    .notNull()
    .default(
      "Please include your full name and email address as the payment reference so we can match your donation.",
    ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export type PaymentSetting = typeof paymentSettingsTable.$inferSelect;
