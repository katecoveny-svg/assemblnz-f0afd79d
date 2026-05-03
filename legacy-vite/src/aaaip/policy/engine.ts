// ═══════════════════════════════════════════════════════════════
// AAAIP — Runtime Compliance Engine
// Evaluates a proposed AgentAction against a registered set of
// policies and returns a single ComplianceDecision the runtime
// must honour. Pure functions — easy to unit-test.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type {
  AgentAction,
  ComplianceDecision,
  PolicyContext,
  PolicyEvaluation,
} from "./types";

export interface ComplianceEngineOptions {
  policies: RegisteredPolicy[];
  /** Default uncertainty threshold if context omits one. */
  defaultUncertaintyThreshold?: number;
}

export class ComplianceEngine {
  private readonly policies: RegisteredPolicy[];
  private readonly defaultThreshold: number;

  constructor(opts: ComplianceEngineOptions) {
    this.policies = opts.policies;
    this.defaultThreshold = opts.defaultUncertaintyThreshold ?? 0.7;
  }

  evaluate(action: AgentAction, ctx: Partial<PolicyContext> = {}): ComplianceDecision {
    const fullCtx: PolicyContext = {
      now: ctx.now ?? action.proposedAt,
      world: ctx.world ?? {},
      uncertaintyThreshold: ctx.uncertaintyThreshold ?? this.defaultThreshold,
    };

    const evaluations: PolicyEvaluation[] = this.policies.map(({ predicate }) =>
      predicate(action, fullCtx),
    );

    const blocked = evaluations.find((e) => !e.passed && e.severity === "block");
    const warned = evaluations.find((e) => !e.passed && e.severity === "warn");

    let verdict: ComplianceDecision["verdict"];
    let explanation: string;

    if (blocked) {
      verdict = "block";
      explanation = `Blocked by ${blocked.policyId}: ${blocked.message}`;
    } else if (warned) {
      verdict = "needs_human";
      explanation = `Needs human approval (${warned.policyId}): ${warned.message}`;
    } else {
      verdict = "allow";
      explanation = `Approved by ${this.policies.length} policies.`;
    }

    return { action, evaluations, verdict, explanation };
  }

  /** Returns the registered policy metadata for UI surfacing. */
  describePolicies() {
    return this.policies.map((p) => p.policy);
  }
}
