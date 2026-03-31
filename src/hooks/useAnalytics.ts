import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type DeviceType = "mobile" | "tablet" | "desktop";

const getDeviceType = (): DeviceType => {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const chatStartRef = useRef<number | null>(null);

  const trackPackEvent = useCallback(
    async (packSlug: string, eventType: string, metadata?: Record<string, any>) => {
      try {
        await (supabase.from("pack_analytics") as any).insert({
          user_id: user?.id || null,
          pack_slug: packSlug,
          event_type: eventType,
          device_type: getDeviceType(),
          metadata: metadata || {},
        });
      } catch (e) {
        console.warn("[analytics] pack event failed", e);
      }
    },
    [user?.id]
  );

  const trackAgentEvent = useCallback(
    async (
      packSlug: string,
      agentSlug: string,
      eventType: string,
      extra?: { sessionDuration?: number; successfulCompletion?: boolean; metadata?: Record<string, any> }
    ) => {
      if (!user?.id) return;
      try {
        await (supabase.from("agent_analytics_events") as any).insert({
          user_id: user.id,
          pack_slug: packSlug,
          agent_slug: agentSlug,
          event_type: eventType,
          session_duration_seconds: extra?.sessionDuration || null,
          successful_completion: extra?.successfulCompletion ?? null,
          metadata: extra?.metadata || {},
        });
      } catch (e) {
        console.warn("[analytics] agent event failed", e);
      }
    },
    [user?.id]
  );

  const trackFunnelStep = useCallback(
    async (stepName: string, completed: boolean = true) => {
      if (!user?.id) return;
      try {
        await (supabase.from("funnel_analytics") as any).insert({
          user_id: user.id,
          step_name: stepName,
          completed,
        });
      } catch (e) {
        console.warn("[analytics] funnel event failed", e);
      }
    },
    [user?.id]
  );

  const startChatSession = useCallback(() => {
    chatStartRef.current = Date.now();
  }, []);

  const endChatSession = useCallback(
    (packSlug: string, agentSlug: string, successfulCompletion?: boolean) => {
      const start = chatStartRef.current;
      if (!start) return;
      const duration = Math.round((Date.now() - start) / 1000);
      chatStartRef.current = null;
      trackAgentEvent(packSlug, agentSlug, "chat_end", {
        sessionDuration: duration,
        successfulCompletion,
      });
    },
    [trackAgentEvent]
  );

  const trackResultCopy = useCallback(
    (packSlug: string, agentSlug: string) => {
      trackAgentEvent(packSlug, agentSlug, "result_copy");
    },
    [trackAgentEvent]
  );

  return {
    trackPackEvent,
    trackAgentEvent,
    trackFunnelStep,
    startChatSession,
    endChatSession,
    trackResultCopy,
    getDeviceType,
  };
};
