// ═══════════════════════════════════════════════════════════════
// AAAIP — Robot runtime hook
// Owns one RobotSimulator + ComplianceEngine + RobotAgent +
// AuditLog instance and exposes the same shape as useAaaipRuntime
// so the dashboard chrome can render either domain.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { RobotAgent, type RobotAgentDecisionResult } from "./agent/robot-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { ROBOT_POLICIES } from "./policy/human-robot";
import type { AaaipRuntimeBase } from "./runtime-base";
import { RobotSimulator, type RobotWorld } from "./simulation/human-robot";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 02 — Human-robot collaboration";

export interface RobotRuntime extends AaaipRuntimeBase {
  domain: "robot";
  world: RobotWorld;
  step: () => RobotAgentDecisionResult | null;
  injectHumanIntrusion: () => void;
  injectSensorFailure: () => void;
}

export function useRobotRuntime(): RobotRuntime {
  const simRef = useRef<RobotSimulator | null>(null);
  const agentRef = useRef<RobotAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new RobotSimulator({ seed: 11 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: ROBOT_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new RobotAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    return auditRef.current!.subscribe(() => forceRender());
  }, [forceRender]);

  const step = useCallback((): RobotAgentDecisionResult | null => {
    const sim = simRef.current!;
    const agent = agentRef.current!;
    const audit = auditRef.current!;
    sim.tick();
    const result = agent.step(sim);
    if (result) audit.record(result.decision, result.applied);
    setTickCount((t) => t + 1);
    forceRender();
    return result;
  }, [forceRender]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      step();
    }, 900);
    return () => window.clearInterval(id);
  }, [isRunning, step]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    simRef.current!.reset();
    auditRef.current!.reset();
    setTickCount(0);
    setIsRunning(false);
    forceRender();
  }, [forceRender]);

  const approve = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { taskId?: string };
    if (payload.taskId) {
      agentRef.current!.approveAndApply(simRef.current!, payload.taskId);
    }
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { taskId?: string };
    if (payload.taskId) simRef.current!.dropTask(payload.taskId);
    audit.override(entryId, "rejected");
  }, []);

  const injectHumanIntrusion = useCallback(() => {
    simRef.current!.injectHumanIntoZone("workbench");
    forceRender();
  }, [forceRender]);

  const injectSensorFailure = useCallback(() => {
    simRef.current!.injectSensorFailure();
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "robot", pilotLabel: PILOT_LABEL }),
    [],
  );

  const submitToAaaip = useCallback(
    () =>
      submitAaaipExport(
        auditRef.current!.buildExportPayload({ domain: "robot", pilotLabel: PILOT_LABEL }),
      ),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "robot",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit,
    pendingApprovals,
    isRunning,
    tickCount,
    policies,
    metrics,
    start,
    pause,
    step,
    reset,
    approve,
    reject,
    exportJson,
    submitToAaaip,
    injectHumanIntrusion,
    injectSensorFailure,
    scenarioActions: [
      { id: "intrusion", label: "Inject human intrusion", onTrigger: injectHumanIntrusion },
      { id: "sensor_fail", label: "Degrade sensor", onTrigger: injectSensorFailure },
    ],
  };
}
