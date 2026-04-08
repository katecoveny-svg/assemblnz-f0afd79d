// ═══════════════════════════════════════════════════════════════
// AAAIP — Community Portal Moderation Policies
// Reference policies for an AAAIP-aligned community portal where
// researchers, industry partners and whānau share content. The
// agent moderates incoming posts; every action is gated by these
// policies before publish / hide / escalate.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id,
  passed: true,
  severity,
  message: "ok",
});

const fail = (
  id: string,
  severity: Policy["severity"],
  message: string,
): PolicyEvaluation => ({
  policyId: id,
  passed: false,
  severity,
  message,
});

// ── Policies ─────────────────────────────────────────────────

const HARM_BLOCK: Policy = {
  id: "community.harm_block",
  domain: "community_portal",
  name: "Block clearly harmful content",
  rationale:
    "Posts flagged as harassment, hate speech, doxxing or self-harm risk above the safety threshold must be blocked outright.",
  source: "NZ Harmful Digital Communications Act 2015",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "moderation"],
};

const harmBlockPredicate: PolicyPredicate = (action) => {
  const score = (action.payload.harmScore as number | undefined) ?? 0;
  if (score >= 0.8) {
    return fail(
      HARM_BLOCK.id,
      "block",
      `Harm score ${score.toFixed(2)} ≥ 0.80 — refusing to publish.`,
    );
  }
  return pass(HARM_BLOCK.id, "block");
};

const TE_REO_RESPECT: Policy = {
  id: "community.te_reo_respect",
  domain: "community_portal",
  name: "Te reo Māori respect",
  rationale:
    "Posts that misuse macrons, mistranslate karakia or appropriate Māori cultural concepts without attribution must be reviewed by a kaitiaki before publishing.",
  source: "Te Mana Raraunga Māori Data Sovereignty Network principles",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["te-reo", "data-sovereignty", "cultural-safety"],
};

const teReoPredicate: PolicyPredicate = (action) => {
  const flagged = action.payload.teReoConcernFlag as boolean | undefined;
  if (flagged === true) {
    return fail(
      TE_REO_RESPECT.id,
      "warn",
      "Post flagged for te reo / cultural safety concerns — kaitiaki review required.",
    );
  }
  return pass(TE_REO_RESPECT.id, "warn");
};

const DATA_SOVEREIGNTY: Policy = {
  id: "community.data_sovereignty",
  domain: "community_portal",
  name: "Māori data sovereignty",
  rationale:
    "Datasets, recordings or imagery identified as taonga must remain under iwi / hapū control and cannot be cross-shared without explicit consent.",
  source: "Te Mana Raraunga + UNDRIP Article 31",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["data-sovereignty", "consent"],
};

const dataSovereigntyPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "publish_post") return pass(DATA_SOVEREIGNTY.id, "block");
  const isTaonga = action.payload.containsTaonga as boolean | undefined;
  const iwiConsent = action.payload.iwiConsent as boolean | undefined;
  if (isTaonga && iwiConsent !== true) {
    return fail(
      DATA_SOVEREIGNTY.id,
      "block",
      "Post contains taonga material but iwi consent is not on file.",
    );
  }
  return pass(DATA_SOVEREIGNTY.id, "block");
};

const PRIVACY_LEAK: Policy = {
  id: "community.privacy_leak",
  domain: "community_portal",
  name: "PII leak protection",
  rationale:
    "Posts must not contain raw email addresses, phone numbers, NHI numbers or home addresses unless the author explicitly opts in.",
  source: "NZ Privacy Act 2020 — IPP 11 (limits on disclosure)",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "pii"],
};

const privacyLeakPredicate: PolicyPredicate = (action) => {
  const hasPii = action.payload.containsPii as boolean | undefined;
  const optedIn = action.payload.authorPiiOptIn as boolean | undefined;
  if (hasPii && optedIn !== true) {
    return fail(
      PRIVACY_LEAK.id,
      "block",
      "Post contains PII but author has not opted in to publish it.",
    );
  }
  return pass(PRIVACY_LEAK.id, "block");
};

const MISINFO_REVIEW: Policy = {
  id: "community.misinfo_review",
  domain: "community_portal",
  name: "Misinformation human review",
  rationale:
    "Posts whose factual-claim score is below the confidence threshold must be reviewed by a moderator before publishing, with a 'community noted' label if approved.",
  source: "AAAIP epistemic safety principle + IFCN code",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["epistemic", "human-in-the-loop"],
};

const misinfoPredicate: PolicyPredicate = (action) => {
  const factScore = (action.payload.factScore as number | undefined) ?? 1;
  if (factScore < 0.5) {
    return fail(
      MISINFO_REVIEW.id,
      "warn",
      `Fact confidence ${factScore.toFixed(2)} below 0.50 — request moderator review.`,
    );
  }
  return pass(MISINFO_REVIEW.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "community.uncertainty_handoff",
  domain: "community_portal",
  name: "Defer to humans when uncertain",
  rationale:
    "If the moderation agent's confidence is below the configured threshold, escalate to a human kaiwhakahaere.",
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
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)} — requesting kaiwhakahaere approval.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

// ── Public registry ──────────────────────────────────────────

export const COMMUNITY_POLICIES: RegisteredPolicy[] = [
  { policy: HARM_BLOCK, predicate: harmBlockPredicate },
  { policy: TE_REO_RESPECT, predicate: teReoPredicate },
  { policy: DATA_SOVEREIGNTY, predicate: dataSovereigntyPredicate },
  { policy: PRIVACY_LEAK, predicate: privacyLeakPredicate },
  { policy: MISINFO_REVIEW, predicate: misinfoPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];

export const COMMUNITY_POLICY_METADATA: Policy[] = COMMUNITY_POLICIES.map((p) => p.policy);
