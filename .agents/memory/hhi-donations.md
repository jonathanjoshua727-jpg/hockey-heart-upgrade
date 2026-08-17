---
name: HHI donation flow
description: Donation form, Paystack usage, seeds/migrations, and security constraints
---
- Presets $50/$100/$250/$500 + Custom; $50 minimum. USD-first, international presentation; never show Nigerian bank details publicly.
- Paystack inline popup only; bank transfer via `channels:['bank_transfer']`. Branding limited to "Secure payment powered by Paystack".
- **Never store the Paystack secret key client-side.** `getPaymentSettings()` scrubs any legacy `paystackSecretKey` from localStorage; admin UI intentionally has no secret-key input. **Why:** review found the old admin form persisted sk_ keys in browser storage.
- `getDonationCauses()` does a non-destructive merge migration: new seeded designations (by id) are appended to existing stored lists so long-time visitors get updated programs.
- Funnel events fired in DonationForm: `donation_page_visit` (mount), `checkout_start` (popup open), `donation_success` (callback), `donation_failed` (onClose, guarded by a `paid` flag so it never fires after success).
- Transaction statuses: completed/pending/failed/cancelled/refunded.
- Known limitation (frontend-only app): no server-side Paystack verification, webhooks, or confirmation emails; donation records live in each donor's own browser localStorage, so admin cannot see other users' donations. Fixing this requires moving payments to the api-server + a real database — pending user decision.
