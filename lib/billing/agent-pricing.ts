/**
 * The locked agent-marketplace pricing ladder.
 *
 * Locked by Kate (2026-06-27 pricing sweep): one consistent ladder across the
 * whole site. Each agent carries a per-agent price (Free / $9.99 / $199); the
 * checkout charges that tier, and All-Access unlocks the lot. This replaces the
 * earlier flat $15/agent + bundle model (Per-Agent $15 / Bundle 5 $50 / Bundle
 * 10 $90 / Bundle 20 $150), whose Stripe products are archived (never deleted)
 * by scripts/setup-flat-pricing-stripe.ts so existing subs keep working.
 *
 *   Everyday     NZ$9.99/mo   one everyday agent
 *   Specialist   NZ$199/mo    one specialist agent
 *   All-Access   NZ$250/mo    every agent
 *
 * Prices are GST inclusive (NZ consumer). Free tier (no Stripe product): the
 * first 3 messages per agent are free, then the paywall. See FREE_MESSAGE_LIMIT.
 *
 * Stripe price IDs are NOT hardcoded — they come from env so the same code runs
 * against test and live keys. Create the products/prices with
 * scripts/setup-flat-pricing-stripe.ts, then set the NEXT_PUBLIC_STRIPE_PRICE_*
 * vars below in Vercel.
 */

/** Free messages allowed per agent before the paywall. */
export const FREE_MESSAGE_LIMIT = 3;

/** The paid plans on the ladder. `free` is in-app only (no Stripe price). */
export type AgentPlan = 'everyday' | 'specialist' | 'all_access';

/** Per-agent NZD price → the plan that charges it. Falls back to everyday. */
export function planForAgentPriceNzd(priceNzd: number): AgentPlan {
  return priceNzd >= 199 ? 'specialist' : 'everyday';
}

/** Plans whose entitlement covers every agent (no per-agent pick). */
export const ALL_ACCESS_PLAN: AgentPlan = 'all_access';

/**
 * Sentinel agent_slug used for an all-access install row — one row entitles the
 * user to every agent instead of writing 30+ rows.
 */
export const ALL_ACCESS_SLUG = '*';

export type AgentPlanDef = {
  id: AgentPlan;
  name: string;
  /** Monthly price in NZD, GST inclusive. */
  monthlyNzd: number;
  /** Stable Stripe lookup_key (shared across test + live). */
  stripeLookupKey: string;
  /** Env var holding the Stripe price id for this plan. */
  envVar: string;
  /**
   * How many agents the customer picks. 1 for per-agent, N for a bundle, and
   * null for all-access (no pick — every agent is included).
   */
  agentCount: number | null;
  /** Short marketing line for the pricing page. */
  summary: string;
};

export const AGENT_PLANS: readonly AgentPlanDef[] = [
  {
    id: 'everyday',
    name: 'Everyday',
    monthlyNzd: 9.99,
    stripeLookupKey: 'assembl_everyday_999',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_EVERYDAY_999',
    agentCount: 1,
    summary: 'One everyday agent — the daily admin, cleared. Add more any time.',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    monthlyNzd: 199,
    stripeLookupKey: 'assembl_specialist_19900',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_SPECIALIST_19900',
    agentCount: 1,
    summary: 'One specialist agent — regulated, high-stakes work on live NZ sources.',
  },
  {
    id: 'all_access',
    name: 'All-Access',
    monthlyNzd: 250,
    stripeLookupKey: 'assembl_all_access_25000',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_ALL_ACCESS_25000',
    agentCount: null,
    summary: 'Every agent we make — now and as we add them.',
  },
] as const;

const PLAN_BY_ID = new Map(AGENT_PLANS.map((p) => [p.id, p]));

export function isAgentPlan(value: string): value is AgentPlan {
  return PLAN_BY_ID.has(value as AgentPlan);
}

export function getAgentPlan(id: string): AgentPlanDef | undefined {
  return PLAN_BY_ID.get(id as AgentPlan);
}

/** How many agents must be picked for a plan (0 for all-access). */
export function agentCountForPlan(plan: AgentPlan): number {
  return getAgentPlan(plan)?.agentCount ?? 0;
}

/**
 * Stripe price id for a plan, read from env. Returns null when unset so callers
 * can fail closed (e.g. the checkout route returns a clear error instead of
 * creating a broken session).
 */
export function priceIdForPlan(
  plan: AgentPlan,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const def = getAgentPlan(plan);
  if (!def) return null;
  const value = env[def.envVar];
  return value && value.length > 0 ? value : null;
}

/**
 * Reverse map: which agent plan does a Stripe price id correspond to? Used by
 * the webhook to interpret a subscription. Returns null for prices we don't
 * recognise (e.g. the self-serve Solo/Team prices, or legacy archived prices)
 * so the webhook leaves agent entitlements untouched for those.
 */
export function planForPriceId(
  priceId: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): AgentPlan | null {
  if (!priceId) return null;
  for (const def of AGENT_PLANS) {
    if (priceId === priceIdForPlan(def.id, env)) return def.id;
  }
  return null;
}
