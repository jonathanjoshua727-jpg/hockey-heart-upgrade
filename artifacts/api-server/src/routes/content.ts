import { Router, type IRouter, type Response } from "express";
import { z } from "zod/v4";
import { and, asc, desc, eq } from "drizzle-orm";
import { requireAdmin } from "../lib/adminToken";
import {
  db,
  homepageContentTable,
  pagesTable,
  campaignsTable,
  programsTable,
  newsTable,
  faqsTable,
  siteSettingsTable,
  imagesTable,
} from "@workspace/db";
import {
  campaignInputSchema,
  campaignUpdateSchema,
  contentIdSchema,
  contentSlugSchema,
  faqInputSchema,
  faqUpdateSchema,
  homepageContentInputSchema,
  imageInputSchema,
  imageUpdateSchema,
  newsInputSchema,
  newsUpdateSchema,
  pageContentInputSchema,
  pageContentUpdateSchema,
  programInputSchema,
  programUpdateSchema,
  siteSettingsInputSchema,
  siteSettingsUpdateSchema,
} from "./contentValidation";

const router: IRouter = Router();

router.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return requireAdmin(req, res, next);
  }
  next();
});

function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown,
  res: Response,
): z.output<T> | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request body.",
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return null;
  }
  return parsed.data;
}

function parseParam(
  schema: typeof contentIdSchema | typeof contentSlugSchema,
  value: string,
  name: string,
  res: Response,
): string | null {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;
  res.status(400).json({ error: `Invalid ${name}.` });
  return null;
}

/* ─────────────────────────────────────────────
   Homepage
───────────────────────────────────────────── */

router.get("/content/homepage", async (_req, res) => {
  const [homepage] = await db
    .select()
    .from(homepageContentTable)
    .limit(1);

  res.json(homepage ?? null);
});

router.put("/content/homepage", async (req, res) => {
  const content = parseBody(homepageContentInputSchema, req.body, res);
  if (!content) return;
  const now = new Date();

  const [homepage] = await db
    .insert(homepageContentTable)
    .values({
      id: 1,
      ...content,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: homepageContentTable.id,
      set: {
        ...content,
        updatedAt: now,
      },
    })
    .returning();

  res.json(homepage);
});


/* ─────────────────────────────────────────────
   Pages
───────────────────────────────────────────── */

router.get("/content/pages", async (_req, res) => {
  const pages = await db
    .select()
    .from(pagesTable)
    .orderBy(asc(pagesTable.slug));

  res.json(pages);
});

router.get("/content/pages/:slug", async (req, res) => {
  const [page] = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.slug, req.params.slug))
    .limit(1);

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  res.json(page);
});

router.put("/content/pages/:slug", async (req, res) => {
  const slug = parseParam(contentSlugSchema, req.params.slug, "page slug", res);
  if (!slug) return;
  const content = parseBody(pageContentInputSchema, req.body, res);
  if (!content) return;
  const now = new Date();

  const [page] = await db
    .insert(pagesTable)
    .values({
      slug,
      ...content,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pagesTable.slug,
      set: {
        slug,
        ...content,
        updatedAt: now,
      },
    })
    .returning();

  res.json(page);
});


/* ─────────────────────────────────────────────
   Campaigns
───────────────────────────────────────────── */

router.get("/content/campaigns", async (_req, res) => {
  const campaigns = await db
    .select()
    .from(campaignsTable)
    .orderBy(desc(campaignsTable.createdAt));

  res.json(campaigns);
});

router.get("/content/campaigns/:slug", async (req, res) => {
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.slug, req.params.slug))
    .limit(1);

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json(campaign);
});

router.post("/content/campaigns", async (req, res) => {
  const content = parseBody(campaignInputSchema, req.body, res);
  if (!content) return;
  const [campaign] = await db
    .insert(campaignsTable)
    .values(content)
    .returning();

  res.status(201).json(campaign);
});

router.put("/content/campaigns/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "campaign id", res);
  if (!id) return;
  const content = parseBody(campaignUpdateSchema, req.body, res);
  if (!content) return;
  const [campaign] = await db
    .update(campaignsTable)
    .set({
      ...content,
      updatedAt: new Date(),
    })
    .where(eq(campaignsTable.id, id))
    .returning();

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json(campaign);
});

router.delete("/content/campaigns/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "campaign id", res);
  if (!id) return;
  await db
    .delete(campaignsTable)
    .where(eq(campaignsTable.id, id));

  res.sendStatus(204);
});


/* ─────────────────────────────────────────────
   Programs
───────────────────────────────────────────── */

router.get("/content/programs", async (_req, res) => {
  const programs = await db
    .select()
    .from(programsTable)
    .orderBy(asc(programsTable.title));

  res.json(programs);
});

router.post("/content/programs", async (req, res) => {
  const content = parseBody(programInputSchema, req.body, res);
  if (!content) return;
  const [program] = await db
    .insert(programsTable)
    .values(content)
    .returning();

  res.status(201).json(program);
});

router.put("/content/programs/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "program id", res);
  if (!id) return;
  const content = parseBody(programUpdateSchema, req.body, res);
  if (!content) return;
  const [program] = await db
    .update(programsTable)
    .set({
      ...content,
      updatedAt: new Date(),
    })
    .where(eq(programsTable.id, id))
    .returning();

  if (!program) {
    res.status(404).json({ error: "Program not found" });
    return;
  }

  res.json(program);
});

router.delete("/content/programs/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "program id", res);
  if (!id) return;
  await db
    .delete(programsTable)
    .where(eq(programsTable.id, id));

  res.sendStatus(204);
});


/* ─────────────────────────────────────────────
   News
───────────────────────────────────────────── */

router.get("/content/news", async (_req, res) => {
  const articles = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt));

  res.json(articles);
});

router.get("/content/news/:slug", async (req, res) => {
  const slug = parseParam(contentSlugSchema, req.params.slug, "article slug", res);
  if (!slug) return;
  const [article] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.slug, slug))
    .limit(1);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.post("/content/news", async (req, res) => {
  const content = parseBody(newsInputSchema, req.body, res);
  if (!content) return;
  const [article] = await db
    .insert(newsTable)
    .values(content)
    .returning();

  res.status(201).json(article);
});

router.put("/content/news/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "article id", res);
  if (!id) return;
  const content = parseBody(newsUpdateSchema, req.body, res);
  if (!content) return;
  const [article] = await db
    .update(newsTable)
    .set({
      ...content,
      updatedAt: new Date(),
    })
    .where(eq(newsTable.id, id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.delete("/content/news/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "article id", res);
  if (!id) return;
  await db
    .delete(newsTable)
    .where(eq(newsTable.id, id));

  res.sendStatus(204);
});


/* ─────────────────────────────────────────────
   FAQs
───────────────────────────────────────────── */

router.get("/content/faqs", async (_req, res) => {
  const faqs = await db
    .select()
    .from(faqsTable)
    .where(eq(faqsTable.active, true))
    .orderBy(asc(faqsTable.sortOrder));

  res.json(faqs);
});

router.post("/content/faqs", async (req, res) => {
  const content = parseBody(faqInputSchema, req.body, res);
  if (!content) return;
  const [faq] = await db
    .insert(faqsTable)
    .values(content)
    .returning();

  res.status(201).json(faq);
});

router.put("/content/faqs/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "FAQ id", res);
  if (!id) return;
  const content = parseBody(faqUpdateSchema, req.body, res);
  if (!content) return;
  const [faq] = await db
    .update(faqsTable)
    .set({
      ...content,
      updatedAt: new Date(),
    })
    .where(eq(faqsTable.id, id))
    .returning();

  if (!faq) {
    res.status(404).json({ error: "FAQ not found" });
    return;
  }

  res.json(faq);
});

router.delete("/content/faqs/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "FAQ id", res);
  if (!id) return;
  await db
    .delete(faqsTable)
    .where(eq(faqsTable.id, id));

  res.sendStatus(204);
});


/* ─────────────────────────────────────────────
   Site Settings
───────────────────────────────────────────── */

router.get("/content/settings", async (_req, res) => {
  const [settings] = await db
    .select()
    .from(siteSettingsTable)
    .limit(1);

  res.json(settings ?? null);
});

router.put("/content/settings", async (req, res) => {
  const settingsInput = parseBody(
    siteSettingsUpdateSchema,
    req.body,
    res,
  );
  if (!settingsInput) return;
  const [settings] = await db
    .insert(siteSettingsTable)
    .values({
      id: 1,
      ...settingsInput,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettingsTable.id,
      set: {
        ...settingsInput,
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json(settings);
});


/* ─────────────────────────────────────────────
   Images
───────────────────────────────────────────── */

router.get("/content/images", async (_req, res) => {
  const images = await db
    .select()
    .from(imagesTable)
    .orderBy(asc(imagesTable.sortOrder));

  res.json(images);
});

router.post("/content/images", async (req, res) => {
  const content = parseBody(imageInputSchema, req.body, res);
  if (!content) return;
  const [image] = await db
    .insert(imagesTable)
    .values(content)
    .returning();

  res.status(201).json(image);
});

router.put("/content/images/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "image id", res);
  if (!id) return;
  const content = parseBody(imageUpdateSchema, req.body, res);
  if (!content) return;
  const [image] = await db
    .update(imagesTable)
    .set(content)
    .where(eq(imagesTable.id, id))
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  res.json(image);
});

router.delete("/content/images/:id", async (req, res) => {
  const id = parseParam(contentIdSchema, req.params.id, "image id", res);
  if (!id) return;
  await db
    .delete(imagesTable)
    .where(eq(imagesTable.id, id));

  res.sendStatus(204);
});


export default router;
