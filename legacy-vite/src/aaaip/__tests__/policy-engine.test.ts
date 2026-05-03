import { describe, it, expect } from "vitest";

import { ComplianceEngine } from "../policy/engine";
import { CLINIC_POLICIES } from "../policy/library";
import type { AgentAction } from "../policy/types";

const baseAction = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "act-1",
  domain: "clinic_scheduling",
  kind: "schedule_appointment",
  payload: {
    patientId: "pt-1",
    slotId: "slot-1",
    acuity: 4,
    consentOnFile: true,
    region: "nz",
  },
  confidence: 0.9,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: CLINIC_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean booking", () => {
    const decision = engine.evaluate(baseAction(), {
      world: { occupiedSlots: [], pendingEmergency: false, fairnessDriftScore: 0 },
    });
    expect(decision.verdict).toBe("allow");
    expect(decision.evaluations.every((e) => e.passed)).toBe(true);
  });

  it("blocks a double booking", () => {
    const decision = engine.evaluate(baseAction(), {
      world: { occupiedSlots: ["slot-1"], pendingEmergency: false, fairnessDriftScore: 0 },
    });
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "clinic.no_double_book",
    );
  });

  it("blocks routine bookings while an emergency is pending", () => {
    const decision = engine.evaluate(baseAction({ payload: { ...baseAction().payload, acuity: 4 } }), {
      world: { occupiedSlots: [], pendingEmergency: true, fairnessDriftScore: 0 },
    });
    expect(decision.verdict).toBe("block");
  });

  it("allows critical bookings even with emergency pending", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, acuity: 1 } }),
      {
        world: { occupiedSlots: [], pendingEmergency: true, fairnessDriftScore: 0 },
      },
    );
    expect(decision.verdict).toBe("allow");
  });

  it("blocks bookings without consent", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, consentOnFile: false } }),
      { world: { occupiedSlots: [], pendingEmergency: false, fairnessDriftScore: 0 } },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "clinic.consent",
    );
  });

  it("escalates to a human when confidence is below threshold", () => {
    const decision = engine.evaluate(baseAction({ confidence: 0.3 }), {
      world: { occupiedSlots: [], pendingEmergency: false, fairnessDriftScore: 0 },
    });
    expect(decision.verdict).toBe("needs_human");
  });

  it("warns when fairness drift exceeds threshold", () => {
    const decision = engine.evaluate(baseAction(), {
      world: { occupiedSlots: [], pendingEmergency: false, fairnessDriftScore: 0.5 },
    });
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "clinic.fairness",
    );
  });

  it("blocks cross-border data routing", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, region: "us" } }),
      { world: { occupiedSlots: [], pendingEmergency: false, fairnessDriftScore: 0 } },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "clinic.data_residency",
    );
  });

  it("describes its policies for UI surfacing", () => {
    const policies = engine.describePolicies();
    expect(policies.length).toBe(CLINIC_POLICIES.length);
    expect(policies[0]).toHaveProperty("rationale");
    expect(policies[0]).toHaveProperty("source");
  });
});
