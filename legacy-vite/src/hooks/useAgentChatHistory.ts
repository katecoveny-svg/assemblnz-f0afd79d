/**
 * useAgentChatHistory — per-agent chat persistence.
 *
 * - Signed-in users: load + upsert into the `conversations` table, keyed by
 *   (user_id, agent_id). One row per agent — the latest one is reused so a
 *   user's history with a given agent resumes wherever they left off.
 * - Guests: persist to localStorage under `assembl_chat:<agentId>` so the
 *   thread also survives refreshes / back-forward / new tabs without auth.
 *
 * The hook intentionally mirrors the contract used by KeteBrainChat so all
 * chat surfaces share the same persistence behaviour.
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ChatRole = "user" | "assistant";
export interface PersistedMsg {
  role: ChatRole;
  content: string;
}

const GUEST_KEY = (agentId: string) => `assembl_chat:${agentId}`;
const SAVE_DEBOUNCE_MS = 600;
// Cap what we persist so very long threads stay snappy and within row limits.
const MAX_PERSISTED_MESSAGES = 200;

function readGuest(agentId: string): PersistedMsg[] {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY(agentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m): m is PersistedMsg =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
      )
      .slice(-MAX_PERSISTED_MESSAGES);
  } catch {
    return [];
  }
}

function writeGuest(agentId: string, messages: PersistedMsg[]) {
  try {
    const trimmed = messages.slice(-MAX_PERSISTED_MESSAGES);
    window.localStorage.setItem(GUEST_KEY(agentId), JSON.stringify(trimmed));
  } catch {
    // Quota / private mode — silently ignore; chat still works in-memory.
  }
}

export interface UseAgentChatHistoryResult {
  /** True once we've attempted to load the saved thread. Use to gate first save. */
  loaded: boolean;
  /** Clear the saved thread (e.g. "Start new chat" affordance). */
  clearHistory: () => Promise<void>;
}

/**
 * Persist `messages` for `(user, agentId)`. Calls `setMessages` once on mount
 * with the saved thread (if any) so callers don't need to manage that wiring.
 */
export function useAgentChatHistory(
  agentId: string | undefined,
  messages: PersistedMsg[],
  setMessages: (msgs: PersistedMsg[]) => void,
): UseAgentChatHistoryResult {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAgentRef = useRef<string | undefined>(undefined);

  // ── Load on mount / when agent or auth changes ──────────────────────────
  useEffect(() => {
    if (!agentId) return;
    // If the agent slug changed mid-session, reset state cleanly.
    if (lastAgentRef.current && lastAgentRef.current !== agentId) {
      conversationIdRef.current = null;
      setLoaded(false);
    }
    lastAgentRef.current = agentId;

    let active = true;

    (async () => {
      // Guest path
      if (!user) {
        const saved = readGuest(agentId);
        if (active && saved.length > 0) setMessages(saved);
        if (active) setLoaded(true);
        return;
      }

      // Authed path
      try {
        const { data } = await supabase
          .from("conversations")
          .select("id, messages")
          .eq("user_id", user.id)
          .eq("agent_id", agentId)
          .order("updated_at", { ascending: false })
          .limit(1);
        if (!active) return;
        if (data && data.length > 0) {
          const conv = data[0] as { id: string; messages: unknown };
          conversationIdRef.current = conv.id;
          if (Array.isArray(conv.messages) && conv.messages.length > 0) {
            const safe = (conv.messages as PersistedMsg[]).filter(
              (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
            );
            if (safe.length > 0) setMessages(safe);
          }
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();

    return () => { active = false; };
    // We deliberately only re-run when identity changes, not when messages change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, agentId]);

  // ── Save (debounced) on message changes ─────────────────────────────────
  useEffect(() => {
    if (!agentId || !loaded || messages.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      // Guest: localStorage only
      if (!user) {
        writeGuest(agentId, messages);
        return;
      }

      // Authed: upsert against conversations row for this (user, agent).
      const trimmed = messages.slice(-MAX_PERSISTED_MESSAGES);
      try {
        if (conversationIdRef.current) {
          await supabase
            .from("conversations")
            .update({
              messages: trimmed as unknown as never,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationIdRef.current);
        } else {
          const { data } = await supabase
            .from("conversations")
            .insert({
              user_id: user.id,
              agent_id: agentId,
              messages: trimmed as unknown as never,
            })
            .select("id")
            .single();
          if (data) conversationIdRef.current = (data as { id: string }).id;
        }
      } catch {
        // Network / RLS hiccup — keep the in-memory thread; next change will retry.
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [messages, loaded, user, agentId]);

  const clearHistory = async () => {
    setMessages([]);
    if (!agentId) return;
    if (!user) {
      try { window.localStorage.removeItem(GUEST_KEY(agentId)); } catch { /* ignore */ }
      return;
    }
    if (conversationIdRef.current) {
      try {
        await supabase.from("conversations").delete().eq("id", conversationIdRef.current);
      } catch { /* ignore */ }
      conversationIdRef.current = null;
    }
  };

  return { loaded, clearHistory };
}
