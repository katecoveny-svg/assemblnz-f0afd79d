// ═══════════════════════════════════════════════════════════════
// AAAIP — Manaaki (Hospitality) runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { ManaakiAgent, type ManaakiDecisionResult } from "./agent/manaaki-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { MANAAKI_POLICIES } from "./policy/manaaki";
import type { AaaipRuntimeBase } from "./runtime-base";
import { ManaakiSimulator, type ManaakiWorld } from "./simulation/manaaki";

const PILOT_LABEL = "Aotearoa Agentic AI Platform · Pilot 07 — Manaaki (hospitality)";

export interface ManaakiRuntime extends AaaipRuntimeBase {
  domain: "manaaki";
  world: ManaakiWorld;
  step: () => ManaakiDecisionResult | null;
  injectAllergenConflict: () => void;
  injectAccessibilityMismatch: () => void;
}

export function useManaakiRuntime(): ManaakiRuntime {
  const simRef = useRef<ManaakiSimulator | null>(null);
  const agentRef = useRef<ManaakiAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new ManaakiSimulator({ seed: 53 });
  if (!engineRef.current) engineRef.current = new ComplianceEngine({
    policies: MANAAKI_POLICIES, defaultUncertaintyThreshold: 0.7,
  });
  if (!agentRef.current) agentRef.current = new ManaakiAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): ManaakiDecisionResult | null => {
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

  const injectAllergenConflict = useCallback(() => { simRef.current!.injectAllergenConflict(); forceRender(); }, [forceRender]);
  const injectAccessibilityMismatch = useCallback(() => { simRef.current!.injectAccessibilityMismatch(); forceRender(); }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "manaaki", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "manaaki", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "manaaki",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectAllergenConflict, injectAccessibilityMismatch,
    scenarioActions: [
      { id: "allergen", label: "Inject allergen conflict", onTrigger: injectAllergenConflict },
      { id: "access", label: "Inject accessibility mismatch", onTrigger: injectAccessibilityMismatch },
    ],
  };
}
