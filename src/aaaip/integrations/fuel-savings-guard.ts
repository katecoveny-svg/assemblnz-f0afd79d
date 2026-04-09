// ═══════════════════════════════════════════════════════════════
// AAAIP — Fuel-Savings Guard
//
// Lightweight consumer-facing policy wrapper that gates the
// Fuel-Savings Assistant's estimate proposals before they are
// shown to the user. Draws on a subset of Arataki AAAIP policies
// adapted for a direct-to-consumer context.
//
// Policies applied:
//   1. HONEST_FUEL_ECONOMY   — stated L/100km must be realistic
//   2. REASONABLE_WEEKLY_KM  — implausibly high km figures are flagged
//   3. UNCERTAINTY_HANDOFF   — low-confidence inputs defer to user review
//
// These mirror the spirit of arataki.fair_trading_claims and
// arataki.uncertainty_handoff but are scoped to consumer
// self-entered vehicle data rather than dealer-quoted figures.
// ═══════════════════════════════════════════════════════════════

import { ComplianceEngine } from "../policy/engine";
import type { RegisteredPolicy } from "../policy/library";
import type {
  AgentAction,
  Policy,
  PolicyEvaluation,
  PolicyPredicate,
} from "../policy/types";

// ── Helpers ────────────────────────────────────────────────────

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

// ── Policies ──────────────────────────────────────────────────

const HONEST_FUEL_ECONOMY: Policy = {
  id: "fuel_savings.honest_fuel_economy",
  domain: "automotive",
  name: "Realistic fuel-economy figure",
  rationale:
    "A stated fuel economy below 3.0 L/100km is unrealistic for most NZ petrol or diesel vehicles. " +
    "Projections based on implausibly low figures will mislead the consumer about actual savings. " +
    "Mirrors NZ Fair Trading Act 1986 §9 — no misleading representations.",
  source: "NZ Fair Trading Act 1986 — section 9 + Arataki AAAIP policy arataki.fair_trading_claims",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["consumer-protection", "fuel-economy"],
};
const honestFuelEconomyPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "estimate_savings") return pass(HONEST_FUEL_ECONOMY.id, "warn");
  const lPer100 = action.payload.fuelEconomyLPer100km as number | undefined;
  if (lPer100 !== undefined && lPer100 < 3.0) {
    return fail(
      HONEST_FUEL_ECONOMY.id,
      "warn",
      `Stated fuel economy ${lPer100.toFixed(1)} L/100km is below realistic NZ vehicle range — check figure before showing projection.`,
    );
  }
  return pass(HONEST_FUEL_ECONOMY.id, "warn");
};

const REASONABLE_WEEKLY_KM: Policy = {
  id: "fuel_savings.reasonable_weekly_km",
  domain: "automotive",
  name: "Plausible weekly distance",
  rationale:
    "A weekly distance above 3,000 km is implausible for a private NZ vehicle. " +
    "Projections based on outlier values would dramatically overstate savings estimates.",
  source: "NZ Transport Agency average annual km data + AAAIP consumer-protection principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["consumer-protection", "plausibility"],
};
const reasonableWeeklyKmPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "estimate_savings") return pass(REASONABLE_WEEKLY_KM.id, "warn");
  const weeklyKm = action.payload.weeklyKm as number | undefined;
  if (weeklyKm !== undefined && weeklyKm > 3000) {
    return fail(
      REASONABLE_WEEKLY_KM.id,
      "warn",
      `Weekly distance ${weeklyKm} km exceeds plausible private vehicle range — verify before projecting savings.`,
    );
  }
  return pass(REASONABLE_WEEKLY_KM.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "fuel_savings.uncertainty_handoff",
  domain: "automotive",
  name: "Flag incomplete inputs",
  rationale:
    "If the consumer's inputs are low-confidence (missing fuel type, unreported economy, " +
    "or incomplete alternative vehicle data), the assistant should show a disclaimer rather " +
    "than present a precise projection.",
  source: "AAAIP safe-operation principle — consumer-context adaptation",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight", "consumer-protection"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(
      UNCERTAINTY.id,
      "warn",
      `Input confidence ${action.confidence.toFixed(2)} < ${ctx.uncertaintyThreshold.toFixed(2)} — show estimate with disclaimer.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

const FUEL_SAVINGS_POLICIES: RegisteredPolicy[] = [
  { policy: HONEST_FUEL_ECONOMY, predicate: honestFuelEconomyPredicate },
  { policy: REASONABLE_WEEKLY_KM, predicate: reasonableWeeklyKmPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];

// ── Engine singleton ───────────────────────────────────────────

const _engine = new ComplianceEngine({
  policies: FUEL_SAVINGS_POLICIES,
  defaultUncertaintyThreshold: 0.7,
});

// ── Public types ───────────────────────────────────────────────

export interface FuelSavingsInput {
  /** Vehicle's stated fuel economy in L/100km (petrol/diesel). */
  fuelEconomyLPer100km: number;
  /** Weekly kilometres driven. */
  weeklyKm: number;
  /** Fuel type the ICE vehicle uses. */
  fuelType: "petrol91" | "petrol95" | "diesel";
  /** EV energy use in kWh/100km (default 17). */
  evKwhPer100km?: number;
  /**
   * Additional upfront cost of switching to an EV over the
   * consumer's current vehicle in NZD (can be negative if EV is cheaper).
   */
  evPremiumNzd?: number;
  /**
   * Confidence 0–1 that all input fields are accurate.
   * Pass 0.95 when all fields are filled; lower if some are guessed.
   */
  confidence?: number;
}

export interface FuelSavingsEstimate {
  /** Whether the estimate passed all policy checks. */
  compliant: boolean;
  /** Human-readable explanation if any policy flagged an issue. */
  policyWarning?: string;
  /** Weekly ICE fuel cost in NZD at current prices. */
  weeklyIceCostNzd: number;
  /** Annual ICE fuel cost in NZD. */
  annualIceCostNzd: number;
  /** Weekly EV fuel (charging) cost in NZD at current prices. */
  weeklyEvCostNzd: number;
  /** Annual EV fuel cost in NZD. */
  annualEvCostNzd: number;
  /** Annual savings from switching to EV. */
  annualSavingsNzd: number;
  /** Payback period in years (null if no premium / instant payback). */
  paybackYears: number | null;
  /** Current diesel price used for the estimate. */
  dieselPriceNzd: number;
  /** Current EV charging price used for the estimate. */
  evPriceNzdPerKwh: number;
  /** Active fuel events (e.g. "strait_of_hormuz_shock"). */
  fuelEvents: string[];
}

let _counter = 0;
const nextId = () => `fsa-${++_counter}`;

/**
 * Evaluate a consumer's fuel-savings inputs through the AAAIP guard
 * and return a policy-annotated savings estimate using live FuelOracle prices.
 *
 * @param input    Consumer's vehicle and usage data.
 * @param fuelSnap Current FuelOracle snapshot (pass `oracle.snapshot()`).
 */
export function estimateFuelSavings(
  input: FuelSavingsInput,
  fuelSnap: { petrol91: number; petrol95: number; diesel: number; ev: number; events: string[] },
): FuelSavingsEstimate {
  const evKwh = input.evKwhPer100km ?? 17;
  const confidence = input.confidence ?? 0.9;

  const action: AgentAction = {
    id: nextId(),
    domain: "automotive",
    kind: "estimate_savings",
    payload: {
      fuelEconomyLPer100km: input.fuelEconomyLPer100km,
      weeklyKm: input.weeklyKm,
      fuelType: input.fuelType,
      evKwhPer100km: evKwh,
    },
    confidence,
    proposedAt: Date.now(),
    rationale: "Consumer fuel-savings estimate request",
  };

  const decision = _engine.evaluate(action, {
    now: Date.now(),
    world: {},
    uncertaintyThreshold: 0.7,
  });

  const fuelPrice = fuelSnap[input.fuelType];
  const evPrice = fuelSnap.ev;

  const weeklyIceCostNzd = round((input.weeklyKm / 100) * input.fuelEconomyLPer100km * fuelPrice);
  const annualIceCostNzd = round(weeklyIceCostNzd * 52);

  const weeklyEvCostNzd = round((input.weeklyKm / 100) * evKwh * evPrice);
  const annualEvCostNzd = round(weeklyEvCostNzd * 52);

  const annualSavingsNzd = round(annualIceCostNzd - annualEvCostNzd);

  const premium = input.evPremiumNzd ?? 0;
  const paybackYears =
    annualSavingsNzd > 0 && premium > 0
      ? round(premium / annualSavingsNzd, 1)
      : premium <= 0
      ? 0
      : null;

  const compliant = decision.verdict === "allow";
  const policyWarning =
    decision.verdict !== "allow" ? decision.explanation : undefined;

  return {
    compliant,
    policyWarning,
    weeklyIceCostNzd,
    annualIceCostNzd,
    weeklyEvCostNzd,
    annualEvCostNzd,
    annualSavingsNzd,
    paybackYears,
    dieselPriceNzd: fuelSnap.diesel,
    evPriceNzdPerKwh: evPrice,
    fuelEvents: fuelSnap.events,
  };
}

/** Expose policy metadata for UI tooltips. */
export const FUEL_SAVINGS_POLICY_METADATA = FUEL_SAVINGS_POLICIES.map((p) => p.policy);

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
