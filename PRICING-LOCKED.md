# PRICING LOCKED — 2026-05-15

This file is the single source of truth for assembl pricing.
Code (`lib/pricing.ts`, `app/pricing/page.tsx`), copy
(`legacy-vite/src/pages/PricingPage.tsx`, homepage pricing teasers), and
customer-facing pricing references must match this file. Do not deviate.

All prices are NZD, GST exclusive. Add 15% GST at invoice.

Use code `ANNUAL12` for 12% off annual prepay.

## Current Offers

| Offer | Price | Setup | Includes | Audience |
| --- | ---: | ---: | --- | --- |
| Tōro Family | $29/mo | $0 | Tōro whānau navigator · reviewed family actions and records · month to month | Households |
| Pilot Sprint | $5,000 once-off | $0 | Two weeks · one workflow · one evidence pack · money-back if no real time saved by week two | Try before you buy |
| Industry Pack | $5,000/mo | $0 | One industry kete · six to eight specialist agents · one operating loop · no usage limits · switch kete any time · cancel any time | NZ operators |
| Outcome | from $5,000 | Scoped | Bespoke workflow engagements with the evidence pack and commercial model agreed up front | High-value bespoke work |

## Retired Public Tiers

The previous Operator, Leader, and Enterprise public tiers are retired for new
customer-facing copy as of 2026-05-15.

Do not publish:

- Operator — NZ$1,490/mo + setup
- Leader — NZ$1,990/mo + setup
- Enterprise — from NZ$2,990/mo + setup
- Any copy that frames kete access as one/two/all kete by tier

## Industry Pack Canon

Industry Pack is the off-the-shelf operating fleet:

- NZ$5,000/month
- GST exclusive
- No setup fee
- Pick one of the eight industry kete at signup
- Switch kete any time
- Six to eight specialist agents sequenced into one loop: Hunt, Pitch, Execution, Ledger
- No usage limits
- Cancel any time

Pilot Sprint is the try-before-you-buy path into Industry Pack.

### Fleet Wiring Branch Decision

`feat/industry-pack-fleet-wiring-2026-05-15` was inspected after the flat
pricing work landed and was formally abandoned as redundant. The branch tried
to reintroduce older tier/copy structure while the useful Industry Pack canon
is already captured here and in `lib/pricing.ts`.

## The 9 Locked Kete

Eight industry kete:

1. Waihanga — Construction
2. Manaaki — Hospitality
3. Pīkau — Freight & Customs
4. Arataki — Automotive & Fleet
5. Auaha — Creative
6. Ako — Early Childhood Education
7. Mātauranga — Secondary Education
8. Hoko — Retail

Ninth whānau kete:

9. Tōro — Whānau

## Forbidden Phrases

These must not appear in user-visible pricing copy:

- "44 specialist agents" / "42 specialist agents" / "78 agents"
- "Trained on 50+ NZ Acts" or similar quantified claims unless backed in a register row
- Legacy prices: `$199`, `$399`, `$799`, `$750-$4,500`
- Retired tier names/prices: `Operator $1,490`, `Leader $1,990`, `Enterprise $2,990`
- "enterprise-grade"
- "AI" used as a bare noun in customer copy
- Legacy 5-kete, 7-kete, or 8-kete product framing
- "Tōroa" or "Toroa" in customer copy

## Billing Note

Do not delete legacy Stripe price IDs without a billing migration plan. They may
still be needed for grandfathered subscribers and historical invoices.

New Industry Pack checkout wiring requires the real Stripe price ID before any
checkout/paywall code is changed.
