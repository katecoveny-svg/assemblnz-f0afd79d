import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';
import { PilotError } from '@/lib/typesafe/core';
import { enabledPersonalDoPlan } from './personal-do-plan';

export async function hasPersonalDoEntitlement(ownerId: string): Promise<boolean> {
  const plan = enabledPersonalDoPlan();
  if (!plan) return false;
  const { data, error } = await getServiceClient().from('personal_do_subscriptions').select('stripe_subscription_id')
    .eq('owner_id', ownerId).eq('price_id', plan.priceId).in('status', ['active', 'trialing'])
    .gt('period_end', new Date().toISOString()).limit(1);
  if (error) throw new PilotError('billing_unavailable', 503, 'DO could not check your access. Please try again.');
  return !!data?.length;
}

/** A reservation is conservative spend accounting, not a measured provider invoice. No prompt is persisted. */
export async function admitPersonalDoUsage(ownerId: string, input: unknown, requestId: string = randomUUID()) {
  const plan = enabledPersonalDoPlan();
  if (!plan) throw new PilotError('consumer_unavailable', 503, 'Personal DO subscriptions are not available yet.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new PilotError('invalid_request_id', 400, 'Use a valid request identifier.');
  const db = getServiceClient();
  const { data, error } = await db.rpc('admit_personal_do_request', {
    p_owner: ownerId, p_request: requestId, p_digest: createHash('sha256').update(JSON.stringify(input)).digest('hex'),
    p_price: plan.priceId, p_daily: plan.requestsPerDay, p_monthly: plan.requestsPerMonth,
    p_reserve: plan.maxRequestProviderCostCents, p_owner_budget: plan.maxMonthlyProviderCostCents,
    p_global_budget: plan.globalMonthlyProviderCostCents,
  });
  if (error || typeof data !== 'string') throw new PilotError('usage_unavailable', 503, 'DO could not reserve this request. No provider request was started.');
  if (data !== 'admitted') {
    const status = data === 'entitlement_required' ? 403 : data === 'invalid_configuration' ? 503 : data.startsWith('already_') || data === 'idempotency_conflict' ? 409 : 429;
    throw new PilotError(data, status, data === 'entitlement_required' ? 'A current Personal DO subscription is required.' : 'This request cannot start again or has reached the current usage limit.');
  }
  return { requestId, async finish(succeeded: boolean, metrics: unknown = null) {
    const { error: writeError } = await db.from('personal_do_usage').update({ status: succeeded ? 'succeeded' : 'failed', token_usage: metrics })
      .eq('owner_id', ownerId).eq('request_id', requestId).eq('status', 'pending');
    if (writeError) throw new PilotError('usage_settlement_failed', 503, 'DO could not record this request safely. Please wait before retrying.');
  } };
}
