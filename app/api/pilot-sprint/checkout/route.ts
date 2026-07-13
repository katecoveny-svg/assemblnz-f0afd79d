import { NextResponse } from 'next/server';
import { consume, rateKey } from '@/lib/creative/ratelimit';
import {
  PILOT_SPRINT_DESCRIPTION,
  PILOT_SPRINT_EX_GST_NZD,
  PILOT_SPRINT_GST_NZD,
  PILOT_SPRINT_TOTAL_CENTS,
} from '@/lib/billing/pilot-sprint';
import { getStripe } from '@/lib/stripe/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function field(input: unknown, max: number): string | null {
  return typeof input === 'string' && input.trim().length > 0 && input.trim().length <= max
    ? input.trim()
    : null;
}

/**
 * Generate a one-time Stripe Checkout URL for an already-approved Pilot Sprint.
 * NZ$1,500 + NZ$225 GST is charged in one payment and an invoice is created.
 */
export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!input) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const name = field(input.name, 120);
  const business = field(input.business, 180);
  const email = field(input.email, 200);
  const workflow = field(input.workflow, 500);
  const accepted = input.accepted === true;
  if (!name || !business || !email || !EMAIL_RE.test(email) || !workflow || !accepted) {
    return NextResponse.json({ error: 'Name, business, valid email, agreed workflow and acceptance are required.' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Secure checkout is not configured yet.' }, { status: 503 });
  }

  const rate = await consume(rateKey(request), 'pilot-sprint-checkout');
  if (!rate.ok) return NextResponse.json({ error: 'Too many checkout attempts. Try again in an hour.' }, { status: 429 });

  try {
    const requestUrl = new URL(request.url);
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || 'https://www.assembl.co.nz';
    const origin = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(requestUrl.hostname)
      ? requestUrl.origin
      : new URL(configuredOrigin).origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      invoice_creation: { enabled: true },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'nzd',
          unit_amount: PILOT_SPRINT_TOTAL_CENTS,
          product_data: {
            name: 'assembl Founding Pilot Sprint',
            description: `${PILOT_SPRINT_DESCRIPTION} Price includes NZ$225 GST.`,
            metadata: { assembl_offer: 'founding-pilot-sprint' },
          },
        },
      }],
      metadata: {
        assembl_offer: 'founding-pilot-sprint',
        customer_name: name,
        business: business.slice(0, 180),
        workflow,
        price_ex_gst_nzd: String(PILOT_SPRINT_EX_GST_NZD),
        gst_nzd: String(PILOT_SPRINT_GST_NZD),
      },
      payment_intent_data: {
        metadata: { assembl_offer: 'founding-pilot-sprint', business: business.slice(0, 180) },
      },
      success_url: `${origin}/pilot-sprint?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pilot-sprint?checkout=cancelled`,
    });
    if (!session.url) return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (cause) {
    console.error('pilot sprint checkout: stripe error', cause);
    return NextResponse.json({ error: 'Could not start secure checkout.' }, { status: 502 });
  }
}
