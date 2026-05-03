// ═══════════════════════════════════════════════════════════════
// AAAIP — Community Portal runtime hook
// Owns one CommunitySimulator + ComplianceEngine + CommunityAgent +
// AuditLog instance and exposes the same shape as the other
// runtime hooks so the dashboard chrome works unchanged.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { CommunityAgent, type CommunityDecisionResult } from "./agent/community-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { COMMUNITY_POLICIES } from "./policy/community";
import type { AaaipRuntimeBase } from "./runtime-base";
import { CommunitySimulator, type CommunityWorld } from "./simulation/community";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 04 — Community portal moderation";

export interface CommunityRuntime extends AaaipRuntimeBase {
  domain: "community";
  world: CommunityWorld;
  step: () => CommunityDecisionResult | null;
  injectHarmfulPost: () => void;
  injectTaongaWithoutConsent: () => void;
}

export function useCommunityRuntime(): CommunityRuntime {
  const simRef = useRef<CommunitySimulator | null>(null);
  const agentRef = useRef<CommunityAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new CommunitySimulator({ seed: 19 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: COMMUNITY_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new CommunityAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    return auditRef.current!.subscribe(() => forceRender());
  }, [forceRender]);

  const step = useCallback((): CommunityDecisionResult | null => {
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
    const payload = entry.decision.action.payload as { postId?: string };
    if (payload.postId) {
      agentRef.current!.approveAndApply(simRef.current!, payload.postId);
    }
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const payload = entry.decision.action.payload as { postId?: string };
    if (payload.postId) simRef.current!.reject(payload.postId);
    audit.override(entryId, "rejected");
  }, []);

  const injectHarmfulPost = useCallback(() => {
    simRef.current!.injectHarmfulPost();
    forceRender();
  }, [forceRender]);

  const injectTaongaWithoutConsent = useCallback(() => {
    simRef.current!.injectTaongaWithoutConsent();
    forceRender();
  }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "community", pilotLabel: PILOT_LABEL }),
    [],
  );

  const submitToAaaip = useCallback(
    () =>
      submitAaaipExport(
        auditRef.current!.buildExportPayload({ domain: "community", pilotLabel: PILOT_LABEL }),
      ),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "community",
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
    injectHarmfulPost,
    injectTaongaWithoutConsent,
    scenarioActions: [
      { id: "harm", label: "Inject harmful post", onTrigger: injectHarmfulPost },
      { id: "taonga", label: "Inject taonga w/o consent", onTrigger: injectTaongaWithoutConsent },
    ],
  };
}
