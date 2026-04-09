// ═══════════════════════════════════════════════════════════════
// AAAIP — Auaha (Creative) runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { AuahaAgent, type AuahaDecisionResult } from "./agent/auaha-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { AUAHA_POLICIES } from "./policy/auaha";
import type { AaaipRuntimeBase } from "./runtime-base";
import { AuahaSimulator, type AuahaWorld } from "./simulation/auaha";

const PILOT_LABEL = "Aotearoa Agentic AI Platform · Pilot 08 — Auaha (creative)";

export interface AuahaRuntime extends AaaipRuntimeBase {
  domain: "auaha";
  world: AuahaWorld;
  step: () => AuahaDecisionResult | null;
  injectUnlicensedAsset: () => void;
  injectLikenessWithoutConsent: () => void;
  injectTeReoAsset: () => void;
}

export function useAuahaRuntime(): AuahaRuntime {
  const simRef = useRef<AuahaSimulator | null>(null);
  const agentRef = useRef<AuahaAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new AuahaSimulator({ seed: 67 });
  if (!engineRef.current) engineRef.current = new ComplianceEngine({
    policies: AUAHA_POLICIES, defaultUncertaintyThreshold: 0.7,
  });
  if (!agentRef.current) agentRef.current = new AuahaAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): AuahaDecisionResult | null => {
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
    const p = entry.decision.action.payload as { assetId?: string };
    if (p.assetId) agentRef.current!.approveAndApply(simRef.current!, p.assetId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { assetId?: string };
    if (p.assetId) simRef.current!.reject(p.assetId);
    audit.override(entryId, "rejected");
  }, []);

  const injectUnlicensedAsset = useCallback(() => { simRef.current!.injectUnlicensedAsset(); forceRender(); }, [forceRender]);
  const injectLikenessWithoutConsent = useCallback(() => { simRef.current!.injectLikenessWithoutConsent(); forceRender(); }, [forceRender]);
  const injectTeReoAsset = useCallback(() => { simRef.current!.injectTeReoAsset(); forceRender(); }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "auaha", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "auaha", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "auaha",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectUnlicensedAsset, injectLikenessWithoutConsent, injectTeReoAsset,
    scenarioActions: [
      { id: "licence", label: "Inject unlicensed asset", onTrigger: injectUnlicensedAsset },
      { id: "likeness", label: "Inject likeness w/o consent", onTrigger: injectLikenessWithoutConsent },
      { id: "tereo", label: "Inject te reo asset", onTrigger: injectTeReoAsset },
    ],
  };
}
