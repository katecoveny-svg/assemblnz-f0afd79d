// ═══════════════════════════════════════════════════════════════
// AAAIP — Pikau (Freight & Customs) runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { PikauAgent, type PikauDecisionResult } from "./agent/pikau-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { PIKAU_POLICIES } from "./policy/pikau";
import type { AaaipRuntimeBase } from "./runtime-base";
import { PikauSimulator, type PikauWorld } from "./simulation/pikau";

const PILOT_LABEL = "Aotearoa Agentic AI Platform · Pilot 06 — Pikau (freight & customs)";

export interface PikauRuntime extends AaaipRuntimeBase {
  domain: "pikau";
  world: PikauWorld;
  step: () => PikauDecisionResult | null;
  injectDriverFatigue: () => void;
  injectColdChainBreak: () => void;
  injectSensorFailure: () => void;
  /** Inject a Strait of Hormuz fuel shock — diesel +74%. */
  injectFuelShock: () => void;
}

export function usePikauRuntime(): PikauRuntime {
  const simRef = useRef<PikauSimulator | null>(null);
  const agentRef = useRef<PikauAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new PikauSimulator({ seed: 41 });
  if (!engineRef.current) engineRef.current = new ComplianceEngine({
    policies: PIKAU_POLICIES, defaultUncertaintyThreshold: 0.7,
  });
  if (!agentRef.current) agentRef.current = new PikauAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): PikauDecisionResult | null => {
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
    const id = window.setInterval(() => step(), 900);
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
    const p = entry.decision.action.payload as { taskId?: string };
    if (p.taskId) agentRef.current!.approveAndApply(simRef.current!, p.taskId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { taskId?: string };
    if (p.taskId) simRef.current!.drop(p.taskId);
    audit.override(entryId, "rejected");
  }, []);

  const injectDriverFatigue = useCallback(() => { simRef.current!.injectDriverFatigue(); forceRender(); }, [forceRender]);
  const injectColdChainBreak = useCallback(() => { simRef.current!.injectColdChainBreak(); forceRender(); }, [forceRender]);
  const injectSensorFailure = useCallback(() => { simRef.current!.injectSensorFailure(); forceRender(); }, [forceRender]);
  const injectFuelShock = useCallback(() => { simRef.current!.injectFuelShock(); forceRender(); }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "pikau", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "pikau", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "pikau",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectDriverFatigue, injectColdChainBreak, injectSensorFailure, injectFuelShock,
    scenarioActions: [
      { id: "fatigue", label: "Inject fatigued driver", onTrigger: injectDriverFatigue },
      { id: "cold", label: "Inject cold-chain break", onTrigger: injectColdChainBreak },
      { id: "sensor", label: "Degrade sensors", onTrigger: injectSensorFailure },
      { id: "fuel-shock", label: "Strait of Hormuz fuel shock (+74% diesel)", onTrigger: injectFuelShock },
    ],
  };
}
