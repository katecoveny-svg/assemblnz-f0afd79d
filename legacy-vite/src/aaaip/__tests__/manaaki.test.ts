import { describe, it, expect, beforeEach } from "vitest";

import { ManaakiAgent } from "../agent/manaaki-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { MANAAKI_POLICIES } from "../policy/manaaki";
import type { AgentAction } from "../policy/types";
import { ManaakiSimulator } from "../simulation/manaaki";

const action = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "a-1",
  domain: "hospitality",
  kind: "confirm_reservation",
  payload: { region: "nz" },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Manaaki ComplianceEngine", () => {
  const engine = new ComplianceEngine({ policies: MANAAKI_POLICIES, defaultUncertaintyThreshold: 0.7 });

  it("allows a clean reservation", () => {
    const d = engine.evaluate(action(), { world: { confirmedCount: 2, propertyCapacity: 10 } });
    expect(d.verdict).toBe("allow");
  });

  it("blocks reservations past capacity", () => {
    const d = engine.evaluate(action(), { world: { confirmedCount: 10, propertyCapacity: 10 } });
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("manaaki.no_overbook");
  });

  it("blocks orders with an allergen conflict", () => {
    const d = engine.evaluate(
      action({ kind: "confirm_order", payload: { allergenConflict: true, region: "nz" } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("manaaki.allergen_safety");
  });

  it("blocks room assignment missing accessibility features", () => {
    const d = engine.evaluate(
      action({
        kind: "assign_room",
        payload: {
          region: "nz",
          accessibilityRequired: ["step_free", "grab_rails"],
          accessibilityProvided: ["step_free"],
        },
      }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("manaaki.accessibility");
  });

  it("blocks profile sharing without opt-in", () => {
    const d = engine.evaluate(
      action({ kind: "share_guest_profile", payload: { marketingOptIn: false, region: "nz" } }),
      { world: {} },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("manaaki.guest_consent");
  });
});

describe("ManaakiAgent + ManaakiSimulator", () => {
  let sim: ManaakiSimulator;
  let agent: ManaakiAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new ManaakiSimulator({ seed: 3, arrivalRate: 1 });
    const engine = new ComplianceEngine({ policies: MANAAKI_POLICIES, defaultUncertaintyThreshold: 0.6 });
    agent = new ManaakiAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never confirms an allergen-conflict order", () => {
    sim.injectAllergenConflict();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
  });

  it("never assigns a room missing required accessibility", () => {
    sim.injectAccessibilityMismatch();
    const r = agent.step(sim);
    if (!r) throw new Error("expected result");
    audit.record(r.decision, r.applied);
    expect(r.applied).toBe(false);
  });

  it("never overbooks", () => {
    for (let i = 0; i < 80; i++) {
      sim.tick();
      const r = agent.step(sim);
      if (r) audit.record(r.decision, r.applied);
    }
    expect(sim.world.confirmedCount).toBeLessThanOrEqual(sim.world.propertyCapacity);
  });
});
