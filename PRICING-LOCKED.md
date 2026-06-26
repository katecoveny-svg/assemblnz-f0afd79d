# PRICING LOCKED — 2026-05-15

> **🔒 SUPERSEDED — 2026-06-27 pricing sweep (Kate, autonomous authority).**
> The whole site is locked to ONE consumer agent-marketplace ladder. Everything
> below (kete packs, Pilot Sprint cross-sell, Starter/Pack/Outcome, Solo/Team
> self-serve) is retired for customer-facing pricing copy. The locked ladder is:
> - **Free** — the utility agents stay free; every paid agent gives 3 free messages first.
> - **Everyday agent** — NZ$9.99/month per agent.
> - **Specialist agent** — NZ$199/month per agent.
> - **All-Access** — NZ$250/month, every agent we make.
> - **GST inclusive everywhere** (NZ consumer). Never show "+ GST" on these prices.
>
> Canonical pricing page: `/agents/pricing` (`/pricing` redirects to it). Runtime
> source of truth in code: `lib/billing/agent-pricing.ts` (`AGENT_PLANS`) and the
> per-agent `priceTier` in `lib/marketplace/agents.ts`. Pilot Sprint survives only
> as a B2B professional-services engagement priced per signed Statement of Work
> (no fixed public price). Old Stripe SKUs ($799 / $3,500 / $15 / $50 / $90 /
> $150 / $24.99 / $49.99) are archived (never deleted) by
> `scripts/setup-flat-pricing-stripe.ts` so grandfathered subs keep working.
>
> ---
>
> **SUPERSEDED IN PART — 2026-06-16 strategic reset (Kate, autonomous authority).**
> The public `/pricing` page now shows exactly three tiers + Outcome:
> - **Pilot Sprint** — $5,000 once-off + GST (covers month one of Starter or Pack)
> - **Starter** — $799/month + GST · one specialist workflow · all HAPAI tools · email support
> - **Pack** — $3,500/month + GST · the whole industry kete · all HAPAI tools · named support
> - **Outcome** — custom; commercial model tied to reviewed work delivered, not seats
>
> This intentionally overrides the 2026-05-15 lock below: the Solo $49 / Team $149
> self-serve tiers are **removed from `/pricing`**, and **$799 is no longer a
> forbidden price** (it is now the sanctioned Starter price). Tōro ($29/mo) is
> removed from `/pricing` and lives on its own page at `/toro`.
>
> Stripe is NOT yet wired for the new prices — see the PR action list. Until new
> Prices exist, monthly-tier CTAs route through the Pilot Sprint / contact, not a
> live checkout, so no customer is charged the wrong amount.

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
| Solo (self-serve) | $49/mo | $0 | One industry kete's workflows · single user · draft-only · HAPAI tools · cancel any time | Free-tool users converting |
| Team (self-serve) | $149/mo | $0 | All kete workflows · up to 5 users · draft-only · HAPAI tools · cancel any time | Small teams converting |
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
- Any copy that frames kete access as one/two/all kete by tier **for the
  retired Operator/Leader/Enterprise structure**. (The 2026-06-05 self-serve
  Solo/Team tiers above are the only sanctioned one-kete/all-kete framing.)

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

## Self-Serve Tiers (added 2026-06-05, confirmed by Kate)

A self-serve step sits between the free HAPAI tools and the $5,000/mo kete pack,
so free-tool users can convert with a card and no sales call. This is a
deliberate, confirmed change to the 2026-05-15 lock.

- **Solo — NZ$49/month**: one industry kete's workflows, single user.
- **Team — NZ$149/month**: all kete workflows, up to 5 users.
- Both: GST exclusive, no setup fee, cancel any time, HAPAI tools included.
- Draft-only is absolute on both — paying never unlocks auto-lodging or
  auto-send.
- Self-serve does **not** include the done-for-you Pilot Sprint or the human
  review service. Those protect the $5k Pilot Sprint and Industry Pack.

Runtime source: `lib/billing/tiers.ts`. Stripe price ids come from env
(`STRIPE_PRICE_SOLO`, `STRIPE_PRICE_TEAM`) created by
`scripts/setup-self-serve-stripe.ts` — never hardcoded.

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
