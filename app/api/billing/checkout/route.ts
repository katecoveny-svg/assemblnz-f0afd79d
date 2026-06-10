/**
 * POST /api/billing/checkout — start a self-serve subscription.
 *
 * Body: { tier: 'solo' | 'team' }
 *
 * Auth-gated: the signed-in user is resolved to a tenant (provisioned on first
 * checkout), a Stripe Customer is reused/created, and a Checkout Session in
 * subscription mode is returned. The webhook mirrors the resulting subscription
 * into public.subscriptions; entitlement is never trusted from the client.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { getOrCreateCustomer } from '@/lib/stripe/customer';
import { resolveOrCreateTenantId } from '@/lib/billing/tenant-context';
import { isPaidTier, priceIdForTier, getSelfServeTier } from '@/lib/billing/tiers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { tier?: string };
  try {
    body = (await req.json()) as { tier?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tier = body.tier ?? '';
  if (!isPaidTier(tier)) {
    return NextResponse.json({ error: 'Unknown tier' }, { status: 400 });
  }

  const priceId = priceIdForTier(tier);
  if (!priceId) {
    // Fail closed: prices not configured yet (run scripts/setup-self-serve-stripe.ts).
    return NextResponse.json({ error: 'Billing is not configured yet' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to subscribe' }, { status: 401 });
  }

  let tenantId: string;
  try {
    tenantId = await resolveOrCreateTenantId(user.id, user.email ?? null);
  } catch (error) {
    console.error('billing checkout: tenant resolution failed', error);
    return NextResponse.json({ error: 'Could not prepare your workspace' }, { status: 500 });
  }

  try {
    const customer = await getOrCreateCustomer({
      tenantId,
      contactEmail: user.email ?? undefined,
    });

    const origin = req.headers.get('origin') ?? new URL(req.url).origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.stripe_customer_id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/app/billing?status=active`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: { assembl_tenant_id: tenantId, assembl_tier: tier },
      },
      metadata: { assembl_tenant_id: tenantId, assembl_tier: tier },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, tier, plan: getSelfServeTier(tier)?.name });
  } catch (error) {
    console.error('billing checkout: stripe error', error);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 });
  }
}
