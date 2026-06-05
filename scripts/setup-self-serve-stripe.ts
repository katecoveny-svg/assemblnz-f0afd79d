/**
 * One-off (idempotent) setup for the self-serve Stripe products + prices.
 *
 *   STRIPE_SECRET_KEY=sk_test_... pnpm tsx scripts/setup-self-serve-stripe.ts
 *
 * Creates a product + a recurring monthly NZD price for each self-serve tier
 * (Solo, Team) using a stable lookup_key, then prints the price ids to set as
 * STRIPE_PRICE_SOLO / STRIPE_PRICE_TEAM in Vercel env. Re-running reuses the
 * existing price for each lookup_key instead of creating duplicates.
 *
 * Run once against the test key to verify, then once against the live key.
 * Per PRICING-LOCKED.md, never delete legacy price ids — this only adds.
 */
import Stripe from 'stripe';
import { SELF_SERVE_TIERS } from '../lib/billing/tiers';

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is required. Export the test or live key first.');
  }
  const stripe = new Stripe(key, { appInfo: { name: 'assembl-self-serve-setup' } });
  const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`Setting up self-serve prices in ${mode} mode…\n`);

  const results: Record<string, string> = {};

  for (const tier of SELF_SERVE_TIERS) {
    // Reuse an existing price for this lookup_key if present.
    const existing = await stripe.prices.list({
      lookup_keys: [tier.stripeLookupKey],
      active: true,
      limit: 1,
    });

    let priceId: string;
    if (existing.data[0]) {
      priceId = existing.data[0].id;
      console.log(`• ${tier.name}: reusing existing price ${priceId} (${tier.stripeLookupKey})`);
    } else {
      const product = await stripe.products.create({
        name: `assembl ${tier.name}`,
        description: tier.summary,
        metadata: { assembl_tier: tier.id },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'nzd',
        unit_amount: tier.monthlyNzd * 100,
        recurring: { interval: 'month' },
        lookup_key: tier.stripeLookupKey,
        metadata: { assembl_tier: tier.id },
      });
      priceId = price.id;
      console.log(`• ${tier.name}: created product ${product.id} + price ${priceId} (NZ$${tier.monthlyNzd}/mo)`);
    }

    results[tier.id] = priceId;
  }

  console.log('\nSet these in Vercel project env (and .env.local):');
  console.log(`  STRIPE_PRICE_SOLO=${results.solo ?? '<missing>'}`);
  console.log(`  STRIPE_PRICE_TEAM=${results.team ?? '<missing>'}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
