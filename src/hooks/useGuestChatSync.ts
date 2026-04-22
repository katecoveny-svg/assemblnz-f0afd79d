import { useEffect, useRef } from "react";

type Message = { role: string; content: string; [k: string]: any };

interface Options {
  agentId: string | null | undefined;
  /** Whether the current user is a guest (no signed-in session). */
  isGuest: boolean;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
}

const keyFor = (agentId: string) => `assembl_chat_${agentId}`;

/**
 * Cross-tab sync for guest chat conversations.
 *
 * Listens to the browser `storage` event so that when the same agent's
 * conversation is updated in another tab, this tab picks up the change
 * instantly without needing a refresh.
 *
 * Only active for guests — signed-in users sync through Supabase.
 */
export function useGuestChatSync({ agentId, isGuest, messages, setMessages }: Options) {
  // Track the last serialized payload we wrote/applied so we can ignore
  // echoes of our own writes and avoid render loops.
  const lastSeenRef = useRef<string | null>(null);

  // Keep the ref in sync whenever this tab updates messages locally.
  useEffect(() => {
    if (!isGuest || !agentId) return;
    try {
      lastSeenRef.current = JSON.stringify(messages.slice(-50));
    } catch {
      lastSeenRef.current = null;
    }
  }, [messages, isGuest, agentId]);

  useEffect(() => {
    if (!isGuest || !agentId) return;
    const storageKey = keyFor(agentId);

    const handler = (e: StorageEvent) => {
      // Only react to changes for the active agent's key.
      if (e.key !== storageKey) return;
      // Key cleared in another tab — clear here too.
      if (e.newValue === null) {
        if (lastSeenRef.current !== null) {
          lastSeenRef.current = null;
          setMessages([]);
        }
        return;
      }
      // Skip if value is identical to what we last applied/wrote.
      if (e.newValue === lastSeenRef.current) return;

      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          lastSeenRef.current = e.newValue;
          setMessages(parsed as Message[]);
        }
      } catch {
        // ignore malformed payloads from other tabs
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [agentId, isGuest, setMessages]);
}
