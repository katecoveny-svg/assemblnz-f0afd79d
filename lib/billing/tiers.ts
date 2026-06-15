/**
 * Self-serve subscription tiers — the conversion step between the free HAPAI
 * tools and the $3,500/mo kete pack.
 *
 * Locked numbers (confirmed by Kate, June 2026): Solo NZ$49/mo, Team NZ$149/mo.
 * Both are GST exclusive, in line with PRICING-LOCKED.md.
 *
 * Hard rules carried here:
 *   - Draft-only stays absolute on every tier. Paying never unlocks
 *     auto-lodging or auto-send. (See posture copy below.)
 *   - Self-serve does NOT include the done-for-you Pilot Sprint or the human
 *     review service — those protect the $5k Pilot. (excludes[] below.)
 *
 * Stripe price IDs are NOT hardcoded. They come from env so the same code runs
 * against test and live keys. Create the products/prices with
 * scripts/setup-self-serve-stripe.ts, then set STRIPE_PRICE_SOLO / _TEAM.
 */

export type Tier = 'free' | 'solo' | 'team';
export type PaidTier = Exclude<Tier, 'free'>;

/** Higher rank = more access. Used by requireTier for fail-closed comparisons. */
export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  solo: 1,
  team: 2,
};

export type SelfServeTier = {
  id: PaidTier;
  name: string;
  /** Monthly price in NZD, GST exclusive. */
  monthlyNzd: number;
  /** Stripe lookup_key used when creating the price (stable across envs). */
  stripeLookupKey: string;
  seats: number;
  summary: string;
  includes: string[];
  excludes: string[];
};

export const SELF_SERVE_TIERS: readonly SelfServeTier[] = [
  {
    id: 'solo',
    name: 'Solo',
    monthlyNzd: 49,
    stripeLookupKey: 'assembl_solo_monthly_nzd',
    seats: 1,
    summary: 'One kete’s workflows for a single user. Self-serve, no sales call.',
    includes: [
      'One industry kete’s workflows',
      'Single user',
      'Draft-only outputs, reviewed by you',
      'HAPAI tools included',
      'Cancel any time',
    ],
    excludes: ['Done-for-you Pilot Sprint', 'assembl human-review service'],
  },
  {
    id: 'team',
    name: 'Team',
    monthlyNzd: 149,
    stripeLookupKey: 'assembl_team_monthly_nzd',
    seats: 5,
    summary: 'Every kete for a small team. Self-serve, no sales call.',
    includes: [
      'All kete workflows',
      'Up to 5 users',
      'Draft-only outputs, reviewed by your team',
      'HAPAI tools included',
      'Cancel any time',
    ],
    excludes: ['Done-for-you Pilot Sprint', 'assembl human-review service'],
  },
] as const;

/** Posture shown on every self-serve surface — paying never relaxes it. */
export const SELF_SERVE_POSTURE =
  'Every output stays a draft for a named person to review. No tier auto-lodges, auto-files, or auto-sends anything.';

export function getSelfServeTier(id: string): SelfServeTier | undefined {
  return SELF_SERVE_TIERS.find((tier) => tier.id === id);
}

export function isPaidTier(value: string): value is PaidTier {
  return value === 'solo' || value === 'team';
}

export function isTier(value: string): value is Tier {
  return value === 'free' || value === 'solo' || value === 'team';
}

/** Env var name holding the Stripe price id for a paid tier. */
function priceEnvVar(tier: PaidTier): string {
  return tier === 'solo' ? 'STRIPE_PRICE_SOLO' : 'STRIPE_PRICE_TEAM';
}

/**
 * Stripe price id for a tier, read from env. Returns null when unset so
 * callers can fail closed (e.g. the checkout route returns a clear error
 * instead of creating a broken session).
 */
export function priceIdForTier(
  tier: PaidTier,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env[priceEnvVar(tier)];
  return value && value.length > 0 ? value : null;
}

/**
 * Reverse map: which tier does a Stripe price id correspond to? Used by the
 * webhook to set the tier when a subscription is created/updated. Returns null
 * for prices we don't recognise (e.g. the legacy kete-pack price) so the
 * webhook leaves the self-serve `subscriptions` table untouched for those.
 */
export function tierForPriceId(
  priceId: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): PaidTier | null {
  if (!priceId) return null;
  if (priceId === priceIdForTier('solo', env)) return 'solo';
  if (priceId === priceIdForTier('team', env)) return 'team';
  return null;
}

/** Does `current` satisfy `required`? Free never satisfies a paid requirement. */
export function tierSatisfies(current: Tier, required: Tier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}
