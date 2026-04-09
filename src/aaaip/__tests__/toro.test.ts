import { describe, it, expect, beforeEach } from "vitest";

import { ToroAgent } from "../agent/toro-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { TORO_POLICIES } from "../policy/toro";
import type { AgentAction } from "../policy/types";
import { ToroSimulator } from "../simulation/toro";

const action = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "tro-1",
  domain: "whanau_navigator",
  kind: "send_school_notice",
  payload: {
    recipientType: "parent",
    referencesChild: true,
    parentalConsent: true,
    ageAppropriate: true,
    recommendationRisk: "low",
    vulnerableHousehold: false,
    crisisFlag: false,
    containsTeReo: false,
    teReoValidated: true,
    dataScope: "whanau",
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Tōro ComplianceEngine", () => {
  const engine = new ComplianceEngine({ policies: TORO_POLICIES, defaultUncertaintyThreshold: 0.7 });

  it("allows a clean school notice", () => {
    const d = engine.evaluate(action(), { world: {} });
    expect(d.verdict).toBe("allow");
  });

  it("blocks child references without parental consent", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, parentalConsent: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.parental_consent");
  });

  it("blocks non-age-appropriate messages to a child", () => {
    const d = engine.evaluate(
      action({
        payload: { ...action().payload, recipientType: "child", ageAppropriate: false, referencesChild: false },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.age_appropriate");
  });

  it("blocks high-risk budget advice to vulnerable households", () => {
    const d = engine.evaluate(
      action({
        kind: "send_budget_alert",
        payload: {
          ...action().payload,
          referencesChild: false,
          recommendationRisk: "high",
          vulnerableHousehold: true,
        },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.financial_harm");
  });

  it("blocks wellbeing-crisis messages for mandatory handoff", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, crisisFlag: true } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.wellbeing_crisis");
  });

  it("warns on te reo content without validation", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, containsTeReo: true, teReoValidated: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("needs_human");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.te_reo_integrity");
  });

  it("blocks data leaving the whānau scope", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, dataScope: "provider" } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("toro.data_sovereignty");
  });
});

describe("ToroAgent + ToroSimulator", () => {
  let sim: ToroSimulator;
  let agent: ToroAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new ToroSimulator({ seed: 3, arrivalRate: 1, vulnerableHousehold: true });
    const engine = new ComplianceEngine({ policies: TORO_POLICIES, defaultUncertaintyThreshold: 0.6 });
    agent = new ToroAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("escalates a wellbeing crisis instead of sending", () => {
    sim.injectWellbeingCrisis();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
    expect(sim.world.escalated.length).toBe(1);
  });

  it("never sends high-risk budget advice to a vulnerable household", () => {
    sim.injectHighRiskBudgetAdvice();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
    expect(sim.world.sent.find((m) => m.recommendationRisk === "high")).toBeUndefined();
  });

  it("never sends child messages without parental consent", () => {
    sim.injectChildMessageWithoutConsent();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
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
