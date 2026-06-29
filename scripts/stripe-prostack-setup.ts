/**
 * One-off (idempotent) Stripe setup for the July 2026 Pro Stack rollout.
 *
 *   # verify against test first, then run with the live key
 *   pnpm tsx scripts/stripe-prostack-setup.ts
 *
 * Reads STRIPE_SECRET_KEY from .env.local (never echoed). What it does:
 *   1. Creates (or reuses) a Stripe Product "Pro Stack" + a $49 NZD monthly
 *      recurring price, keyed by the stable lookup_key assembl_prostack_4900.
 *   2. Creates (or reuses) the JULYLAUNCH50 coupon — 50% off, duration `once`
 *      (first month only), max_redemptions 20.
 *   3. Writes the resulting IDs to ~/Downloads/STRIPE-PROSTACK-IDS.txt (chmod
 *      600). Re-running reuses existing objects — it never duplicates.
 *
 * Per PRICING-LOCKED.md we never delete a price id; this only adds.
 */
import { promises as fs, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';
import { JULY_PROMO, getAgentPlan } from '../lib/billing/agent-pricing';

function loadEnvLocal(): void {
  // Minimal .env.local loader so the script works without extra deps. Existing
  // process env always wins; we never overwrite an already-set var.
  const file = path.resolve(process.cwd(), '.env.local');
  let raw: string;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    return; // no .env.local — rely on the ambient env
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is required. Set it in .env.local or export it before running.',
    );
  }

  const stripe = new Stripe(key, { appInfo: { name: 'assembl-prostack-setup' } });
  const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`Setting up Pro Stack + ${JULY_PROMO.code} in ${mode} mode…\n`);

  const plan = getAgentPlan('prostack');
  if (!plan || !plan.stripeLookupKey) {
    throw new Error('prostack plan or its lookup key is missing from AGENT_PLANS.');
  }

  // ── 1. Pro Stack product + $49 NZD monthly price ──────────────────────────
  let priceId: string;
  const existing = await stripe.prices.list({
    lookup_keys: [plan.stripeLookupKey],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) {
    priceId = existing.data[0].id;
    console.log(`• Pro Stack: reusing existing price ${priceId} (${plan.stripeLookupKey})`);
  } else {
    const product = await stripe.products.create({
      name: 'assembl Pro Stack',
      description: plan.blurb,
      metadata: { assembl_plan: plan.id },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'nzd',
      unit_amount: plan.monthlyNzd * 100, // 4900
      recurring: { interval: 'month' },
      lookup_key: plan.stripeLookupKey,
      metadata: { assembl_plan: plan.id },
    });
    priceId = price.id;
    console.log(
      `• Pro Stack: created product ${product.id} + price ${priceId} (NZ$${plan.monthlyNzd}/mo)`,
    );
  }

  // ── 2. JULYLAUNCH50 coupon (50% off, once, max 20) ────────────────────────
  let couponId: string;
  try {
    const found = await stripe.coupons.retrieve(JULY_PROMO.code);
    couponId = found.id;
    console.log(
      `• Coupon: reusing existing ${couponId} (${found.percent_off}% off, ${found.times_redeemed}/${found.max_redemptions ?? '∞'} redeemed)`,
    );
  } catch {
    const coupon = await stripe.coupons.create({
      id: JULY_PROMO.code, // fixed id so the code is stable + idempotent
      name: 'July launch — 50% off first month',
      percent_off: JULY_PROMO.percentOff,
      duration: JULY_PROMO.duration, // 'once' → first month only
      max_redemptions: JULY_PROMO.maxRedemptions,
      metadata: { assembl_promo: 'july_2026_launch' },
    });
    couponId = coupon.id;
    console.log(
      `• Coupon: created ${couponId} (${coupon.percent_off}% off, ${coupon.duration}, max ${coupon.max_redemptions})`,
    );
    // A matching promotion code so customers can type JULYLAUNCH50 at checkout
    // (Checkout's allow_promotion_codes resolves promotion codes, not raw coupons).
    try {
      await stripe.promotionCodes.create({
        promotion: { type: 'coupon', coupon: couponId },
        code: JULY_PROMO.code,
      });
      console.log(`  └ promotion code ${JULY_PROMO.code} created`);
    } catch (err) {
      console.log(
        `  └ promotion code ${JULY_PROMO.code} not created (may already exist): ${(err as Error).message}`,
      );
    }
  }

  // ── 3. Write the IDs to ~/Downloads/STRIPE-PROSTACK-IDS.txt (chmod 600) ────
  const out = path.join(os.homedir(), 'Downloads', 'STRIPE-PROSTACK-IDS.txt');
  const everyday = getAgentPlan('everyday');
  const allAccess = getAgentPlan('all_access');
  const specialist = getAgentPlan('specialist');
  const body = [
    `# assembl Stripe — Pro Stack + ${JULY_PROMO.code} (${mode})`,
    `# Generated by scripts/stripe-prostack-setup.ts`,
    '',
    `# Set this in Vercel project env (and .env.local):`,
    `${plan.envVar}=${priceId}`,
    '',
    `# Coupon (promotion code customers type at checkout):`,
    `JULYLAUNCH50_COUPON_ID=${couponId}`,
    `JULYLAUNCH50_PERCENT_OFF=${JULY_PROMO.percentOff}`,
    `JULYLAUNCH50_MAX_REDEMPTIONS=${JULY_PROMO.maxRedemptions}`,
    `JULYLAUNCH50_DURATION=${JULY_PROMO.duration}`,
    '',
    `# For reference, the rest of the ladder env vars (set by scripts/setup-flat-pricing-stripe.ts):`,
    `# ${everyday?.envVar}=<price id>`,
    `# ${specialist?.envVar}=<price id>`,
    `# ${allAccess?.envVar}=<price id>`,
    '',
  ].join('\n');

  await fs.writeFile(out, body, { mode: 0o600 });
  await fs.chmod(out, 0o600);
  console.log(`\nWrote ${out} (chmod 600).`);
  console.log('Add the price id above to Vercel env, then redeploy.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
