import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { allAgents, type Agent } from "@/data/agents";
import {
  fetchAgentOverrides,
  mergeAgentOverride,
  type AgentOverride,
} from "@/lib/agentOverrides";

interface OverridesContextValue {
  overrides: Record<string, AgentOverride>;
  loading: boolean;
  refresh: () => Promise<void>;
  resolvedAgents: Agent[];
  resolveAgent: (agent: Agent) => Agent;
  isHidden: (agentId: string) => boolean;
}

const Ctx = createContext<OverridesContextValue | null>(null);

export function AgentOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, AgentOverride>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchAgentOverrides();
    setOverrides(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Realtime so admin edits propagate without reload
    const channel = supabase
      .channel("agent_overrides_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_overrides" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo<OverridesContextValue>(() => {
    const resolveAgent = (agent: Agent) => mergeAgentOverride(agent, overrides[agent.id]);
    const isHidden = (agentId: string) => overrides[agentId]?.is_active === false;
    const resolvedAgents = allAgents.filter((a) => !isHidden(a.id)).map(resolveAgent);
    return { overrides, loading, refresh, resolvedAgents, resolveAgent, isHidden };
  }, [overrides, loading, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Safe to call outside the provider — returns identity helpers. */
export function useAgentOverrides(): OverridesContextValue {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  return {
    overrides: {},
    loading: false,
    refresh: async () => {},
    resolvedAgents: allAgents,
    resolveAgent: (a) => a,
    isHidden: () => false,
  };
}

/** Resolve a single agent through the current overrides cache. */
export function useResolvedAgent(agent: Agent): Agent {
  const { resolveAgent } = useAgentOverrides();
  return useMemo(() => resolveAgent(agent), [agent, resolveAgent]);
}
