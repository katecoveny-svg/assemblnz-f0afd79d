/**
 * Dash accrual — write the publisher's rev-share into the payout ledger when an
 * impression is recorded. Append-only, idempotent per impression so a retried
 * serve/record path never double-credits.
 *
 * Targets the production "payout" dash schema: dash_impressions.revenue_nzd (uuid
 * publisher_id) and dash_publishers.rev_share. (See the schema-reconciliation
 * follow-up — the serving code still uses the older "beat" shape; this helper is
 * ready for when real impressions flow through the payout tables.)
 *
 * Server-only; uses the service-role client (RLS bypass) since the ledger is
 * write-restricted.
 */
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publisherCredit } from './payouts';

export interface AccrueInput {
  /** dash_impressions.id — the idempotency key. */
  impressionId: string;
  /** dash_publishers.id (uuid). The payout party. */
  publisherId: string;
  /** Gross revenue assembl earned on this impression (NZD). */
  revenueNzd: number;
  /** Publisher rev-share (0.55 standard / 0.60 anchor). */
  revShare: number;
}

export interface AccrueResult {
  credited: boolean;
  amountNzd: number;
  reason: 'ok' | 'duplicate' | 'zero' | 'error';
}

/**
 * Credit a publisher for one impression. Returns `duplicate` (no-op) if a ledger
 * credit already exists for this impression — making the call safe to retry.
 */
export async function accruePublisherImpression(
  service: SupabaseClient,
  input: AccrueInput,
): Promise<AccrueResult> {
  const amount = publisherCredit(input.revenueNzd, input.revShare);
  if (amount <= 0) return { credited: false, amountNzd: 0, reason: 'zero' };

  // Idempotency: one credit per impression.
  const { data: existing, error: lookupErr } = await service
    .from('dash_payout_ledger')
    .select('id')
    .eq('impression_id', input.impressionId)
    .eq('direction', 'credit')
    .limit(1)
    .maybeSingle();

  if (lookupErr) {
    console.error('[dash-accrual] ledger lookup failed', lookupErr.message);
    return { credited: false, amountNzd: amount, reason: 'error' };
  }
  if (existing) return { credited: false, amountNzd: amount, reason: 'duplicate' };

  const { error: insertErr } = await service.from('dash_payout_ledger').insert({
    party_type: 'publisher',
    party_id: input.publisherId,
    direction: 'credit',
    amount_nzd: amount,
    reason: 'impression rev-share',
    impression_id: input.impressionId,
  });

  if (insertErr) {
    console.error('[dash-accrual] ledger insert failed', insertErr.message);
    return { credited: false, amountNzd: amount, reason: 'error' };
  }
  return { credited: true, amountNzd: amount, reason: 'ok' };
}
