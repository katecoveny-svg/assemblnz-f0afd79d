/**
 * Server-side subscription state + the single tier gate.
 *
 * `requireTier(orgId, minTier)` is the one place workflow access is decided.
 * It is fail-closed: any error, missing row, or non-entitled status resolves
 * to the free tier, so a caller can never accidentally grant paid access. The
 * client is never trusted — entitlement is read from the `subscriptions` table
 * with the service role.
 *
 * This also closes the MCP audit's missing-tier-gating finding.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { TIER_RANK, tierSatisfies, isTier, type Tier } from '@/lib/billing/tiers';

/** Stripe statuses that grant access. A scheduled cancel keeps 'active' until
 *  the period ends, then flips to 'canceled' — which drops out of this set. */
const ENTITLED_STATUSES = new Set(['active', 'trialing']);

export type ActiveSubscription = {
  tenantId: string;
  tier: Tier;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/**
 * The tenant's current entitled tier. Returns 'free' when there is no active
 * paid subscription, when the table is missing, or on any error.
 */
export async function getEntitledTier(orgId: string): Promise<Tier> {
  const sub = await getActiveSubscription(orgId);
  return sub?.tier ?? 'free';
}

export async function getActiveSubscription(orgId: string): Promise<ActiveSubscription | null> {
  if (!orgId) return null;
  let supabase: ReturnType<typeof getServiceClient>;
  try {
    supabase = getServiceClient();
  } catch {
    return null; // No service client → fail closed to free.
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('tenant_id, tier, status, current_period_end, cancel_at_period_end')
    .eq('tenant_id', orgId)
    .in('status', Array.from(ENTITLED_STATUSES))
    .order('current_period_end', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as {
    tenant_id: string;
    tier: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  };
  if (!isTier(row.tier) || !ENTITLED_STATUSES.has(row.status)) return null;

  return {
    tenantId: row.tenant_id,
    tier: row.tier,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
  };
}

export type RequireTierResult =
  | { ok: true; tier: Tier }
  | { ok: false; tier: Tier; reason: 'insufficient_tier' };

/**
 * The gate. `ok` is true only when the tenant's entitled tier meets or exceeds
 * `minTier`. Never throws for the not-entitled case — callers branch on `ok`
 * and return 402/403 themselves.
 */
export async function requireTier(orgId: string, minTier: Tier): Promise<RequireTierResult> {
  const tier = await getEntitledTier(orgId);
  if (tierSatisfies(tier, minTier)) {
    return { ok: true, tier };
  }
  return { ok: false, tier, reason: 'insufficient_tier' };
}

export { TIER_RANK };
