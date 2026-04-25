// ────────────────────────────────────────────────────────────────
// Tracks whether the current user has already asked a first
// question for a given agent. Used by the welcome screen to
// decide whether to show starter prompts.
//
// Storage: localStorage, keyed per user (or "guest") + agent id.
// On first interaction (sending a message), call markAsked(agentId).
// ────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_PREFIX = "assembl:agent-first-visit:v1";

function storageKey(scope: string, agentId: string): string {
  return `${STORAGE_PREFIX}:${scope}:${agentId}`;
}

function readAsked(scope: string, agentId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey(scope, agentId)) === "1";
  } catch {
    return false;
  }
}

function writeAsked(scope: string, agentId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(scope, agentId), "1");
  } catch {
    // Storage failures are non-fatal.
  }
}

export interface AgentFirstVisitState {
  /** True if the user has not yet sent a first message to this agent. */
  isFirstVisit: boolean;
  /** Mark the agent as "asked" — call this when the user sends their first message. */
  markAsked: () => void;
  /** Reset the first-visit flag (e.g. for a "Show starter prompts again" affordance). */
  reset: () => void;
}

export function useAgentFirstVisit(agentId: string): AgentFirstVisitState {
  const { user } = useAuth();
  const scope = user?.id ?? "guest";

  const [hasAsked, setHasAsked] = useState<boolean>(() => readAsked(scope, agentId));

  // Re-read when the scope (auth) or agent changes.
  useEffect(() => {
    setHasAsked(readAsked(scope, agentId));
  }, [scope, agentId]);

  // Stay in sync across tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = storageKey(scope, agentId);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setHasAsked(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [scope, agentId]);

  const markAsked = useCallback(() => {
    writeAsked(scope, agentId);
    setHasAsked(true);
  }, [scope, agentId]);

  const reset = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey(scope, agentId));
    } catch {
      // ignore
    }
    setHasAsked(false);
  }, [scope, agentId]);

  return {
    isFirstVisit: !hasAsked,
    markAsked,
    reset,
  };
}
