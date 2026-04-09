import { describe, it, expect, beforeEach } from "vitest";

import { PikauAgent } from "../agent/pikau-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { PIKAU_POLICIES } from "../policy/pikau";
import type { AgentAction } from "../policy/types";
import { PikauSimulator } from "../simulation/pikau";

const route = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "r-1",
  domain: "freight_customs",
  kind: "assign_route",
  payload: { driverMinutesRemaining: 120, fuelBurnLitres: 40, fuelBudgetLitres: 90, region: "nz" },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Pikau ComplianceEngine", () => {
  const engine = new ComplianceEngine({ policies: PIKAU_POLICIES, defaultUncertaintyThreshold: 0.7 });

  it("allows a healthy route", () => {
    const d = engine.evaluate(route(), { world: { sensorReliability: 0.9 } });
    expect(d.verdict).toBe("allow");
  });

  it("blocks a route for a fatigued driver", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, driverMinutesRemaining: 15 } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("pikau.driver_hours");
  });

  it("blocks cold chain clearance outside tolerance", () => {
    const d = engine.evaluate(
      route({ kind: "clear_delivery", payload: { reeferTempC: 9, targetTempC: 4, region: "nz" } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("pikau.cold_chain");
  });

  it("blocks on degraded sensors", () => {
    const d = engine.evaluate(route(), { world: { sensorReliability: 0.5 } });
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("pikau.sensor_health");
  });

  it("blocks cross-border data routing", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, region: "us" } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("pikau.data_residency");
  });

  it("warns on over-budget fuel burn", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, fuelBurnLitres: 200, fuelBudgetLitres: 90 } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("needs_human");
  });
});

describe("PikauAgent + PikauSimulator", () => {
  let sim: PikauSimulator;
  let agent: PikauAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new PikauSimulator({ seed: 3, arrivalRate: 1 });
    const engine = new ComplianceEngine({ policies: PIKAU_POLICIES, defaultUncertaintyThreshold: 0.6 });
    agent = new PikauAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never dispatches a fatigued driver", () => {
    sim.injectDriverFatigue();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
    expect(sim.world.completed).toHaveLength(0);
  });

  it("never clears a cold-chain break", () => {
    sim.injectColdChainBreak();
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
