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
    /** Amount actually paid according to Paystack verification (cents). */
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
    /** Actual channel reported by Paystack after verification. */
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
