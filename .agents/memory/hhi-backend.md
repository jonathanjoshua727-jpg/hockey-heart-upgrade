---
name: HHI Donations Backend
description: Server-side donation verification architecture, admin auth model, and Resend email setup for Hockey Heart Initiative.
---

# HHI Donations Backend

- **Payment provider is Flutterwave (migrated from Paystack, Aug 2026).** Hosted-link flow (Flutterwave Standard): initialize creates a pending record then POST /v3/payments → hosted `link`; frontend redirects donor there (no inline popup) and stashes pending details in sessionStorage; on return (tx_ref query param) it calls POST /api/donations/verify. Verify uses GET /v3/transactions/verify_by_reference (amounts in MAJOR units — ×100 to cents; success status is "successful"). Test keys DO support USD (unlike Paystack). DB column `paystackId` intentionally retained to store the Flutterwave transaction id (avoids a data migration).
- Donations live in Replit PostgreSQL (`donations` table, unique reference index). Frontend never decides success; success UI only renders after server verification (amount/currency tamper check: paid must cover pledge).
- Redirect origin for the hosted checkout is built server-side from PUBLIC_ORIGIN or REPLIT_DOMAINS — never from the Host header (open-redirect protection); `redirectPath` must match `/^\/(?!\/)/`.
- `notFound` on verify leaves the record PENDING (never cancelled/terminal) — the tx may just not be indexed yet; a later webhook/verify can still settle it.
- **Why:** brief requires never trusting frontend callbacks; totals only count server-verified records.
- Webhook POST /api/flutterwave/webhook: authenticated by timing-safe compare of the `verif-hash` header against FLUTTERWAVE_SECRET_HASH (503 if unset); never trusts payload — charge events re-verify via API, refund events re-verify the tx AND confirm a completed refund via GET /v3/refunds?tx_id= (matched client-side by tx_id) before transitioning `successful` → `refunded`. Provider not-found/pending responses and refund-before-charge races return 5xx so Flutterwave retries instead of losing settlement. All state transitions are conditional (`WHERE status='pending'`/`'successful'`) so terminal states are never overwritten and concurrent verify+webhook can't double-settle.
- Admin API auth: first login bootstraps `admin_credentials` (scrypt-salted hash, rate-limited, unique-constraint guarded). Tokens are HMAC-signed with SESSION_SECRET, 8h expiry. Frontend adminAuth.ts logs into backend alongside local login and stores the token in sessionStorage (`hhi_admin_api_token`); changeAdminPassword syncs server credentials. Known tradeoff: first-login bootstrap window — legit admin should log in right after deploy.
- Confirmation email: atomic claim on `email_sent_at IS NULL` before sending; sent via direct Resend API (`https://api.resend.com/emails`) authenticated with the user's own `RESEND_API_KEY` secret (migrated off the Replit-managed connector Aug 2026; `@replit/connectors-sdk` removed). Sender defaults to `Hockey Heart Initiative <donations@hockeyheartinitiative.com>` (override with `DONATION_EMAIL_FROM`); reply-to hockeyheartinitiative@gmail.com. The key accepts sends from that domain but `/domains` returns an empty list (likely a sending-restricted key); test sends with `delivered@resend.dev`.
- Admin UI: DonationsSection merges server-verified donations (shield icon, no delete) with local crypto transactions (manual, still localStorage). AnalyticsSection merges server stats (byCause/byMethod/byCurrency) with local crypto.
- Crypto donations remain frontend/localStorage only (off-gateway manual verification).
- Flutterwave webhook URL must be configured in the Flutterwave dashboard to `<prod-domain>/api/flutterwave/webhook`, with the same secret hash as FLUTTERWAVE_SECRET_HASH.

## Production-readiness hardening (Aug 2026)
- Known program ids get canonical labels forced server-side on initialize (CANONICAL_CAUSES in donations routes); unknown ids accepted for admin-configured causes.
- Public initialize/verify routes have in-memory per-IP rate limits; `trust proxy` is set to 1 (Replit proxy hop) so req.ip is the real client. Never set trust proxy to `true`.
- CORS is disabled unless CORS_ORIGIN env is set (same-origin path routing makes it unnecessary).
- Amount policy is deliberate: paid must be >= pledged in same currency (covers fee-pass-through); mismatch/short-pay is marked failed, no email.
- (Historical) Paystack was dropped partly because its test account rejected USD; Flutterwave test keys create USD hosted links fine. PAYSTACK_SECRET_KEY secret may still linger in env — safe to delete once live Flutterwave donations are confirmed.
- Payment method flags, crypto wallets, and admin bank notes are authoritative in the singleton Postgres payment settings row; authenticated admin APIs update them and donation initialization enforces card/bank flags server-side. The public settings API returns only flags + crypto wallets, never bank account fields. Legacy contentStore fields remain only as compatibility cache.
- Bank transfer is disabled by default for launch because the live USD Flutterwave checkout exposed only card even when `banktransfer` was requested. Enable it from admin only after Flutterwave confirms USD bank transfer on the merchant account; bank account notes in admin are not sent to Flutterwave.
