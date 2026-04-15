# PRICING LOCKED — 2026-04-08

This file is the **single source of truth** for Assembl pricing.
Code (`src/data/pricing.ts`), copy (`PricingPage.tsx`, `Index.tsx`,
`PaywallModal.tsx`, `FAQSection.tsx`), public surfaces (`public/llms.txt`,
`public/manifest.json`, `index.html`) and any nav/footer kete listing
must match this file. Do **not** deviate.

All prices NZD, **GST exclusive**. Add 15% GST at invoice.

## Tier ladder

| Tier       | Monthly        | Setup (one-off)                 | Includes                                                                          | Audience          |
|------------|----------------|---------------------------------|-----------------------------------------------------------------------------------|-------------------|
| Family     | $29            | —                               | Toro whānau agent · SMS-first · household coordination                           | Households        |
| Operator   | $1,490         | $590 (split across first 3)     | 1 kete · up to 5 seats · 20 evidence packs/mo                                    | Single-site SMB   |
| Leader     | $1,990         | $1,290 (split across first 3)   | 2 kete · up to 15 seats · 60 evidence packs/mo · quarterly compliance review     | Multi-site SMB    |
| Enterprise | $2,990         | $2,890 (split across first 3)   | All 5 kete · unlimited seats · 200 evidence packs/mo · 99.9% SLA · NZ data residency · named success mgr  | Mid-market NZ     |
| Outcome    | from $5,000    | per engagement                  | Bespoke outcome workflows · 10–20% of measured savings                            | High-value flows  |

> Setup fees can be split across the first 3 invoices on request.
> Family tier has no setup fee.

## The 5 locked kete

1. **Manaaki** — Hospitality
2. **Waihanga** — Construction
3. **Auaha** — Creative
4. **Arataki** — Automotive
5. **Pikau** — Freight & Customs

Plus the **Toro** whānau agent on the Family tier.

### Retired kete (do NOT show in user-visible copy)

`Hanga` (renamed to **Waihanga** on the pricing page — component folder
unchanged), `Pakihi`, `Waka`, `Hangarau`, `Hauora`, `Te Kāhui Reo`.

## Forbidden phrases (must not appear in user-visible copy)

- "44 specialist agents" / "42 specialist agents" / "78 agents"
- "Trained on 50+ NZ Acts" (Fair Trading Act risk)
- "9 kete" / "7 industry kete"
- "16 industries"
- Legacy prices: `$199`, `$399`, `$799`, `$750–$4,500`
- "enterprise-grade" (use "mid-market NZ")

## Grandfathering

Existing customers on the legacy `$199 / $399 / $799 + $749 setup` model
are grandfathered for 12 months from 2026-04-08 (until 2027-04-08). After
that, they roll to the closest new tier with 60 days' written notice.

**Do not delete legacy Stripe price IDs.** They are needed for billing
existing subscribers through the grandfather window.
