import { describe, it, expect, beforeEach } from "vitest";

import { ArataikiAgent } from "../agent/arataki-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { ARATAKI_POLICIES } from "../policy/arataki";
import type { AgentAction } from "../policy/types";
import { ArataikiSimulator } from "../simulation/arataki";

const action = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "ara-1",
  domain: "automotive",
  kind: "quote_finance",
  payload: {
    mvtrNumber: "MVTR-12345",
    cccfaDisclosuresAttached: true,
    inspectionPassed: true,
    odometerTamperFlag: false,
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Arataki ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: ARATAKI_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean finance quote", () => {
    const d = engine.evaluate(action(), { world: {} });
    expect(d.verdict).toBe("allow");
  });

  it("blocks finance quotes missing CCCFA disclosures", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, cccfaDisclosuresAttached: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.cccfa_disclosure");
  });

  it("blocks misleading fuel-economy quotes", () => {
    const d = engine.evaluate(
      action({
        kind: "quote_fuel_economy",
        payload: { quotedLPer100km: 4, ratedLPer100km: 8, inspectionPassed: true },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.fair_trading_claims");
  });

  it("blocks sales without a valid MVTR number", () => {
    const d = engine.evaluate(
      action({
        kind: "close_sale",
        payload: {
          mvtrNumber: "",
          cccfaDisclosuresAttached: true,
          inspectionPassed: true,
        },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.mvsa_licensing");
  });

  it("blocks anything on a vehicle with an odometer tamper flag", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, odometerTamperFlag: true } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.odometer_integrity");
  });

  it("blocks anything on a vehicle that failed the acceptable-quality inspection", () => {
    const d = engine.evaluate(
      action({ payload: { ...action().payload, inspectionPassed: false } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.cga_acceptable_quality");
  });

  it("blocks partner data sharing without customer opt-in", () => {
    const d = engine.evaluate(
      action({
        kind: "share_with_partner",
        payload: {
          mvtrNumber: "MVTR-12345",
          cccfaDisclosuresAttached: true,
          inspectionPassed: true,
          customerOptIn: false,
        },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("arataki.customer_data_consent");
  });
});

describe("ArataikiAgent + ArataikiSimulator", () => {
  let sim: ArataikiSimulator;
  let agent: ArataikiAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new ArataikiSimulator({ seed: 17, arrivalRate: 1 });
    const engine = new ComplianceEngine({
      policies: ARATAKI_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new ArataikiAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never sends an undisclosed finance quote", () => {
    sim.injectUndisclosedFinance();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
    expect(sim.world.handled).toHaveLength(0);
  });

  it("never confirms a misleading fuel-economy quote", () => {
    sim.injectMisleadingEconomyQuote();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
  });

  it("never closes a sale on a tamper-flagged vehicle and delists it", () => {
    sim.injectTamperedVehicle();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
    expect(r.vehicle?.listed).toBe(false);
  });

  it("advances the fuel snapshot on every tick", () => {
    const startTick = sim.world.fuel.tick;
    for (let i = 0; i < 5; i++) sim.tick();
    // The fuel snapshot's tick counter should have advanced in
    // lockstep with sim.world.now, even if prices happen to round
    // back to the same value at 2 decimals.
    expect(sim.world.fuel.tick).toBe(startTick + 5);
    expect(sim.world.fuel.petrol91).toBeGreaterThan(0);
    expect(sim.world.fuel.diesel).toBeGreaterThan(0);
  });

  it("reflects the fuel shock in the world snapshot immediately", () => {
    const before = sim.world.fuel.diesel;
    sim.injectFuelShock();
    expect(sim.world.fuel.diesel).toBeGreaterThan(before);
    expect(sim.world.fuel.events).toContain("strait_of_hormuz_shock");
  });

  it("aggregates compliance metrics across many ticks", () => {
    for (let i = 0; i < 60; i++) {
      sim.tick();
      const r = agent.step(sim);
      if (r) audit.record(r.decision, r.applied);
    }
    const agg = audit.aggregates();
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
    expect(agg.complianceRate).toBeGreaterThanOrEqual(0);
    expect(agg.complianceRate).toBeLessThanOrEqual(1);
  });
});
