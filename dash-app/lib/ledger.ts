// Pure ledger math — no database, no React. Easy to unit-test.
// The wallet balance is ALWAYS the sum of the append-only entries.

export type LedgerEntry = { amount_cents: number; reason: string };

/** Balance = sum of all entries (credits positive, redemptions negative). */
export function balanceOf(entries: LedgerEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount_cents, 0);
}

/** Can this user redeem `amount` cents? Must be > 0, above the threshold, and <= balance. */
export function canRedeem(
  balanceCents: number,
  amountCents: number,
  thresholdCents = 500
): boolean {
  return amountCents > 0 && amountCents >= thresholdCents && amountCents <= balanceCents;
}

/** The redemption entry to append (mirrors what the server writes). */
export function redemptionEntry(amountCents: number): LedgerEntry {
  return { amount_cents: -Math.abs(amountCents), reason: "redemption" };
}

/** Format cents as NZ dollars, e.g. 1234 -> "$12.34". */
export function formatNZD(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}
