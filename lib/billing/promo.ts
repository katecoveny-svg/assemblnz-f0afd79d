/**
 * Server-only promo helpers for the July 2026 launch (JULYLAUNCH50).
 *
 * Kept separate from lib/billing/agent-pricing.ts because that module is also
 * imported by client components; this one imports the server-only Stripe client,
 * so it must never reach the browser bundle.
 */
import 'server-only';
import { getStripe } from '@/lib/stripe/client';
import { JULY_PROMO, type PromoEligibility } from './agent-pricing';

/**
 * Live remaining redemptions for {@link JULY_PROMO}, read from the Stripe API.
 *
 * Fails OPEN: if Stripe is unconfigured, the coupon hasn't been created yet, or
 * the call errors, we return `eligible: true, remaining: maxRedemptions,
 * known: false` so a transient issue never kills the launch banner. When the
 * coupon is genuinely exhausted we return `eligible: false, remaining: 0,
 * known: true`.
 */
export async function eligibleForPromo(): Promise<PromoEligibility> {
  const fallback: PromoEligibility = {
    eligible: true,
    remaining: JULY_PROMO.maxRedemptions,
    known: false,
  };
  try {
    if (!process.env.STRIPE_SECRET_KEY) return fallback;
    const stripe = getStripe();
    const coupon = await stripe.coupons.retrieve(JULY_PROMO.code);
    const max = coupon.max_redemptions ?? JULY_PROMO.maxRedemptions;
    const used = coupon.times_redeemed ?? 0;
    const remaining = Math.max(0, max - used);
    return {
      eligible: (coupon.valid ?? true) && remaining > 0,
      remaining,
      known: true,
    };
  } catch {
    return fallback;
  }
}
