---
name: HHI Analytics System
description: Link-click tracking system design and event type conventions
---

## File
`src/lib/analytics.ts`

## Design
- Tracks anonymous click events in `localStorage` under key `hhi_link_clicks`
- Session ID stored in `sessionStorage` (resets per browser session)
- Admin sessions detected via `sessionStorage.hhi_admin_session.authenticated` — admin clicks NOT tracked
- Max 10,000 events stored (FIFO, newest first)

## Event type strings (must use consistently)
- `donate_button` — any donate CTA click
- `donation_page_visit` — when DonationForm mounts (useEffect)
- `checkout_start` — when Paystack popup opens
- `donation_success` — after successful payment callback
- `donation_failed` — after failed payment
- `campaign` — campaign card/link clicks
- `program` — program link clicks
- `news` — news article clicks
- `supporter` — ambassador/supporter profile link clicks
- `email` — email address clicks
- `phone` — phone number clicks
- `whatsapp` — WhatsApp link clicks
- `cta` — generic CTA buttons
- `nav` — navigation link clicks
- `external` — external social/website links

## Key exports
- `trackClick(label, type, destination, page?)` — add an event
- `getClickStats(clicks?)` — {total, today, thisWeek, thisMonth, thisYear}
- `getTopLinks(clicks?, limit?)` — sorted by count with time breakdowns
- `getDonationFunnel()` — {pageVisit, btnClick, checkoutStart, success, failed}

**Why:** localStorage-only keeps it zero-infra. Admin exclusion prevents internal testing from inflating analytics.
