---
name: HHI Admin Sections - New Additions
description: Architecture of LegalSection, SupportersSection, ImpactSection and how they store data
---

## Storage pattern for new sections
Unlike older sections that use `contentStore.ts` KEYS, the three new sections store directly in localStorage:
- `hhi_supporters` — Supporter[] (managed by SupportersSection.tsx, read by contentStore getSupporters)
- `hhi_legal_info` — LegalInfo (managed by LegalSection.tsx, getLegalInfo/saveLegalInfo exported from it)
- `hhi_impact_metrics` — ImpactMetric[] (managed by ImpactSection.tsx, getImpactMetrics exported from it)

## Public access
- `getSupporters()` and `getActiveSupporters()` ARE in contentStore.ts for use by public pages
- LegalInfo is NOT in contentStore — public pages should import from LegalSection if ever needed
- ImpactMetric's `getPublishedImpactMetrics()` is exported from ImpactSection.tsx for public Impact page

## Interfaces in contentStore.ts
Supporter, LegalField, LegalInfo, ImpactMetric, LinkClick are all in contentStore.ts (types only).

## Seed data consistency
SupportersSection.tsx has its own SEED_SUPPORTERS (6 entries). contentStore.ts has SEED_SUPPORTERS_PUBLIC (same 6 entries). Both write to 'hhi_supporters'. On first load, whichever runs first seeds it — this is fine since seeds are identical.

**Why:** Kept new sections self-contained for easier future extraction. Public Home.tsx needs supporters, so getSupporters was added to contentStore.
