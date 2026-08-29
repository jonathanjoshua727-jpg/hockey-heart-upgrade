import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ─────────────────────────────────────────────
   Homepage
───────────────────────────────────────────── */

export const homepageContentTable = pgTable("homepage_content", {
  id: integer("id").primaryKey().default(1),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroDescription: text("hero_description").notNull(),
  heroImage: text("hero_image"),
  heroPrimaryButtonText: text("hero_primary_button_text").notNull(),
  heroPrimaryButtonUrl: text("hero_primary_button_url").notNull(),
  heroSecondaryButtonText: text("hero_secondary_button_text").notNull(),
  heroSecondaryButtonUrl: text("hero_secondary_button_url").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertHomepageContentSchema =
  createInsertSchema(homepageContentTable).omit({ id: true });

export type InsertHomepageContent = z.infer<typeof insertHomepageContentSchema>;
export type HomepageContent = typeof homepageContentTable.$inferSelect;


/* ─────────────────────────────────────────────
   Pages
───────────────────────────────────────────── */

export const pagesTable = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  published: boolean("published").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPageSchema =
  createInsertSchema(pagesTable).omit({ id: true });

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pagesTable.$inferSelect;


/* ─────────────────────────────────────────────
   Campaigns
───────────────────────────────────────────── */

export const campaignsTable = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  description: text("description"),
  image: text("image"),
  goalCents: integer("goal_cents"),
  raisedCents: integer("raised_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCampaignSchema =
  createInsertSchema(campaignsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;


/* ─────────────────────────────────────────────
   Programs / Donation Causes
───────────────────────────────────────────── */

export const programsTable = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertProgramSchema =
  createInsertSchema(programsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programsTable.$inferSelect;


/* ─────────────────────────────────────────────
   News
───────────────────────────────────────────── */

export const newsTable = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  image: text("image"),
  author: text("author"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertNewsSchema =
  createInsertSchema(newsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;


/* ─────────────────────────────────────────────
   FAQs
───────────────────────────────────────────── */

export const faqsTable = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertFaqSchema =
  createInsertSchema(faqsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqsTable.$inferSelect;


/* ─────────────────────────────────────────────
   Site Settings
───────────────────────────────────────────── */

export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("Hockey Heart Initiative"),
  tagline: text("tagline").notNull().default("Play. Heal. Thrive."),
  logo: text("logo"),
  favicon: text("favicon"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  mailingAddress: text("mailing_address"),
  socialLinks: jsonb("social_links")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSiteSettingsSchema =
  createInsertSchema(siteSettingsTable).omit({ id: true });

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;


/* ─────────────────────────────────────────────
   Gallery / Images
───────────────────────────────────────────── */

export const imagesTable = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertImageSchema =
  createInsertSchema(imagesTable).omit({
    id: true,
    createdAt: true,
  });

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof imagesTable.$inferSelect;
