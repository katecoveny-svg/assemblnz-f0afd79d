// ═══════════════════════════════════════════════════════════════
// AAAIP — Tōro (Whānau Family Navigator) Policies
// Safety, consent and wellbeing policies for Tōro — an SMS-first
// whānau family navigator that sends school notices, meal ideas,
// budget alerts, learning prompts and appointment reminders.
//
// Tōro works with children's data, household finances and
// wellbeing signals — a triple-sensitive combination — so every
// outbound message is gated by these policies.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

// ── Policies ─────────────────────────────────────────────────

const PARENTAL_CONSENT: Policy = {
  id: "toro.parental_consent",
  domain: "whanau_navigator",
  name: "Parental consent for child data",
  rationale:
    "Any message referencing a child (name, school, performance, health) must only be sent to whānau members with recorded parental consent.",
  source: "NZ Privacy Act 2020 + UN Convention on the Rights of the Child Art. 16",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "children", "consent"],
};
const parentalConsentPredicate: PolicyPredicate = (action) => {
  const childRef = action.payload.referencesChild as boolean | undefined;
  const consent = action.payload.parentalConsent as boolean | undefined;
  if (childRef && consent !== true) {
    return fail(PARENTAL_CONSENT.id, "block",
      "Message references a child but no parental consent is on file.");
  }
  return pass(PARENTAL_CONSENT.id, "block");
};

const AGE_APPROPRIATE: Policy = {
  id: "toro.age_appropriate",
  domain: "whanau_navigator",
  name: "Age-appropriate content for children",
  rationale:
    "Messages delivered directly to a child recipient must be rated age-appropriate by the content classifier.",
  source: "NZ Classification Office guidance + Broadcasting Standards Authority rules",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "children"],
};
const ageAppropriatePredicate: PolicyPredicate = (action) => {
  const recipient = action.payload.recipientType as string | undefined;
  const ageAppropriate = action.payload.ageAppropriate as boolean | undefined;
  if (recipient === "child" && ageAppropriate !== true) {
    return fail(AGE_APPROPRIATE.id, "block",
      "Message is not rated age-appropriate for a child recipient.");
  }
  return pass(AGE_APPROPRIATE.id, "block");
};

const FINANCIAL_HARM: Policy = {
  id: "toro.financial_harm",
  domain: "whanau_navigator",
  name: "Financial harm protection",
  rationale:
    "Budget advice must not recommend high-risk actions (payday loans, overdraft, credit rollover) to vulnerable households.",
  source: "NZ Credit Contracts and Consumer Finance Act 2003 + MSD hardship guidance",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "financial"],
};
const financialHarmPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "send_budget_alert") return pass(FINANCIAL_HARM.id, "block");
  const riskTier = action.payload.recommendationRisk as string | undefined;
  const vulnerable = action.payload.vulnerableHousehold as boolean | undefined;
  if (vulnerable && riskTier === "high") {
    return fail(FINANCIAL_HARM.id, "block",
      "High-risk financial action recommended to a vulnerable household — refusing.");
  }
  return pass(FINANCIAL_HARM.id, "block");
};

const WELLBEING_CRISIS: Policy = {
  id: "toro.wellbeing_crisis",
  domain: "whanau_navigator",
  name: "Wellbeing crisis handoff",
  rationale:
    "Messages mentioning suicidal ideation, family harm or acute mental-health crisis must be handed off to a human whānau worker immediately — the agent cannot auto-respond.",
  source: "Mental Health (Compulsory Assessment & Treatment) Act 1992 + NZ Suicide Prevention Framework",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "wellbeing"],
};
const wellbeingCrisisPredicate: PolicyPredicate = (action) => {
  const crisisFlag = action.payload.crisisFlag as boolean | undefined;
  if (crisisFlag === true) {
    return fail(WELLBEING_CRISIS.id, "block",
      "Wellbeing crisis flag raised — mandatory human handoff.");
  }
  return pass(WELLBEING_CRISIS.id, "block");
};

const TE_REO_INTEGRITY: Policy = {
  id: "toro.te_reo_integrity",
  domain: "whanau_navigator",
  name: "Te reo integrity",
  rationale:
    "Messages containing te reo Māori must pass a macron / spelling check before being sent to whānau.",
  source: "Te Taura Whiri i te Reo Māori guidance + Te Mana Raraunga",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["te-reo", "cultural-safety"],
};
const teReoPredicate: PolicyPredicate = (action) => {
  const teReo = action.payload.containsTeReo as boolean | undefined;
  const validated = action.payload.teReoValidated as boolean | undefined;
  if (teReo && validated !== true) {
    return fail(TE_REO_INTEGRITY.id, "warn",
      "Message contains te reo but has not passed validation.");
  }
  return pass(TE_REO_INTEGRITY.id, "warn");
};

const DATA_SOVEREIGNTY: Policy = {
  id: "toro.data_sovereignty",
  domain: "whanau_navigator",
  name: "Whānau data sovereignty",
  rationale:
    "Whānau data (school performance, household finance, wellbeing signals) must not leave the whānau's own data scope.",
  source: "Te Mana Raraunga + NZ Privacy Act 2020 IPP 11",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["data-sovereignty", "privacy"],
};
const sovereigntyPredicate: PolicyPredicate = (action) => {
  const scope = action.payload.dataScope as string | undefined;
  if (scope && scope !== "whanau") {
    return fail(DATA_SOVEREIGNTY.id, "block",
      `Action would share data beyond the whānau scope (${scope}).`);
  }
  return pass(DATA_SOVEREIGNTY.id, "block");
};

const UNCERTAINTY: Policy = {
  id: "toro.uncertainty_handoff",
  domain: "whanau_navigator",
  name: "Defer to humans when uncertain",
  rationale:
    "If the agent's confidence in a whānau-facing action is below the threshold, escalate to a human kaiāwhina.",
  source: "AAAIP safe-operation principle: human-in-the-loop fallback",
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

// ── Public registry ──────────────────────────────────────────

export const TORO_POLICIES: RegisteredPolicy[] = [
  { policy: PARENTAL_CONSENT, predicate: parentalConsentPredicate },
  { policy: AGE_APPROPRIATE, predicate: ageAppropriatePredicate },
  { policy: FINANCIAL_HARM, predicate: financialHarmPredicate },
  { policy: WELLBEING_CRISIS, predicate: wellbeingCrisisPredicate },
  { policy: TE_REO_INTEGRITY, predicate: teReoPredicate },
  { policy: DATA_SOVEREIGNTY, predicate: sovereigntyPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const TORO_POLICY_METADATA: Policy[] = TORO_POLICIES.map((p) => p.policy);
