// ═══════════════════════════════════════════════════════════════
// AAAIP — Aroha Employment Advice Guard
//
// Lightweight policy wrapper for the Aroha HR & Employment Law
// kete. Three policies run on every document or advice output
// before it is shown to the user.
//
// Policies applied:
//   1. LEGAL_ADVICE_DISCLAIMER — all output must carry a
//      "not legal advice" notice referencing the ERA review right
//   2. HIGH_RISK_DOCUMENT_FLAG — termination letters, written
//      warnings (final), PGs, and redundancy letters are flagged
//      for human (lawyer) review before use
//   3. PG_ESCALATION — any personal grievance context immediately
//      defers to a qualified NZ employment lawyer
//
// Mirrors the spirit of the fuel-savings-guard.ts pattern and
// aligns with NZ Employment Relations Act 2000 s 63A (employee
// right to independent advice before signing an agreement).
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

// ── High-risk document kinds ───────────────────────────────────

const HIGH_RISK_KINDS = new Set([
  "termination_letter",
  "written_warning_final",
  "written_warning_second",
  "redundancy_letter",
  "performance_improvement_plan",
  "personal_grievance_response",
]);

const PG_KINDS = new Set([
  "personal_grievance_response",
  "pg_advice",
  "unjustified_dismissal",
  "unjustified_disadvantage",
]);

// ── Policy 1: Legal Advice Disclaimer ─────────────────────────

const LEGAL_ADVICE_DISCLAIMER: Policy = {
  id: "aroha.legal_advice_disclaimer",
  domain: "employment",
  name: "Legal advice disclaimer",
  rationale:
    "Aroha generates guidance based on NZ employment legislation but does not constitute " +
    "legal advice. The Employment Relations Act 2000 s 63A gives employees the right to seek " +
    "independent advice before signing agreements. All output must carry this notice.",
  source: "Employment Relations Act 2000 — section 63A",
  severity: "info",
  oversight: "auto_approve",
  tags: ["consumer-protection", "legal-disclaimer"],
};
const legalAdviceDisclaimerPredicate: PolicyPredicate = (action) => {
  // Always passes — the guard just ensures the disclaimer flag is set in the output
  if (action.kind !== "generate_employment_doc" && action.kind !== "give_employment_advice") {
    return pass(LEGAL_ADVICE_DISCLAIMER.id, "info");
  }
  const hasDisclaimer = action.payload.disclaimerAcknowledged as boolean | undefined;
  if (!hasDisclaimer) {
    return fail(
      LEGAL_ADVICE_DISCLAIMER.id,
      "info",
      "Output must include legal advice disclaimer: this guidance is not a substitute for advice from a qualified employment lawyer.",
    );
  }
  return pass(LEGAL_ADVICE_DISCLAIMER.id, "info");
};

// ── Policy 2: High-Risk Document Flag ─────────────────────────

const HIGH_RISK_DOCUMENT_FLAG: Policy = {
  id: "aroha.high_risk_document_flag",
  domain: "employment",
  name: "High-risk document review",
  rationale:
    "Termination letters, final written warnings, performance improvement plans, and " +
    "redundancy letters carry significant legal and personal consequences. These must be " +
    "reviewed by a qualified employment lawyer or HR professional before being sent. " +
    "Mirrors the NZ Fair Trading Act 1986 §9 — no misleading representations — and " +
    "Employment Relations Act 2000 duty of good faith.",
  source: "Employment Relations Act 2000 — Part 9 (good faith) + AAAIP high-risk flag principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["employment-law", "high-risk", "consumer-protection"],
};
const highRiskDocumentFlagPredicate: PolicyPredicate = (action) => {
  const kind = action.payload.documentKind as string | undefined;
  if (kind && HIGH_RISK_KINDS.has(kind)) {
    return fail(
      HIGH_RISK_DOCUMENT_FLAG.id,
      "warn",
      `"${kind}" is a high-risk employment document — have it reviewed by a qualified employment lawyer or HR professional before sending.`,
    );
  }
  return pass(HIGH_RISK_DOCUMENT_FLAG.id, "warn");
};

// ── Policy 3: Personal Grievance Escalation ────────────────────

const PG_ESCALATION: Policy = {
  id: "aroha.pg_escalation",
  domain: "employment",
  name: "Personal grievance escalation",
  rationale:
    "Personal grievances (unjustified dismissal, unjustified disadvantage, harassment, " +
    "discrimination) are high-stakes legal proceedings under the Employment Relations Act 2000 " +
    "Part 9. The time limit to raise a PG is 90 days. Aroha must always defer these to a " +
    "qualified NZ employment lawyer rather than providing substantive advice.",
  source: "Employment Relations Act 2000 — Part 9, s 114 (90-day PG window)",
  severity: "block",
  oversight: "always_human",
  tags: ["employment-law", "personal-grievance", "escalation"],
};
const pgEscalationPredicate: PolicyPredicate = (action) => {
  const kind = action.payload.documentKind as string | undefined;
  const context = action.payload.context as string | undefined;
  const isPG =
    (kind && PG_KINDS.has(kind)) ||
    (context && /personal.?grievance|unjustified.?dismiss|unjustified.?disadvantage/i.test(context));
  if (isPG) {
    return fail(
      PG_ESCALATION.id,
      "block",
      "Personal grievance situations require a qualified NZ employment lawyer — the 90-day window from the ERA (s 114) makes prompt legal advice critical. Aroha cannot provide substantive guidance on PGs.",
    );
  }
  return pass(PG_ESCALATION.id, "block");
};

// ── Registry ───────────────────────────────────────────────────

const AROHA_POLICIES: RegisteredPolicy[] = [
  { policy: LEGAL_ADVICE_DISCLAIMER, predicate: legalAdviceDisclaimerPredicate },
  { policy: HIGH_RISK_DOCUMENT_FLAG, predicate: highRiskDocumentFlagPredicate },
  { policy: PG_ESCALATION, predicate: pgEscalationPredicate },
];

// ── Engine singleton ───────────────────────────────────────────

const _engine = new ComplianceEngine({
  policies: AROHA_POLICIES,
  defaultUncertaintyThreshold: 0.7,
});

// ── Public types ───────────────────────────────────────────────

export interface ArohaAdviceInput {
  /** The kind of document or advice being generated. */
  documentKind?: string;
  /** Free-form context string (used to detect PG references). */
  context?: string;
  /** Whether the user has acknowledged the legal disclaimer. */
  disclaimerAcknowledged?: boolean;
  /** Confidence 0–1 in the request classification. */
  confidence?: number;
}

export interface ArohaAdviceDecision {
  /** Whether the output is cleared to show. */
  compliant: boolean;
  /** Human-readable policy warning if not compliant. */
  policyWarning?: string;
  /** Whether this is a high-risk document requiring lawyer review. */
  requiresLawyerReview: boolean;
  /** Whether this is a PG situation that must be escalated. */
  isPgEscalation: boolean;
  /** Whether a legal advice disclaimer must be shown. */
  showDisclaimer: boolean;
}

let _counter = 0;
const nextId = () => `aroha-${++_counter}`;

/**
 * Evaluate an Aroha employment advice request through the AAAIP guard.
 *
 * @param input  Advice request details.
 * @returns      Policy-annotated decision for the UI to act on.
 */
export function evaluateArohaAdvice(input: ArohaAdviceInput): ArohaAdviceDecision {
  const confidence = input.confidence ?? 0.9;

  const action: AgentAction = {
    id: nextId(),
    domain: "employment",
    kind: "generate_employment_doc",
    payload: {
      documentKind: input.documentKind ?? "general_advice",
      context: input.context ?? "",
      disclaimerAcknowledged: input.disclaimerAcknowledged ?? false,
    },
    confidence,
    proposedAt: Date.now(),
    rationale: "Aroha employment advice request",
  };

  const decision = _engine.evaluate(action, {
    now: Date.now(),
    world: {},
    uncertaintyThreshold: 0.7,
  });

  const kind = input.documentKind ?? "";
  const context = input.context ?? "";
  const isPG =
    PG_KINDS.has(kind) ||
    /personal.?grievance|unjustified.?dismiss|unjustified.?disadvantage/i.test(context);
  const isHighRisk = HIGH_RISK_KINDS.has(kind);

  return {
    compliant: decision.verdict === "allow",
    policyWarning: decision.verdict !== "allow" ? decision.explanation : undefined,
    requiresLawyerReview: isHighRisk,
    isPgEscalation: isPG,
    showDisclaimer: true, // always show disclaimer for Aroha
  };
}

/** Expose policy metadata for UI tooltips. */
export const AROHA_POLICY_METADATA = AROHA_POLICIES.map((p) => p.policy);
