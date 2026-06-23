/**
 * AAAIP governance kernel — types.
 *
 * Ported verbatim (lightly) from `assemblnz-latest/src/aaaip/policy/types.ts`
 * and the `RegisteredPolicy` shape in `policy/library.ts`. Pure data contract,
 * zero dependencies. Defines how an agent's proposed action is evaluated against
 * policies before the runtime lets it through — the draft-and-suggest spine
 * behind the flagship creative (Auaha) and clinic (Scribe) policy packs.
 */

/** Domains AAAIP targets. New domains plug in by extending this union. */
export type Domain =
  | 'clinic_scheduling'
  | 'human_robot_collab'
  | 'scientific_discovery'
  | 'community_portal'
  | 'construction'
  | 'freight_customs'
  | 'hospitality'
  | 'creative'
  | 'whanau_navigator'
  | 'automotive'
  | 'maritime';

/** Severity controls how a violation is handled by the runtime. */
export type Severity = 'advisory' | 'warn' | 'block';

/** How human oversight is required for a given action class. */
export type OversightMode = 'always_allow' | 'ask_each_time' | 'never_allow';

/** A single policy rule. Pure data — evaluation logic is separate. */
export interface Policy {
  id: string;
  domain: Domain;
  name: string;
  rationale: string;
  /** Which legal / ethical framework this policy maps to. */
  source: string;
  severity: Severity;
  oversight: OversightMode;
  tags: string[];
}

/** A proposed action the agent wants to take. */
export interface AgentAction {
  id: string;
  domain: Domain;
  kind: string;
  payload: Record<string, unknown>;
  /** Agent's self-assessed confidence (0–1). Drives uncertainty checks. */
  confidence: number;
  proposedAt: number;
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
  verdict: 'allow' | 'needs_human' | 'block';
  explanation: string;
}

/** Mutable runtime context the predicates can read. */
export interface PolicyContext {
  now: number;
  world: Record<string, unknown>;
  /** Threshold below which an action is treated as low-confidence. */
  uncertaintyThreshold: number;
}

/** Predicate signature used by the runtime — kept separate from data. */
export type PolicyPredicate = (action: AgentAction, ctx: PolicyContext) => PolicyEvaluation;

/** A policy bundled with its runtime predicate, as registered with the engine. */
export interface RegisteredPolicy {
  policy: Policy;
  predicate: PolicyPredicate;
}

/** Helpers shared by every policy pack. */
export const pass = (id: string, severity: Severity): PolicyEvaluation => ({
  policyId: id,
  passed: true,
  severity,
  message: 'ok',
});

export const fail = (id: string, severity: Severity, message: string): PolicyEvaluation => ({
  policyId: id,
  passed: false,
  severity,
  message,
});
