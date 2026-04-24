// ═══════════════════════════════════════════════════════════════
// WAIHANGA — Edge-runtime compliance pre-check
// Deno mirror of src/aaaip/policy/waihanga.ts. Runs BEFORE any
// upstream LLM call so blocked actions never reach Claude.
//
// Used by: supabase/functions/claude-chat/index.ts
// ═══════════════════════════════════════════════════════════════

export type Verdict = "allow" | "block" | "needs_human";
export type Severity = "block" | "warn";

export interface PolicyEvaluation {
  policyId: string;
  passed: boolean;
  severity: Severity;
  message: string;
}

export interface ComplianceDecision {
  verdict: Verdict;
  explanation: string;
  evaluations: PolicyEvaluation[];
}

/** Action descriptor parsed from the chat request. */
export interface WaihangaAction {
  /**
   * site_checkin | upload_photo | submit_tender | escalate_hazard | chat
   * "chat" means a free-form conversation turn — only zone-hazard and
   * uncertainty rules apply.
   */
  kind: string;
  zone?: string;
  ppeConfirmed?: boolean;
  containsWorkers?: boolean;
  workerConsent?: boolean;
  humanSignoff?: boolean;
  /** Caller's confidence 0..1 (defaults to 0.95 for chat turns). */
  confidence?: number;
}

/** World snapshot supplied by the client (or sensible defaults). */
export interface WaihangaWorld {
  /** Active workers currently checked in. */
  headcount?: number;
  /** Site headcount cap (defaults to 40). */
  headcountCap?: number;
  /** Zone IDs with unresolved critical hazards. */
  criticalHazardZones?: string[];
  /** Confidence threshold below which to escalate. Defaults to 0.7. */
  uncertaintyThreshold?: number;
}

const pass = (id: string, severity: Severity): PolicyEvaluation => ({
  policyId: id,
  passed: true,
  severity,
  message: "ok",
});
const fail = (id: string, severity: Severity, message: string): PolicyEvaluation => ({
  policyId: id,
  passed: false,
  severity,
  message,
});

// ── Policies ───────────────────────────────────────────────────

function ppe(action: WaihangaAction): PolicyEvaluation {
  const id = "waihanga.ppe_required";
  if (action.kind !== "site_checkin") return pass(id, "block");
  if (!action.ppeConfirmed) {
    return fail(id, "block", "Worker has not confirmed PPE — refusing check-in.");
  }
  return pass(id, "block");
}

function hazard(action: WaihangaAction, world: WaihangaWorld): PolicyEvaluation {
  const id = "waihanga.hazard_escalation";
  const zones = world.criticalHazardZones ?? [];
  if (action.zone && zones.includes(action.zone) && action.kind !== "escalate_hazard") {
    return fail(
      id,
      "block",
      `Zone ${action.zone} has an unresolved critical hazard — only escalation actions allowed.`,
    );
  }
  return pass(id, "block");
}

function workerConsent(action: WaihangaAction): PolicyEvaluation {
  const id = "waihanga.worker_consent";
  if (action.kind !== "upload_photo") return pass(id, "block");
  if (action.containsWorkers && action.workerConsent !== true) {
    return fail(id, "block", "Photo contains identifiable workers but no consent is on file.");
  }
  return pass(id, "block");
}

function tenderIntegrity(action: WaihangaAction): PolicyEvaluation {
  const id = "waihanga.tender_integrity";
  if (action.kind !== "submit_tender") return pass(id, "warn");
  if (action.humanSignoff !== true) {
    return fail(id, "warn", "Tender submission requires human sign-off before dispatch.");
  }
  return pass(id, "warn");
}

function siteAccess(action: WaihangaAction, world: WaihangaWorld): PolicyEvaluation {
  const id = "waihanga.site_access";
  if (action.kind !== "site_checkin") return pass(id, "block");
  const headcount = world.headcount ?? 0;
  const cap = world.headcountCap ?? 40;
  if (headcount >= cap) {
    return fail(id, "block", `Site at capacity (${headcount}/${cap}) — refusing further check-ins.`);
  }
  return pass(id, "block");
}

function uncertainty(action: WaihangaAction, world: WaihangaWorld): PolicyEvaluation {
  const id = "waihanga.uncertainty_handoff";
  const threshold = world.uncertaintyThreshold ?? 0.7;
  const conf = action.confidence ?? 0.95;
  if (conf < threshold) {
    return fail(
      id,
      "warn",
      `Confidence ${conf.toFixed(2)} below threshold ${threshold.toFixed(2)}.`,
    );
  }
  return pass(id, "warn");
}

// ── Engine ─────────────────────────────────────────────────────

export function evaluateWaihangaCompliance(
  action: WaihangaAction,
  world: WaihangaWorld = {},
): ComplianceDecision {
  const evaluations: PolicyEvaluation[] = [
    ppe(action),
    hazard(action, world),
    workerConsent(action),
    tenderIntegrity(action),
    siteAccess(action, world),
    uncertainty(action, world),
  ];

  const blocked = evaluations.find((e) => !e.passed && e.severity === "block");
  const warned = evaluations.find((e) => !e.passed && e.severity === "warn");

  if (blocked) {
    return {
      verdict: "block",
      explanation: `Blocked by ${blocked.policyId}: ${blocked.message}`,
      evaluations,
    };
  }
  if (warned) {
    return {
      verdict: "needs_human",
      explanation: `Needs human approval (${warned.policyId}): ${warned.message}`,
      evaluations,
    };
  }
  return {
    verdict: "allow",
    explanation: `Approved by ${evaluations.length} policies.`,
    evaluations,
  };
}

/**
 * Lightweight intent parser — looks at the latest user turn and the
 * optional `complianceContext` field on the request body to derive an
 * action descriptor. Conservative: returns "chat" when nothing clearly
 * matches a privileged action.
 */
export function deriveActionFromMessage(
  text: string,
  ctx: Partial<WaihangaAction> = {},
): WaihangaAction {
  const lower = text.toLowerCase();

  let kind: string = ctx.kind ?? "chat";
  if (!ctx.kind) {
    if (/\b(check ?in|sign ?in|on ?site)\b/.test(lower)) kind = "site_checkin";
    else if (/\b(upload|attach|post)\b.*\b(photo|image|picture)\b/.test(lower)) kind = "upload_photo";
    else if (/\b(submit|send|file)\b.*\btender\b/.test(lower)) kind = "submit_tender";
    else if (/\b(escalate|notifiable|critical hazard|near miss)\b/.test(lower)) kind = "escalate_hazard";
  }

  return {
    kind,
    zone: ctx.zone,
    ppeConfirmed: ctx.ppeConfirmed,
    containsWorkers: ctx.containsWorkers,
    workerConsent: ctx.workerConsent,
    humanSignoff: ctx.humanSignoff,
    confidence: ctx.confidence ?? 0.95,
  };
}

// ── Structured compliance result for API responses ─────────────
//
// When a chat request is blocked or needs human review, we return
// a richer `complianceResult` object so the frontend can render a
// proper handoff card (per-policy status, required follow-ups,
// recommended next action) without re-deriving the meaning of each
// policy id on the client.

export type PolicyStatus = "passed" | "warned" | "blocked";

export interface PolicyResultItem {
  policyId: string;
  status: PolicyStatus;
  severity: Severity;
  message: string;
  /** Plain-English description of what this policy guards. */
  description: string;
  /** Concrete steps the user / reviewer must take to clear it. */
  requiredFollowUps: string[];
}

export type RecommendedActionType =
  | "fix_input_and_retry"
  | "request_human_approval"
  | "escalate_hazard"
  | "wait_for_capacity"
  | "no_action_required";

export interface RecommendedAction {
  type: RecommendedActionType;
  /** One-line summary the UI can show as a CTA. */
  summary: string;
  /** Ordered next steps the user should follow. */
  steps: string[];
  /** Who owns the next step. */
  owner: "user" | "supervisor" | "site_manager" | "health_safety_officer";
}

export interface ComplianceResult {
  verdict: Verdict;
  explanation: string;
  actionKind: string;
  zone: string | null;
  /** Per-policy outcome — every policy the engine evaluated, in order. */
  policies: PolicyResultItem[];
  /** Subset of `policies` that did not pass — convenience for the UI. */
  failedPolicies: PolicyResultItem[];
  /** Single recommended next action the caller should take. */
  recommendedAction: RecommendedAction;
  /** Optional approval queue id when the request was queued for review. */
  approvalId?: string;
  /** Stable schema version so clients can negotiate future changes. */
  schemaVersion: 1;
}

interface PolicyMeta {
  description: string;
  /** Followups when the policy fails. */
  followUpsOnFail: string[];
}

const POLICY_META: Record<string, PolicyMeta> = {
  "waihanga.ppe_required": {
    description: "Workers must confirm correct PPE before checking on-site.",
    followUpsOnFail: [
      "Confirm hi-vis, hard hat, and steel-cap boots are on.",
      "Re-submit the check-in with the PPE box ticked.",
    ],
  },
  "waihanga.hazard_escalation": {
    description:
      "Zones with an unresolved critical hazard only accept escalation actions.",
    followUpsOnFail: [
      "Switch the action to 'escalate_hazard' or pick a different zone.",
      "Notify the site H&S officer if the hazard is new.",
    ],
  },
  "waihanga.worker_consent": {
    description:
      "Photos showing identifiable workers require recorded worker consent.",
    followUpsOnFail: [
      "Capture verbal/written consent from every visible worker, or",
      "Re-shoot the photo so no worker is identifiable, then re-upload.",
    ],
  },
  "waihanga.tender_integrity": {
    description:
      "Tender submissions must be reviewed and signed off by a human before dispatch.",
    followUpsOnFail: [
      "Have an authorised teammate review the tender draft.",
      "Mark 'human sign-off complete' and re-submit, or wait for the queued reviewer.",
    ],
  },
  "waihanga.site_access": {
    description:
      "Site headcount cap protects evacuation routes — no further check-ins once full.",
    followUpsOnFail: [
      "Wait for a worker to check out, or",
      "Request a temporary cap increase from the site manager.",
    ],
  },
  "waihanga.uncertainty_handoff": {
    description:
      "Low-confidence agent decisions are escalated to a human rather than auto-actioned.",
    followUpsOnFail: [
      "Add the missing context (zone, PPE, consent, etc.) and resend.",
      "Escalate to a supervisor if the request can't be clarified.",
    ],
  },
};

const DEFAULT_META: PolicyMeta = {
  description: "Compliance policy.",
  followUpsOnFail: ["Review the policy message and resolve the failure before retrying."],
};

function evaluationToItem(ev: PolicyEvaluation): PolicyResultItem {
  const meta = POLICY_META[ev.policyId] ?? DEFAULT_META;
  let status: PolicyStatus;
  if (ev.passed) status = "passed";
  else if (ev.severity === "warn") status = "warned";
  else status = "blocked";
  return {
    policyId: ev.policyId,
    status,
    severity: ev.severity,
    message: ev.message,
    description: meta.description,
    requiredFollowUps: ev.passed ? [] : meta.followUpsOnFail,
  };
}

function recommendedActionFor(
  decision: ComplianceDecision,
  action: WaihangaAction,
  approvalId?: string,
): RecommendedAction {
  const failed = decision.evaluations.filter((e) => !e.passed);
  const failedIds = new Set(failed.map((e) => e.policyId));

  if (decision.verdict === "allow") {
    return {
      type: "no_action_required",
      summary: "Compliance passed — proceed.",
      steps: [],
      owner: "user",
    };
  }

  if (failedIds.has("waihanga.hazard_escalation")) {
    return {
      type: "escalate_hazard",
      summary: `Escalate the hazard in zone ${action.zone ?? "(unspecified)"} before any other action.`,
      steps: [
        "Stop work in the affected zone.",
        "Notify the site H&S officer and log the hazard.",
        "Re-submit only after the hazard is cleared or as an explicit escalation.",
      ],
      owner: "health_safety_officer",
    };
  }

  if (failedIds.has("waihanga.site_access")) {
    return {
      type: "wait_for_capacity",
      summary: "Site is at headcount cap — wait or request an increase.",
      steps: [
        "Wait for an active worker to check out.",
        "Or contact the site manager to authorise a temporary cap increase.",
      ],
      owner: "site_manager",
    };
  }

  if (decision.verdict === "needs_human") {
    return {
      type: "request_human_approval",
      summary: approvalId
        ? "Queued for human review — a teammate will action this."
        : "A human reviewer must approve before this can proceed.",
      steps: [
        approvalId
          ? `Approval queue id: ${approvalId} — track in the supervisor inbox.`
          : "Forward the request and context to an authorised reviewer.",
        "Do not retry until the reviewer signs off.",
      ],
      owner: "supervisor",
    };
  }

  // Default: block — user can fix the input and retry.
  return {
    type: "fix_input_and_retry",
    summary: "Resolve the failed policies and resend the request.",
    steps: failed.flatMap((e) =>
      (POLICY_META[e.policyId] ?? DEFAULT_META).followUpsOnFail,
    ),
    owner: "user",
  };
}

/**
 * Build the structured `complianceResult` object returned by the
 * chat API on block / needs_human responses.
 */
export function buildComplianceResult(
  decision: ComplianceDecision,
  action: WaihangaAction,
  options: { approvalId?: string } = {},
): ComplianceResult {
  const policies = decision.evaluations.map(evaluationToItem);
  const failedPolicies = policies.filter((p) => p.status !== "passed");
  return {
    schemaVersion: 1,
    verdict: decision.verdict,
    explanation: decision.explanation,
    actionKind: action.kind,
    zone: action.zone ?? null,
    policies,
    failedPolicies,
    recommendedAction: recommendedActionFor(decision, action, options.approvalId),
    ...(options.approvalId ? { approvalId: options.approvalId } : {}),
  };
}

