// ═══════════════════════════════════════════════════════════════
// AAAIP — Tōro (Whānau Family Navigator) Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { ToroMessage, ToroSimulator } from "../simulation/toro";

export interface ToroDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  message?: ToroMessage;
}

export interface ToroAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `toroact-${++actionCounter}`;

export class ToroAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: ToroAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: ToroSimulator): ToroDecisionResult | null {
    const msg = this.pickMessage(sim);
    if (!msg) return null;
    const confidence = this.estimateConfidence(msg);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "whanau_navigator",
      kind: msg.kind,
      payload: {
        messageId: msg.id,
        recipientType: msg.recipientType,
        referencesChild: msg.referencesChild,
        parentalConsent: msg.parentalConsent,
        ageAppropriate: msg.ageAppropriate,
        recommendationRisk: msg.recommendationRisk,
        vulnerableHousehold: msg.vulnerableHousehold,
        crisisFlag: msg.crisisFlag,
        containsTeReo: msg.containsTeReo,
        teReoValidated: msg.teReoValidated,
        dataScope: msg.dataScope,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `${msg.label} → ${msg.recipientType} (conf ${confidence.toFixed(2)}).`,
    };
    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;
    if (decision.verdict === "allow") {
      applied = sim.send(msg.id);
      summary = applied ? `Sent: ${msg.label}` : `Simulator refused: ${msg.label}`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting kaiāwhina approval: ${msg.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Wellbeing crises escalate to the escalated queue, not drop.
      if (msg.crisisFlag) sim.escalate(msg.id);
      // Parental-consent / financial-harm failures drop.
      if (msg.referencesChild && !msg.parentalConsent) sim.drop(msg.id);
      if (msg.kind === "send_budget_alert" && msg.recommendationRisk === "high" && msg.vulnerableHousehold) {
        sim.drop(msg.id);
      }
    }
    return { decision, applied, summary, message: msg };
  }

  approveAndApply(sim: ToroSimulator, messageId: string): boolean {
    return sim.send(messageId);
  }

  private pickMessage(sim: ToroSimulator): ToroMessage | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Crises first, then oldest.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      const aCrisis = a.crisisFlag ? 0 : 1;
      const bCrisis = b.crisisFlag ? 0 : 1;
      if (aCrisis !== bCrisis) return aCrisis - bCrisis;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(msg: ToroMessage): number {
    let conf = 0.95;
    if (msg.crisisFlag) conf = 0.1;
    if (msg.referencesChild && !msg.parentalConsent) conf = 0.1;
    if (msg.recipientType === "child" && !msg.ageAppropriate) conf = 0.2;
    if (msg.kind === "send_budget_alert" && msg.recommendationRisk === "high" && msg.vulnerableHousehold) {
      conf = 0.15;
    }
    if (msg.containsTeReo && !msg.teReoValidated) conf -= 0.25;
    if (msg.dataScope !== "whanau") conf -= 0.3;
    return Math.max(0, Math.min(1, conf));
  }
}
