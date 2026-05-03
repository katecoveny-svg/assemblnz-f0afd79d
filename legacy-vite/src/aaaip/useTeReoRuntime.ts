// ═══════════════════════════════════════════════════════════════
// AAAIP — Te Reo Tikanga Advisory runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { TeReoAgent, type TeReoDecisionResult } from "./agent/te-reo-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { TE_REO_POLICIES } from "./policy/te-reo";
import type { AaaipRuntimeBase } from "./runtime-base";
import { TeReoSimulator, type TeReoWorld } from "./simulation/te-reo";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 10 — Te Reo Tikanga Advisory";

export interface TeReoRuntime extends AaaipRuntimeBase {
  domain: "tereo";
  world: TeReoWorld;
  step: () => TeReoDecisionResult | null;
  injectSacredContentRequest: () => void;
  injectSovereigntyViolation: () => void;
  injectUnreviewedTranslation: () => void;
}

export function useTeReoRuntime(): TeReoRuntime {
  const simRef = useRef<TeReoSimulator | null>(null);
  const agentRef = useRef<TeReoAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new TeReoSimulator({ seed: 101 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: TE_REO_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new TeReoAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): TeReoDecisionResult | null => {
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
    const p = entry.decision.action.payload as { requestId?: string };
    if (p.requestId) agentRef.current!.approveAndApply(simRef.current!, p.requestId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { requestId?: string };
    if (p.requestId) simRef.current!.drop(p.requestId);
    audit.override(entryId, "rejected");
  }, []);

  const injectSacredContentRequest = useCallback(() => {
    simRef.current!.injectSacredContentRequest();
    forceRender();
  }, [forceRender]);

  const injectSovereigntyViolation = useCallback(() => {
    simRef.current!.injectSovereigntyViolation();
    forceRender();
  }, [forceRender]);

  const injectUnreviewedTranslation = useCallback(() => {
    simRef.current!.injectUnreviewedTranslation();
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "tereo", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "tereo", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "tereo",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectSacredContentRequest, injectSovereigntyViolation, injectUnreviewedTranslation,
    scenarioActions: [
      { id: "sacred", label: "Inject karakia request", onTrigger: injectSacredContentRequest },
      { id: "sovereignty", label: "Inject sovereignty violation", onTrigger: injectSovereigntyViolation },
      { id: "unreviewed", label: "Inject unreviewed translation", onTrigger: injectUnreviewedTranslation },
    ],
  };
}
