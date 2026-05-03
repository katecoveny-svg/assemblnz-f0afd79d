// ═══════════════════════════════════════════════════════════════
// AAAIP — Scientific Discovery Policies (Drug Screening Pilot)
// Reference policies for an autonomous drug-screening agent that
// proposes wet-lab experiments. Mirrors the clinic / robot library
// shape so the runtime ComplianceEngine consumes it unchanged.
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

const PROVENANCE: Policy = {
  id: "science.provenance",
  domain: "scientific_discovery",
  name: "Compound provenance recorded",
  rationale:
    "Every compound the agent proposes for screening must have a verified provenance trail (source library, lot, date). Untracked compounds cannot enter assay queues.",
  source: "FAIR data principles + GxP data integrity (ALCOA+)",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["data-integrity", "fair"],
};

const provenancePredicate: PolicyPredicate = (action) => {
  if (action.kind !== "screen_compound") return pass(PROVENANCE.id, "block");
  const provenance = action.payload.provenance as string | undefined;
  if (!provenance || provenance.length === 0) {
    return fail(
      PROVENANCE.id,
      "block",
      "Compound has no recorded provenance — refusing to enqueue.",
    );
  }
  return pass(PROVENANCE.id, "block");
};

const IRB_APPROVAL: Policy = {
  id: "science.irb_approval",
  domain: "scientific_discovery",
  name: "Ethics / IRB approval on file",
  rationale:
    "Any assay touching human-derived material requires an active IRB / ethics approval reference.",
  source: "WHO Good Clinical Practice + NZ HDEC ethical review framework",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["ethics", "consent"],
};

const irbPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "screen_compound") return pass(IRB_APPROVAL.id, "block");
  const usesHumanTissue = action.payload.usesHumanTissue as boolean | undefined;
  const irbId = action.payload.irbApprovalId as string | undefined;
  if (usesHumanTissue && !irbId) {
    return fail(
      IRB_APPROVAL.id,
      "block",
      "Assay uses human-derived material but no IRB approval ID is attached.",
    );
  }
  return pass(IRB_APPROVAL.id, "block");
};

const REPRODUCIBILITY: Policy = {
  id: "science.reproducibility_seed",
  domain: "scientific_discovery",
  name: "Reproducibility seed required",
  rationale:
    "Every experiment must record a deterministic seed and the model / pipeline version so the run is independently reproducible.",
  source: "AAAIP open-science principle + Joint Declaration on Research Assessment",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["reproducibility", "open-science"],
};

const reproducibilityPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "screen_compound") return pass(REPRODUCIBILITY.id, "warn");
  const seed = action.payload.seed as number | undefined;
  const pipelineVersion = action.payload.pipelineVersion as string | undefined;
  if (seed === undefined || !pipelineVersion) {
    return fail(
      REPRODUCIBILITY.id,
      "warn",
      "Experiment missing reproducibility seed or pipeline version.",
    );
  }
  return pass(REPRODUCIBILITY.id, "warn");
};

const DOSAGE_LIMIT: Policy = {
  id: "science.dosage_limit",
  domain: "scientific_discovery",
  name: "Dosage within validated range",
  rationale:
    "Proposed dosages must fall within the validated assay range. Out-of-range dosages need an explicit safety review.",
  source: "ICH Q2(R2) analytical validation + assay SOP",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "validated-range"],
};

const dosagePredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "screen_compound") return pass(DOSAGE_LIMIT.id, "block");
  const dose = (action.payload.doseMicromolar as number | undefined) ?? 0;
  const max = (ctx.world.maxDoseMicromolar as number | undefined) ?? 100;
  if (dose > max) {
    return fail(
      DOSAGE_LIMIT.id,
      "block",
      `Dose ${dose} µM exceeds validated maximum of ${max} µM.`,
    );
  }
  return pass(DOSAGE_LIMIT.id, "block");
};

const CONTROL_INTEGRITY: Policy = {
  id: "science.control_integrity",
  domain: "scientific_discovery",
  name: "Control wells preserved",
  rationale:
    "The agent cannot displace positive / negative control wells from a plate. Without controls, results cannot be normalised.",
  source: "Assay SOP + reproducibility working practice",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["assay-integrity"],
};

const controlIntegrityPredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "screen_compound") return pass(CONTROL_INTEGRITY.id, "block");
  const wellId = action.payload.wellId as string | undefined;
  const controlWells = (ctx.world.controlWells as string[]) ?? [];
  if (wellId && controlWells.includes(wellId)) {
    return fail(
      CONTROL_INTEGRITY.id,
      "block",
      `Well ${wellId} is reserved as a control — refusing to overwrite.`,
    );
  }
  return pass(CONTROL_INTEGRITY.id, "block");
};

const TOXICITY_FLAG: Policy = {
  id: "science.toxicity_flag",
  domain: "scientific_discovery",
  name: "Toxicity flag escalation",
  rationale:
    "If the predicted toxicity score exceeds the safety threshold, the experiment must be reviewed by a human investigator before execution.",
  source: "AAAIP safe-operation principle + ICH M7 mutagenicity guideline",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["safety", "human-in-the-loop"],
};

const toxicityPredicate: PolicyPredicate = (action) => {
  const score = (action.payload.toxicityScore as number | undefined) ?? 0;
  if (score > 0.7) {
    return fail(
      TOXICITY_FLAG.id,
      "warn",
      `Predicted toxicity ${score.toFixed(2)} above 0.70 threshold — request investigator review.`,
    );
  }
  return pass(TOXICITY_FLAG.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "science.uncertainty_handoff",
  domain: "scientific_discovery",
  name: "Defer to humans when uncertain",
  rationale:
    "If the agent's confidence in a screening decision is below the configured threshold, escalate to a human investigator.",
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
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)} — requesting investigator approval.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

// ── Public registry ──────────────────────────────────────────

export const SCIENCE_POLICIES: RegisteredPolicy[] = [
  { policy: PROVENANCE, predicate: provenancePredicate },
  { policy: IRB_APPROVAL, predicate: irbPredicate },
  { policy: REPRODUCIBILITY, predicate: reproducibilityPredicate },
  { policy: DOSAGE_LIMIT, predicate: dosagePredicate },
  { policy: CONTROL_INTEGRITY, predicate: controlIntegrityPredicate },
  { policy: TOXICITY_FLAG, predicate: toxicityPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];

export const SCIENCE_POLICY_METADATA: Policy[] = SCIENCE_POLICIES.map((p) => p.policy);
