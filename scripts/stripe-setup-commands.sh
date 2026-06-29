#!/usr/bin/env bash
#
# Pro Stack + July promo — Stripe setup (run by Kate with the live keys).
#
# These create the $49 NZD Pro Stack price and the JULYLAUNCH50 coupon. They are
# idempotent on the stable lookup_key / coupon id — re-running reuses, never
# duplicates. Run against TEST first, then LIVE.
#
#   export STRIPE_SECRET_KEY=sk_test_...   # then re-run with sk_live_... for prod
#   ./scripts/stripe-setup-commands.sh
#
# Prefer the TypeScript provisioner for the whole ladder (Everyday / Pro Stack /
# Specialist / All-Access) in one go: `pnpm stripe:setup`. This shell script is
# the focused Pro Stack + coupon crib sheet.
#
# After it prints the Pro Stack price id, set this in Vercel (and .env.local):
#   NEXT_PUBLIC_STRIPE_PRICE_PRO_STACK_4900=<price id>
#
set -euo pipefail

: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...) first}"
export STRIPE_API_KEY="$STRIPE_SECRET_KEY"   # stripe CLI reads STRIPE_API_KEY

case "$STRIPE_SECRET_KEY" in
  sk_live*) echo ">>> LIVE mode" ;;
  *)        echo ">>> TEST mode" ;;
esac

# ── 1. Pro Stack product ($49 NZD / month) ───────────────────────────────────
echo "Creating Pro Stack product…"
PRODUCT_ID=$(stripe products create \
  --name="assembl Pro Stack" \
  --description="3 everyday agents + 1 specialist" \
  -d "metadata[assembl_plan]=pro_stack" \
  --format=json | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
echo "  product: $PRODUCT_ID"

echo "Creating Pro Stack price (NZ\$49/mo, lookup_key assembl_pro_stack_4900)…"
PRICE_ID=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --currency=nzd \
  --unit-amount=4900 \
  -d "recurring[interval]=month" \
  --lookup-key="assembl_pro_stack_4900" \
  -d "metadata[assembl_plan]=pro_stack" \
  --format=json | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
echo "  price: $PRICE_ID"

# ── 2. JULYLAUNCH50 coupon (50% off, once, max 20) + promotion code ───────────
echo "Creating JULYLAUNCH50 coupon (50% off first month, max 20 redemptions)…"
stripe coupons create \
  --id="JULYLAUNCH50" \
  --name="July launch — 50% off first month" \
  --percent-off=50 \
  --duration=once \
  --max-redemptions=20 \
  -d "metadata[assembl_promo]=july_2026_launch" || \
  echo "  (coupon JULYLAUNCH50 already exists — skipping)"

echo "Creating promotion code JULYLAUNCH50…"
stripe promotion_codes create \
  -d "promotion[type]=coupon" \
  -d "promotion[coupon]=JULYLAUNCH50" \
  --code="JULYLAUNCH50" || \
  echo "  (promotion code JULYLAUNCH50 already exists — skipping)"

echo
echo "Done. Set this in Vercel project env (and .env.local), then redeploy:"
echo "  NEXT_PUBLIC_STRIPE_PRICE_PRO_STACK_4900=$PRICE_ID"
