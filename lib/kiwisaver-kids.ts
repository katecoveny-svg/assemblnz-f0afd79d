// ════════════════════════════════════════════════════════════════════════
// lib/kiwisaver-kids.ts
//
// Compound-growth maths for the KiwiSaver-for-Kids calculator. Built off
// the May 2026 NZ Government proposal floated in the news: every newborn
// receives a $1,000 KiwiSaver kick-start that compounds to ~$53k by age
// 65 (an implied ~6.3% nominal long-run growth-fund return). The model
// also captures the existing rule that anyone aged 16+ can contribute
// themselves, and from age 18 unlocks the Government Member Tax Credit
// (matched up to $521.43/yr if they contribute $1,042.86+).
//
// All currency is NZD. All growth is nominal — inflation handling is left
// to the visitor (we surface the assumption clearly).
// ════════════════════════════════════════════════════════════════════════

export type KiwiSaverInput = {
  /** Child's current age in years, 0 (newborn) to 18 */
  currentAge: number;
  /** Starting balance in NZD (newborn policy default: 1000) */
  startingBalance: number;
  /** Monthly contribution from age `contributionStartAge` onward (NZD) */
  monthlyContribution: number;
  /** Age at which contributions begin. NZ legal floor is 16. */
  contributionStartAge: number;
  /** Assumed nominal annual return — defaults to 6.3% (matches the
   * $1k→$53k figure cited in the May 2026 policy chatter) */
  annualReturnPercent: number;
  /** Target retirement age — defaults to 65 (NZ Super eligibility) */
  retirementAge: number;
};

export type YearSnapshot = {
  age: number;
  contributionsThisYear: number;
  growthThisYear: number;
  balance: number;
};

export type KiwiSaverProjection = {
  finalBalance: number;
  totalContributions: number;
  totalGrowth: number;
  yearsCompounding: number;
  yearsContributing: number;
  /** Compound growth on the starting balance alone — isolates the
   * "newborn $1k → $53k" effect from any later contributions */
  startingBalanceOnlyAtRetirement: number;
  schedule: YearSnapshot[];
  assumptions: {
    annualReturnPercent: number;
    contributionStartAge: number;
    retirementAge: number;
  };
};

/**
 * Project a child's KiwiSaver balance year-by-year until retirement.
 *
 * Conservative: growth is applied AFTER contributions for the year, so
 * a $1,000 starting balance grows for the full retirement window even
 * if contributions don't start until age 16.
 */
export function projectKiwiSaver(input: KiwiSaverInput): KiwiSaverProjection {
  const safeAge = clampInt(input.currentAge, 0, 18);
  const startBal = Math.max(0, Number(input.startingBalance) || 0);
  const monthly = Math.max(0, Number(input.monthlyContribution) || 0);
  const contribStartAge = clampInt(input.contributionStartAge, 0, 65);
  const retireAge = clampInt(input.retirementAge, safeAge + 1, 80);
  const annualRate = (Number(input.annualReturnPercent) || 6.3) / 100;

  let balance = startBal;
  let totalContributions = 0;
  let totalGrowth = 0;
  let yearsContributing = 0;
  const schedule: YearSnapshot[] = [];

  for (let age = safeAge; age < retireAge; age++) {
    // Contributions for the year (only from contribStartAge onward)
    const contribThisYear = age >= contribStartAge ? monthly * 12 : 0;
    balance += contribThisYear;
    totalContributions += contribThisYear;
    if (contribThisYear > 0) yearsContributing += 1;

    // Apply this year's growth on the post-contribution balance
    const growthThisYear = balance * annualRate;
    balance += growthThisYear;
    totalGrowth += growthThisYear;

    schedule.push({
      age: age + 1,
      contributionsThisYear: round2(contribThisYear),
      growthThisYear: round2(growthThisYear),
      balance: round2(balance),
    });
  }

  // Isolate the starting-balance contribution to retirement
  const startingBalanceOnlyAtRetirement =
    startBal * Math.pow(1 + annualRate, retireAge - safeAge);

  return {
    finalBalance: round2(balance),
    totalContributions: round2(totalContributions),
    totalGrowth: round2(totalGrowth),
    yearsCompounding: retireAge - safeAge,
    yearsContributing,
    startingBalanceOnlyAtRetirement: round2(startingBalanceOnlyAtRetirement),
    schedule,
    assumptions: {
      annualReturnPercent: input.annualReturnPercent || 6.3,
      contributionStartAge: contribStartAge,
      retirementAge: retireAge,
    },
  };
}

/**
 * Three preset scenarios the calculator shows by default so visitors
 * see the impact instantly without filling in fields.
 */
export const PRESETS: Record<string, KiwiSaverInput> = {
  // The bare policy proposal: $1,000 at birth, no further contributions.
  newborn_policy_only: {
    currentAge: 0,
    startingBalance: 1000,
    monthlyContribution: 0,
    contributionStartAge: 16,
    annualReturnPercent: 6.3,
    retirementAge: 65,
  },
  // Most likely real-world: $1k at birth + $25/month from 16 onward
  newborn_plus_kids_contributions: {
    currentAge: 0,
    startingBalance: 1000,
    monthlyContribution: 25,
    contributionStartAge: 16,
    annualReturnPercent: 6.3,
    retirementAge: 65,
  },
  // A whānau who tops up alongside the policy: $1k + $50/month from age 5
  // (parent-funded) + $100/month from 16 (self-funded once they're earning)
  whanau_topup: {
    currentAge: 0,
    startingBalance: 1000,
    monthlyContribution: 100,
    contributionStartAge: 16,
    annualReturnPercent: 6.3,
    retirementAge: 65,
  },
};

function clampInt(value: number, min: number, max: number): number {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatNzd(value: number): string {
  return value.toLocaleString("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  });
}
