/**
 * Free HAPAI "admin tax" calculator — deterministic, indicative maths only.
 *
 * The "admin tax" is the unbilled time a team loses every week to compliance
 * paperwork, double entry, and chasing evidence. This module turns a few inputs
 * into an annual cost and an indicative amount a kete pack could claw back.
 *
 * Indicative only. The reclaim rate is a conservative planning assumption, not
 * a guarantee — the UI says so, and the user confirms their own rates.
 */

export const ADMIN_TAX_ASSUMPTIONS_VERSION = "2026-06-05-v1";

/** Working weeks per year (NZ: ~48 after leave + public holidays). */
export const WORKING_WEEKS_PER_YEAR = 48;

/** Conservative share of admin time a structured draft-first workflow reclaims. */
export const DEFAULT_RECLAIM_RATE = 0.4;

export type AdminTaxInput = {
  /** People who spend time on admin / compliance paperwork. */
  people: number;
  /** Hours each person loses to admin per week. */
  hoursPerPersonPerWeek: number;
  /** Loaded hourly cost in NZD (wage + overhead). */
  hourlyRateNzd: number;
  /** Optional override of the reclaim rate (0–1). */
  reclaimRate?: number;
};

export type AdminTaxResult = {
  assumptionsVersion: string;
  weeklyHours: number;
  weeklyCostNzd: number;
  annualHours: number;
  annualCostNzd: number;
  reclaimRate: number;
  reclaimableAnnualHours: number;
  reclaimableAnnualCostNzd: number;
};

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clampRate(value: number | undefined): number {
  if (!Number.isFinite(value as number)) return DEFAULT_RECLAIM_RATE;
  const v = value as number;
  if (v < 0) return 0;
  if (v > 0.9) return 0.9;
  return v;
}

function round0(value: number): number {
  return Math.round(value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateAdminTax(input: AdminTaxInput): AdminTaxResult {
  const people = nonNegative(input.people);
  const hours = nonNegative(input.hoursPerPersonPerWeek);
  const rate = nonNegative(input.hourlyRateNzd);
  const reclaimRate = clampRate(input.reclaimRate);

  const weeklyHours = round2(people * hours);
  const weeklyCostNzd = round2(weeklyHours * rate);
  const annualHours = round0(weeklyHours * WORKING_WEEKS_PER_YEAR);
  const annualCostNzd = round2(weeklyCostNzd * WORKING_WEEKS_PER_YEAR);
  const reclaimableAnnualHours = round0(annualHours * reclaimRate);
  const reclaimableAnnualCostNzd = round2(annualCostNzd * reclaimRate);

  return {
    assumptionsVersion: ADMIN_TAX_ASSUMPTIONS_VERSION,
    weeklyHours,
    weeklyCostNzd,
    annualHours,
    annualCostNzd,
    reclaimRate,
    reclaimableAnnualHours,
    reclaimableAnnualCostNzd,
  };
}

export function formatNzd(value: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}
