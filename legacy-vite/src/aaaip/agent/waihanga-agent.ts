// ═══════════════════════════════════════════════════════════════
// AAAIP — Waihanga (Construction) Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { WaihangaSimulator, WaihangaTask } from "../simulation/waihanga";

export interface WaihangaDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  task?: WaihangaTask;
}

export interface WaihangaAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `wngact-${++actionCounter}`;

export class WaihangaAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: WaihangaAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: WaihangaSimulator): WaihangaDecisionResult | null {
    const task = this.pickTask(sim);
    if (!task) return null;

    const confidence = this.estimateConfidence(task, sim);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "construction",
      kind: task.kind,
      payload: {
        taskId: task.id,
        zone: task.zone,
        ppeConfirmed: task.ppeConfirmed,
        containsWorkers: task.containsWorkers,
        workerConsent: task.workerConsent,
        humanSignoff: task.humanSignoff,
        severity: task.severity,
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
      summary = `Awaiting supervisor approval: ${task.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      if (task.kind === "site_checkin" && task.ppeConfirmed === false) sim.drop(task.id);
      if (task.kind === "upload_photo" && task.containsWorkers && !task.workerConsent) {
        sim.drop(task.id);
      }
    }

    return { decision, applied, summary, task };
  }

  approveAndApply(sim: WaihangaSimulator, taskId: string): boolean {
    const task = sim.world.inbox.find((t) => t.id === taskId);
    if (!task) return false;
    return sim.apply(task);
  }

  private pickTask(sim: WaihangaSimulator): WaihangaTask | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Prioritise hazard escalations first, then tasks in non-critical zones.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      const aHazard = a.kind === "escalate_hazard" ? 0 : 1;
      const bHazard = b.kind === "escalate_hazard" ? 0 : 1;
      if (aHazard !== bHazard) return aHazard - bHazard;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(task: WaihangaTask, sim: WaihangaSimulator): number {
    let conf = 0.95;
    if (task.kind === "site_checkin" && task.ppeConfirmed === false) conf = 0.2;
    if (task.kind === "upload_photo" && task.containsWorkers && !task.workerConsent) conf = 0.2;
    if (task.kind === "submit_tender" && !task.humanSignoff) conf = 0.5;
    if (task.zone && sim.world.criticalHazardZones.includes(task.zone)) conf -= 0.4;
    return Math.max(0, Math.min(1, conf));
  }
}
