import { describe, it, expect, beforeEach } from "vitest";

import { WaihangaAgent } from "../agent/waihanga-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { WAIHANGA_POLICIES } from "../policy/waihanga";
import type { AgentAction } from "../policy/types";
import { WaihangaSimulator } from "../simulation/waihanga";

const baseAction = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "h-1",
  domain: "construction",
  kind: "site_checkin",
  payload: { zone: "gate", ppeConfirmed: true },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

describe("Waihanga ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: WAIHANGA_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean check-in", () => {
    const d = engine.evaluate(baseAction(), { world: { headcount: 5, headcountCap: 40 } });
    expect(d.verdict).toBe("allow");
  });

  it("blocks check-ins without PPE", () => {
    const d = engine.evaluate(
      baseAction({ payload: { zone: "gate", ppeConfirmed: false } }),
      { world: { headcount: 5, headcountCap: 40 } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("waihanga.ppe_required");
  });

  it("blocks check-ins when the site is at capacity", () => {
    const d = engine.evaluate(baseAction(), {
      world: { headcount: 40, headcountCap: 40 },
    });
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("waihanga.site_access");
  });

  it("blocks any non-escalation action in a zone with an unresolved hazard", () => {
    const d = engine.evaluate(
      baseAction({
        kind: "upload_photo",
        payload: { zone: "frame", containsWorkers: false },
      }),
      { world: { headcount: 5, headcountCap: 40, criticalHazardZones: ["frame"] } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("waihanga.hazard_escalation");
  });

  it("blocks photo uploads with workers but no consent", () => {
    const d = engine.evaluate(
      baseAction({
        kind: "upload_photo",
        payload: { zone: "slab", containsWorkers: true, workerConsent: false },
      }),
      { world: { headcount: 5, headcountCap: 40 } },
    );
    expect(d.verdict).toBe("block");
    expect(d.evaluations.find((e) => !e.passed)?.policyId).toBe("waihanga.worker_consent");
  });

  it("warns on tender submissions without sign-off", () => {
    const d = engine.evaluate(
      baseAction({ kind: "submit_tender", payload: { humanSignoff: false } }),
      { world: { headcount: 5, headcountCap: 40 } },
    );
    expect(d.verdict).toBe("needs_human");
  });
});

describe("WaihangaAgent + WaihangaSimulator", () => {
  let sim: WaihangaSimulator;
  let agent: WaihangaAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new WaihangaSimulator({ seed: 3, arrivalRate: 1 });
    const engine = new ComplianceEngine({
      policies: WAIHANGA_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new WaihangaAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never applies a check-in without PPE", () => {
    sim.injectMissingPPE();
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    audit.record(result.decision, result.applied);
    expect(result.applied).toBe(false);
    expect(sim.world.completed.find((t) => t.kind === "site_checkin")).toBeUndefined();
  });

  it("prioritises hazard escalation over other tasks", () => {
    sim.world.inbox.push({
      id: "normal-photo",
      kind: "upload_photo",
      label: "Photo",
      zone: "gate",
      containsWorkers: false,
      arrivedAt: 0,
    });
    sim.injectCriticalHazard("frame");
    const result = agent.step(sim);
    expect(result?.task?.kind).toBe("escalate_hazard");
  });

  it("aggregates metrics across many ticks without breaking invariants", () => {
    for (let i = 0; i < 60; i++) {
      sim.tick();
      const result = agent.step(sim);
      if (result) audit.record(result.decision, result.applied);
    }
    const agg = audit.aggregates();
    expect(agg.allowed + agg.needsHuman + agg.blocked).toBe(agg.total);
    expect(sim.world.headcount).toBeLessThanOrEqual(sim.world.headcountCap);
  });
});
