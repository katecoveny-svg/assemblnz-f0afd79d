/**
 * Server-side Stripe client.
 *
 * Reads STRIPE_SECRET_KEY from Vercel env / Supabase Edge Function secrets.
 * Never hardcoded; never logged. Server-only — never imported from a
 * client component. The publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
 * is the only Stripe key safe to expose to the browser.
 *
 * Hard rule #37: live keys only in production. The env var is the source
 * of truth; this module does not differentiate live vs test.
 */
import 'server-only';
import Stripe from 'stripe';

// Pinned per the v0.3 commerce brief. May be newer than the bundled SDK's
// declared apiVersion literal type; the runtime header is what matters to
// Stripe. Type widening lets us pass it through the constructor unchanged.
const API_VERSION = '2026-02-25.clover';
type StripeApiVersionAccepted = NonNullable<ConstructorParameters<typeof Stripe>[1]>['apiVersion'];

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.length === 0) {
    throw new Error(
      'STRIPE_SECRET_KEY missing. Set it in Vercel project env (and .env.local for local dev). See plugins/CLAUDE.md / PR description for the setup checklist.',
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: API_VERSION as StripeApiVersionAccepted,
    appInfo: {
      name: 'assembl-toro',
      url: 'https://assembl.co.nz',
    },
    typescript: true,
  });
  return _stripe;
}

/**
 * Test-only reset of the cached client. Production code never calls this;
 * vitest tests use it between `vi.mock()` re-installs to avoid leaking a
 * stale instance into the next test.
 */
export function _resetStripeForTests(): void {
  _stripe = null;
}

export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300; // Stripe default
