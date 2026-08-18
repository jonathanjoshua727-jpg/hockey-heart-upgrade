---
name: HHI Project Overview
description: Hockey Heart Initiative architecture, key files, and established decisions
---

## Stack
- **Monorepo**: pnpm, artifact at `artifacts/hockey-hearts`
- **Frontend**: React + Vite + Wouter routing + Tailwind + shadcn/ui
- **Persistence**: All data in `localStorage` via `src/lib/contentStore.ts`
- **Admin auth**: SHA-256 hash in localStorage, session in sessionStorage, 8-hour expiry (`src/lib/adminAuth.ts`)
- **No backend**: api-server artifact exists but frontend does not depend on it

## Key contacts / config
- Primary email: `hockeyheartinitiative@gmail.com`
- Domain: `hockeyheartinitiative.com`
- Payments: Paystack (bank transfer uses `channels: ['bank_transfer']`); never show "Paystack" to donors
- Minimum donation: $50 USD

## Admin dashboard
- `src/pages/admin/AdminDashboard.tsx` — sidebar with 19 sections in 4 groups
- All sections are in `src/pages/admin/sections/`
- New sections added: SupportersSection, LegalSection, ImpactSection

**Why:** All state is localStorage-only for zero-backend simplicity. This must stay consistent — do not introduce API calls or databases to the frontend without a major architectural decision.

## Seed-data migrations
Stored localStorage content never re-reads seeds, so seed improvements need a migration. Use the version-gated one-time migration in contentStore (`hhi_content_migration_version`, `runContentMigration()`): bump the version and add steps there. Never merge/sync seeds on every read — that resurrects admin-deleted items and clobbers admin edits. New seed campaigns must be matched by id AND slug to avoid collisions with admin-created records.
