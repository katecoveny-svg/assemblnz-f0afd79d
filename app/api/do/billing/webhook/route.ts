import type Stripe from 'stripe';
import { getStripe, STRIPE_WEBHOOK_TOLERANCE_SECONDS } from '@/lib/stripe/client';
import { getServiceClient } from '@/lib/supabase/service';
import { enabledPersonalDoPlan } from '@/lib/billing/personal-do-plan';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const json = (body: unknown, status: number) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const plan = enabledPersonalDoPlan();
  const secret = process.env.PERSONAL_DO_STRIPE_WEBHOOK_SECRET;
  if (!plan || !secret) return json({ error: 'webhook_unavailable' }, 503);
  let event: Stripe.Event;
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) return json({ error: 'invalid_signature' }, 400);
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > 256_000) return json({ error: 'body_too_large' }, 413);
    event = getStripe().webhooks.constructEvent(Buffer.from(bytes), signature, secret, STRIPE_WEBHOOK_TOLERANCE_SECONDS);
  } catch { return json({ error: 'invalid_signature' }, 400); }
  if (!['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) return json({ received: true }, 200);
  try {
    const db = getServiceClient();
    const { data: receipt, error: receiptError } = await db.from('personal_do_webhook_receipts').select('event_id').eq('event_id', event.id).maybeSingle();
    if (receiptError) throw new Error('Receipt unavailable');
    if (receipt) return json({ received: true }, 200);
    // Retrieve current Stripe state: redelivery and out-of-order snapshots cannot restore cancelled access.
    const snapshot = event.data.object as Stripe.Subscription;
    const subscription = await getStripe().subscriptions.retrieve(snapshot.id);
    const item = subscription.items.data[0];
    if (subscription.items.data.length !== 1 || !item || item.price.id !== plan.priceId || item.quantity !== 1) throw new Error('Unexpected consumer subscription');
    const customer = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const { error } = await db.rpc('sync_personal_do_subscription', {
      p_event: event.id, p_customer: customer, p_subscription: subscription.id, p_price: item.price.id,
      p_status: subscription.status, p_period_end: new Date(item.current_period_end * 1000).toISOString(),
      p_cancel: subscription.cancel_at_period_end, p_event_created: event.created,
    });
    if (error) throw new Error('Subscription not acknowledged');
    return json({ received: true }, 200);
  } catch { return json({ error: 'webhook_processing_failed' }, 503); }
}
