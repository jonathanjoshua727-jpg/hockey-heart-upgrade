---
name: HHI Donations Backend
description: Server-side donation verification architecture, admin auth model, and email pending-provider state for Hockey Heart Initiative.
---

# HHI Donations Backend

- Donations live in Replit PostgreSQL (`donations` table, unique reference index). Frontend never decides success: DonationForm calls POST /api/donations/initialize (server creates pending record + reference), opens Paystack inline popup with that reference, then POST /api/donations/verify. Success UI only renders when the server verified with Paystack (amount/currency tamper check: paid must cover pledge).
- **Why:** brief requires never trusting frontend callbacks; totals only count server-verified records.
- Webhook POST /api/paystack/webhook: HMAC-SHA512 over raw body (rawBody captured via express.json verify callback); re-verifies via Paystack API rather than trusting payload; returns 5xx on transient failure so Paystack retries. All state transitions are conditional (`WHERE status='pending'`) so refunded/terminal states are never overwritten and concurrent verify+webhook can't double-settle.
- Admin API auth: first login bootstraps `admin_credentials` (scrypt-salted hash, rate-limited, unique-constraint guarded). Tokens are HMAC-signed with SESSION_SECRET, 8h expiry. Frontend adminAuth.ts logs into backend alongside local login and stores the token in sessionStorage (`hhi_admin_api_token`); changeAdminPassword syncs server credentials. Known tradeoff: first-login bootstrap window — legit admin should log in right after deploy.
- Confirmation email: atomic claim on `email_sent_at IS NULL` before sending; mailer is a no-op (returns false, claim released) until an email provider (e.g. Resend) is connected — so no donation is ever marked emailed prematurely and no duplicates once enabled.
- Admin UI: DonationsSection merges server-verified donations (shield icon, no delete) with local crypto transactions (manual, still localStorage). AnalyticsSection merges server stats (byCause/byMethod/byCurrency) with local crypto.
- Crypto donations remain frontend/localStorage only (off-gateway manual verification).
- Paystack webhook URL must be configured in the Paystack dashboard to `<prod-domain>/api/paystack/webhook` after publishing.
