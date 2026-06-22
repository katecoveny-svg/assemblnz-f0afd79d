/**
 * Agent-marketplace subscription plans — the single source of truth for the
 * commercial layer over the App Store-style agent catalogue (lib/marketplace/
 * agents.ts).
 *
 * Four live plans (confirmed by Kate, June 2026 — all NZD, GST exclusive):
 *
 *   Tōro      NZ$9.99/mo   one consumer agent
 *   Whānau    NZ$24.99/mo  five consumer agents, bundled
 *   Pro       NZ$49.99/mo  every consumer agent, unlimited
 *   Business  NZ$199/mo    one business agent (voice CS, healthcare scribe,
 *                          maritime), billed per agent
 *
 * Stripe price IDs are NEVER hardcoded. They come from env so the same code
 * runs against test and live keys. Create the products/prices once with
 *   scripts/create-dash-stripe-products.ts  (npm run stripe:setup)
 * then paste the printed ids into the NEXT_PUBLIC_STRIPE_PRICE_* env vars.
 *
 * The `lookupKey` is stable across test/live — the setup script reuses an
 * existing price for a lookup_key instead of creating duplicates, so re-running
 * is idempotent.
 */

export type MarketplacePlanId = 'toro' | 'whanau' | 'pro' | 'business';

export type MarketplacePlan = {
  /** stable code id + metadata key */
  id: MarketplacePlanId;
  /** display name (without the "assembl " prefix Stripe products carry) */
  name: string;
  /** Stripe product name */
  productName: string;
  /** monthly price in NZD (GST exclusive) */
  monthlyNzd: number;
  /** integer cents for Stripe's unit_amount */
  unitAmount: number;
  /** stable Stripe lookup_key (same across test + live) */
  lookupKey: string;
  /** the env var holding the resolved Stripe price id */
  priceEnvVar: string;
  /** Stripe product description */
  description: string;
  /** does this plan grant a single agent (business/per-agent) vs the account? */
  perAgent: boolean;
};

export const MARKETPLACE_PLANS: readonly MarketplacePlan[] = [
  {
    id: 'toro',
    name: 'Tōro',
    productName: 'assembl Tōro',
    monthlyNzd: 9.99,
    unitAmount: 999,
    lookupKey: 'assembl_toro_999',
    priceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_TORO_999',
    description: 'Unlimited use of one consumer agent',
    perAgent: false,
  },
  {
    id: 'whanau',
    name: 'Whānau',
    productName: 'assembl Whānau',
    monthlyNzd: 24.99,
    unitAmount: 2499,
    lookupKey: 'assembl_whanau_2499',
    priceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_WHANAU_2499',
    description: '5 consumer agents bundled',
    perAgent: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    productName: 'assembl Pro',
    monthlyNzd: 49.99,
    unitAmount: 4999,
    lookupKey: 'assembl_pro_4999',
    priceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_4999',
    description: 'All consumer agents, unlimited',
    perAgent: false,
  },
  {
    id: 'business',
    name: 'Business',
    productName: 'assembl Business per-agent',
    monthlyNzd: 199,
    unitAmount: 19900,
    lookupKey: 'assembl_business_19900',
    priceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_19900',
    description: 'One business agent (voice CS, healthcare scribe, maritime)',
    perAgent: true,
  },
] as const;

const BY_ID = new Map(MARKETPLACE_PLANS.map((p) => [p.id, p]));
const BY_LOOKUP = new Map(MARKETPLACE_PLANS.map((p) => [p.lookupKey, p]));

export function planById(id: string): MarketplacePlan | undefined {
  return BY_ID.get(id as MarketplacePlanId);
}

export function planByLookupKey(lookupKey: string): MarketplacePlan | undefined {
  return BY_LOOKUP.get(lookupKey);
}

export function isMarketplacePlanId(value: string): value is MarketplacePlanId {
  return BY_ID.has(value as MarketplacePlanId);
}

/**
 * Resolved Stripe price id for a plan, read from env. Returns null when the env
 * var is unset so callers fail closed (e.g. a checkout route returns a clear
 * error instead of creating a broken session). The price ids land in env only
 * after `npm run stripe:setup` has been run against the live key.
 */
export function priceIdForPlan(
  id: MarketplacePlanId,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const plan = BY_ID.get(id);
  if (!plan) return null;
  const value = env[plan.priceEnvVar];
  return value && value.length > 0 ? value : null;
}

/**
 * Reverse map: which plan does a Stripe price id correspond to? Used by the
 * webhook to set the plan when a subscription is created/updated. Returns null
 * for prices we don't recognise (e.g. the legacy kete-pack or Pulse prices) so
 * the webhook leaves those untouched.
 */
export function planForPriceId(
  priceId: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): MarketplacePlan | null {
  if (!priceId) return null;
  for (const plan of MARKETPLACE_PLANS) {
    if (env[plan.priceEnvVar] === priceId) return plan;
  }
  return null;
}

/** Display helper: "NZ$9.99/mo". */
export function formatPlanPrice(plan: MarketplacePlan): string {
  const n = Number.isInteger(plan.monthlyNzd)
    ? plan.monthlyNzd.toString()
    : plan.monthlyNzd.toFixed(2);
  return `NZ$${n}/mo`;
}
