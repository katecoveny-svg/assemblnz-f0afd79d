// ═══════════════════════════════════════════════════════════════
// AAAIP — Arataki (Automotive) React runtime hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitAaaipExport } from "./api/export";
import { ArataikiAgent, type ArataikiDecisionResult } from "./agent/arataki-agent";
import { AuditLog, type AuditEntry } from "./metrics/audit";
import { ComplianceEngine } from "./policy/engine";
import { ARATAKI_POLICIES } from "./policy/arataki";
import type { AaaipRuntimeBase } from "./runtime-base";
import { ArataikiSimulator, type ArataikiWorld } from "./simulation/arataki";

const PILOT_LABEL =
  "Aotearoa Agentic AI Platform · Pilot 10 — Arataki (automotive dealer intelligence)";

export interface ArataikiRuntime extends AaaipRuntimeBase {
  domain: "arataki";
  world: ArataikiWorld;
  step: () => ArataikiDecisionResult | null;
  injectFuelShock: () => void;
  injectMisleadingEconomyQuote: () => void;
  injectUndisclosedFinance: () => void;
  injectTamperedVehicle: () => void;
  lastTco: ArataikiDecisionResult["tco"];
}

export function useArataikiRuntime(): ArataikiRuntime {
  const simRef = useRef<ArataikiSimulator | null>(null);
  const agentRef = useRef<ArataikiAgent | null>(null);
  const auditRef = useRef<AuditLog | null>(null);
  const engineRef = useRef<ComplianceEngine | null>(null);

  if (!simRef.current) simRef.current = new ArataikiSimulator({ seed: 109 });
  if (!engineRef.current)
    engineRef.current = new ComplianceEngine({
      policies: ARATAKI_POLICIES,
      defaultUncertaintyThreshold: 0.7,
    });
  if (!agentRef.current) agentRef.current = new ArataikiAgent({ engine: engineRef.current });
  if (!auditRef.current) auditRef.current = new AuditLog();

  const [, setRenderTick] = useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [lastTco, setLastTco] = useState<ArataikiDecisionResult["tco"]>(undefined);

  useEffect(() => auditRef.current!.subscribe(() => forceRender()), [forceRender]);

  const step = useCallback((): ArataikiDecisionResult | null => {
    const sim = simRef.current!;
    const agent = agentRef.current!;
    const audit = auditRef.current!;
    sim.tick();
    const result = agent.step(sim);
    if (result) {
      audit.record(result.decision, result.applied);
      if (result.tco) setLastTco(result.tco);
    }
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
    setLastTco(undefined);
    forceRender();
  }, [forceRender]);

  const approve = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { enquiryId?: string };
    if (p.enquiryId) agentRef.current!.approveAndApply(simRef.current!, p.enquiryId);
    audit.override(entryId, "approved");
  }, []);

  const reject = useCallback((entryId: string) => {
    const audit = auditRef.current!;
    const entry = audit.list().find((e) => e.id === entryId);
    if (!entry) return;
    const p = entry.decision.action.payload as { enquiryId?: string };
    if (p.enquiryId) simRef.current!.reject(p.enquiryId);
    audit.override(entryId, "rejected");
  }, []);

  const injectFuelShock = useCallback(() => { simRef.current!.injectFuelShock(); forceRender(); }, [forceRender]);
  const injectMisleadingEconomyQuote = useCallback(() => { simRef.current!.injectMisleadingEconomyQuote(); forceRender(); }, [forceRender]);
  const injectUndisclosedFinance = useCallback(() => { simRef.current!.injectUndisclosedFinance(); forceRender(); }, [forceRender]);
  const injectTamperedVehicle = useCallback(() => { simRef.current!.injectTamperedVehicle(); forceRender(); }, [forceRender]);

  const exportJson = useCallback(
    () => auditRef.current!.exportJson({ domain: "arataki", pilotLabel: PILOT_LABEL }),
    [],
  );
  const submitToAaaip = useCallback(
    () => submitAaaipExport(auditRef.current!.buildExportPayload({ domain: "arataki", pilotLabel: PILOT_LABEL })),
    [],
  );

  const policies = useMemo(() => engineRef.current!.describePolicies(), []);
  const metrics = auditRef.current!.aggregates();
  const audit = auditRef.current!.list();
  const pendingApprovals = auditRef.current!.pendingApprovals();

  return {
    domain: "arataki",
    pilotLabel: PILOT_LABEL,
    world: simRef.current!.world,
    audit, pendingApprovals, isRunning, tickCount, policies, metrics,
    start, pause, step, reset, approve, reject, exportJson, submitToAaaip,
    injectFuelShock, injectMisleadingEconomyQuote, injectUndisclosedFinance, injectTamperedVehicle,
    lastTco,
    scenarioActions: [
      { id: "fuel_shock", label: "Inject fuel-price shock", onTrigger: injectFuelShock },
      { id: "misleading", label: "Inject misleading quote", onTrigger: injectMisleadingEconomyQuote },
      { id: "finance", label: "Inject undisclosed finance", onTrigger: injectUndisclosedFinance },
      { id: "tamper", label: "Inject tampered vehicle", onTrigger: injectTamperedVehicle },
    ],
  };
}
