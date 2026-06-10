/**
 * POST /api/billing/portal — open the Stripe billing portal.
 *
 * Lets a subscriber manage or cancel their plan. Cancelling there sets
 * cancel_at_period_end; the webhook flips status to canceled at period end,
 * which drops the tenant back to free via requireTier.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { loadCustomer } from '@/lib/stripe/customer';
import { resolveOrCreateTenantId } from '@/lib/billing/tenant-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to manage billing' }, { status: 401 });
  }

  let tenantId: string;
  try {
    tenantId = await resolveOrCreateTenantId(user.id, user.email ?? null);
  } catch (error) {
    console.error('billing portal: tenant resolution failed', error);
    return NextResponse.json({ error: 'Could not load your workspace' }, { status: 500 });
  }

  const customer = await loadCustomer(tenantId);
  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account yet' }, { status: 404 });
  }

  try {
    const origin = req.headers.get('origin') ?? new URL(req.url).origin;
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${origin}/app/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('billing portal: stripe error', error);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 502 });
  }
}
