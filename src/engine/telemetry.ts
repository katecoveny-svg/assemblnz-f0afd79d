// ────────────────────────────────────────────────────────────────
// Lightweight client-side telemetry.
//
// Fires events into `agent_analytics_events` so we can see which
// agents are clicked into and which actually receive chat messages.
//
// Always fire-and-forget. Never throw. Never block the UI.
// ────────────────────────────────────────────────────────────────

import { supabase } from "@/integrations/supabase/client";

type EventType =
  | "agent_grid_click"
  | "chat_message_sent"
  | "starter_prompt_used";

interface LogAgentEventOptions {
  eventType: EventType;
  agentSlug: string;
  packSlug?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Insert one row into `agent_analytics_events`.
 *
 * - Anonymous visitors are supported (user_id stays null).
 * - Errors are swallowed; telemetry must never break the app.
 */
export function logAgentEvent({
  eventType,
  agentSlug,
  packSlug,
  metadata,
}: LogAgentEventOptions): void {
  if (!agentSlug) return;

  // Resolve the current user without awaiting the caller.
  void (async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id ?? null;

      const row = {
        user_id: userId,
        agent_slug: agentSlug,
        pack_slug: packSlug ?? "unknown",
        event_type: eventType,
        metadata: {
          ...(metadata ?? {}),
          path: typeof window !== "undefined" ? window.location.pathname : null,
          ts: new Date().toISOString(),
        },
      };

      await supabase.from("agent_analytics_events").insert(row);
    } catch {
      // Telemetry is best-effort. Never surface to the user.
    }
  })();
}
