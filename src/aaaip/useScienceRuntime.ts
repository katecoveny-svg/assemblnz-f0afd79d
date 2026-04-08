// ═══════════════════════════════════════════════════════════════
// AAAIP — Drug Screening runtime hook
// Owns one ScienceSimulator + ComplianceEngine + ScienceAgent +
// AuditLog instance and exposes the same shape as useAaaipRuntime
// / useRobotRuntime so the dashboard chrome can render any domain.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { ScienceAgent, type ScienceDecisionResult } from "./agent/science-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { SCIENCE_POLICIES } from "./policy/science";
import type { AaaipRuntimeBase } from "./runtime-base";
import { ScienceSimulator, type ScienceWorld } from "./simulation/science";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 03 — Drug screening / scientific discovery";

export interface ScienceRuntime extends AaaipRuntimeBase {
  domain: "science";
  world: ScienceWorld;
  step: () => ScienceDecisionResult | null;
  injectBadCompound: () => void;
}

export function useScienceRuntime(): ScienceRuntime {
  const simRef = useRef<ScienceSimulator | null>(null);
  const agentRef = useRef<ScienceAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new ScienceSimulator({ seed: 23 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: SCIENCE_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current)
    agentRef.current = new ScienceAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    return auditRef.current!.subscribe(() => forceRender());
  }, [forceRender]);

  const step = useCallback((): ScienceDecisionResult | null => {
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
    const payload = entry.decision.action.payload as {
      compoundId?: string;
      wellId?: string;
    };
    if (payload.compoundId && payload.wellId) {
      agentRef.current!.approveAndApply(simRef.current!, payload.compoundId, payload.wellId);
    }
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { compoundId?: string };
    if (payload.compoundId) simRef.current!.dropCompound(payload.compoundId);
    audit.override(entryId, "rejected");
  }, []);

  const injectBadCompound = useCallback(() => {
    simRef.current!.injectBadCompound();
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "science", pilotLabel: PILOT_LABEL }),
    [],
  );

  const submitToAaaip = useCallback(
    () =>
      submitAaaipExport(
        auditRef.current!.buildExportPayload({ domain: "science", pilotLabel: PILOT_LABEL }),
      ),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "science",
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
    injectBadCompound,
    scenarioActions: [
      {
        id: "bad_compound",
        label: "Inject bad compound",
        onTrigger: injectBadCompound,
      },
    ],
  };
}
