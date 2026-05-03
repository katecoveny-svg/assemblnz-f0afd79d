// ═══════════════════════════════════════════════════════════════
// AAAIP — Community Portal Moderation Agent
// Picks the next post from the inbox, builds a publish proposal,
// runs it through the compliance engine, and either publishes,
// rejects, or escalates to a human kaiwhakahaere.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { CommunityPost, CommunitySimulator } from "../simulation/community";

export interface CommunityDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  post?: CommunityPost;
}

export interface CommunityAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `cmty-${++actionCounter}`;

export class CommunityAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: CommunityAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: CommunitySimulator): CommunityDecisionResult | null {
    const post = this.pickPost(sim);
    if (!post) return null;

    const confidence = this.estimateConfidence(post);

    const action: AgentAction = {
      id: nextActionId(),
      domain: "community_portal",
      kind: "publish_post",
      payload: {
        postId: post.id,
        harmScore: post.harmScore,
        factScore: post.factScore,
        containsPii: post.containsPii,
        authorPiiOptIn: post.authorPiiOptIn,
        containsTaonga: post.containsTaonga,
        iwiConsent: post.iwiConsent,
        teReoConcernFlag: post.teReoConcernFlag,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `Publish "${post.title}" by ${post.author} (harm ${post.harmScore.toFixed(2)}, conf ${confidence.toFixed(2)}).`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;

    if (decision.verdict === "allow") {
      applied = sim.publish(post.id);
      summary = applied ? `Published "${post.title}".` : `Refused: simulator rejected ${post.id}.`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting kaiwhakahaere review: "${post.title}" — ${decision.explanation}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      // Hard-block harmful content drops the post.
      if (post.harmScore >= 0.8 || (post.containsPii && !post.authorPiiOptIn)) {
        sim.reject(post.id);
      }
    }

    return { decision, applied, summary, post };
  }

  /** Apply a human-approved publish that was flagged needs_human. */
  approveAndApply(sim: CommunitySimulator, postId: string): boolean {
    return sim.publish(postId);
  }

  // ── Internals ────────────────────────────────────────────

  private pickPost(sim: CommunitySimulator): CommunityPost | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Prefer posts with the lowest harm score first; tie-break by oldest.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      if (a.harmScore !== b.harmScore) return a.harmScore - b.harmScore;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(post: CommunityPost): number {
    let conf = 0.95;
    if (post.harmScore > 0.5) conf -= 0.4;
    if (post.factScore < 0.6) conf -= 0.2;
    if (post.containsPii && !post.authorPiiOptIn) conf -= 0.4;
    if (post.containsTaonga && !post.iwiConsent) conf -= 0.5;
    if (post.teReoConcernFlag) conf -= 0.2;
    return Math.max(0, Math.min(1, conf));
  }
}
