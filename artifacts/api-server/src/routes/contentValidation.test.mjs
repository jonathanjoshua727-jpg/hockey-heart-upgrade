import assert from "node:assert/strict";
import test from "node:test";
import {
  campaignInputSchema,
  campaignUpdateSchema,
  contentIdSchema,
  faqInputSchema,
  homepageContentInputSchema,
  imageInputSchema,
  newsInputSchema,
  pageContentInputSchema,
  programInputSchema,
  siteSettingsInputSchema,
  siteSettingsUpdateSchema,
} from "./contentValidation.ts";

test("validates content create bodies against required database fields", () => {
  assert.equal(
    homepageContentInputSchema.safeParse({
      heroTitle: "Welcome",
      heroSubtitle: "Play. Heal. Thrive.",
      heroDescription: "A description",
      heroPrimaryButtonText: "Donate",
      heroPrimaryButtonUrl: "/donate",
      heroSecondaryButtonText: "Learn more",
      heroSecondaryButtonUrl: "/about",
    }).success,
    true,
  );
  assert.equal(
    pageContentInputSchema.safeParse({ title: "About" }).success,
    true,
  );
  assert.equal(
    campaignInputSchema.safeParse({ slug: "winter-drive", title: "Winter Drive" })
      .success,
    true,
  );
  assert.equal(
    programInputSchema.safeParse({ slug: "equipment", title: "Equipment" })
      .success,
    true,
  );
  assert.equal(
    newsInputSchema.safeParse({
      slug: "news",
      title: "News",
      content: "Article body",
      publishedAt: "2026-10-13T00:00:00.000Z",
    }).success,
    true,
  );
  assert.equal(
    faqInputSchema.safeParse({ question: "Question?", answer: "Answer." }).success,
    true,
  );
  assert.equal(
    imageInputSchema.safeParse({ name: "Banner", url: "/banner.jpg" }).success,
    true,
  );
  assert.equal(
    siteSettingsInputSchema.safeParse({ contactEmail: "" }).success,
    true,
  );
});

test("rejects malformed create bodies and immutable update fields", () => {
  assert.equal(campaignInputSchema.safeParse({ slug: 42, title: "" }).success, false);
  assert.equal(newsInputSchema.safeParse({ slug: "news", title: "News" }).success, false);
  assert.equal(imageInputSchema.safeParse({ name: "Banner", url: 42 }).success, false);
  assert.equal(
    campaignUpdateSchema.safeParse({ id: "not-client-editable" }).success,
    false,
  );
  assert.equal(campaignUpdateSchema.safeParse({}).success, false);
  assert.equal(siteSettingsUpdateSchema.safeParse({}).success, false);
  assert.equal(contentIdSchema.safeParse("not-a-uuid").success, false);
});
