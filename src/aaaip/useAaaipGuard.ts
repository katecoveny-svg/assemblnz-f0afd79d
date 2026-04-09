// ═══════════════════════════════════════════════════════════════
// AAAIP — useAaaipGuard hook
//
// Single entry point for any production Assembl component that
// wants to route a user action through the AAAIP ComplianceEngine
// before executing it. Returns a stable `guard.check()` function
// and tracks the most recent decision so the component can show
// an inline verdict without maintaining its own state.
//
// Usage:
//
//   const guard = useAaaipGuard("waihanga");
//
//   const handleCheckin = async () => {
//     const decision = guard.check({
//       kind: "site_checkin",
//       payload: { ppeConfirmed, zone },
//       world: { headcount, headcountCap: 40, criticalHazardZones: [] },
//     });
//     if (decision.verdict === "block") {
//       toast.error(decision.explanation);
//       return;
//     }
//     if (decision.verdict === "needs_human") {
//       toast.warning("Needs supervisor approval", { description: decision.explanation });
//       return;
//     }
//     // proceed with real check-in …
//   };
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo, useRef, useState } from "react";

import { AUAHA_POLICIES } from "./policy/auaha";
import { ComplianceEngine } from "./policy/engine";
import { MANAAKI_POLICIES } from "./policy/manaaki";
import { PIKAU_POLICIES } from "./policy/pikau";
import { TORO_POLICIES } from "./policy/toro";
import { WAIHANGA_POLICIES } from "./policy/waihanga";
import type { RegisteredPolicy } from "./policy/library";
import type { AgentAction, ComplianceDecision } from "./policy/types";

/** Kete-scoped domain keys this guard knows about. */
export type GuardDomain = "waihanga" | "pikau" | "manaaki" | "auaha" | "toro";

const POLICIES_BY_DOMAIN: Record<GuardDomain, RegisteredPolicy[]> = {
  waihanga: WAIHANGA_POLICIES,
  pikau: PIKAU_POLICIES,
  manaaki: MANAAKI_POLICIES,
  auaha: AUAHA_POLICIES,
  toro: TORO_POLICIES,
};

/** Shape of the action a consumer passes to `guard.check()`. */
export interface GuardInput {
  kind: string;
  payload: Record<string, unknown>;
  /**
   * Domain-world snapshot the policy predicates read.
   * Most policies read from this (e.g. headcount for Waihanga).
   */
  world?: Record<string, unknown>;
  /** Optional override for the uncertainty threshold. */
  uncertaintyThreshold?: number;
  /** Optional confidence the caller estimates — default 0.9. */
  confidence?: number;
  /** Plain-English rationale for the audit log. */
  rationale?: string;
}

export interface GuardResult extends ComplianceDecision {
  /** Pass-through for UI: true when verdict === "allow". */
  allowed: boolean;
  /** Pass-through: true when verdict === "needs_human". */
  requiresHuman: boolean;
  /** Pass-through: true when verdict === "block". */
  blocked: boolean;
}

export interface UseAaaipGuard {
  /** Run a proposed action through the engine and return the decision. */
  check: (input: GuardInput) => GuardResult;
  /** Most recent decision for inline display. */
  lastDecision: GuardResult | null;
  /** Clear the last decision (e.g. on dialog close). */
  clear: () => void;
  /** Metadata of the policies gating this domain — surfaced in tooltips. */
  policies: ReturnType<ComplianceEngine["describePolicies"]>;
  domain: GuardDomain;
}

let actionCounter = 0;
const nextActionId = () => `guard-${++actionCounter}`;

/**
 * React hook returning a stable AAAIP guard bound to one Kete.
 * The engine instance is memoised per-domain so repeated renders
 * don't rebuild it.
 */
export function useAaaipGuard(domain: GuardDomain): UseAaaipGuard {
  const engineRef = useRef<ComplianceEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ComplianceEngine({
      policies: POLICIES_BY_DOMAIN[domain],
      defaultUncertaintyThreshold: 0.7,
    });
  }

  const [lastDecision, setLastDecision] = useState<GuardResult | null>(null);

  const check = useCallback(
    (input: GuardInput): GuardResult => {
      const action: AgentAction = {
        id: nextActionId(),
        // The Domain union in policy/types.ts is separate from
        // this UI-domain, so cast through a narrow escape.
        domain: domainSemanticOf(domain) as AgentAction["domain"],
        kind: input.kind,
        payload: input.payload,
        confidence: input.confidence ?? 0.9,
        proposedAt: Date.now(),
        rationale: input.rationale ?? `${input.kind} proposed by production component`,
      };
      const decision = engineRef.current!.evaluate(action, {
        now: Date.now(),
        world: input.world ?? {},
        uncertaintyThreshold: input.uncertaintyThreshold ?? 0.7,
      });
      const result: GuardResult = {
        ...decision,
        allowed: decision.verdict === "allow",
        requiresHuman: decision.verdict === "needs_human",
        blocked: decision.verdict === "block",
      };
      setLastDecision(result);
      return result;
    },
    [domain],
  );

  const clear = useCallback(() => setLastDecision(null), []);

  const policies = useMemo(
    () => engineRef.current!.describePolicies(),
    [],
  );

  return { check, lastDecision, clear, policies, domain };
}

function domainSemanticOf(d: GuardDomain): string {
  switch (d) {
    case "waihanga":
      return "construction";
    case "pikau":
      return "freight_customs";
    case "manaaki":
      return "hospitality";
    case "auaha":
      return "creative";
    case "toro":
      return "whanau_navigator";
  }
}
