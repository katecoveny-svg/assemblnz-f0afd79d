/**
 * Agent-marketplace Stripe webhook receiver.
 *
 * Reachable at https://assembl.co.nz/api/stripe/webhooks. This is the webhook
 * for the consumer agent marketplace + Stripe Connect payouts. (The legacy
 * /api/stripe-webhook endpoint serves the separate Tōro v0.3 commerce flow and
 * is left untouched — if both endpoints are registered in Stripe they each have
 * their own signing secret; see the PR description.)
 *
 * Signature verification is mandatory — we reject with 401 if the
 * Stripe-Signature header is missing or doesn't verify against
 * STRIPE_WEBHOOK_SECRET. Every event writes an audit row regardless of whether
 * a domain table is updated. We return 200 as fast as we safely can so Stripe
 * doesn't retry on a slow DB write; processing failures are logged + audited but
 * still ack'd (we don't want Stripe hammering retries on our own bugs).
 *
 * Events handled (per the marketplace commerce spec):
 *   - checkout.session.completed       → record the install / subscription
 *   - customer.subscription.updated    → mirror subscription status
 *   - customer.subscription.deleted    → drop entitlement
 *   - account.updated                  → mirror Connect onboarding status
 *   - payout.paid                      → stamp last_payout_at + audit
 */

import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/stripe/supabase-service';
import { writeAuditRow } from '@/lib/stripe/audit';
import { syncAccountStatus } from '@/lib/stripe/connect';
import { ALL_ACCESS_SLUG, isAgentPlan, planForPriceId } from '@/lib/billing/agent-pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'account.updated',
  'payout.paid',
]);

const SENTINEL_TENANT = '00000000-0000-0000-0000-000000000000';

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
    return NextResponse.json({ error: 'missing Stripe-Signature header' }, { status: 401 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    // Do NOT echo error detail — that would leak whether the secret is
    // misconfigured vs the signature wrong.
    return NextResponse.json({ error: 'signature verification failed' }, { status: 401 });
  }

  try {
    await processEvent(event);
  } catch (err) {
    // Log but still 200 — Stripe retries on non-2xx, and our processing
    // failures are recorded via the audit row written below / inside handlers.
    // eslint-disable-next-line no-console
    console.error(
      `stripe/webhooks: processing error for ${event.type} (${event.id}):`,
      err instanceof Error ? err.message : err,
    );
  }

  return NextResponse.json({ received: true, type: event.type, id: event.id }, { status: 200 });
}

async function processEvent(event: Stripe.Event): Promise<void> {
  // Every event audits regardless of whether it is one we mirror.
  await writeAuditRow({
    tenantId: SENTINEL_TENANT,
    action: `stripe.${event.type}`,
    agent_slug: 'marketplace',
    tool_input: {
      stripe_event_id: event.id,
      stripe_event_type: event.type,
      api_version: event.api_version,
    },
    tool_output: { livemode: event.livemode },
  });

  if (!HANDLED_EVENTS.has(event.type)) return;

  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await onSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'account.updated':
      await syncAccountStatus(event.data.object as Stripe.Account);
      break;
    case 'payout.paid':
      await onPayoutPaid(event);
      break;
    default:
      break;
  }
}

/**
 * A successful checkout. The session metadata (set by /api/agents/checkout)
 * carries our user_id, the plan, and the comma-joined agent slugs the customer
 * picked. We write one agent_installs row per picked agent — or a single
 * all-access row (agent_slug = '*') for the all-access plan. Best-effort: if the
 * agent_installs table isn't deployed yet, we degrade gracefully (the audit row
 * was already written above).
 */
async function onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
  const plan = session.metadata?.plan ?? null;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!userId || !plan || !isAgentPlan(plan)) return; // Not an agent subscription.

  // All-access → one sentinel row; Pro Stack / per-agent → one row per picked
  // slug (Pro Stack rides the four picked slugs in metadata, same as everyday).
  const metadataSlugs = (session.metadata?.agent_slugs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const slugs = plan === 'all_access' ? [ALL_ACCESS_SLUG] : metadataSlugs;

  if (slugs.length === 0) return; // No agents picked — nothing to grant.

  const rows = slugs.map((agentSlug) => ({
    user_id: userId,
    agent_slug: agentSlug,
    plan,
    stripe_subscription_id: subscriptionId,
  }));

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('agent_installs')
    .upsert(rows, { onConflict: 'user_id,agent_slug', ignoreDuplicates: false });

  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.error(`onCheckoutCompleted: ${error.message}`);
  }
}

async function onSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  const plan = planForPriceId(priceId);
  if (!plan) return; // Not one of our flat-ladder plans — leave untouched.

  // Reflect status onto every install carrying this subscription id. Cancelled /
  // unpaid subscriptions drop the install back to free entitlement; active ones
  // are restamped with the concrete plan id.
  const entitled = sub.status === 'active' || sub.status === 'trialing';
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('agent_installs')
    .update({ plan: entitled ? plan : 'free' })
    .eq('stripe_subscription_id', sub.id);

  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.error(`onSubscriptionUpdated: ${error.message}`);
  }
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  // Remove the entitlement rows tied to this subscription. Deleting (rather than
  // downgrading) keeps the table clean; the user falls back to the free tier.
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('agent_installs')
    .delete()
    .eq('stripe_subscription_id', sub.id);

  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.error(`onSubscriptionDeleted: ${error.message}`);
  }
}

/**
 * A payout to a connected account succeeded. Stamp last_payout_at on the
 * matching payout account. The Connect account id arrives in the event's
 * `account` field (Stripe sets it on connected-account events).
 */
async function onPayoutPaid(event: Stripe.Event): Promise<void> {
  const accountId = (event as Stripe.Event & { account?: string }).account ?? null;
  if (!accountId) return;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('agent_payout_accounts')
    .update({ last_payout_at: new Date().toISOString() })
    .eq('stripe_account_id', accountId);

  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.error(`onPayoutPaid: ${error.message}`);
  }
}

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42P01') return true;
  const m = (error.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the table');
}
