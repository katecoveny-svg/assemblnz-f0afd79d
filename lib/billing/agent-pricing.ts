/**
 * The locked agent-marketplace pricing ladder.
 *
 * Read CANON-LOCKED-2026-06-23.md before touching any pricing surface.
 *
 * July 2026 rollout (Juno's Pro Stack): the customer-facing ladder is four
 * tiers — Free → Everyday ($9.99) → Pro Stack ($49) → All-Access ($250).
 * Pro Stack bundles a handful of $9.99 everyday agents into one monthly price.
 *
 *   Free         NZ$0          try any agent, some stay free for good
 *   Everyday     NZ$9.99/mo    one everyday agent
 *   Pro Stack    NZ$49/mo      a bundle of everyday agents (see PROSTACK_BUNDLE_SLUGS)
 *   All-Access   NZ$250/mo     every agent
 *
 * `Specialist` ($199/mo) stays in the registry below as plumbing, not as a
 * headline marketing card: 31 agents on the locked 54-agent roster carry the
 * $199 price and check out through this plan, so removing it would break those
 * agents (and the brief says don't touch the roster). The pricing PAGE renders
 * the four marketing tiers; the specialist price is surfaced as a footnote.
 *
 * Prices are GST inclusive (NZ consumer). Never show "+ GST".
 *
 * Stripe price IDs are NOT hardcoded — they come from env so the same code runs
 * against test and live keys. Create the products/prices with
 * scripts/setup-flat-pricing-stripe.ts (and scripts/stripe-prostack-setup.ts
 * for Pro Stack + the JULYLAUNCH50 coupon), then set the
 * NEXT_PUBLIC_STRIPE_PRICE_* vars below in Vercel.
 */

/** Free messages allowed per agent before the paywall (Everyday/free tier). */
export const FREE_MESSAGE_LIMIT = 3;

/**
 * Free-trial config for the paid tiers: 7 days OR 50 messages, whichever comes
 * first. (The per-agent {@link FREE_MESSAGE_LIMIT} still gates anonymous Free
 * usage; this trial governs a started subscription.)
 */
export const freeTrial = {
  days: 7,
  messages: 50,
  /** Plain-English summary for the pricing page + checkout copy. */
  label: '7-day free trial, or your first 50 messages — whichever comes first',
} as const;

/** The paid + free plans on the ladder. `free` carries no Stripe price. */
export type AgentPlan = 'free' | 'everyday' | 'prostack' | 'specialist' | 'all_access';

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

/**
 * The everyday agents bundled into Pro Stack. Server-authoritative: the checkout
 * route grants exactly these (the customer doesn't pick), and the webhook falls
 * back to them when the metadata is empty. Juno will refine the composition;
 * these four are the launch placeholders.
 */
export const PROSTACK_BUNDLE_SLUGS = [
  'hui-notes',
  'invoice-tidy',
  'inbox-triage',
  'travel-logs',
] as const;

export type AgentPlanDef = {
  id: AgentPlan;
  name: string;
  /** Display label, e.g. "$9.99/mo", "Pro Stack — $49/mo", "All-Access $250/mo". */
  label: string;
  /** Monthly price in NZD, GST inclusive (0 = free). */
  monthlyNzd: number;
  /** One-line marketing blurb for the pricing card. */
  blurb: string;
  /** 4–6 perk bullets for the pricing card. */
  perks: readonly string[];
  /**
   * Placeholder Stripe price id. The REAL id is resolved from env at runtime via
   * {@link priceIdForPlan}; this empty placeholder keeps the shape explicit and
   * is filled in by scripts/STRIPE-PROSTACK-IDS.txt → Vercel env.
   */
  stripePriceId: string;
  /** Stable Stripe lookup_key (shared across test + live). null for free. */
  stripeLookupKey: string | null;
  /** Env var holding the Stripe price id for this plan. null for free. */
  envVar: string | null;
  /**
   * How many agents the customer picks. 1 for per-agent, null for a fixed
   * bundle / all-access / free (no pick — the agents are predetermined).
   */
  agentCount: number | null;
};

export const AGENT_PLANS: readonly AgentPlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    label: 'Free',
    monthlyNzd: 0,
    blurb: 'Try any agent before you pay — and some stay free for good.',
    perks: [
      `Your first ${FREE_MESSAGE_LIMIT} messages with any agent are on us`,
      'The everyday utility agents are free forever',
      'No card to start',
      'Every reply is a draft for you to check',
    ],
    stripePriceId: '',
    stripeLookupKey: null,
    envVar: null,
    agentCount: null,
  },
  {
    id: 'everyday',
    name: 'Everyday',
    label: '$9.99/mo',
    monthlyNzd: 9.99,
    blurb: 'One everyday agent — the daily admin, cleared. Add more any time.',
    perks: [
      'One agent, all yours',
      'Unlimited messages',
      `${freeTrial.label}`,
      'Drafts only — you stay in control',
      'Cancel any month',
    ],
    stripePriceId: '',
    stripeLookupKey: 'assembl_everyday_999',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_EVERYDAY_999',
    agentCount: 1,
  },
  {
    id: 'prostack',
    name: 'Pro Stack',
    label: 'Pro Stack — $49/mo',
    monthlyNzd: 49,
    blurb: 'A bundle of everyday agents that work together — the small-business stack.',
    perks: [
      'Four everyday agents in one subscription',
      'Hui Notes, Invoice Tidy, Inbox Triage and Travel Logs',
      'Unlimited messages across the stack',
      `${freeTrial.label}`,
      'Cheaper than the agents bought one by one',
      'Cancel any month',
    ],
    stripePriceId: '',
    stripeLookupKey: 'assembl_prostack_4900',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_PROSTACK_4900',
    agentCount: null,
  },
  {
    id: 'specialist',
    name: 'Specialist',
    label: '$199/mo',
    monthlyNzd: 199,
    blurb: 'One specialist agent — regulated, high-stakes work on live NZ sources.',
    perks: [
      'One specialist agent',
      'Unlimited messages',
      'Wired to the live NZ sources it needs',
      'Drafts only — you stay in control',
    ],
    stripePriceId: '',
    stripeLookupKey: 'assembl_specialist_19900',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_SPECIALIST_19900',
    agentCount: 1,
  },
  {
    id: 'all_access',
    name: 'All-Access',
    label: 'All-Access $250/mo',
    monthlyNzd: 250,
    blurb: 'Every agent we make — now and as we add them.',
    perks: [
      'Every agent in the marketplace',
      'Every agent we add, included',
      'Unlimited messages across the lot',
      'The simplest way in for a busy team',
      'Cancel any month',
    ],
    stripePriceId: '',
    stripeLookupKey: 'assembl_all_access_25000',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_ALL_ACCESS_25000',
    agentCount: null,
  },
] as const;

const PLAN_BY_ID = new Map(AGENT_PLANS.map((p) => [p.id, p]));

export function isAgentPlan(value: string): value is AgentPlan {
  return PLAN_BY_ID.has(value as AgentPlan);
}

export function getAgentPlan(id: string): AgentPlanDef | undefined {
  return PLAN_BY_ID.get(id as AgentPlan);
}

/** How many agents must be picked for a plan (0 for fixed bundles / all-access). */
export function agentCountForPlan(plan: AgentPlan): number {
  return getAgentPlan(plan)?.agentCount ?? 0;
}

/**
 * Display label for a plan tier, e.g. "Free", "$9.99/mo", "Pro Stack — $49/mo",
 * "All-Access $250/mo". Defaults to the Everyday rung when no tier is given.
 * This is the single source of truth for plan labels across the site.
 */
export function agentPriceLabel(tier: AgentPlan = 'everyday'): string {
  return getAgentPlan(tier)?.label ?? '$9.99/mo';
}

/**
 * Per-agent card/detail label from a raw NZD price. Snaps whatever tier price
 * the registry carries onto the nearest canon rung so a card can never surface
 * an off-ladder figure: Free / $9.99/mo / $199/mo (GST inclusive).
 */
export function priceLabelForNzd(priceNzd: number): string {
  if (!priceNzd || priceNzd <= 0) return 'Free';
  return priceNzd >= 100 ? '$199/mo' : '$9.99/mo';
}

/**
 * Stripe price id for a plan, read from env. Returns null when unset (or when
 * the plan has no Stripe price, i.e. free) so callers can fail closed.
 */
export function priceIdForPlan(
  plan: AgentPlan,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const def = getAgentPlan(plan);
  if (!def || !def.envVar) return null;
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
    if (def.envVar && priceId === priceIdForPlan(def.id, env)) return def.id;
  }
  return null;
}

/**
 * The July launch promo: 50% off the first month for the first 20 businesses,
 * applied via the Stripe coupon JULYLAUNCH50. Created by
 * scripts/stripe-prostack-setup.ts.
 */
export const JULY_PROMO = {
  code: 'JULYLAUNCH50',
  percentOff: 50,
  maxRedemptions: 20,
  /** Stripe coupon `duration` — only the first invoice is discounted. */
  duration: 'once' as const,
  firstMonthOnly: true,
  blurb: 'First 20 businesses get 50% off the first month — code JULYLAUNCH50',
} as const;

export type PromoEligibility = {
  /** True while the coupon still has redemptions left (or we can't reach Stripe). */
  eligible: boolean;
  /** Redemptions remaining. Falls back to maxRedemptions when Stripe is unknown. */
  remaining: number;
  /** False when we couldn't read live state from Stripe (transient/unconfigured). */
  known: boolean;
};

// NOTE: the live Stripe check `eligibleForPromo()` lives in the server-only
// sibling `lib/billing/promo.ts`. It can't live here because this module is also
// imported by client components (via lib/marketplace/agents.ts), and importing
// the server-only Stripe client would poison the client bundle.
