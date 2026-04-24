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
