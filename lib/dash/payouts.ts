/**
 * Dash payout maths — pure, DB-free helpers shared by the payout cron and tests.
 *
 * The append-only public.dash_payout_ledger holds one row per money event:
 * a `credit` when a party earns (publisher rev-share on an impression) and a
 * `debit` when they're paid out. A party's balance is therefore always
 * derivable: SUM(credits) − SUM(debits). We only ever pay the whole accrued
 * balance, and only once it clears a threshold (Stripe's payout + FX fees make
 * sub-threshold micro-payouts unprofitable).
 *
 * Money is NZD with 2dp. GST is handled at invoice, not in transfers.
 */

/** Default payout threshold (NZD). A party isn't paid until they clear this. */
export const PAYOUT_THRESHOLD_NZD = 20;

/** Publisher rev-share floor/standard. Anchors get 0.600; everyone else 0.550. */
export const STANDARD_REV_SHARE = 0.55;
export const ANCHOR_REV_SHARE = 0.6;

export type LedgerDirection = 'credit' | 'debit';

export interface LedgerRow {
  direction: LedgerDirection;
  amount_nzd: number | string;
}

/** Round to whole cents (NZD 2dp) to avoid float drift in money maths. */
export function roundNzd(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** NZD dollars → integer cents, for Stripe's `amount` field. */
export function toCents(amountNzd: number): number {
  return Math.round(amountNzd * 100);
}

/** Balance for a party = SUM(credits) − SUM(debits), rounded to cents. */
export function computeBalance(rows: readonly LedgerRow[]): number {
  let total = 0;
  for (const row of rows) {
    const amt = typeof row.amount_nzd === 'string' ? Number(row.amount_nzd) : row.amount_nzd;
    if (!Number.isFinite(amt)) continue;
    total += row.direction === 'credit' ? amt : -amt;
  }
  return roundNzd(total);
}

/** A party is payable when it clears the threshold AND Stripe payouts are on. */
export function isPayable(balanceNzd: number, payoutsEnabled: boolean, threshold = PAYOUT_THRESHOLD_NZD): boolean {
  return payoutsEnabled && balanceNzd >= threshold;
}

/** Publisher credit for one impression = revenue × rev-share, to the cent. */
export function publisherCredit(revenueNzd: number, revShare: number): number {
  if (!Number.isFinite(revenueNzd) || revenueNzd <= 0) return 0;
  const share = Number.isFinite(revShare) ? revShare : STANDARD_REV_SHARE;
  return roundNzd(revenueNzd * share);
}
