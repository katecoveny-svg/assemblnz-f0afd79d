/**
 * One-off (idempotent) setup for the flat per-agent + bundle Stripe ladder.
 *
 *   # verify against test first, then run with the live key
 *   STRIPE_SECRET_KEY=sk_test_... pnpm tsx scripts/setup-flat-pricing-stripe.ts
 *   STRIPE_SECRET_KEY=sk_live_... pnpm tsx scripts/setup-flat-pricing-stripe.ts
 *
 * What it does:
 *   1. Creates a product + recurring monthly NZD price for each plan in
 *      AGENT_PLANS, using a stable lookup_key. Re-running reuses the existing
 *      price for each lookup_key instead of creating duplicates.
 *   2. ARCHIVES (never deletes) the old per-agent ladder — Tōro $9.99,
 *      Whānau $24.99, Pro $49.99, Business $199 — by matching their recurring
 *      NZD amounts and setting active=false on the price (and its product when
 *      no active price remains). Archiving keeps existing subscriptions running;
 *      it only hides the price from new checkouts. Self-serve Solo ($49) and
 *      Team ($149) are left untouched.
 *   3. Prints the new price ids to paste into Vercel env (and .env.local).
 *
 * Per PRICING-LOCKED.md, we never delete a price id — this only adds + archives.
 */
import Stripe from 'stripe';
import { AGENT_PLANS } from '../lib/billing/agent-pricing';

// Old per-agent ladder amounts to archive, in cents (NZD). Matched precisely so
// we never touch the new ladder (1500/5000/9000/15000/25000) or self-serve
// Solo (4900) / Team (14900).
const ARCHIVE_AMOUNTS_CENTS = new Set([999, 2499, 4999, 19900]);

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is required. Export the test or live key first.');
  }
  const stripe = new Stripe(key, { appInfo: { name: 'assembl-flat-pricing-setup' } });
  const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`Setting up the flat per-agent + bundle ladder in ${mode} mode…\n`);

  // ── 1 + 3. Create (or reuse) the new plans ───────────────────────────────
  const results: Record<string, string> = {};
  for (const plan of AGENT_PLANS) {
    const existing = await stripe.prices.list({
      lookup_keys: [plan.stripeLookupKey],
      active: true,
      limit: 1,
    });

    let priceId: string;
    if (existing.data[0]) {
      priceId = existing.data[0].id;
      console.log(`• ${plan.name}: reusing existing price ${priceId} (${plan.stripeLookupKey})`);
    } else {
      const product = await stripe.products.create({
        name: `assembl ${plan.name}`,
        description: plan.summary,
        metadata: { assembl_plan: plan.id },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'nzd',
        unit_amount: plan.monthlyNzd * 100,
        recurring: { interval: 'month' },
        lookup_key: plan.stripeLookupKey,
        metadata: { assembl_plan: plan.id },
      });
      priceId = price.id;
      console.log(
        `• ${plan.name}: created product ${product.id} + price ${priceId} (NZ$${plan.monthlyNzd}/mo)`,
      );
    }
    results[plan.id] = priceId;
  }

  // ── 2. Archive the old ladder ─────────────────────────────────────────────
  console.log('\nArchiving the old per-agent ladder (matching recurring NZD amounts)…');
  const newLookupKeys = new Set(AGENT_PLANS.map((p) => p.stripeLookupKey));
  let archivedPrices = 0;
  let archivedProducts = 0;

  for await (const price of stripe.prices.list({ active: true, limit: 100 })) {
    if (price.currency !== 'nzd') continue;
    if (price.recurring?.interval !== 'month') continue;
    if (price.unit_amount == null || !ARCHIVE_AMOUNTS_CENTS.has(price.unit_amount)) continue;
    if (price.lookup_key && newLookupKeys.has(price.lookup_key)) continue; // never the new ladder

    await stripe.prices.update(price.id, { active: false });
    archivedPrices += 1;
    const productId = typeof price.product === 'string' ? price.product : price.product?.id;
    console.log(
      `  · archived price ${price.id} (NZ$${(price.unit_amount / 100).toFixed(2)}/mo, product ${productId ?? '?'})`,
    );

    // Archive the product too, if it has no remaining active prices.
    if (productId) {
      const remaining = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      if (remaining.data.length === 0) {
        await stripe.products.update(productId, { active: false });
        archivedProducts += 1;
        console.log(`    └ archived product ${productId} (no active prices left)`);
      }
    }
  }

  if (archivedPrices === 0) {
    console.log('  (nothing matched — old ladder already archived or never created in this account)');
  } else {
    console.log(`  archived ${archivedPrices} price(s) and ${archivedProducts} product(s).`);
  }

  // ── 3. Output env ─────────────────────────────────────────────────────────
  console.log('\nSet these in Vercel project env (and .env.local):');
  for (const plan of AGENT_PLANS) {
    console.log(`  ${plan.envVar}=${results[plan.id] ?? '<missing>'}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
