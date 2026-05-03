// ═══════════════════════════════════════════════════════════════
// AAAIP — Pikau (Freight & Customs) Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { PikauSimulator, PikauTask } from "../simulation/pikau";

export interface PikauDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  task?: PikauTask;
}

export interface PikauAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `pikact-${++actionCounter}`;

export class PikauAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: PikauAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: PikauSimulator): PikauDecisionResult | null {
    const task = this.pickTask(sim);
    if (!task) return null;
    const confidence = this.estimateConfidence(task, sim);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "freight_customs",
      kind: task.kind,
      payload: {
        taskId: task.id,
        driverMinutesRemaining: task.driverMinutesRemaining,
        fuelBurnLitres: task.fuelBurnLitres,
        fuelBudgetLitres: task.fuelBudgetLitres,
        fuelCostNzdEstimate: task.fuelCostNzdEstimate,
        fuelCostBudgetNzd: task.fuelCostBudgetNzd,
        reeferTempC: task.reeferTempC,
        targetTempC: task.targetTempC,
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
      summary = `Awaiting controller approval: ${task.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Drop hopeless tasks so they don't retry.
      if (task.driverMinutesRemaining !== undefined && task.driverMinutesRemaining < 15) {
        sim.drop(task.id);
      }
    }
    return { decision, applied, summary, task };
  }

  approveAndApply(sim: PikauSimulator, taskId: string): boolean {
    const task = sim.world.inbox.find((t) => t.id === taskId);
    if (!task) return false;
    return sim.apply(task);
  }

  private pickTask(sim: PikauSimulator): PikauTask | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Prioritise cold-chain clearances first (perishables), then oldest.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      const aCold = a.kind === "clear_delivery" ? 0 : 1;
      const bCold = b.kind === "clear_delivery" ? 0 : 1;
      if (aCold !== bCold) return aCold - bCold;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(task: PikauTask, sim: PikauSimulator): number {
    let conf = 0.95;
    if (sim.world.sensorReliability < 0.85) conf -= 0.3;
    if (task.driverMinutesRemaining !== undefined && task.driverMinutesRemaining < 60) conf -= 0.2;
    if (task.reeferTempC !== undefined && task.targetTempC !== undefined) {
      if (Math.abs(task.reeferTempC - task.targetTempC) > 1) conf -= 0.15;
    }
    if (task.region !== "nz" && task.region !== "au") conf -= 0.4;
    return Math.max(0, Math.min(1, conf));
  }
}
