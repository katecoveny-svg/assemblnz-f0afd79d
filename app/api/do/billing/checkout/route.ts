import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { getServiceClient } from '@/lib/supabase/service';
import { hasPersonalDoEntitlement } from '@/lib/billing/personal-do-access';
import { personalDoCustomer, personalDoStripePlan } from '@/lib/billing/personal-do-stripe';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const json = (body: unknown, status: number) => Response.json(body, { status, headers: privateDoHeaders });
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  try {
    const { plan, stripe } = await personalDoStripePlan();
    if (await hasPersonalDoEntitlement(owner.id)) return json({ error: 'already_subscribed' }, 409);
    const customer = await personalDoCustomer(owner.id, true);
    if (!customer) throw new Error('Customer missing');
    const existing = await stripe.subscriptions.list({ customer, status: 'all', limit: 100 });
    if (existing.has_more || existing.data.some(sub => !['canceled','incomplete_expired'].includes(sub.status))) return json({ error: 'subscription_exists', message: 'Manage your existing subscription before starting another.' }, 409);
    const { data: attemptData, error: attemptError } = await getServiceClient().rpc('personal_do_checkout_attempt', { p_owner: owner.id });
    const attempt = Array.isArray(attemptData) ? attemptData[0] : attemptData;
    if (attemptError || !attempt?.attempt_id || !attempt.expires_at) throw new Error('Checkout attempt unavailable');
    const origin = new URL(request.url).origin;
    // Each session expires promptly; checkout completion never grants access by itself.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', customer, line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${origin}/do/personal?checkout=returned`, cancel_url: `${origin}/do/personal`,
      client_reference_id: owner.id, expires_at: Math.floor(new Date(attempt.expires_at).getTime() / 1000),
      automatic_tax: { enabled: plan.automaticTax }, customer_update: { address: 'auto' },
      subscription_data: { metadata: { personal_do_owner: owner.id } },
    }, { idempotencyKey: `personal-do-checkout:${owner.id}:${attempt.attempt_id}` });
    // The redirect confers no entitlement. Only the dedicated signed webhook updates access.
    return json({ url: session.url }, 200);
  } catch { return json({ error: 'checkout_unavailable', message: 'Personal DO subscriptions are not available yet.' }, 503); }
}
