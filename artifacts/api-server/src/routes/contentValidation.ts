import { z } from "zod/v4";

const text = (max: number) => z.string().max(max);
const requiredText = (max: number) => text(max).trim().min(1);
const optionalText = (max: number) => text(max).nullable().optional();
const jsonContent = z.record(z.string(), z.unknown()).optional();

function updateSchema<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0);
}

const homepageContentShape = {
  heroTitle: requiredText(300),
  heroSubtitle: requiredText(500),
  heroDescription: requiredText(10_000),
  heroImage: optionalText(2_048),
  heroPrimaryButtonText: requiredText(120),
  heroPrimaryButtonUrl: requiredText(2_048),
  heroSecondaryButtonText: requiredText(120),
  heroSecondaryButtonUrl: requiredText(2_048),
  content: jsonContent,
  seoTitle: optionalText(300),
  seoDescription: optionalText(1_000),
};

const pageContentShape = {
  title: requiredText(300),
  content: jsonContent,
  published: z.boolean().optional(),
  seoTitle: optionalText(300),
  seoDescription: optionalText(1_000),
};

const campaignShape = {
  slug: requiredText(200),
  title: requiredText(300),
  summary: optionalText(2_000),
  description: optionalText(20_000),
  image: optionalText(2_048),
  goalCents: z.number().int().nonnegative().nullable().optional(),
  raisedCents: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  content: jsonContent,
};

const programShape = {
  slug: requiredText(200),
  title: requiredText(300),
  description: optionalText(20_000),
  image: optionalText(2_048),
  active: z.boolean().optional(),
  content: jsonContent,
};

const newsShape = {
  slug: requiredText(200),
  title: requiredText(300),
  excerpt: optionalText(2_000),
  content: requiredText(100_000),
  image: optionalText(2_048),
  author: optionalText(200),
  published: z.boolean().optional(),
  publishedAt: z
    .union([z.date(), z.iso.datetime().transform((value) => new Date(value))])
    .nullable()
    .optional(),
  seoTitle: optionalText(300),
  seoDescription: optionalText(1_000),
};

const faqShape = {
  question: requiredText(2_000),
  answer: requiredText(20_000),
  category: optionalText(200),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
};

const siteSettingsShape = {
  siteName: requiredText(300).optional(),
  tagline: requiredText(500).optional(),
  logo: optionalText(2_048),
  favicon: optionalText(2_048),
  contactEmail: z.union([z.email(), z.literal("")]).nullable().optional(),
  contactPhone: optionalText(100),
  mailingAddress: optionalText(1_000),
  socialLinks: z.record(z.string(), z.string().max(2_048)).optional(),
  seoTitle: optionalText(300),
  seoDescription: optionalText(1_000),
};

const imageShape = {
  name: requiredText(300),
  url: requiredText(2_048),
  altText: optionalText(1_000),
  category: optionalText(200),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
};

export const homepageContentInputSchema = z
  .object(homepageContentShape)
  .strict();
export const pageContentInputSchema = z.object(pageContentShape).strict();
export const campaignInputSchema = z.object(campaignShape).strict();
export const programInputSchema = z.object(programShape).strict();
export const newsInputSchema = z.object(newsShape).strict();
export const faqInputSchema = z.object(faqShape).strict();
export const siteSettingsInputSchema = z.object(siteSettingsShape).strict();
export const imageInputSchema = z.object(imageShape).strict();

export const pageContentUpdateSchema = updateSchema(pageContentShape);
export const campaignUpdateSchema = updateSchema(campaignShape);
export const programUpdateSchema = updateSchema(programShape);
export const newsUpdateSchema = updateSchema(newsShape);
export const faqUpdateSchema = updateSchema(faqShape);
export const siteSettingsUpdateSchema = updateSchema(siteSettingsShape);
export const imageUpdateSchema = updateSchema(imageShape);

export const contentIdSchema = z.uuid();
export const contentSlugSchema = z.string().trim().min(1).max(200);
