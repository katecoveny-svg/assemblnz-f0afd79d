# PRICING LOCKED — 2026-04-08 (Updated 2026-05-14 to reflect 9 kete + lowercase brand)

This file is the **single source of truth** for assembl pricing.
Code (`app/pricing/page.tsx`, `lib/pricing.ts`), copy (`PricingPage.tsx`,
`Index.tsx`, `PaywallModal.tsx`, `FAQSection.tsx`), public surfaces
(`public/llms.txt`, `public/manifest.json`, `index.html`) and any nav/footer
kete listing must match this file. Do **not** deviate.

All prices NZD, **GST exclusive**. Add 15% GST at invoice.

**Lowercase brand canon:** always `assembl`, never `Assembl`. Per Plugin Architecture Canon §10.4 and Kate's 14 May 2026 lock-in.

## Tier ladder

| Tier       | Monthly        | Setup (one-off)                 | Includes                                                                          | Audience          |
|------------|----------------|---------------------------------|-----------------------------------------------------------------------------------|-------------------|
| Family     | $29            | —                               | Tōro whānau agent · email-first · household coordination                          | Households        |
| Operator   | $1,490         | $590 (split across first 3)     | 1 kete · up to 5 seats · 20 evidence packs/mo                                    | Single-site SMB   |
| Leader     | $1,990         | $1,290 (split across first 3)   | All kete · up to 15 seats · 60 evidence packs/mo · quarterly compliance review   | Multi-site SMB    |
| Enterprise | $2,990         | $2,890 (split across first 3)   | All kete · unlimited seats · 200 evidence packs/mo · 99.9% SLA · NZ data residency · named success mgr  | Mid-market NZ     |
| Outcome    | from $5,000    | per engagement                  | Bespoke outcome workflows · 10–20% of measured savings                            | High-value flows  |

> Setup fees can be split across the first 3 invoices on request.
> Family tier has no setup fee.

> **Tier differentiation:** kete count is the same across Leader / Enterprise (all kete). Differentiation is seats + monthly outputs + SLA + compliance review cadence + named contact.

## The 9 locked kete

1. **Manaaki** — Hospitality
2. **Waihanga** — Construction
3. **Auaha** — Creative
4. **Arataki** — Automotive (renamed from Tourism per Q1 canon 13 May 2026)
5. **Pīkau** — Freight & Customs
6. **Ako** — Early Childhood Education (tightened from generic education per Q2 canon 13 May 2026)
7. **Mātauranga** — Secondary Education (new 9th kete per Q2 canon 13 May 2026)
8. **Hoko** — Retail
9. **Tōro** — Whānau / Family AI (architecture-led 9 specialists per Q3 canon 13 May 2026)

### Retired kete (do NOT show in user-visible copy)

`Hanga` (renamed to **Waihanga** on the pricing page — component folder
unchanged), `Pakihi`, `Waka`, `Hangarau`, `Hauora`, `Te Kāhui Reo`.

## Forbidden phrases (must not appear in user-visible copy)

- "44 specialist agents" / "42 specialist agents" / "78 agents"
- "Trained on 50+ NZ Acts" (Fair Trading Act risk)
- Legacy prices: `$199`, `$399`, `$799`, `$750–$4,500`
- "enterprise-grade" (use "mid-market NZ")
- "Assembl" with capital A (use lowercase `assembl`)
- "AI" used as a bare noun in customer copy (use "intelligent automation" or describe the function)
- Legacy 5-kete or 7-kete framing (use "9 kete" or "all kete")

### Removed from forbidden list (14 May 2026)

- ~~"9 kete"~~ — was forbidden in 8 April canon; site has had 9 kete since Q2 canon decision 13 May 2026; now canonical
- ~~"7 industry kete"~~ — same reasoning
- ~~"16 industries"~~ — was forbidden in 8 April canon; never reflected reality; removed

## Grandfathering

Existing customers on the legacy `$199 / $399 / $799 + $749 setup` model
are grandfathered for 12 months from 2026-04-08 (until 2027-04-08). After
that, they roll to the closest new tier with 60 days' written notice.

**Do not delete legacy Stripe price IDs.** They are needed for billing
existing subscribers through the grandfather window.
