import { supabase } from "@/integrations/supabase/client";

export interface MemoryResult {
  agent_id: string;
  summary: string;
  key_facts: Record<string, any>;
  created_at: string;
  rank: number;
}

/**
 * Search conversation memory using full-text search.
 * Returns ranked past conversation summaries relevant to the query.
 */
export async function searchMemory(
  userId: string,
  query: string,
  agentId?: string,
  limit = 5
): Promise<MemoryResult[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase.rpc("search_memory", {
    p_user_id: userId,
    p_query: query,
    p_agent_id: agentId ?? null,
    p_limit: limit,
  });

  if (error) {
    console.warn("[searchMemory] RPC error:", error.message);
    return [];
  }

  return (data || []) as MemoryResult[];
}

/**
 * Build a memory context block for injection into system prompts.
 */
export function buildMemoryBlock(memories: MemoryResult[]): string {
  if (!memories.length) return "";
  return (
    "\n[RELEVANT PAST CONVERSATIONS]\n" +
    memories
      .map(
        (m) =>
          `${m.agent_id} (${new Date(m.created_at).toLocaleDateString("en-NZ")}): ${m.summary}`
      )
      .join("\n") +
    "\n"
  );
}
