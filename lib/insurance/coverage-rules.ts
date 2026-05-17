import {
  INSURANCE_ASSUMPTIONS_VERSION,
  INSURANCE_RULES,
  INSURANCE_SOURCES,
  REBUILD_COST_PER_SQM_BY_REGION,
} from "@/config/insurance-assumptions";

export type InsuranceInput = {
  tenure: "own" | "rent";
  region: string;
  floorAreaSqm: number;
  houseSumInsured: number;
  contentsSumInsured: number;
  dependants: number;
  workFromHome: boolean;
  vehicleCount: number;
  vehicleValue: number;
  vehicleCover: "none" | "third_party" | "third_party_fire_theft" | "comprehensive";
  annualIncome: number;
  mortgageBalance: number;
  lifeCover: number;
  soleEarner: boolean;
  savings: number;
  kiwiSaverBalance: number;
  incomeProtectionMonthly: number;
};

export type CoverageCategory = {
  key: "house" | "contents" | "vehicles" | "life" | "income";
  label: string;
  status: "green" | "amber" | "red";
  recommendedCoverNzd: number;
  currentCoverNzd: number;
  gapNzd: number;
  rationale: string;
};

export type InsuranceGapResult = {
  categories: CoverageCategory[];
  overallStatus: "green" | "amber" | "red";
  largestGapNzd: number;
  assumptionsVersion: string;
  sources: typeof INSURANCE_SOURCES;
};

function statusFor(gap: number, recommended: number): CoverageCategory["status"] {
  if (recommended <= 0 || gap <= 0) return "green";
  const ratio = gap / recommended;
  if (ratio <= 0.15) return "amber";
  return "red";
}

function regionRate(region: string): number {
  return REBUILD_COST_PER_SQM_BY_REGION[region] ?? REBUILD_COST_PER_SQM_BY_REGION.other;
}

function category(
  key: CoverageCategory["key"],
  label: string,
  recommendedCoverNzd: number,
  currentCoverNzd: number,
  rationale: string,
): CoverageCategory {
  const roundedRecommended = Math.max(0, Math.round(recommendedCoverNzd));
  const roundedCurrent = Math.max(0, Math.round(currentCoverNzd));
  const gap = Math.max(0, roundedRecommended - roundedCurrent);
  return {
    key,
    label,
    recommendedCoverNzd: roundedRecommended,
    currentCoverNzd: roundedCurrent,
    gapNzd: gap,
    status: statusFor(gap, roundedRecommended),
    rationale,
  };
}

export function calculateInsuranceGap(input: InsuranceInput): InsuranceGapResult {
  const rebuildEstimate =
    input.tenure === "own"
      ? input.floorAreaSqm * regionRate(input.region) * INSURANCE_RULES.houseBuffer
      : 0;

  const contentsRecommended =
    (input.tenure === "own" ? rebuildEstimate * INSURANCE_RULES.contentsAsShareOfRebuild : 70000) +
    input.dependants * INSURANCE_RULES.contentsPerDependent +
    (input.workFromHome ? INSURANCE_RULES.workFromHomeEquipment : 0);

  const vehicleRecommended =
    input.vehicleValue > INSURANCE_RULES.comprehensiveVehicleThreshold
      ? input.vehicleValue
      : input.vehicleValue > INSURANCE_RULES.thirdPartyFireTheftThreshold
        ? Math.round(input.vehicleValue * 0.5)
        : 0;
  const vehicleCurrent =
    input.vehicleCover === "comprehensive"
      ? input.vehicleValue
      : input.vehicleCover === "third_party_fire_theft"
        ? Math.round(input.vehicleValue * 0.5)
        : 0;

  const lifeRecommended =
    input.annualIncome * INSURANCE_RULES.lifeIncomeMultiple +
    input.mortgageBalance -
    input.savings -
    input.kiwiSaverBalance;

  const annualIncomeProtectionRecommended =
    input.annualIncome * INSURANCE_RULES.incomeProtectionShare * (input.soleEarner ? 1.15 : 1);
  const currentIncomeBuffer =
    input.incomeProtectionMonthly * 12 + input.savings + input.kiwiSaverBalance * 0.25;

  const categories: CoverageCategory[] = [
    category(
      "house",
      "House",
      rebuildEstimate,
      input.tenure === "own" ? input.houseSumInsured : 0,
      input.tenure === "own"
        ? "Indicative rebuild cost × 1.25 buffer. This is not a quote; use a formal sum-insured calculator before changing cover."
        : "Renters usually do not insure the building itself. Focus on contents and liability.",
    ),
    category(
      "contents",
      "Contents",
      contentsRecommended,
      input.contentsSumInsured,
      "25% of rebuild estimate, plus dependant and work-from-home equipment buffers.",
    ),
    category(
      "vehicles",
      "Vehicles",
      vehicleRecommended,
      vehicleCurrent,
      "Comprehensive suggested above $8k vehicle value; third-party-fire-theft may be enough from $4k-$8k.",
    ),
    category(
      "life",
      "Life",
      lifeRecommended,
      input.lifeCover,
      "10× annual income plus mortgage, less liquid savings and KiwiSaver balance.",
    ),
    category(
      "income",
      "Income protection",
      annualIncomeProtectionRecommended,
      currentIncomeBuffer,
      "75% of annual income, with a higher bar for sole earners with dependants. Savings count as part of the buffer.",
    ),
  ];

  const largestGapNzd = Math.max(...categories.map((item) => item.gapNzd));
  const overallStatus = categories.some((item) => item.status === "red")
    ? "red"
    : categories.some((item) => item.status === "amber")
      ? "amber"
      : "green";

  return {
    categories,
    overallStatus,
    largestGapNzd,
    assumptionsVersion: INSURANCE_ASSUMPTIONS_VERSION,
    sources: INSURANCE_SOURCES,
  };
}
