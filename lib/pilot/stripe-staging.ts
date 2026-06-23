/**
 * Pilot Stripe staging.
 *
 * When a user ships an agent on a paid tier, Pilot creates a Stripe product +
 * price but stages them inactive (`active: false`) — they only go live when the
 * agent is published through marketplace review. This keeps the catalogue and
 * Stripe in step without exposing a half-reviewed agent for purchase.
 *
 * FAIL-OPEN: if Stripe is not configured (no STRIPE_SECRET_KEY), staging is
 * skipped and the ship still succeeds — the agent saves as a draft, payments
 * are simply not wired yet. Free-tier agents never touch Stripe.
 *
 * Server-only.
 */
import 'server-only';
import { getStripe } from '@/lib/stripe/client';
import type { PilotDraft } from './types';

const TIER_NZD: Record<string, number> = {
  free: 0,
  toro: 9.99,
  whanau: 24.99,
  pro: 49.99,
  business: 199,
};

export interface StagedProduct {
  stripeProductId: string | null;
  stripePriceId: string | null;
  staged: boolean;
  reason?: string;
}

/**
 * Create an inactive Stripe product + monthly NZD price for a paid agent draft.
 * Returns nulls (staged: false) for free agents or when Stripe is unconfigured.
 */
export async function stageStripeProduct(draft: PilotDraft): Promise<StagedProduct> {
  const monthly = TIER_NZD[draft.priceTier] ?? 0;
  if (monthly <= 0) {
    return { stripeProductId: null, stripePriceId: null, staged: false, reason: 'free tier' };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { stripeProductId: null, stripePriceId: null, staged: false, reason: 'stripe not configured' };
  }

  try {
    const stripe = getStripe();
    const product = await stripe.products.create({
      name: `${draft.name} — built with Pilot`,
      // Inactive until the agent is published through review.
      active: false,
      description: draft.description.slice(0, 350) || undefined,
      metadata: {
        assembl_source: 'pilot',
        assembl_pilot_slug: draft.slug,
        assembl_price_tier: draft.priceTier,
        assembl_status: draft.status,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'nzd',
      unit_amount: Math.round(monthly * 100),
      recurring: { interval: 'month' },
      active: false,
      lookup_key: `pilot_${draft.slug}_monthly_nzd`,
      metadata: { assembl_source: 'pilot', assembl_pilot_slug: draft.slug },
    });

    return { stripeProductId: product.id, stripePriceId: price.id, staged: true };
  } catch (err) {
    // Never block a ship on a Stripe hiccup — the draft still saves.
    return {
      stripeProductId: null,
      stripePriceId: null,
      staged: false,
      reason: err instanceof Error ? err.message : 'stripe error',
    };
  }
}
