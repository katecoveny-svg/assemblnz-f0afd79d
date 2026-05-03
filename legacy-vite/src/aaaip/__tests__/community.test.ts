import { describe, it, expect, beforeEach } from "vitest";

import { CommunityAgent } from "../agent/community-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { COMMUNITY_POLICIES } from "../policy/community";
import type { AgentAction } from "../policy/types";
import { CommunitySimulator } from "../simulation/community";

const baseAction = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "cmty-1",
  domain: "community_portal",
  kind: "publish_post",
  payload: {
    postId: "post-1",
    harmScore: 0.1,
    factScore: 0.9,
    containsPii: false,
    authorPiiOptIn: false,
    containsTaonga: false,
    iwiConsent: false,
    teReoConcernFlag: false,
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Community ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: COMMUNITY_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean post", () => {
    const decision = engine.evaluate(baseAction(), { world: {} });
    expect(decision.verdict).toBe("allow");
  });

  it("blocks posts above the harm threshold", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, harmScore: 0.92 } }),
      { world: {} },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "community.harm_block",
    );
  });

  it("blocks taonga posts without iwi consent", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, containsTaonga: true, iwiConsent: false },
      }),
      { world: {} },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "community.data_sovereignty",
    );
  });

  it("allows taonga posts with iwi consent", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, containsTaonga: true, iwiConsent: true },
      }),
      { world: {} },
    );
    expect(decision.verdict).toBe("allow");
  });

  it("blocks PII without author opt-in", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, containsPii: true, authorPiiOptIn: false },
      }),
      { world: {} },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "community.privacy_leak",
    );
  });

  it("warns on te reo concern flags", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, teReoConcernFlag: true },
      }),
      { world: {} },
    );
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "community.te_reo_respect",
    );
  });

  it("warns on low fact-score posts", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, factScore: 0.3 } }),
      { world: {} },
    );
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "community.misinfo_review",
    );
  });
});

describe("CommunityAgent + CommunitySimulator", () => {
  let sim: CommunitySimulator;
  let agent: CommunityAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new CommunitySimulator({ seed: 5, arrivalRate: 1 });
    const engine = new ComplianceEngine({
      policies: COMMUNITY_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new CommunityAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never publishes a hard-blocked post", () => {
    sim.injectHarmfulPost();
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    audit.record(result.decision, result.applied);
    expect(["block", "needs_human"]).toContain(result.decision.verdict);
    expect(result.applied).toBe(false);
    expect(sim.world.published).toHaveLength(0);
  });

  it("blocks a taonga post without consent and drops it", () => {
    sim.injectTaongaWithoutConsent();
    // The injected post has teReoConcernFlag=true and confidence below threshold,
    // so the engine returns needs_human first; force the path by calling step
    // multiple times until the post is removed.
    for (let i = 0; i < 3; i++) {
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    expect(sim.world.published.find((p) => p.containsTaonga)).toBeUndefined();
  });

  it("aggregates compliance metrics across many ticks", () => {
    for (let i = 0; i < 40; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const agg = audit.aggregates();
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
    expect(agg.complianceRate).toBeGreaterThanOrEqual(0);
    expect(agg.complianceRate).toBeLessThanOrEqual(1);
  });

  it("supports human approval of pending posts", () => {
    sim.world.inbox.push({
      id: "post-pending",
      author: "Test",
      kind: "discussion",
      title: "Borderline post",
      harmScore: 0.1,
      factScore: 0.9,
      containsPii: false,
      authorPiiOptIn: false,
      containsTaonga: false,
      iwiConsent: false,
      teReoConcernFlag: true, // forces needs_human
      arrivedAt: 0,
    });
    const result = agent.step(sim);
    if (!result) throw new Error("expected a result");
    audit.record(result.decision, result.applied);
    expect(result.decision.verdict).toBe("needs_human");
    expect(audit.pendingApprovals().length).toBe(1);

    const entry = audit.pendingApprovals()[0];
    agent.approveAndApply(sim, "post-pending");
    audit.override(entry.id, "approved");
    expect(audit.pendingApprovals().length).toBe(0);
    expect(sim.world.published.find((p) => p.id === "post-pending")).toBeDefined();
  });
});
