// ═══════════════════════════════════════════════════════════════
// AAAIP — Human-Robot Collaboration Agent
// Picks the next task from the simulator queue, builds a proposed
// motion action, runs it through the compliance engine, and either
// applies the task or escalates to a human supervisor.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { RobotSimulator, RobotTask } from "../simulation/human-robot";

export interface RobotAgentDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  task?: RobotTask;
}

export interface RobotAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `racton-${++actionCounter}`;

export class RobotAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: RobotAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: RobotSimulator): RobotAgentDecisionResult | null {
    const task = this.pickTask(sim);
    if (!task) return null;

    // Adapt the proposed motion plan to current world state.
    const speed = sim.world.humanZones.length > 0
      ? Math.min(task.speedMmS, sim.world.collaborativeSpeedMmS)
      : task.speedMmS;
    const confidence = this.estimateConfidence(task, sim);

    const action: AgentAction = {
      id: nextActionId(),
      domain: "human_robot_collab",
      kind: task.toolChange ? "change_tool" : "move_to_zone",
      payload: {
        taskId: task.id,
        targetZone: task.targetZone,
        forceN: task.forceN,
        speedMmS: speed,
        operatorAck: false, // tool changes start unacknowledged
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `${task.label} (force ${task.forceN}N, speed ${speed}mm/s, conf ${confidence.toFixed(2)}).`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;

    if (decision.verdict === "allow") {
      applied = sim.applyTaskExecution(task.id);
      summary = applied
        ? `Executed: ${task.label}`
        : `Refused by simulator: ${task.label}`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting supervisor approval: ${task.label} — ${decision.explanation}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Hard-block tasks that would put a human at risk are dropped from the queue
      // so they don't immediately retry.
      if (sim.world.humanZones.includes(task.targetZone)) sim.dropTask(task.id);
    }

    return { decision, applied, summary, task };
  }

  /** Apply a human-approved task that the engine flagged as needs_human. */
  approveAndApply(sim: RobotSimulator, taskId: string): boolean {
    return sim.applyTaskExecution(taskId);
  }

  // ── Internals ────────────────────────────────────────────

  private pickTask(sim: RobotSimulator): RobotTask | undefined {
    if (sim.world.taskQueue.length === 0) return undefined;
    // Prefer tasks whose target zone has no human in it; tie-break by force
    // ascending so easy moves go first.
    const sorted = [...sim.world.taskQueue].sort((a, b) => {
      const aHuman = sim.world.humanZones.includes(a.targetZone) ? 1 : 0;
      const bHuman = sim.world.humanZones.includes(b.targetZone) ? 1 : 0;
      if (aHuman !== bHuman) return aHuman - bHuman;
      return a.forceN - b.forceN;
    });
    return sorted[0];
  }

  private estimateConfidence(task: RobotTask, sim: RobotSimulator): number {
    let conf = 0.95;
    if (sim.world.sensorReliability < 0.85) conf -= 0.25;
    if (sim.world.humanIntent === "unknown") conf -= 0.3;
    if (sim.world.humanIntentConfidence < 0.6) conf -= 0.15;
    if (task.toolChange) conf -= 0.1;
    if (sim.world.humanZones.includes(task.targetZone)) conf -= 0.5;
    return Math.max(0, Math.min(1, conf));
  }
}
