// ═══════════════════════════════════════════════════════════════
// AAAIP — Waihanga (Construction) React runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { WaihangaAgent, type WaihangaDecisionResult } from "./agent/waihanga-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { WAIHANGA_POLICIES } from "./policy/waihanga";
import type { AaaipRuntimeBase } from "./runtime-base";
import { logWaihangaDecision } from "./services/waihangaAuditLogger";
import { WaihangaSimulator, type WaihangaWorld } from "./simulation/waihanga";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 05 — Waihanga (construction)";

export interface WaihangaRuntime extends AaaipRuntimeBase {
  domain: "waihanga";
  world: WaihangaWorld;
  step: () => WaihangaDecisionResult | null;
  injectCriticalHazard: () => void;
  injectMissingPPE: () => void;
}

export function useWaihangaRuntime(): WaihangaRuntime {
  const simRef = useRef<WaihangaSimulator | null>(null);
  const agentRef = useRef<WaihangaAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new WaihangaSimulator({ seed: 31 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: WAIHANGA_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new WaihangaAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    return auditRef.current!.subscribe(() => forceRender());
  }, [forceRender]);

  const step = useCallback((): WaihangaDecisionResult | null => {
    const sim = simRef.current!;
    const agent = agentRef.current!;
    const audit = auditRef.current!;
    sim.tick();
    const result = agent.step(sim);
    if (result) {
      audit.record(result.decision, result.applied);
      // Server-side audit trail (fire-and-forget).
      logWaihangaDecision({
        decision: result.decision,
        applied: result.applied,
        pilotLabel: PILOT_LABEL,
        world: sim.world,
      });
    }
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
    if (payload.taskId) agentRef.current!.approveAndApply(simRef.current!, payload.taskId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { taskId?: string };
    if (payload.taskId) simRef.current!.drop(payload.taskId);
    audit.override(entryId, "rejected");
  }, []);

  const injectCriticalHazard = useCallback(() => {
    simRef.current!.injectCriticalHazard();
    forceRender();
  }, [forceRender]);

  const injectMissingPPE = useCallback(() => {
    simRef.current!.injectMissingPPE();
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "waihanga", pilotLabel: PILOT_LABEL }),
    [],
  );

  const submitToAaaip = useCallback(
    () =>
      submitAaaipExport(
        auditRef.current!.buildExportPayload({ domain: "waihanga", pilotLabel: PILOT_LABEL }),
      ),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "waihanga",
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
    injectCriticalHazard,
    injectMissingPPE,
    scenarioActions: [
      { id: "hazard", label: "Inject critical hazard", onTrigger: injectCriticalHazard },
      { id: "ppe", label: "Inject missing-PPE check-in", onTrigger: injectMissingPPE },
    ],
  };
}
