---
name: HHI Donations Backend
description: Server-side donation verification architecture, admin auth model, and Resend email setup for Hockey Heart Initiative.
---

# HHI Donations Backend

- Donations live in Replit PostgreSQL (`donations` table, unique reference index). Frontend never decides success: DonationForm calls POST /api/donations/initialize (server creates pending record + reference), opens Paystack inline popup with that reference, then POST /api/donations/verify. Success UI only renders when the server verified with Paystack (amount/currency tamper check: paid must cover pledge).
- **Why:** brief requires never trusting frontend callbacks; totals only count server-verified records.
- Webhook POST /api/paystack/webhook: HMAC-SHA512 over raw body (rawBody captured via express.json verify callback); re-verifies via Paystack API rather than trusting payload; returns 5xx on transient failure so Paystack retries. All state transitions are conditional (`WHERE status='pending'`) so refunded/terminal states are never overwritten and concurrent verify+webhook can't double-settle.
- Admin API auth: first login bootstraps `admin_credentials` (scrypt-salted hash, rate-limited, unique-constraint guarded). Tokens are HMAC-signed with SESSION_SECRET, 8h expiry. Frontend adminAuth.ts logs into backend alongside local login and stores the token in sessionStorage (`hhi_admin_api_token`); changeAdminPassword syncs server credentials. Known tradeoff: first-login bootstrap window — legit admin should log in right after deploy.
- Confirmation email: atomic claim on `email_sent_at IS NULL` before sending; sent via direct Resend API (`https://api.resend.com/emails`) authenticated with the user's own `RESEND_API_KEY` secret (migrated off the Replit-managed connector Aug 2026; `@replit/connectors-sdk` removed). Sender defaults to `Hockey Heart Initiative <donations@hockeyheartinitiative.com>` (override with `DONATION_EMAIL_FROM`); reply-to hockeyheartinitiative@gmail.com. The key accepts sends from that domain but `/domains` returns an empty list (likely a sending-restricted key); test sends with `delivered@resend.dev`.
- Admin UI: DonationsSection merges server-verified donations (shield icon, no delete) with local crypto transactions (manual, still localStorage). AnalyticsSection merges server stats (byCause/byMethod/byCurrency) with local crypto.
- Crypto donations remain frontend/localStorage only (off-gateway manual verification).
- Paystack webhook URL must be configured in the Paystack dashboard to `<prod-domain>/api/paystack/webhook` after publishing.

## Production-readiness hardening (Aug 2026)
- Known program ids get canonical labels forced server-side on initialize (CANONICAL_CAUSES in donations routes); unknown ids accepted for admin-configured causes.
- Public initialize/verify routes have in-memory per-IP rate limits; `trust proxy` is set to 1 (Replit proxy hop) so req.ip is the real client. Never set trust proxy to `true`.
- CORS is disabled unless CORS_ORIGIN env is set (same-origin path routing makes it unnecessary).
- Refund webhook updates are conditional on status != 'refunded' (duplicate refund events can't overwrite refundedAt).
- Amount policy is deliberate: paid must be >= pledged in same currency (covers Paystack fee-pass-through); mismatch/short-pay is marked failed, no email.
- **BLOCKER for live donations: the Paystack account (TEST key) does not support USD** — /charge returns "Currency not supported by merchant". Site is USD-only server-side. User must enable USD on their Paystack account (or the site must switch currency) before real donations work.
