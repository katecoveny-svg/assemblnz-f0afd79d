import { describe, it, expect, beforeEach } from "vitest";

import { RobotAgent } from "../agent/robot-agent";
import { AuditLog } from "../metrics/audit";
import { ComplianceEngine } from "../policy/engine";
import { ROBOT_POLICIES } from "../policy/human-robot";
import type { AgentAction } from "../policy/types";
import { RobotSimulator } from "../simulation/human-robot";

const baseAction = (overrides: Partial<AgentAction> = {}): AgentAction => ({
  id: "racton-1",
  domain: "human_robot_collab",
  kind: "move_to_zone",
  payload: {
    taskId: "task-1",
    targetZone: "workbench",
    forceN: 30,
    speedMmS: 200,
    operatorAck: false,
  },
  confidence: 0.92,
  proposedAt: 0,
  rationale: "test",
  ...overrides,
});

const baseWorld = (overrides: Record<string, unknown> = {}) => ({
  humanZones: [],
  humanIntent: "helping",
  humanIntentConfidence: 0.9,
  sensorReliability: 0.95,
  forceLimitN: 80,
  collaborativeSpeedMmS: 250,
  ...overrides,
});

describe("Robot ComplianceEngine", () => {
  const engine = new ComplianceEngine({
    policies: ROBOT_POLICIES,
    defaultUncertaintyThreshold: 0.7,
  });

  it("allows a clean motion when no human is present", () => {
    const decision = engine.evaluate(baseAction(), { world: baseWorld() });
    expect(decision.verdict).toBe("allow");
  });

  it("blocks motion into a zone occupied by a human", () => {
    const decision = engine.evaluate(baseAction(), {
      world: baseWorld({ humanZones: ["workbench"] }),
    });
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "robot.no_motion_in_human_zone",
    );
  });

  it("blocks high-force actions while a human is in any shared zone", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, targetZone: "shared", forceN: 150 },
      }),
      { world: baseWorld({ humanZones: ["safe"] }) },
    );
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "robot.force_limit",
    );
  });

  it("warns when speed exceeds collaborative threshold near a human", () => {
    const decision = engine.evaluate(
      baseAction({
        payload: { ...baseAction().payload, targetZone: "shared", speedMmS: 400 },
      }),
      { world: baseWorld({ humanZones: ["safe"] }) },
    );
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "robot.speed_near_human",
    );
  });

  it("requests confirmation when operator intent is unknown", () => {
    const decision = engine.evaluate(baseAction(), {
      world: baseWorld({ humanIntent: "unknown", humanIntentConfidence: 0.3 }),
    });
    expect(decision.verdict).toBe("needs_human");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "robot.intent_confirmation",
    );
  });

  it("blocks any motion when sensor reliability is below safety threshold", () => {
    const decision = engine.evaluate(baseAction(), {
      world: baseWorld({ sensorReliability: 0.5 }),
    });
    expect(decision.verdict).toBe("block");
    expect(decision.evaluations.find((e) => !e.passed)?.policyId).toBe(
      "robot.sensor_health",
    );
  });

  it("warns on tool changes without operator acknowledgement", () => {
    const decision = engine.evaluate(
      baseAction({
        kind: "change_tool",
        payload: { ...baseAction().payload, operatorAck: false },
      }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("needs_human");
  });

  it("allows tool changes once acknowledged", () => {
    const decision = engine.evaluate(
      baseAction({
        kind: "change_tool",
        payload: { ...baseAction().payload, operatorAck: true },
      }),
      { world: baseWorld() },
    );
    expect(decision.verdict).toBe("allow");
  });
});

describe("RobotAgent + RobotSimulator", () => {
  let sim: RobotSimulator;
  let agent: RobotAgent;
  let audit: AuditLog;

  beforeEach(() => {
    sim = new RobotSimulator({ seed: 3, taskRate: 1, humanMoveRate: 0, sensorNoiseRate: 0 });
    const engine = new ComplianceEngine({
      policies: ROBOT_POLICIES,
      defaultUncertaintyThreshold: 0.6,
    });
    agent = new RobotAgent({ engine, uncertaintyThreshold: 0.6 });
    audit = new AuditLog();
  });

  it("never executes a task whose target zone is occupied by a human", () => {
    sim.injectHumanIntoZone("workbench");
    sim.world.taskQueue.push({
      id: "danger",
      label: "Test task in occupied zone",
      targetZone: "workbench",
      forceN: 30,
      speedMmS: 200,
      toolChange: false,
      completed: false,
    });
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    audit.record(result.decision, result.applied);
    expect(result.applied).toBe(false);
    expect(["block", "needs_human"]).toContain(result.decision.verdict);
    expect(sim.world.completedTasks).toHaveLength(0);
  });

  it("escalates when sensor reliability is below threshold", () => {
    sim.injectSensorFailure();
    sim.world.taskQueue.push({
      id: "task-x",
      label: "Routine pick",
      targetZone: "safe",
      forceN: 20,
      speedMmS: 200,
      toolChange: false,
      completed: false,
    });
    const result = agent.step(sim);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(["block", "needs_human"]).toContain(result.decision.verdict);
    expect(result.applied).toBe(false);
  });

  it("supports human approval of pending tasks", () => {
    // Default sim starts with the human in "safe", so target a clear zone
    // for the tool-change task — otherwise applyTaskExecution refuses on
    // safety grounds (defence-in-depth) regardless of the human verdict.
    sim.world.taskQueue.push({
      id: "task-pending",
      label: "Tool change",
      targetZone: "shared",
      forceN: 10,
      speedMmS: 150,
      toolChange: true,
      completed: false,
    });
    const result = agent.step(sim);
    if (!result) throw new Error("expected a result");
    audit.record(result.decision, result.applied);
    expect(result.decision.verdict).toBe("needs_human");
    expect(audit.pendingApprovals().length).toBe(1);

    const entry = audit.pendingApprovals()[0];
    agent.approveAndApply(sim, "task-pending");
    audit.override(entry.id, "approved");
    expect(audit.pendingApprovals().length).toBe(0);
    expect(sim.world.completedTasks.find((t) => t.id === "task-pending")).toBeDefined();
  });

  it("aggregates compliance metrics across many ticks", () => {
    sim = new RobotSimulator({ seed: 5 });
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
});
