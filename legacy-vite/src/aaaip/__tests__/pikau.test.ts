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

  it("warns on over-budget fuel burn (litre-based eco policy)", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, fuelBurnLitres: 200, fuelBudgetLitres: 90 } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("needs_human");
  });

  it("allows a route under the NZD fuel cost cap", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, fuelCostNzdEstimate: 150, fuelCostBudgetNzd: 200 } }),
      { world: { sensorReliability: 0.9 } },
    );
    // Under budget — should pass the cost-cap policy (eco litre policy also passes)
    const costCapEval = d.evaluations.find((e) => e.policyId === "pikau.fuel_cost_cap");
    expect(costCapEval?.passed).toBe(true);
  });

  it("flags a route over the NZD fuel cost cap as needs_human", () => {
    const d = engine.evaluate(
      route({ payload: { ...route().payload, fuelCostNzdEstimate: 350, fuelCostBudgetNzd: 200 } }),
      { world: { sensorReliability: 0.9 } },
    );
    expect(d.verdict).toBe("needs_human");
    const costCapEval = d.evaluations.find((e) => e.policyId === "pikau.fuel_cost_cap");
    expect(costCapEval?.passed).toBe(false);
    expect(costCapEval?.message).toContain("NZ$350.00");
  });
});

describe("Pikau FuelOracle integration", () => {
  it("simulator carries a live diesel price snapshot", () => {
    const sim = new PikauSimulator({ seed: 7 });
    expect(sim.world.fuel.diesel).toBeGreaterThan(0);
    expect(sim.world.fuel.tick).toBe(0);
  });

  it("spawned route tasks carry NZD fuel cost estimate at baseline price", () => {
    const sim = new PikauSimulator({ seed: 7, arrivalRate: 1 });
    sim.tick();
    const routeTask = sim.world.inbox.find((t) => t.kind === "assign_route");
    if (!routeTask) return; // no route spawned this tick — skip
    expect(routeTask.fuelCostNzdEstimate).toBeDefined();
    // NZD estimate should equal litres × diesel price (approximately)
    const expectedCost = (routeTask.fuelBurnLitres ?? 0) * sim.world.fuel.diesel;
    expect(routeTask.fuelCostNzdEstimate!).toBeCloseTo(expectedCost, 1);
  });

  it("fuel shock inflates NZD estimates on inbox tasks", () => {
    const sim = new PikauSimulator({ seed: 13, arrivalRate: 1 });
    // Spawn some route tasks at baseline price
    for (let i = 0; i < 5; i++) sim.tick();
    const before = sim.world.inbox
      .filter((t) => t.kind === "assign_route" && t.fuelCostNzdEstimate !== undefined)
      .map((t) => t.fuelCostNzdEstimate!);

    // Inject fuel shock and recalculate
    sim.injectFuelShock();
    const after = sim.world.inbox
      .filter((t) => t.kind === "assign_route" && t.fuelCostNzdEstimate !== undefined)
      .map((t) => t.fuelCostNzdEstimate!);

    if (before.length === 0) return; // no route tasks spawned — skip
    const avgBefore = before.reduce((a, b) => a + b, 0) / before.length;
    const avgAfter = after.reduce((a, b) => a + b, 0) / after.length;
    // Diesel +74% → cost estimates should rise meaningfully
    expect(avgAfter).toBeGreaterThan(avgBefore * 1.5);
  });

  it("agent flags over-budget routes as needs_human after a fuel shock", () => {
    const sim = new PikauSimulator({ seed: 17, arrivalRate: 1 });
    const engine = new ComplianceEngine({ policies: PIKAU_POLICIES, defaultUncertaintyThreshold: 0.6 });
    const agent = new PikauAgent({ engine });
    const audit = new AuditLog();

    // Run 10 ticks at baseline — most routes should pass
    for (let i = 0; i < 10; i++) {
      sim.tick();
      const r = agent.step(sim);
      if (r) audit.record(r.decision, r.applied);
    }
    const beforeShock = audit.aggregates();

    // Inject fuel shock and run 10 more ticks
    sim.injectFuelShock();
    for (let i = 0; i < 10; i++) {
      sim.tick();
      const r = agent.step(sim);
      if (r) audit.record(r.decision, r.applied);
    }
    const afterShock = audit.aggregates();

    // After the shock, needs_human count should have grown
    expect(afterShock.needsHuman).toBeGreaterThan(beforeShock.needsHuman);
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
