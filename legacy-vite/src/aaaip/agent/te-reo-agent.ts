// ═══════════════════════════════════════════════════════════════
// AAAIP — Te Reo Tikanga Advisory Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { TeReoRequest, TeReoSimulator } from "../simulation/te-reo";

export interface TeReoDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  request?: TeReoRequest;
}

export interface TeReoAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `tereoact-${++actionCounter}`;

export class TeReoAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: TeReoAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: TeReoSimulator): TeReoDecisionResult | null {
    const req = this.pickRequest(sim);
    if (!req) return null;

    const confidence = this.estimateConfidence(req);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "language",
      kind: req.kind,
      payload: {
        requestId: req.id,
        containsTeReo: req.containsTeReo,
        macronsValidated: req.macronsValidated,
        complexTeReo: req.complexTeReo,
        kaitiakiApproved: req.kaitiakiApproved,
        touchesMaoriData: req.touchesMaoriData,
        sovereigntyCleared: req.sovereigntyCleared,
        culturalContent: req.culturalContent,
        tikangaCleared: req.tikangaCleared,
        sacredContent: req.sacredContent,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `${req.label} (conf ${confidence.toFixed(2)}).`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;

    if (decision.verdict === "allow") {
      sim.process(req.id);
      applied = true;
      summary = `Processed: ${req.label}`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting kaitiaki review: ${req.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      if (req.sacredContent) {
        sim.drop(req.id);
        sim.world.alerts.sacredContentBlocks += 1;
      }
      if (req.touchesMaoriData && !req.sovereigntyCleared) {
        sim.drop(req.id);
        sim.world.alerts.sovereigntyBlocks += 1;
      }
      if (!req.macronsValidated && req.containsTeReo) {
        sim.world.alerts.macronFlags += 1;
      }
      if (req.culturalContent && !req.tikangaCleared) {
        sim.world.alerts.tikangaReviews += 1;
      }
    }

    return { decision, applied, summary, request: req };
  }

  approveAndApply(sim: TeReoSimulator, requestId: string): boolean {
    sim.process(requestId);
    return true;
  }

  private pickRequest(sim: TeReoSimulator): TeReoRequest | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Sacred content first (to block immediately), then oldest.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      const aSacred = a.sacredContent ? 0 : 1;
      const bSacred = b.sacredContent ? 0 : 1;
      if (aSacred !== bSacred) return aSacred - bSacred;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(req: TeReoRequest): number {
    let conf = 0.9;
    if (req.sacredContent) conf = 0.05; // never allow
    if (req.complexTeReo && !req.kaitiakiApproved) conf = 0.2;
    if (req.touchesMaoriData && !req.sovereigntyCleared) conf = 0.1;
    if (req.containsTeReo && !req.macronsValidated) conf -= 0.3;
    if (req.culturalContent && !req.tikangaCleared) conf -= 0.2;
    return Math.max(0, Math.min(1, conf));
  }
}
