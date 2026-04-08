// ═══════════════════════════════════════════════════════════════
// AAAIP — React runtime hook
// Owns one ClinicSimulator + ComplianceEngine + ClinicAgent +
// AuditLog instance and exposes a small imperative API plus
// reactive state for the dashboard.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { ClinicAgent, type AgentDecisionResult } from "./agent/clinic-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { CLINIC_POLICIES } from "./policy/library";
import type { AaaipRuntimeBase } from "./runtime-base";
import { ClinicSimulator, type ClinicWorld } from "./simulation/clinic";

const PILOT_LABEL = "Aotearoa Agentic AI Platform · Pilot 01 — Clinic scheduling";

export interface AaaipRuntime extends AaaipRuntimeBase {
  domain: "clinic";
  world: ClinicWorld;
  step: () => AgentDecisionResult | null;
  injectEmergency: () => void;
}

export function useAaaipRuntime(): AaaipRuntime {
  const simRef = useRef<ClinicSimulator | null>(null);
  const agentRef = useRef<ClinicAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new ClinicSimulator({ seed: 7 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({ policies: CLINIC_POLICIES });
  if (!agentRef.current) agentRef.current = new ClinicAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  // Bridge audit log changes into React state.
  useEffect(() => {
    return auditRef.current!.subscribe(() => forceRender());
  }, [forceRender]);

  const step = useCallback((): AgentDecisionResult | null => {
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

  // Drive the loop while running.
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

  const approve = useCallback(
    (entryId: string) => {
      const audit = auditRef.current!;
      const entry = audit.list().find((e) => e.id === entryId);
      if (!entry) return;
      const payload = entry.decision.action.payload as {
        patientId?: string;
        slotId?: string;
      };
      if (payload.patientId && payload.slotId) {
        agentRef.current!.approveAndApply(simRef.current!, payload.patientId, payload.slotId);
      }
      audit.override(entryId, "approved");
    },
    [],
  );

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { patientId?: string };
    if (payload.patientId) simRef.current!.drainInboxFor(payload.patientId);
    audit.override(entryId, "rejected");
  }, []);

  const injectEmergency = useCallback(() => {
    // Force the next tick to spawn an emergency by mutating the inbox directly.
    const sim = simRef.current!;
    sim.world.pendingEmergency = true;
    sim.world.inbox.push({
      id: `manual-${Date.now()}`,
      name: "Walk-in Emergency",
      acuity: 1,
      consentOnFile: true,
      cohort: "A",
      arrivedAt: sim.world.now,
    });
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "clinic", pilotLabel: PILOT_LABEL }),
    [],
  );

  const submitToAaaip = useCallback(
    () =>
      submitAaaipExport(
        auditRef.current!.buildExportPayload({ domain: "clinic", pilotLabel: PILOT_LABEL }),
      ),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "clinic",
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
    injectEmergency,
    exportJson,
    submitToAaaip,
    scenarioActions: [
      { id: "emergency", label: "Inject emergency", onTrigger: injectEmergency },
    ],
  };
}
