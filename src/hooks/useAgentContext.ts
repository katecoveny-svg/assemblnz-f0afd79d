/**
 * useAgentContext — loads full context for any agent chat session.
 * Fetches: shared_context, agent_memory, cross-agent summaries,
 * relevant memory (FTS), and recent compliance updates.
 * Injects into a system prompt block for the agent-router.
 */
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContextBlock {
  sharedContext: Record<string, any>;
  agentMemory: any[];
  crossAgentSummaries: any[];
  relevantMemory: any[];
  complianceUpdates: any[];
  systemPromptInjection: string;
}

export function useAgentContext(userId: string | undefined, agentId: string) {
  const loadContext = useCallback(async (firstMessage?: string): Promise<ContextBlock> => {
    if (!userId) {
      return { sharedContext: {}, agentMemory: [], crossAgentSummaries: [], relevantMemory: [], complianceUpdates: [], systemPromptInjection: "" };
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all in parallel
    const [ctxRes, memRes, sumRes, compRes, relRes] = await Promise.all([
      // 1. Shared context
      supabase.from("shared_context").select("context_key, context_value, source_agent, confidence")
        .eq("user_id", userId),

      // 2. Agent-specific memory
      supabase.from("agent_memory").select("memory_key, memory_value, updated_at")
        .eq("user_id", userId).eq("agent_id", agentId).order("updated_at", { ascending: false }).limit(10),

      // 3. Cross-agent summaries (last 7 days, other agents)
      supabase.from("conversation_summaries").select("agent_id, summary, key_facts_extracted, created_at")
        .eq("user_id", userId).neq("agent_id", agentId)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false }).limit(5),

      // 5. Recent compliance updates for this agent
      supabase.from("compliance_updates")
        .select("title, change_summary, effective_date")
        .contains("affected_agents", [agentId])
        .eq("verified", true)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false }).limit(5),

      // 4. Relevant memory (FTS) — only if we have a first message
      firstMessage
        ? supabase.rpc("search_memory", { p_user_id: userId, p_query: firstMessage, p_limit: 3 })
        : Promise.resolve({ data: [] }),
    ]);

    const sharedContext: Record<string, any> = {};
    (ctxRes.data || []).forEach((row: any) => {
      sharedContext[row.context_key] = row.context_value;
    });
    const agentMemory = memRes.data || [];
    const crossAgentSummaries = sumRes.data || [];
    const complianceUpdates = compRes.data || [];
    const relevantMemory = (relRes as any).data || [];

    // Build system prompt injection
    const blocks: string[] = [];

    if (Object.keys(sharedContext).length > 0) {
      blocks.push(`[BUSINESS PROFILE — shared_context]\n${Object.entries(sharedContext).map(([k, v]) => `• ${k}: ${JSON.stringify(v)}`).join("\n")}`);
    }

    if (agentMemory.length > 0) {
      blocks.push(`[AGENT MEMORY — ${agentId}]\n${agentMemory.map((m: any) => `• ${m.memory_key}: ${JSON.stringify(m.memory_value)} (updated ${m.updated_at})`).join("\n")}`);
    }

    if (crossAgentSummaries.length > 0) {
      blocks.push(`[CROSS-AGENT ACTIVITY — Last 7 days]\n${crossAgentSummaries.map((s: any) => `• ${s.agent_id} (${s.created_at}): ${s.summary}`).join("\n")}`);
    }

    if (relevantMemory.length > 0) {
      blocks.push(`[RELEVANT PAST CONTEXT]\n${relevantMemory.map((m: any) => `• ${m.agent_id} (${m.created_at}): ${m.summary}`).join("\n")}`);
    }

    if (complianceUpdates.length > 0) {
      blocks.push(`[RECENT COMPLIANCE UPDATES — Last 30 days]\n${complianceUpdates.map((u: any) => `• ${u.title} (effective ${u.effective_date || "TBD"}): ${u.change_summary}`).join("\n")}\nThese are verified updates. Reference them when relevant.`);
    }

    return {
      sharedContext,
      agentMemory,
      crossAgentSummaries,
      relevantMemory,
      complianceUpdates,
      systemPromptInjection: blocks.join("\n\n"),
    };
  }, [userId, agentId]);

  return { loadContext };
}
