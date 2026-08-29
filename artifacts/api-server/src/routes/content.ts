import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
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

const router: IRouter = Router();

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
  const now = new Date();

  const [homepage] = await db
    .insert(homepageContentTable)
    .values({
      id: 1,
      ...req.body,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: homepageContentTable.id,
      set: {
        ...req.body,
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
  const now = new Date();

  const [page] = await db
    .insert(pagesTable)
    .values({
      slug: req.params.slug,
      ...req.body,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pagesTable.slug,
      set: {
        ...req.body,
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
  const [campaign] = await db
    .insert(campaignsTable)
    .values(req.body)
    .returning();

  res.status(201).json(campaign);
});

router.put("/content/campaigns/:id", async (req, res) => {
  const [campaign] = await db
    .update(campaignsTable)
    .set({
      ...req.body,
      updatedAt: new Date(),
    })
    .where(eq(campaignsTable.id, req.params.id))
    .returning();

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json(campaign);
});

router.delete("/content/campaigns/:id", async (req, res) => {
  await db
    .delete(campaignsTable)
    .where(eq(campaignsTable.id, req.params.id));

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
  const [program] = await db
    .insert(programsTable)
    .values(req.body)
    .returning();

  res.status(201).json(program);
});

router.put("/content/programs/:id", async (req, res) => {
  const [program] = await db
    .update(programsTable)
    .set({
      ...req.body,
      updatedAt: new Date(),
    })
    .where(eq(programsTable.id, req.params.id))
    .returning();

  if (!program) {
    res.status(404).json({ error: "Program not found" });
    return;
  }

  res.json(program);
});

router.delete("/content/programs/:id", async (req, res) => {
  await db
    .delete(programsTable)
    .where(eq(programsTable.id, req.params.id));

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
  const [article] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.slug, req.params.slug))
    .limit(1);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.post("/content/news", async (req, res) => {
  const [article] = await db
    .insert(newsTable)
    .values(req.body)
    .returning();

  res.status(201).json(article);
});

router.put("/content/news/:id", async (req, res) => {
  const [article] = await db
    .update(newsTable)
    .set({
      ...req.body,
      updatedAt: new Date(),
    })
    .where(eq(newsTable.id, req.params.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.delete("/content/news/:id", async (req, res) => {
  await db
    .delete(newsTable)
    .where(eq(newsTable.id, req.params.id));

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
  const [faq] = await db
    .insert(faqsTable)
    .values(req.body)
    .returning();

  res.status(201).json(faq);
});

router.put("/content/faqs/:id", async (req, res) => {
  const [faq] = await db
    .update(faqsTable)
    .set({
      ...req.body,
      updatedAt: new Date(),
    })
    .where(eq(faqsTable.id, req.params.id))
    .returning();

  if (!faq) {
    res.status(404).json({ error: "FAQ not found" });
    return;
  }

  res.json(faq);
});

router.delete("/content/faqs/:id", async (req, res) => {
  await db
    .delete(faqsTable)
    .where(eq(faqsTable.id, req.params.id));

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
  const [settings] = await db
    .insert(siteSettingsTable)
    .values({
      id: 1,
      ...req.body,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettingsTable.id,
      set: {
        ...req.body,
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
  const [image] = await db
    .insert(imagesTable)
    .values(req.body)
    .returning();

  res.status(201).json(image);
});

router.put("/content/images/:id", async (req, res) => {
  const [image] = await db
    .update(imagesTable)
    .set(req.body)
    .where(eq(imagesTable.id, req.params.id))
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  res.json(image);
});

router.delete("/content/images/:id", async (req, res) => {
  await db
    .delete(imagesTable)
    .where(eq(imagesTable.id, req.params.id));

  res.sendStatus(204);
});


export default router;
