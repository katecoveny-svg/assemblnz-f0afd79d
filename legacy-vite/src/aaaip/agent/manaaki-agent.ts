// ═══════════════════════════════════════════════════════════════
// AAAIP — Manaaki (Hospitality) Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { ManaakiSimulator, ManaakiTask } from "../simulation/manaaki";

export interface ManaakiDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  task?: ManaakiTask;
}

export interface ManaakiAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `mnkact-${++actionCounter}`;

export class ManaakiAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: ManaakiAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: ManaakiSimulator): ManaakiDecisionResult | null {
    const task = this.pickTask(sim);
    if (!task) return null;
    const confidence = this.estimateConfidence(task);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "hospitality",
      kind: task.kind,
      payload: {
        taskId: task.id,
        accessibilityRequired: task.accessibilityRequired,
        accessibilityProvided: task.accessibilityProvided,
        allergenConflict: task.allergenConflict,
        marketingOptIn: task.marketingOptIn,
        region: task.region,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `${task.label} (conf ${confidence.toFixed(2)}).`,
    };
    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;
    if (decision.verdict === "allow") {
      applied = sim.apply(task);
      summary = applied ? `Applied: ${task.label}` : `Simulator refused: ${task.label}`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting front-of-house approval: ${task.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Allergen conflicts and accessibility mismatches drop from queue.
      if (task.allergenConflict) sim.drop(task.id);
      if (task.kind === "assign_room" && (task.accessibilityRequired?.length ?? 0) > 0) {
        const missing = (task.accessibilityRequired ?? []).filter(
          (r) => !(task.accessibilityProvided ?? []).includes(r),
        );
        if (missing.length > 0) sim.drop(task.id);
      }
    }
    return { decision, applied, summary, task };
  }

  approveAndApply(sim: ManaakiSimulator, taskId: string): boolean {
    const task = sim.world.inbox.find((t) => t.id === taskId);
    if (!task) return false;
    return sim.apply(task);
  }

  private pickTask(sim: ManaakiSimulator): ManaakiTask | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    return [...sim.world.inbox].sort((a, b) => a.arrivedAt - b.arrivedAt)[0];
  }

  private estimateConfidence(task: ManaakiTask): number {
    let conf = 0.92;
    if (task.allergenConflict) conf = 0.1;
    if (task.kind === "share_guest_profile" && !task.marketingOptIn) conf = 0.3;
    if (task.region !== "nz" && task.region !== "au") conf -= 0.4;
    return Math.max(0, Math.min(1, conf));
  }
}
