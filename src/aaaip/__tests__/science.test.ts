import { describe, it, expect, beforeEach } from "vitest";

import { ScienceAgent } from "../agent/science-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { SCIENCE_POLICIES } from "../policy/science";
import type { AgentAction } from "../policy/types";
import { ScienceSimulator } from "../simulation/science";

const baseAction = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "sci-1",
  domain: "scientific_discovery",
  kind: "screen_compound",
  payload: {
    compoundId: "cmp-1",
    wellId: "well-50",
    provenance: "lib-AKT-1234",
    usesHumanTissue: false,
    irbApprovalId: undefined,
    toxicityScore: 0.2,
    doseMicromolar: 25,
    seed: 42,
    pipelineVersion: "screen-pipeline-1.4.0",
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

const baseWorld = (overrides: Record<string, unknown> = {}) => ({
  maxDoseMicromolar: 100,
  controlWells: ["well-0", "well-1", "well-2", "well-3", "well-4", "well-5", "well-6", "well-7"],
  pipelineVersion: "screen-pipeline-1.4.0",
  ...overrides,
});

describe("Science ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: SCIENCE_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean screening", () => {
    const decision = engine.evaluate(baseAction(), { world: baseWorld() });
    expect(decision.verdict).toBe("allow");
  });

  it("blocks compounds without provenance", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, provenance: "" } }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.provenance",
    );
  });

  it("blocks human-tissue assays without IRB approval", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: {
          ...baseAction().payload,
          usesHumanTissue: true,
          irbApprovalId: undefined,
        },
      }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.irb_approval",
    );
  });

  it("warns when reproducibility seed or pipeline version is missing", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, seed: undefined } }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.reproducibility_seed",
    );
  });

  it("blocks dosages above the validated maximum", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, doseMicromolar: 250 } }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.dosage_limit",
    );
  });

  it("blocks writes to control wells", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, wellId: "well-0" } }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.control_integrity",
    );
  });

  it("warns when predicted toxicity exceeds the safety threshold", () => {
    const decision = engine.evaluate(
      baseAction({ payload: { ...baseAction().payload, toxicityScore: 0.85 } }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "science.toxicity_flag",
    );
  });
});

describe("ScienceAgent + ScienceSimulator", () => {
  let sim: ScienceSimulator;
  let agent: ScienceAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new ScienceSimulator({ seed: 7, arrivalRate: 1 });
    const engine = new ComplianceEngine({
      policies: SCIENCE_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new ScienceAgent({ engine, uncertaintyThreshold: 0.6, seed: 1337 });
    audit = new AuditLog();
  });

  it("never overwrites a control well across many ticks", () => {
    for (let i = 0; i < 80; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const usedWells = sim.world.completed.map((c) => c.wellId);
    for (const wellId of usedWells) {
      expect(sim.world.controlWells).not.toContain(wellId);
    }
  });

  it("blocks injected bad compounds and drops them from the queue", () => {
    sim.injectBadCompound();
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    audit.record(result.decision, result.applied);
    expect(["block", "needs_human"]).toContain(result.decision.verdict);
    expect(result.applied).toBe(false);
    expect(sim.world.completed).toHaveLength(0);
  });

  it("supports human approval of pending screenings", () => {
    sim.world.inbox.push({
      id: "cmp-pending",
      name: "Pending compound",
      provenance: "lib-test",
      usesHumanTissue: false,
      toxicityScore: 0.85, // toxicity above threshold → needs_human
      doseMicromolar: 50,
      arrivedAt: 0,
    });
    const result = agent.step(sim);
    if (!result) throw new Error("expected a result");
    audit.record(result.decision, result.applied);
    expect(result.decision.verdict).toBe("needs_human");
    expect(audit.pendingApprovals().length).toBe(1);

    const entry = audit.pendingApprovals()[0];
    const wellId = (entry.decision.action.payload as { wellId: string }).wellId;
    agent.approveAndApply(sim, "cmp-pending", wellId);
    audit.override(entry.id, "approved");
    expect(audit.pendingApprovals().length).toBe(0);
    expect(sim.world.completed.find((c) => c.compound.id === "cmp-pending")).toBeDefined();
  });

  it("aggregates compliance metrics across many ticks", () => {
    for (let i = 0; i < 50; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const agg = audit.aggregates();
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
    expect(agg.complianceRate).toBeGreaterThanOrEqual(0);
    expect(agg.complianceRate).toBeLessThanOrEqual(1);
  });

  it("records reproducibility metadata in every action payload", () => {
    sim.tick();
    const result = agent.step(sim);
    if (!result) throw new Error("expected a result");
    const payload = result.decision.action.payload as {
      seed: number;
      pipelineVersion: string;
    };
    expect(typeof payload.seed).toBe("number");
    expect(payload.pipelineVersion).toBe("screen-pipeline-1.4.0");
  });
});
