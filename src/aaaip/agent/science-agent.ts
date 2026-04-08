// ═══════════════════════════════════════════════════════════════
// AAAIP — Drug Screening Agent
// Picks the next compound from the simulator inbox, builds a
// reproducible screening proposal, runs it through the compliance
// engine, and either dispatches the assay or escalates to a
// human investigator.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { Compound, ScienceSimulator, Well } from "../simulation/science";

export interface ScienceDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  compound?: Compound;
  well?: Well;
}

export interface ScienceAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
  /** Reproducibility seed used in proposed actions. */
  seed?: number;
}

let actionCounter = 0;
const nextActionId = () => `sci-${++actionCounter}`;

export class ScienceAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;
  private readonly seed: number;

  constructor(opts: ScienceAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
    this.seed = opts.seed ?? 1337;
  }

  step(sim: ScienceSimulator): ScienceDecisionResult | null {
    const compound = this.pickCompound(sim);
    if (!compound) return null;

    const well = this.pickWell(sim);
    if (!well) return this.escalateNoWell(compound, sim);

    const confidence = this.estimateConfidence(compound, sim);

    const action: AgentAction = {
      id: nextActionId(),
      domain: "scientific_discovery",
      kind: "screen_compound",
      payload: {
        compoundId: compound.id,
        wellId: well.id,
        provenance: compound.provenance,
        usesHumanTissue: compound.usesHumanTissue,
        irbApprovalId: compound.irbApprovalId,
        toxicityScore: compound.toxicityScore,
        doseMicromolar: compound.doseMicromolar,
        seed: this.seed + sim.world.now,
        pipelineVersion: sim.world.pipelineVersion,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `Screen ${compound.name} in ${well.id} (${compound.doseMicromolar} µM, tox ${compound.toxicityScore.toFixed(2)}, conf ${confidence.toFixed(2)}).`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;

    if (decision.verdict === "allow") {
      applied = sim.applyScreening(compound.id, well.id);
      summary = applied
        ? `Screened ${compound.name} → ${well.id}.`
        : `Refused: simulator rejected ${compound.name}.`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting investigator approval: ${compound.name} → ${well.id}: ${decision.explanation}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Hard block for missing provenance / IRB / dosage — drop the compound.
      if (
        !compound.provenance ||
        (compound.usesHumanTissue && !compound.irbApprovalId) ||
        compound.doseMicromolar > sim.world.maxDoseMicromolar
      ) {
        sim.dropCompound(compound.id);
      }
    }

    return { decision, applied, summary, compound, well };
  }

  /** Apply a human-approved compound that the engine flagged as needs_human. */
  approveAndApply(sim: ScienceSimulator, compoundId: string, wellId: string): boolean {
    return sim.applyScreening(compoundId, wellId);
  }

  // ── Internals ────────────────────────────────────────────

  private pickCompound(sim: ScienceSimulator): Compound | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Prefer low-toxicity compounds first to maximise information per assay.
    const sorted = [...sim.world.inbox].sort(
      (a, b) => a.toxicityScore - b.toxicityScore,
    );
    return sorted[0];
  }

  private pickWell(sim: ScienceSimulator): Well | undefined {
    return sim.freeWells()[0];
  }

  private estimateConfidence(compound: Compound, sim: ScienceSimulator): number {
    let conf = 0.95;
    if (!compound.provenance) conf -= 0.5;
    if (compound.usesHumanTissue && !compound.irbApprovalId) conf -= 0.4;
    if (compound.toxicityScore > 0.7) conf -= 0.25;
    if (compound.doseMicromolar > sim.world.maxDoseMicromolar) conf -= 0.4;
    return Math.max(0, Math.min(1, conf));
  }

  private escalateNoWell(compound: Compound, sim: ScienceSimulator): ScienceDecisionResult {
    const action: AgentAction = {
      id: nextActionId(),
      domain: "scientific_discovery",
      kind: "request_human_review",
      payload: { compoundId: compound.id, reason: "no_well_available" },
      confidence: 0.1,
      proposedAt: sim.world.now,
      rationale: `No free wells for ${compound.name}. Escalating to investigator.`,
    };
    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });
    return {
      decision,
      applied: false,
      summary: `No free wells for ${compound.name} — handed off to investigator.`,
      compound,
    };
  }
}
