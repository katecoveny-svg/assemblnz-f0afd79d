import { describe, it, expect, beforeEach } from "vitest";

import { AuahaAgent } from "../agent/auaha-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { AUAHA_POLICIES } from "../policy/auaha";
import type { AgentAction } from "../policy/types";
import { AuahaSimulator } from "../simulation/auaha";

const action = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "au-1",
  domain: "creative",
  kind: "publish_asset",
  payload: {
    usesThirdPartyAsset: false,
    containsLikeness: false,
    likenessConsent: false,
    containsTeReo: false,
    kaitiakiReview: false,
    brandRisk: 0.2,
    factScore: 0.9,
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Auaha ComplianceEngine", () => {
  const engine = new ComplianceEngine({ policies: AUAHA_POLICIES, defaultUncertaintyThreshold: 0.7 });

  it("allows a clean asset", () => {
    const d = engine.evaluate(action(), { world: {} });
    expect(d.verdict).toBe("allow");
  });

  it("blocks third-party assets without licence", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, usesThirdPartyAsset: true, licenceRef: undefined } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("auaha.copyright");
  });

  it("blocks likeness without consent", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, containsLikeness: true, likenessConsent: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("auaha.likeness_consent");
  });

  it("warns on high brand risk", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, brandRisk: 0.8 } }),
      { world: {} },
    );
    expect(d.verdict).toBe("needs_human");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("auaha.brand_safety");
  });

  it("warns on te reo without kaitiaki review", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, containsTeReo: true, kaitiakiReview: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("needs_human");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("auaha.te_reo_integrity");
  });

  it("warns on low fact score", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, factScore: 0.3 } }),
      { world: {} },
    );
    expect(d.verdict).toBe("needs_human");
  });
});

describe("AuahaAgent + AuahaSimulator", () => {
  let sim: AuahaSimulator;
  let agent: AuahaAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new AuahaSimulator({ seed: 3, arrivalRate: 1 });
    const engine = new ComplianceEngine({ policies: AUAHA_POLICIES, defaultUncertaintyThreshold: 0.6 });
    agent = new AuahaAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never publishes an unlicensed asset", () => {
    sim.injectUnlicensedAsset();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
  });

  it("never publishes a likeness without consent", () => {
    sim.injectLikenessWithoutConsent();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
  });

  it("escalates te reo assets to kaitiaki", () => {
    sim.injectTeReoAsset();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(["needs_human", "block"]).toContain(r.decision.verdict);
  });

  it("aggregates metrics across many ticks", () => {
    for (let i = 0; i < 60; i++) {
      sim.tick();
      const r = agent.step(sim);
      if (r) audit.record(r.decision, r.applied);
    }
    const agg = audit.aggregates();
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
  });
});
