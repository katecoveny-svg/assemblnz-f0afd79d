/**
 * Stripe webhook receiver.
 *
 * Reachable at https://assembl.co.nz/api/stripe-webhook (canon webhook
 * destination `we_1TDx8fPXAX9ohARRtG5JAUPi`).
 *
 * Hard rule #35 — webhook signature verification is mandatory. We
 * reject with 401 if Stripe-Signature header is missing or doesn't
 * verify against STRIPE_WEBHOOK_SECRET. No exceptions.
 *
 * Hard rule #36 — every event writes a row to assembl_audit_log,
 * regardless of whether the matching toro_payment_intents row is
 * updated.
 *
 * Returns 200 as fast as possible. Heavy work happens after we've
 * acknowledged, so Stripe doesn't retry on a slow DB write.
 *
 * Events handled (the nine called out in the v0.3 commerce spec):
 *   - payment_intent.succeeded
 *   - payment_intent.payment_failed
 *   - payment_intent.requires_action
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - setup_intent.succeeded
 *   - invoice.paid
 *   - invoice.payment_failed
 */

import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/stripe/supabase-service';
import { writeAuditRow } from '@/lib/stripe/audit';
import { loadCustomerByStripeId } from '@/lib/stripe/customer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.requires_action',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'setup_intent.succeeded',
  'invoice.paid',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Mis-configuration: fail closed.
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'missing Stripe-Signature header' },
      { status: 401 },
    );
  }

  const readBody = request.text?.bind(request);
  if (!readBody) {
    return NextResponse.json({ error: 'request body reader unavailable' }, { status: 500 });
  }
  const rawBody = await readBody();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    // Signature verification failed. Do NOT echo the error detail to
    // the caller; that would leak whether the secret was misconfigured
    // vs the signature wrong.
    return NextResponse.json({ error: 'signature verification failed' }, { status: 401 });
  }

  // Acknowledge fast. Process in the same handler — Next.js serverless
  // functions on Vercel run to completion before responding, so we
  // can't truly background. Keep handlers small and Supabase calls
  // narrow.
  try {
    await processEvent(event);
  } catch (err) {
    // Log but still 200 — Stripe retries on non-2xx, and our processing
    // failures are recorded in the audit log via writeAuditRow's catch.
    // eslint-disable-next-line no-console
    console.error(
      `stripe-webhook: processing error for ${event.type} (${event.id}):`,
      err instanceof Error ? err.message : err,
    );
  }

  return NextResponse.json({ received: true, type: event.type, id: event.id }, { status: 200 });
}

async function processEvent(event: Stripe.Event): Promise<void> {
  // Every event audits regardless. tenant_id resolution is best-effort:
  // we look up the Stripe customer to find our tenant_id mapping, falling
  // back to a sentinel tenant when no mapping exists (e.g. one-off test
  // event).
  const tenantId = await resolveTenantId(event);

  await writeAuditRow({
    tenantId: tenantId ?? '00000000-0000-0000-0000-000000000000',
    action: `stripe.${event.type}`,
    agent_slug: 'toro',
    tool_input: {
      stripe_event_id: event.id,
      stripe_event_type: event.type,
      api_version: event.api_version,
    },
    tool_output: { livemode: event.livemode },
  });

  if (!HANDLED_EVENTS.has(event.type)) return;

  switch (event.type) {
    case 'payment_intent.succeeded':
      await onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await onPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.requires_action':
      await onPaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await onSubscriptionUpsert(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'setup_intent.succeeded':
      await onSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
      break;
    case 'invoice.paid':
    case 'invoice.payment_failed':
      // Audit already written above; no additional DB mirror needed for
      // Phase 1 (no per-invoice table yet). Subscription status flips
      // arrive via customer.subscription.updated and are handled there.
      break;
    default:
      // Exhaustive — guarded by HANDLED_EVENTS.
      break;
  }
}

async function onPaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from('toro_payment_intents')
    .update({ status: pi.status, captured_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', pi.id);
}

async function onPaymentIntentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from('toro_payment_intents')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', pi.id);
}

async function onPaymentIntentRequiresAction(pi: Stripe.PaymentIntent): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from('toro_payment_intents')
    .update({ status: pi.status })
    .eq('stripe_payment_intent_id', pi.id);
}

async function onSubscriptionUpsert(sub: Stripe.Subscription): Promise<void> {
  const supabase = createServiceClient();
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const periodEnd = readSubscriptionPeriodEnd(sub);
  await supabase
    .from('toro_stripe_customers')
    .update({
      subscription_id: sub.id,
      subscription_status: sub.status,
      subscription_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq('stripe_customer_id', customerId);
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const supabase = createServiceClient();
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  await supabase
    .from('toro_stripe_customers')
    .update({
      subscription_id: null,
      subscription_status: 'canceled',
      subscription_current_period_end: null,
    })
    .eq('stripe_customer_id', customerId);
}

async function onSetupIntentSucceeded(si: Stripe.SetupIntent): Promise<void> {
  const customerId = typeof si.customer === 'string' ? si.customer : si.customer?.id;
  if (!customerId) return;
  const paymentMethodId =
    typeof si.payment_method === 'string' ? si.payment_method : si.payment_method?.id;
  if (!paymentMethodId) return;

  // Fetch the payment method to capture card brand + last4 for the UI.
  const stripe = getStripe();
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

  const supabase = createServiceClient();
  await supabase
    .from('toro_stripe_customers')
    .update({
      default_payment_method_id: paymentMethodId,
      default_payment_brand: pm.card?.brand ?? null,
      default_payment_last4: pm.card?.last4 ?? null,
    })
    .eq('stripe_customer_id', customerId);

  // Mirror as the customer's invoice_settings.default_payment_method so
  // future subscription invoices charge this card by default.
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
}

async function resolveTenantId(event: Stripe.Event): Promise<string | null> {
  // Most relevant event payloads carry the Stripe customer id; look up
  // our mapping. Walk the most common shapes.
  const obj = event.data.object as { customer?: string | { id?: string } } | undefined;
  if (!obj) return null;
  const customerId = typeof obj.customer === 'string'
    ? obj.customer
    : obj.customer?.id ?? null;
  if (!customerId) return null;

  try {
    const mapping = await loadCustomerByStripeId(customerId);
    return mapping?.tenant_id ?? null;
  } catch {
    return null;
  }
}

// Stripe SDK versions vary on subscription period-end field location.
// `current_period_end` is on Subscription in older versions and on the
// first item in newer ones. Read both for forward + backward compat.
function readSubscriptionPeriodEnd(sub: Stripe.Subscription): number | null {
  const direct = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof direct === 'number') return direct;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  if (item && typeof item.current_period_end === 'number') return item.current_period_end;
  return null;
}
