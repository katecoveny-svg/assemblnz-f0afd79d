/**
 * One-off (idempotent) setup for the agent-marketplace Stripe products + prices.
 *
 *   STRIPE_SECRET_KEY=sk_live_... npm run stripe:setup
 *   # or against the test key first:
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
 *
 * Creates a Stripe Product + a recurring monthly NZD Price for each marketplace
 * plan (Tōro, Whānau, Pro, Business per-agent) using a stable lookup_key, then
 * prints the price ids to paste into Vercel env as the NEXT_PUBLIC_STRIPE_PRICE_*
 * vars. Re-running reuses the existing price for each lookup_key instead of
 * creating duplicates, so it is safe to run more than once.
 *
 * Operates on the existing assembl Stripe account (acct_1TCqv7PXAX9ohARR) — the
 * account is selected by the secret key you export. The existing Pulse products
 * (Pulse Watcher, Pulse Practice) and the self-serve Solo/Team prices are
 * untouched; this only adds the four marketplace plans.
 *
 * Run once against the test key to verify, then once against the live key.
 */
import Stripe from 'stripe';
import { MARKETPLACE_PLANS } from '../lib/marketplace/plans';

async function main(): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is required. Export the test or live key first:\n' +
        '  STRIPE_SECRET_KEY=sk_live_... npm run stripe:setup',
    );
  }

  const stripe = new Stripe(key, { appInfo: { name: 'assembl-marketplace-setup' } });
  const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`Setting up agent-marketplace prices in ${mode} mode…\n`);

  const results: Record<string, string> = {};

  for (const plan of MARKETPLACE_PLANS) {
    // Reuse an existing price for this lookup_key if present (idempotent).
    const existing = await stripe.prices.list({
      lookup_keys: [plan.lookupKey],
      active: true,
      limit: 1,
    });

    let priceId: string;
    if (existing.data[0]) {
      priceId = existing.data[0].id;
      console.log(`• ${plan.productName}: reusing existing price ${priceId} (${plan.lookupKey})`);
    } else {
      const product = await stripe.products.create({
        name: plan.productName,
        description: plan.description,
        metadata: { assembl_plan: plan.id, per_agent: String(plan.perAgent) },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'nzd',
        unit_amount: plan.unitAmount,
        recurring: { interval: 'month' },
        lookup_key: plan.lookupKey,
        metadata: { assembl_plan: plan.id },
      });
      priceId = price.id;
      console.log(
        `• ${plan.productName}: created product ${product.id} + price ${priceId} ` +
          `(NZ$${plan.monthlyNzd}/mo, ${plan.lookupKey})`,
      );
    }

    results[plan.priceEnvVar] = priceId;
  }

  console.log('\n✅ Done. Paste these into Vercel env (Production + Preview + Development):\n');
  for (const plan of MARKETPLACE_PLANS) {
    console.log(`  ${plan.priceEnvVar}=${results[plan.priceEnvVar] ?? '<missing>'}`);
  }
  console.log(
    '\nThen redeploy. The webhook + checkout read these at runtime via lib/marketplace/plans.ts.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
