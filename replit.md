# Hockey Heart Initiative

A nonprofit website for the Hockey Heart Initiative — empowering youth through hockey and championing their right to health and opportunity. Includes a public-facing multi-page site and a full admin dashboard for content, donation, and campaign management.

## Run & Operate

- `pnpm --filter @workspace/hockey-hearts run dev` — run the frontend site (reads `PORT` env var)
- `pnpm --filter @workspace/api-server run dev` — run the API server (requires `DATABASE_URL`)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 20, TypeScript
- Frontend: React + Vite + Tailwind CSS + Wouter routing
- Admin auth: SHA-256 hashed credentials in localStorage (`src/lib/adminAuth.ts`)
- Data persistence: `localStorage` via `src/lib/contentStore.ts` — no backend calls from frontend
- API: Express 5 (currently health-check only; `DATABASE_URL` required to start)
- DB: PostgreSQL + Drizzle ORM (`lib/db`) — schema defined, not yet used by frontend

## Where things live

- `artifacts/hockey-hearts/src/` — React frontend
  - `src/lib/contentStore.ts` — all data (campaigns, news, donations, FAQs, settings, etc.) stored in localStorage
  - `src/lib/adminAuth.ts` — admin authentication
  - `src/lib/imageRegistry.ts` — maps image keys to asset URLs
  - `src/pages/admin/` — admin dashboard and all section components
  - `src/pages/admin/sections/` — individual admin sections (Donations, Campaigns, News, FAQs, etc.)
  - `src/components/DonationForm.tsx` — full payment flow (Bank Transfer / Card / Crypto)
- `artifacts/api-server/` — Express API (health check; DB-backed features pending)
- `lib/db/` — Drizzle schema and migrations

## Architecture decisions

- **All data in localStorage**: No backend API calls from the frontend. All content (campaigns, news, FAQs, settings, etc.) lives in `localStorage` via `contentStore.ts`. This makes the site zero-dependency to deploy but limits to single-browser persistence.
- **Payment methods**: Donation form supports Bank Transfer, Credit/Debit Card (via Paystack — never surfaced as "Paystack" on the public site), and Cryptocurrency. The name "Paystack" only appears in admin settings.
- **Admin auth**: SHA-256 password hashing in localStorage. Sessions stored in sessionStorage with 8-hour expiry.
- **Image handling**: `imageRegistry.ts` maps string keys to Vite-processed URLs; `resolveImage()` handles keys, absolute URLs, and base64 blobs.

## Product

- Public site: Home, About, Mission, Vision, Campaigns (with detail pages), News (with article pages), Donate, Impact, FAQ, Contact, Privacy, Terms
- Admin dashboard: Overview, Analytics, Donations (transactions + status management), Donation Causes, Campaigns, Programs, News, Homepage Content, Images/Gallery, Pages (content overrides), Contact Info + Bank Details, FAQs, Payment Config (Paystack keys + crypto wallets), Users, Activity Log

## User preferences

- Never display "Paystack" to the public — it is only referenced in admin settings
- Do not redesign existing pages — only complete missing functionality
- Payment methods: Bank Transfer, Credit/Debit Card, Cryptocurrency only

## Gotchas

- `pnpm run build` on the frontend requires `PORT` env var (set automatically by the workflow runtime)
- `api-server` will not start without `DATABASE_URL` — this is expected; the frontend does not depend on it
- The `pnpm install` must be run from the workspace root before workflows start

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
