/**
 * Flat per-agent + bundle pricing — the agent-marketplace ladder.
 *
 * Locked by Kate (June 2026). One flat price per agent, plus bundles that let a
 * customer pick a fixed number of agents, plus an all-access plan. This replaces
 * the old per-agent tier ladder (Tōro $9.99 / Whānau $24.99 / Pro $49.99 /
 * Business $199), whose Stripe products are archived (never deleted) by
 * scripts/setup-flat-pricing-stripe.ts so existing subs keep working.
 *
 *   Per-Agent    NZ$15/mo   1 agent
 *   Bundle 5     NZ$50/mo   pick 5 agents
 *   Bundle 10    NZ$90/mo   pick 10 agents
 *   Bundle 20    NZ$150/mo  pick 20 agents
 *   All-Access   NZ$250/mo  every agent
 *
 * Free tier (no Stripe product): the first 3 messages per agent are free, then
 * the paywall. See FREE_MESSAGE_LIMIT.
 *
 * Stripe price IDs are NOT hardcoded — they come from env so the same code runs
 * against test and live keys. Create the products/prices with
 * scripts/setup-flat-pricing-stripe.ts, then set the NEXT_PUBLIC_STRIPE_PRICE_*
 * vars below in Vercel.
 */

/** Free messages allowed per agent before the paywall. */
export const FREE_MESSAGE_LIMIT = 3;

/** Flat headline price for a single agent, in NZD. */
export const PER_AGENT_PRICE_NZD = 15;

/** The paid plans on the flat ladder. `free` is in-app only (no Stripe price). */
export type AgentPlan =
  | 'per_agent'
  | 'bundle_5'
  | 'bundle_10'
  | 'bundle_20'
  | 'all_access';

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
  /** Monthly price in NZD, GST exclusive. */
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
    id: 'per_agent',
    name: 'Per-Agent',
    monthlyNzd: 15,
    stripeLookupKey: 'assembl_per_agent_1500',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_PER_AGENT_1500',
    agentCount: 1,
    summary: 'One agent, all yours. Add more any time.',
  },
  {
    id: 'bundle_5',
    name: 'Bundle 5',
    monthlyNzd: 50,
    stripeLookupKey: 'assembl_bundle_5_5000',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_BUNDLE_5_5000',
    agentCount: 5,
    summary: 'Pick any 5 agents. $10 each — save a third.',
  },
  {
    id: 'bundle_10',
    name: 'Bundle 10',
    monthlyNzd: 90,
    stripeLookupKey: 'assembl_bundle_10_9000',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_BUNDLE_10_9000',
    agentCount: 10,
    summary: 'Pick any 10 agents. $9 each.',
  },
  {
    id: 'bundle_20',
    name: 'Bundle 20',
    monthlyNzd: 150,
    stripeLookupKey: 'assembl_bundle_20_15000',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_BUNDLE_20_15000',
    agentCount: 20,
    summary: 'Pick any 20 agents. $7.50 each.',
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

/** Card/detail price chip for a single agent under flat pricing. */
export function agentPriceLabel(): string {
  return `NZ$${PER_AGENT_PRICE_NZD}/mo`;
}
