/**
 * POST /api/dash/connect/onboard — start (or resume) Stripe Connect Express
 * onboarding for a Dash publisher.
 *
 * Creates an Express connected account (Stripe hosts KYC + a lightweight
 * dashboard; assembl stays the platform of record), records it in
 * dash_connect_accounts, then returns a hosted account-onboarding link the
 * publisher is redirected to. Idempotent: an existing account for the publisher
 * is reused, never duplicated.
 *
 * Phase A (publishers first). Prereq: Connect enabled in the Stripe dashboard
 * (Settings → Connect), NZ payout country, platform profile complete.
 *
 * Body: { publisherId: uuid, refreshUrl?, returnUrl? }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/stripe/supabase-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  publisherId: z.string().uuid(),
  refreshUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
});

const SITE = 'https://assembl.co.nz';

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { publisherId } = parsed.data;
  const refreshUrl = parsed.data.refreshUrl ?? `${SITE}/dash/connect/refresh`;
  const returnUrl = parsed.data.returnUrl ?? `${SITE}/dash/connect/return`;

  const service = createServiceClient();

  // Publisher must exist.
  const { data: publisher, error: pubErr } = await service
    .from('dash_publishers')
    .select('id, company')
    .eq('id', publisherId)
    .maybeSingle();
  if (pubErr) {
    console.error('[dash-connect] publisher lookup failed', pubErr.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 503 });
  }
  if (!publisher) {
    return NextResponse.json({ error: 'Unknown publisher' }, { status: 404 });
  }

  const stripe = getStripe();

  // Reuse an existing connect account for this publisher if present.
  const { data: existing } = await service
    .from('dash_connect_accounts')
    .select('id, stripe_account_id')
    .eq('party_type', 'publisher')
    .eq('publisher_id', publisherId)
    .maybeSingle();

  let stripeAccountId = existing?.stripe_account_id ?? null;

  if (!stripeAccountId) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'NZ',
        business_type: 'company',
        capabilities: { transfers: { requested: true } },
        metadata: { dash_publisher_id: publisherId, dash_company: publisher.company ?? '' },
      });
      stripeAccountId = account.id;
      const { error: insErr } = await service.from('dash_connect_accounts').insert({
        party_type: 'publisher',
        publisher_id: publisherId,
        stripe_account_id: stripeAccountId,
        country: 'NZ',
      });
      if (insErr) {
        // The account exists in Stripe; surface the row failure but don't lose it.
        console.error('[dash-connect] connect-account row insert failed', insErr.message, stripeAccountId);
      }
    } catch (err) {
      console.error('[dash-connect] accounts.create failed', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Could not start onboarding' }, { status: 502 });
    }
  }

  try {
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return NextResponse.json({ url: link.url, stripeAccountId }, { status: 200 });
  } catch (err) {
    console.error('[dash-connect] accountLinks.create failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not create onboarding link' }, { status: 502 });
  }
}
