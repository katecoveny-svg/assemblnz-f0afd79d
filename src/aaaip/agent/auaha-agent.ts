// ═══════════════════════════════════════════════════════════════
// AAAIP — Auaha (Creative) Agent
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { AuahaAsset, AuahaSimulator } from "../simulation/auaha";

export interface AuahaDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  asset?: AuahaAsset;
}

export interface AuahaAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `auaact-${++actionCounter}`;

export class AuahaAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: AuahaAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: AuahaSimulator): AuahaDecisionResult | null {
    const asset = this.pickAsset(sim);
    if (!asset) return null;
    const confidence = this.estimateConfidence(asset);
    const action: AgentAction = {
      id: nextActionId(),
      domain: "creative",
      kind: "publish_asset",
      payload: {
        assetId: asset.id,
        usesThirdPartyAsset: asset.usesThirdPartyAsset,
        licenceRef: asset.licenceRef,
        containsLikeness: asset.containsLikeness,
        likenessConsent: asset.likenessConsent,
        containsTeReo: asset.containsTeReo,
        kaitiakiReview: asset.kaitiakiReview,
        brandRisk: asset.brandRisk,
        factScore: asset.factScore,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `Publish ${asset.label} (risk ${asset.brandRisk.toFixed(2)}, conf ${confidence.toFixed(2)}).`,
    };
    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;
    if (decision.verdict === "allow") {
      applied = sim.publish(asset.id);
      summary = applied ? `Published ${asset.label}` : `Simulator refused: ${asset.label}`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting brand-manager review: ${asset.label}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      if (asset.usesThirdPartyAsset && !asset.licenceRef) sim.reject(asset.id);
      if (asset.containsLikeness && !asset.likenessConsent) sim.reject(asset.id);
    }
    return { decision, applied, summary, asset };
  }

  approveAndApply(sim: AuahaSimulator, assetId: string): boolean {
    return sim.publish(assetId);
  }

  private pickAsset(sim: AuahaSimulator): AuahaAsset | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    return [...sim.world.inbox].sort((a, b) => a.brandRisk - b.brandRisk)[0];
  }

  private estimateConfidence(asset: AuahaAsset): number {
    let conf = 0.95;
    if (asset.usesThirdPartyAsset && !asset.licenceRef) conf = 0.2;
    if (asset.containsLikeness && !asset.likenessConsent) conf = 0.2;
    if (asset.containsTeReo && !asset.kaitiakiReview) conf -= 0.25;
    if (asset.brandRisk > 0.6) conf -= 0.3;
    if (asset.factScore < 0.55) conf -= 0.2;
    return Math.max(0, Math.min(1, conf));
  }
}
