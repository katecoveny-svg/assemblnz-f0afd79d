// ═══════════════════════════════════════════════════════════════
// AAAIP — Policy Library
// Reference policies for the clinic-scheduling pilot. Each policy
// pairs declarative metadata (Policy) with a runtime predicate.
// New domains add their own files alongside this one.
// ═══════════════════════════════════════════════════════════════

import type {
  AgentAction,
  Policy,
  PolicyContext,
  PolicyEvaluation,
  PolicyPredicate,
} from "./types";

/** Bundle a Policy with its predicate so the engine can run it. */
export interface RegisteredPolicy {
  policy: Policy;
  predicate: PolicyPredicate;
}

// ── Helpers ────────────────────────────────────────────────────

const pass = (policyId: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId,
  passed: true,
  severity,
  message: "ok",
});

const fail = (
  policyId: string,
  severity: Policy["severity"],
  message: string,
): PolicyEvaluation => ({
  policyId,
  passed: false,
  severity,
  message,
});

// ── Clinic scheduling policies ─────────────────────────────────

const NO_DOUBLE_BOOK: Policy = {
  id: "clinic.no_double_book",
  domain: "clinic_scheduling",
  name: "No double-booking",
  rationale:
    "Clinicians cannot be in two places at once. Overbooking degrades care quality and creates wait-list bias.",
  source: "Operational standard — NZ Health Safety & Quality Commission",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "operational"],
};

const noDoubleBookPredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "schedule_appointment") return pass(NO_DOUBLE_BOOK.id, "block");
  const slot = action.payload.slotId as string | undefined;
  const occupied = (ctx.world.occupiedSlots as string[]) ?? [];
  if (slot && occupied.includes(slot)) {
    return fail(
      NO_DOUBLE_BOOK.id,
      "block",
      `Slot ${slot} is already booked. Refusing to overbook.`,
    );
  }
  return pass(NO_DOUBLE_BOOK.id, "block");
};

const TRIAGE_FIRST: Policy = {
  id: "clinic.triage_first",
  domain: "clinic_scheduling",
  name: "Emergency triage takes priority",
  rationale:
    "Emergency / high-acuity patients must be offered the next available clinical slot before routine bookings.",
  source: "Australasian Triage Scale (ATS) + AAAIP safety alignment",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "fairness"],
};

const triagePredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "schedule_appointment") return pass(TRIAGE_FIRST.id, "block");
  const acuity = (action.payload.acuity as number | undefined) ?? 5;
  const pendingEmergency = (ctx.world.pendingEmergency as boolean) ?? false;
  if (pendingEmergency && acuity >= 3) {
    return fail(
      TRIAGE_FIRST.id,
      "block",
      "An emergency is pending — routine bookings must wait.",
    );
  }
  return pass(TRIAGE_FIRST.id, "block");
};

const CONSENT_REQUIRED: Policy = {
  id: "clinic.consent",
  domain: "clinic_scheduling",
  name: "Patient consent on file",
  rationale:
    "NZ Health Information Privacy Code requires informed consent before storing or acting on health data.",
  source: "Health Information Privacy Code 2020 — Rule 2 & Rule 11",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "consent", "compliance"],
};

const consentPredicate: PolicyPredicate = (action) => {
  const consent = action.payload.consentOnFile as boolean | undefined;
  if (consent === false) {
    return fail(
      CONSENT_REQUIRED.id,
      "block",
      "Patient has not given consent for AI-assisted scheduling.",
    );
  }
  return pass(CONSENT_REQUIRED.id, "block");
};

const FAIRNESS: Policy = {
  id: "clinic.fairness",
  domain: "clinic_scheduling",
  name: "Equitable wait times",
  rationale:
    "Wait times should not differ systematically by ethnicity, postcode or insurance status. Drift triggers a warning.",
  source: "Pae Ora (Healthy Futures) Act 2022 — equity duty",
  severity: "warn",
  oversight: "always_allow",
  tags: ["fairness", "equity"],
};

const fairnessPredicate: PolicyPredicate = (action, ctx) => {
  const bias = (ctx.world.fairnessDriftScore as number | undefined) ?? 0;
  if (bias > 0.25) {
    return fail(
      FAIRNESS.id,
      "warn",
      `Wait-time fairness drift = ${bias.toFixed(2)}. Investigate before more bookings.`,
    );
  }
  return pass(FAIRNESS.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "clinic.uncertainty_handoff",
  domain: "clinic_scheduling",
  name: "Defer to humans when uncertain",
  rationale:
    "If the agent's confidence in a decision is below the configured threshold, escalate to a human clinician.",
  source: "AAAIP safe-operation principle: human-in-the-loop fallback",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight", "human-in-the-loop"],
};

const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(
      UNCERTAINTY.id,
      "warn",
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)} — requesting human approval.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

const DATA_RESIDENCY: Policy = {
  id: "clinic.data_residency",
  domain: "clinic_scheduling",
  name: "NZ data residency",
  rationale:
    "Health data must remain in NZ/AU regions unless explicit cross-border consent is recorded.",
  source: "Privacy Act 2020 — IPP 12 (cross-border disclosure)",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "data-residency"],
};

const dataResidencyPredicate: PolicyPredicate = (action) => {
  const region = (action.payload.region as string | undefined) ?? "nz";
  if (region !== "nz" && region !== "au") {
    return fail(
      DATA_RESIDENCY.id,
      "block",
      `Action would route data through region "${region}" — disallowed.`,
    );
  }
  return pass(DATA_RESIDENCY.id, "block");
};

// ── Public registry ───────────────────────────────────────────

export const CLINIC_POLICIES: RegisteredPolicy[] = [
  { policy: NO_DOUBLE_BOOK, predicate: noDoubleBookPredicate },
  { policy: TRIAGE_FIRST, predicate: triagePredicate },
  { policy: CONSENT_REQUIRED, predicate: consentPredicate },
  { policy: FAIRNESS, predicate: fairnessPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
  { policy: DATA_RESIDENCY, predicate: dataResidencyPredicate },
];

/** Lookup helper for the dashboard. */
export function getPolicyById(id: string): Policy | undefined {
  return CLINIC_POLICIES.find((p) => p.policy.id === id)?.policy;
}

/** Re-export for callers that only want the metadata. */
export const CLINIC_POLICY_METADATA: Policy[] = CLINIC_POLICIES.map((p) => p.policy);

// Re-exported type so callers don't need a second import.
export type { AgentAction, PolicyContext };
