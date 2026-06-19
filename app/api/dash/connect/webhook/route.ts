/**
 * POST /api/dash/connect/webhook — Stripe Connect webhook receiver.
 *
 * SEPARATE endpoint + secret from the main /api/stripe-webhook. Connect events
 * are delivered to their own webhook endpoint with their own signing secret
 * (STRIPE_CONNECT_WEBHOOK_SECRET). Create that endpoint in the Stripe dashboard
 * (Developers → Webhooks → "Connect" listening mode) once Connect is enabled.
 *
 * Hard rule: signature verification is mandatory — 401 if the signature is
 * missing or doesn't verify. Acknowledge fast; keep DB writes narrow.
 *
 * Events handled (Phase A):
 *   - account.updated   → sync charges_enabled / payouts_enabled / details_submitted
 *   - transfer.reversed → mark the matching dash_payouts row failed
 */
import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/stripe/supabase-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED = new Set(['account.updated', 'transfer.reversed']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_CONNECT_WEBHOOK_SECRET not configured' }, { status: 500 });
  }
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing Stripe-Signature header' }, { status: 401 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: 'signature verification failed' }, { status: 401 });
  }

  try {
    if (HANDLED.has(event.type)) await processEvent(event);
  } catch (err) {
    console.error(`[dash-connect-webhook] processing error for ${event.type} (${event.id}):`, err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ received: true, type: event.type, id: event.id }, { status: 200 });
}

async function processEvent(event: Stripe.Event): Promise<void> {
  const service = createServiceClient();

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    const { error } = await service
      .from('dash_connect_accounts')
      .update({
        charges_enabled: Boolean(account.charges_enabled),
        payouts_enabled: Boolean(account.payouts_enabled),
        details_submitted: Boolean(account.details_submitted),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', account.id);
    if (error) console.error('[dash-connect-webhook] account.updated write failed', error.message);
    return;
  }

  if (event.type === 'transfer.reversed') {
    const transfer = event.data.object as Stripe.Transfer;
    const payoutId = (transfer.metadata?.dash_payout_id as string | undefined) ?? null;
    const query = service
      .from('dash_payouts')
      .update({ status: 'failed', failure_reason: 'transfer reversed' });
    const { error } = payoutId
      ? await query.eq('id', payoutId)
      : await query.eq('stripe_transfer_id', transfer.id);
    if (error) console.error('[dash-connect-webhook] transfer.reversed write failed', error.message);
  }
}
