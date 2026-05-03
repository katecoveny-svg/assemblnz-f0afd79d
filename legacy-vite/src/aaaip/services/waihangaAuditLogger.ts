// ═══════════════════════════════════════════════════════════════
// Client-side logger for Waihanga compliance decisions.
//
// Posts each decision (inputs, derived action, evaluations,
// verdict, applied flag, world snapshot) to the
// `waihanga-audit-log` edge function for server-side persistence
// in `public.waihanga_compliance_audit`.
//
// Fire-and-forget by design — never throws into the simulator
// loop, and de-duplicates retries by action id.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

import type { ComplianceDecision } from "../policy/types";
import type { WaihangaWorld } from "../simulation/waihanga";

interface LogDecisionInput {
  decision: ComplianceDecision;
  applied: boolean;
  pilotLabel?: string;
  world?: WaihangaWorld;
}

const SENT_ACTION_IDS = new Set<string>();

/** Strip the live simulator surface down to the snapshot we care about. */
function snapshotWorld(world: WaihangaWorld | undefined) {
  if (!world) return undefined;
  return {
    now: world.now,
    headcount: world.headcount,
    headcountCap: world.headcountCap,
    criticalHazardZones: [...world.criticalHazardZones],
    inboxSize: world.inbox.length,
    completedSize: world.completed.length,
  };
}

/**
 * Log a single Waihanga compliance decision. Safe to call from
 * inside React effects / sim ticks — failures are swallowed and
 * surfaced only via console.warn so the demo never breaks.
 */
export function logWaihangaDecision({
  decision,
  applied,
  pilotLabel,
  world,
}: LogDecisionInput): void {
  // Guard against double-logging the same action across re-renders.
  const dedupeKey = decision.action.id;
  if (SENT_ACTION_IDS.has(dedupeKey)) return;
  SENT_ACTION_IDS.add(dedupeKey);

  const body = {
    pilotLabel,
    decidedAt: new Date().toISOString(),
    applied,
    worldSnapshot: snapshotWorld(world),
    decision: {
      action: decision.action,
      evaluations: decision.evaluations,
      verdict: decision.verdict,
      explanation: decision.explanation,
    },
  };

  void supabase.functions
    .invoke("waihanga-audit-log", { body })
    .then(({ error }) => {
      if (error) {
        // Allow retry for the same action if the server rejected it.
        SENT_ACTION_IDS.delete(dedupeKey);
        console.warn("[waihanga-audit-log] failed:", error.message);
      }
    })
    .catch((err: unknown) => {
      SENT_ACTION_IDS.delete(dedupeKey);
      console.warn("[waihanga-audit-log] threw:", err);
    });
}

/** Test/utility hook — clears the in-memory dedupe set. */
export function _resetWaihangaAuditDedupe() {
  SENT_ACTION_IDS.clear();
}
