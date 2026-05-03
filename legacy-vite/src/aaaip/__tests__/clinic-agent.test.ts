import { describe, it, expect, beforeEach } from "vitest";

import { ClinicAgent } from "../agent/clinic-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { CLINIC_POLICIES } from "../policy/library";
import { ClinicSimulator } from "../simulation/clinic";

describe("ClinicAgent + ClinicSimulator", () => {
  let sim: ClinicSimulator;
  let agent: ClinicAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new ClinicSimulator({ seed: 1, arrivalRate: 1, emergencyRate: 0 });
    const engine = new ComplianceEngine({
      policies: CLINIC_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new ClinicAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("books a routine patient when slots are available", () => {
    sim.tick(); // spawns one patient
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    audit.record(result.decision, result.applied);
    expect(["allow", "needs_human", "block"]).toContain(result.decision.verdict);
    if (result.decision.verdict === "allow") {
      expect(result.applied).toBe(true);
      expect(sim.world.bookings.length).toBe(1);
    }
  });

  it("never double-books a slot across many ticks", () => {
    for (let i = 0; i < 50; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const slotIds = sim.world.bookings.map((b) => b.slotId);
    const unique = new Set(slotIds);
    expect(unique.size).toBe(slotIds.length);
  });

  it("escalates when no slots remain", () => {
    // Fill the schedule first.
    for (const slot of sim.world.slots) {
      sim.world.occupiedSlots.push(slot.id);
    }
    sim.world.inbox.push({
      id: "pt-overflow",
      name: "Overflow",
      acuity: 4,
      consentOnFile: true,
      cohort: "A",
      arrivedAt: 0,
    });
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.decision.action.kind).toBe("request_human_review");
    expect(result.applied).toBe(false);
  });

  it("aggregates compliance metrics through the audit log", () => {
    for (let i = 0; i < 30; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const agg = audit.aggregates();
    expect(agg.total).toBeGreaterThan(0);
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
    expect(agg.complianceRate).toBeGreaterThanOrEqual(0);
    expect(agg.complianceRate).toBeLessThanOrEqual(1);
  });

  it("supports human approval of pending decisions", () => {
    // Force a needs_human decision by spawning a low-confidence patient case.
    sim.world.inbox.push({
      id: "pt-lowconf",
      name: "Low confidence",
      acuity: 4,
      consentOnFile: true,
      cohort: "A",
      arrivedAt: 0,
    });
    // Drift fairness above threshold to trigger the warn path.
    sim.world.fairnessDriftScore = 0.5;
    const result = agent.step(sim);
    if (!result) throw new Error("expected a result");
    audit.record(result.decision, result.applied);
    expect(result.decision.verdict).toBe("needs_human");
    expect(audit.pendingApprovals().length).toBe(1);

    const entry = audit.pendingApprovals()[0];
    audit.override(entry.id, "approved");
    expect(audit.pendingApprovals().length).toBe(0);
    expect(audit.aggregates().humanApprovalRate).toBe(1);
  });
});
