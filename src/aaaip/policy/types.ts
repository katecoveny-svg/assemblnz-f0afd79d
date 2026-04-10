// ═══════════════════════════════════════════════════════════════
// AAAIP — Policy Framework Types
// Aotearoa Agentic AI Platform
//
// Defines the contract between agents, policies, and the runtime
// compliance engine. Every action an agent proposes is evaluated
// against this framework before it can be executed.
// ═══════════════════════════════════════════════════════════════

/** Domains AAAIP targets. New domains plug in by extending this union. */
export type Domain =
  | "clinic_scheduling"
  | "human_robot_collab"
  | "scientific_discovery"
  | "community_portal"
  | "construction"
  | "freight_customs"
  | "hospitality"
  | "creative"
  | "whanau_navigator"
  | "automotive"
  | "employment"
  | "language";

/** Severity controls how a violation is handled by the runtime. */
export type Severity = "advisory" | "warn" | "block" | "info";

/** How human oversight is required for a given action class. */
export type OversightMode = "always_allow" | "ask_each_time" | "never_allow" | "auto_approve" | "always_human";

/** A single policy rule. Pure data — evaluation logic is separate. */
export interface Policy {
  id: string;
  domain: Domain;
  /** Short human-readable name shown in dashboards. */
  name: string;
  /** Why the policy exists — surfaced to clinicians/users. */
  rationale: string;
  /** Which legal / ethical framework this policy maps to. */
  source: string;
  severity: Severity;
  /** Default oversight mode for actions covered by this policy. */
  oversight: OversightMode;
  /** Tags for grouping in the policy library UI. */
  tags: string[];
}

/** A proposed action the agent wants to take. */
export interface AgentAction {
  id: string;
  domain: Domain;
  /** Action verb the agent is proposing. */
  kind: string;
  /** Free-form payload the agent attaches; rule predicates inspect this. */
  payload: Record<string, unknown>;
  /** Agent's self-assessed confidence (0–1). Drives uncertainty checks. */
  confidence: number;
  /** When the action was proposed (sim or wall clock). */
  proposedAt: number;
  /** Plain-English reason the agent gives for this action. */
  rationale: string;
}

/** Outcome of running a single policy against a single action. */
export interface PolicyEvaluation {
  policyId: string;
  passed: boolean;
  severity: Severity;
  message: string;
}

/** Aggregate decision returned by the compliance engine. */
export interface ComplianceDecision {
  action: AgentAction;
  evaluations: PolicyEvaluation[];
  /** Overall verdict the runtime should enforce. */
  verdict: "allow" | "needs_human" | "block";
  /** Human-readable explanation suitable for the approval queue. */
  explanation: string;
}

/** Predicate signature used by the runtime — kept separate from data. */
export type PolicyPredicate = (
  action: AgentAction,
  ctx: PolicyContext,
) => PolicyEvaluation;

/** Mutable runtime context the predicates can read (schedule state, etc.). */
export interface PolicyContext {
  /** Current simulated or real time. */
  now: number;
  /** Domain-specific snapshot the predicates inspect. */
  world: Record<string, unknown>;
  /** Threshold below which an action is treated as low-confidence. */
  uncertaintyThreshold: number;
}
