# Pricing — Source of Truth

See **[PRICING-LOCKED.md](./PRICING-LOCKED.md)** for the canonical pricing
table, kete list, forbidden phrases, and grandfathering rules.

The runtime source of truth in code is **`src/data/pricing.ts`** —
the `PRICING`, `CORE_PLATFORM`, `KETE`, and `COMPARISON_FEATURES` constants.
Every page that displays pricing or kete information must import from there.

## Order of precedence (highest first)

1. `PRICING-LOCKED.md` (this directory)
2. `src/data/pricing.ts`
3. `src/pages/PricingPage.tsx` (visual page)
4. `src/components/PaywallModal.tsx`, `src/components/FAQSection.tsx`
5. `public/llms.txt`, `public/manifest.json`, `index.html` (OG / JSON-LD)

If any of these disagree, **PRICING-LOCKED.md wins** and the others must
be brought back in line.

## Change process

Pricing changes are not a code change in isolation. To change pricing:

1. Update `PRICING-LOCKED.md` first.
2. Update `src/data/pricing.ts` to match.
3. Run a project-wide grep for the old prices and the forbidden-phrase list.
4. Update OG / JSON-LD in `index.html` and `public/llms.txt`.
5. Note the change in the commit message and tag affected Stripe price IDs.
6. Do **not** delete legacy Stripe price IDs — grandfather existing customers.
