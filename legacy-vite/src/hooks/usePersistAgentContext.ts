/**
 * Persists the last successfully resolved agent context across refresh,
 * back/forward navigation, and full reloads. Stored in localStorage so it
 * survives across tabs and browser restarts.
 *
 * Header metadata, color theme, and starter questions are all derived from
 * `agent` (which is itself derived from the URL via useParams), so URL-driven
 * routing already handles refresh + back/forward. This hook adds a recovery
 * lane for cases where the URL has no agentId or an unknown slug — we can
 * suggest restoring the user's last valid agent context.
 */
import { useEffect } from "react";
import type { Agent } from "@/data/agents";

const STORAGE_KEY = "assembl_last_agent";

export interface PersistedAgentContext {
  agentId: string;
  rawSlug: string;
  name: string;
  color: string;
  designation?: string;
  pack?: string;
  savedAt: number;
}

/** Save the resolved agent context whenever it changes. No-op if agent is undefined. */
export function usePersistAgentContext(rawSlug: string | undefined, agent: Agent | undefined) {
  useEffect(() => {
    if (!agent || !rawSlug) return;
    try {
      const payload: PersistedAgentContext = {
        agentId: agent.id,
        rawSlug,
        name: agent.name,
        color: agent.color,
        designation: agent.designation,
        pack: agent.pack,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage may be unavailable (private mode, quota, etc.)
    }
  }, [rawSlug, agent]);
}

/** Read the last persisted agent context (if any). Used by recovery UIs. */
export function getLastAgentContext(): PersistedAgentContext | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAgentContext;
    if (!parsed?.agentId || !parsed?.rawSlug) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Clear the persisted agent context (e.g. on sign-out). */
export function clearLastAgentContext() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
