// ═══════════════════════════════════════════════════════════════
// AAAIP — Tōro (Whānau Family Navigator) runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { ToroAgent, type ToroDecisionResult } from "./agent/toro-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { TORO_POLICIES } from "./policy/toro";
import type { AaaipRuntimeBase } from "./runtime-base";
import { ToroSimulator, type ToroWorld } from "./simulation/toro";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 09 — Tōro (whānau family navigator)";

export interface ToroRuntime extends AaaipRuntimeBase {
  domain: "toro";
  world: ToroWorld;
  step: () => ToroDecisionResult | null;
  injectWellbeingCrisis: () => void;
  injectHighRiskBudgetAdvice: () => void;
  injectChildMessageWithoutConsent: () => void;
}

export function useToroRuntime(): ToroRuntime {
  const simRef = useRef<ToroSimulator | null>(null);
  const agentRef = useRef<ToroAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new ToroSimulator({ seed: 83, vulnerableHousehold: true });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: TORO_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new ToroAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): ToroDecisionResult | null => {
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
    const p = entry.decision.action.payload as { messageId?: string };
    if (p.messageId) agentRef.current!.approveAndApply(simRef.current!, p.messageId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { messageId?: string };
    if (p.messageId) simRef.current!.drop(p.messageId);
    audit.override(entryId, "rejected");
  }, []);

  const injectWellbeingCrisis = useCallback(() => { simRef.current!.injectWellbeingCrisis(); forceRender(); }, [forceRender]);
  const injectHighRiskBudgetAdvice = useCallback(() => { simRef.current!.injectHighRiskBudgetAdvice(); forceRender(); }, [forceRender]);
  const injectChildMessageWithoutConsent = useCallback(() => { simRef.current!.injectChildMessageWithoutConsent(); forceRender(); }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "toro", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "toro", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "toro",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectWellbeingCrisis, injectHighRiskBudgetAdvice, injectChildMessageWithoutConsent,
    scenarioActions: [
      { id: "crisis", label: "Inject wellbeing crisis", onTrigger: injectWellbeingCrisis },
      { id: "risk", label: "Inject high-risk budget advice", onTrigger: injectHighRiskBudgetAdvice },
      { id: "child", label: "Inject child msg w/o consent", onTrigger: injectChildMessageWithoutConsent },
    ],
  };
}
