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

/**
 * The three numbers a household actually decides on.
 *
 * Budget apps can work all of this out, but it sits inside a dashboard nobody
 * remembers to open. These are the ones worth putting where they will be seen
 * before the money is spent: what is due this week, what is next, and what is
 * left once the bills are out.
 *
 * All three come from bills the parser actually read. `balance` is the one
 * thing the app cannot know and has to be told — when it is absent, the third
 * number is absent too rather than guessed.
 */
export type ThreeNumbers = {
  /** total due in the next 7 days, from bills that carried a due date */
  dueThisWeek: number;
  /** how many bills that is */
  dueThisWeekCount: number;
  /** the soonest bill still ahead */
  next: { provider: string; amount: number; dueDate: string; inDays: number } | null;
  /** balance minus everything due in the next 7 days; null until a balance is given */
  leftAfterBills: number | null;
  /** bills carrying no due date, so they cannot be timed */
  undated: number;
};

const DAY = 24 * 60 * 60 * 1000;

/** Whole days from `today` to an ISO date, negative once it has passed. */
function daysUntil(iso: string, today: Date): number | null {
  const due = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(due)) return null;
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((due - start) / DAY);
}

export function threeNumbers(
  bills: SessionBill[],
  today: Date,
  balance: number | null = null,
): ThreeNumbers {
  const dated = bills
    .map((b) => ({ b, days: b.dueDate ? daysUntil(b.dueDate, today) : null }))
    .filter((x): x is { b: SessionBill; days: number } => x.days !== null);

  const ahead = dated
    .filter((x) => x.days >= 0 && typeof x.b.amount === 'number')
    .sort((a, b) => a.days - b.days);

  const week = ahead.filter((x) => x.days <= 7);
  const dueThisWeek = week.reduce((sum, x) => sum + (x.b.amount as number), 0);

  const first = ahead[0];
  return {
    dueThisWeek,
    dueThisWeekCount: week.length,
    next: first
      ? {
          provider: first.b.provider,
          amount: first.b.amount as number,
          dueDate: first.b.dueDate as string,
          inDays: first.days,
        }
      : null,
    leftAfterBills: typeof balance === 'number' ? balance - dueThisWeek : null,
    undated: bills.filter((b) => !b.dueDate).length,
  };
}
