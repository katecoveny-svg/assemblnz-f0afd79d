/**
 * Turning a session's parsed bills into the figures the console shows.
 *
 * Split out from the route so the arithmetic is testable without a database.
 * The rule that matters: a bill whose total the parser could not read is
 * counted as a bill and left out of every sum. Treating a missing amount as
 * zero would understate a household's spend and quietly make the product wrong
 * about the only number it exists to get right.
 */

export type SessionBill = {
  provider: string;
  category: string;
  amount: number | null;
  billDate: string | null;
  dueDate: string | null;
  fileName: string | null;
  confidence: string | null;
};

export type SessionSummary = {
  bills: SessionBill[];
  count: number;
  pricedCount: number;
  monthly: number;
  annual: number;
  byCategory: { category: string; amount: number }[];
};

export function summariseSession(bills: SessionBill[]): SessionSummary {
  const priced = bills.filter(
    (b): b is SessionBill & { amount: number } =>
      typeof b.amount === 'number' && Number.isFinite(b.amount),
  );
  const monthly = priced.reduce((sum, b) => sum + b.amount, 0);

  const byCategory = Object.entries(
    priced.reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] ?? 0) + b.amount;
      return acc;
    }, {}),
  )
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    bills,
    count: bills.length,
    pricedCount: priced.length,
    monthly,
    annual: monthly * 12,
    byCategory,
  };
}
