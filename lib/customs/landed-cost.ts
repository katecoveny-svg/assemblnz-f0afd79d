/**
 * Landed-cost calculator — ported from
 * legacy-vite/src/components/pikau/PikauLandedCost.tsx.
 *
 * Pure and deterministic: CIF = FOB + freight + insurance; duty = CIF × rate;
 * import GST = (CIF + duty) × 15%; landed = CIF + duty + GST + other fees.
 * Indicative only — the licensed broker confirms rate, concessions and the
 * exact valuation method at lodgement.
 */
import { NZ_GST_RATE } from './types';
import { round2, nonNegative } from './format';

export interface LandedCostInput {
  fobNzd: number;
  freightNzd: number;
  insuranceNzd: number;
  dutyRatePercent: number;
  processingFeeNzd: number;
  biosecurityLevyNzd: number;
  otherFeesNzd: number;
}

export interface LandedCostResult {
  customsValueNzd: number;
  dutyNzd: number;
  gstNzd: number;
  feesNzd: number;
  totalLandedNzd: number;
  /** Effective % uplift over the FOB goods value. */
  upliftPercent: number;
}

export function computeLandedCost(input: LandedCostInput): LandedCostResult {
  const fob = nonNegative(input.fobNzd);
  const customsValueNzd = round2(fob + nonNegative(input.freightNzd) + nonNegative(input.insuranceNzd));
  const dutyNzd = round2((customsValueNzd * Math.max(0, input.dutyRatePercent)) / 100);
  const gstNzd = round2((customsValueNzd + dutyNzd) * NZ_GST_RATE);
  const feesNzd = round2(
    nonNegative(input.processingFeeNzd) + nonNegative(input.biosecurityLevyNzd) + nonNegative(input.otherFeesNzd),
  );
  const totalLandedNzd = round2(customsValueNzd + dutyNzd + gstNzd + feesNzd);
  const upliftPercent = fob > 0 ? round2(((totalLandedNzd - fob) / fob) * 100) : 0;
  return { customsValueNzd, dutyNzd, gstNzd, feesNzd, totalLandedNzd, upliftPercent };
}

export const LANDED_COST_DEFAULTS: LandedCostInput = {
  fobNzd: 25000,
  freightNzd: 4200,
  insuranceNzd: 380,
  dutyRatePercent: 0,
  processingFeeNzd: 33.03,
  biosecurityLevyNzd: 30.66,
  otherFeesNzd: 0,
};
