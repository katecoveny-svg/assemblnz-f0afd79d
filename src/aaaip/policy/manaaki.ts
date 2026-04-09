// ═══════════════════════════════════════════════════════════════
// AAAIP — Manaaki (Hospitality) Policies
// Guest-safety and data-sovereignty policies for a reservations /
// guest-experience agent managing dietary, accessibility and
// preference data.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

const ALLERGEN_SAFETY: Policy = {
  id: "manaaki.allergen_safety",
  domain: "hospitality",
  name: "Allergen conflict block",
  rationale:
    "No menu item containing a declared guest allergen can be confirmed for that guest under any circumstances.",
  source: "NZ Food Act 2014 + MPI allergen labelling guidance",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "food-safety"],
};
const allergenPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "confirm_order") return pass(ALLERGEN_SAFETY.id, "block");
  const conflicts = action.payload.allergenConflict as boolean | undefined;
  if (conflicts) {
    return fail(ALLERGEN_SAFETY.id, "block", "Order contains a guest allergen — refusing confirm.");
  }
  return pass(ALLERGEN_SAFETY.id, "block");
};

const GUEST_CONSENT: Policy = {
  id: "manaaki.guest_consent",
  domain: "hospitality",
  name: "Guest data sharing consent",
  rationale:
    "Guest profile data cannot be shared with third-party marketing or analytics without the guest's opt-in.",
  source: "NZ Privacy Act 2020 + Unsolicited Electronic Messages Act",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "consent"],
};
const consentPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "share_guest_profile") return pass(GUEST_CONSENT.id, "block");
  const consent = action.payload.marketingOptIn as boolean | undefined;
  if (consent !== true) {
    return fail(GUEST_CONSENT.id, "block", "Guest has not opted in to marketing data sharing.");
  }
  return pass(GUEST_CONSENT.id, "block");
};

const ACCESSIBILITY: Policy = {
  id: "manaaki.accessibility",
  domain: "hospitality",
  name: "Accessibility requirements honoured",
  rationale:
    "Rooms assigned to guests with accessibility needs must match the required features (step-free, grab-rails, hearing loop).",
  source: "NZ Human Rights Act 1993 + MBIE hospitality accessibility guidance",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["accessibility", "equity"],
};
const accessibilityPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "assign_room") return pass(ACCESSIBILITY.id, "block");
  const required = (action.payload.accessibilityRequired as string[]) ?? [];
  const provided = (action.payload.accessibilityProvided as string[]) ?? [];
  const missing = required.filter((r) => !provided.includes(r));
  if (missing.length > 0) {
    return fail(ACCESSIBILITY.id, "block",
      `Room missing required accessibility features: ${missing.join(", ")}.`);
  }
  return pass(ACCESSIBILITY.id, "block");
};

const OVERBOOK: Policy = {
  id: "manaaki.no_overbook",
  domain: "hospitality",
  name: "No overbooking",
  rationale: "Cannot confirm a reservation past the property's confirmed room count.",
  source: "Consumer Guarantees Act 1993 + operational SOP",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["operational"],
};
const overbookPredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "confirm_reservation") return pass(OVERBOOK.id, "block");
  const confirmed = (ctx.world.confirmedCount as number | undefined) ?? 0;
  const cap = (ctx.world.propertyCapacity as number | undefined) ?? 10;
  if (confirmed >= cap) {
    return fail(OVERBOOK.id, "block", `Property full (${confirmed}/${cap}).`);
  }
  return pass(OVERBOOK.id, "block");
};

const DATA_RESIDENCY: Policy = {
  id: "manaaki.data_residency",
  domain: "hospitality",
  name: "NZ/AU data residency",
  rationale: "Guest PII must remain in NZ/AU unless explicit consent is recorded.",
  source: "NZ Privacy Act 2020 IPP 12",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "data-residency"],
};
const residencyPredicate: PolicyPredicate = (action) => {
  const region = (action.payload.region as string | undefined) ?? "nz";
  if (region !== "nz" && region !== "au") {
    return fail(DATA_RESIDENCY.id, "block", `Action would route via "${region}".`);
  }
  return pass(DATA_RESIDENCY.id, "block");
};

const UNCERTAINTY: Policy = {
  id: "manaaki.uncertainty_handoff",
  domain: "hospitality",
  name: "Defer to humans when uncertain",
  rationale: "Escalate low-confidence guest decisions to the front-of-house manager.",
  source: "AAAIP safe-operation principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(UNCERTAINTY.id, "warn",
      `Confidence ${action.confidence.toFixed(2)} < ${ctx.uncertaintyThreshold.toFixed(2)}.`);
  }
  return pass(UNCERTAINTY.id, "warn");
};

export const MANAAKI_POLICIES: RegisteredPolicy[] = [
  { policy: ALLERGEN_SAFETY, predicate: allergenPredicate },
  { policy: GUEST_CONSENT, predicate: consentPredicate },
  { policy: ACCESSIBILITY, predicate: accessibilityPredicate },
  { policy: OVERBOOK, predicate: overbookPredicate },
  { policy: DATA_RESIDENCY, predicate: residencyPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const MANAAKI_POLICY_METADATA: Policy[] = MANAAKI_POLICIES.map((p) => p.policy);
