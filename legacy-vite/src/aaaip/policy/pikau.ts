// ═══════════════════════════════════════════════════════════════
// AAAIP — Pikau (Freight & Customs) Policies
// Gates for an autonomous fleet-and-cold-chain agent reading
// telemetry from trucks, vessels and reefer containers.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

const DRIVER_HOURS: Policy = {
  id: "pikau.driver_hours",
  domain: "freight_customs",
  name: "Driver hours cap",
  rationale:
    "Dispatch actions cannot assign a route to a driver who is within 30 minutes of their legal hours-of-service cap.",
  source: "NZTA Work Time and Logbook rules 2007",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "fatigue"],
};
const driverHoursPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "assign_route") return pass(DRIVER_HOURS.id, "block");
  const remaining = (action.payload.driverMinutesRemaining as number | undefined) ?? 60;
  if (remaining < 30) {
    return fail(DRIVER_HOURS.id, "block",
      `Driver has ${remaining} min left — below 30 min safety buffer.`);
  }
  return pass(DRIVER_HOURS.id, "block");
};

const COLD_CHAIN: Policy = {
  id: "pikau.cold_chain",
  domain: "freight_customs",
  name: "Cold chain compliance",
  rationale:
    "Reefer containers whose temperature is outside the +/-2°C spec must escalate before the agent clears them for delivery.",
  source: "NZFSA ANZFA 3.2.2 cold chain standard",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "cold-chain"],
};
const coldChainPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "clear_delivery") return pass(COLD_CHAIN.id, "block");
  const temp = (action.payload.reeferTempC as number | undefined) ?? 0;
  const target = (action.payload.targetTempC as number | undefined) ?? 4;
  if (Math.abs(temp - target) > 2) {
    return fail(COLD_CHAIN.id, "block",
      `Reefer at ${temp}°C (target ${target}°C) — outside tolerance.`);
  }
  return pass(COLD_CHAIN.id, "block");
};

const SENSOR_HEALTH: Policy = {
  id: "pikau.sensor_health",
  domain: "freight_customs",
  name: "Sensor reliability gate",
  rationale:
    "If telemetry sensor reliability falls below 0.75, all automated decisions are blocked until the sensor recovers.",
  source: "IEC 61496 + internal IoT SOP",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "perception"],
};
const sensorHealthPredicate: PolicyPredicate = (action, ctx) => {
  const reliability = (ctx.world.sensorReliability as number | undefined) ?? 1;
  if (reliability < 0.75) {
    return fail(SENSOR_HEALTH.id, "block",
      `Sensor reliability ${reliability.toFixed(2)} < 0.75.`);
  }
  return pass(SENSOR_HEALTH.id, "block");
};

const DATA_RESIDENCY: Policy = {
  id: "pikau.data_residency",
  domain: "freight_customs",
  name: "NZ/AU data residency",
  rationale:
    "Fleet telemetry must stay in NZ/AU region unless an explicit cross-border consent token is present.",
  source: "NZ Privacy Act 2020 IPP 12",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "data-residency"],
};
const residencyPredicate: PolicyPredicate = (action) => {
  const region = (action.payload.region as string | undefined) ?? "nz";
  if (region !== "nz" && region !== "au") {
    return fail(DATA_RESIDENCY.id, "block", `Action would route data via "${region}".`);
  }
  return pass(DATA_RESIDENCY.id, "block");
};

const ECO_DRIVE: Policy = {
  id: "pikau.eco_drive",
  domain: "freight_customs",
  name: "Eco-driving preference",
  rationale:
    "Prefer routes that do not exceed a fuel-burn budget, warn if the agent picks a high-burn option.",
  source: "Internal ESG target + ICCT freight efficiency guidance",
  severity: "warn",
  oversight: "always_allow",
  tags: ["sustainability", "esg"],
};
const ecoPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "assign_route") return pass(ECO_DRIVE.id, "warn");
  const fuel = (action.payload.fuelBurnLitres as number | undefined) ?? 0;
  const budget = (action.payload.fuelBudgetLitres as number | undefined) ?? 100;
  if (fuel > budget) {
    return fail(ECO_DRIVE.id, "warn",
      `Route burns ${fuel}L, budget ${budget}L — flag for review.`);
  }
  return pass(ECO_DRIVE.id, "warn");
};

/**
 * FUEL_COST_CAP — replaces the litre-only ECO_DRIVE check with a
 * live-price NZD check powered by FuelOracle. When fuel prices spike
 * (e.g. after a geopolitical shock), routes that were previously
 * under-budget become over-budget and must go to human review.
 *
 * The action payload carries:
 *   fuelCostNzdEstimate  — agent's current-price cost estimate in NZD
 *   fuelCostBudgetNzd    — route NZD budget (defaults to $200 if omitted)
 */
const FUEL_COST_CAP: Policy = {
  id: "pikau.fuel_cost_cap",
  domain: "freight_customs",
  name: "Fuel cost cap (NZD)",
  rationale:
    "Routes whose estimated fuel cost in NZD exceeds the dispatcher-set budget must be flagged for human review. NZD-based (not litre-based) so live price movements — including geopolitical fuel shocks — automatically tighten the gate.",
  source: "Internal ESG target + FuelOracle live pricing + ICCT freight efficiency guidance",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["sustainability", "esg", "fuel-cost"],
};
const fuelCostCapPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "assign_route") return pass(FUEL_COST_CAP.id, "warn");
  const costNzd = (action.payload.fuelCostNzdEstimate as number | undefined) ?? 0;
  const budgetNzd = (action.payload.fuelCostBudgetNzd as number | undefined) ?? 200;
  if (costNzd > budgetNzd) {
    return fail(
      FUEL_COST_CAP.id,
      "warn",
      `Fuel cost NZ$${costNzd.toFixed(2)} exceeds budget NZ$${budgetNzd.toFixed(2)} — send to controller for approval.`,
    );
  }
  return pass(FUEL_COST_CAP.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "pikau.uncertainty_handoff",
  domain: "freight_customs",
  name: "Defer to humans when uncertain",
  rationale: "Escalate low-confidence dispatch decisions to a human controller.",
  source: "AAAIP safe-operation principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight", "human-in-the-loop"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(UNCERTAINTY.id, "warn",
      `Confidence ${action.confidence.toFixed(2)} < ${ctx.uncertaintyThreshold.toFixed(2)}.`);
  }
  return pass(UNCERTAINTY.id, "warn");
};

export const PIKAU_POLICIES: RegisteredPolicy[] = [
  { policy: DRIVER_HOURS, predicate: driverHoursPredicate },
  { policy: COLD_CHAIN, predicate: coldChainPredicate },
  { policy: SENSOR_HEALTH, predicate: sensorHealthPredicate },
  { policy: DATA_RESIDENCY, predicate: residencyPredicate },
  { policy: ECO_DRIVE, predicate: ecoPredicate },
  { policy: FUEL_COST_CAP, predicate: fuelCostCapPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const PIKAU_POLICY_METADATA: Policy[] = PIKAU_POLICIES.map((p) => p.policy);
