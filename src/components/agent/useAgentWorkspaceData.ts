import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * useAgentWorkspaceData — live read-only feeds for an agent's workspace.
 *
 * Pulls four datasets:
 *  • runs        — recent audit_log entries scoped to this agent_code
 *  • memory      — agent_memory rows scoped to this agent_id (slug)
 *  • evidence    — recent evidence_packs in the agent's kete (no agent
 *                  column on the table, so we filter by kete and rely on
 *                  the section attribution inside evidence_json)
 *  • toolUses    — distinct tool names + counts pulled from audit_log
 */

export type AgentRunRow = {
  id: string;
  created_at: string | null;
  model_used: string;
  request_summary: string | null;
  response_summary: string | null;
  cost_nzd: number | null;
  duration_ms: number | null;
  total_tokens: number | null;
  compliance_passed: boolean | null;
  data_classification: string | null;
};

export type AgentMemoryRow = {
  id: string;
  memory_type: string | null;
  subject: string | null;
  content: string | null;
  importance: number | null;
  updated_at: string;
};

export type AgentEvidenceRow = {
  id: string;
  action_type: string;
  watermark: string;
  signed_by: string | null;
  signed_at: string | null;
  created_at: string | null;
  share_view_count: number;
  kete: string;
};

export type AgentToolUseRow = {
  policy: string;
  count: number;
};

export function useAgentRuns(agentCode: string) {
  return useQuery({
    queryKey: ["agent-workspace", "runs", agentCode],
    enabled: Boolean(agentCode),
    queryFn: async (): Promise<AgentRunRow[]> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select(
          "id, created_at, model_used, request_summary, response_summary, cost_nzd, duration_ms, total_tokens, compliance_passed, data_classification",
        )
        .eq("agent_code", agentCode)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AgentRunRow[];
    },
  });
}

export function useAgentMemory(agentSlug: string) {
  return useQuery({
    queryKey: ["agent-workspace", "memory", agentSlug],
    enabled: Boolean(agentSlug),
    queryFn: async (): Promise<AgentMemoryRow[]> => {
      const { data, error } = await supabase
        .from("agent_memory")
        .select("id, memory_type, subject, content, importance, updated_at")
        .eq("agent_id", agentSlug)
        .is("superseded_by", null)
        .order("updated_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as AgentMemoryRow[];
    },
  });
}

export function useAgentEvidence(keteCode: string) {
  return useQuery({
    queryKey: ["agent-workspace", "evidence", keteCode],
    enabled: Boolean(keteCode),
    queryFn: async (): Promise<AgentEvidenceRow[]> => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select(
          "id, action_type, watermark, signed_by, signed_at, created_at, share_view_count, kete",
        )
        .eq("kete", keteCode)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as AgentEvidenceRow[];
    },
  });
}

export function useAgentPolicyHits(agentCode: string) {
  return useQuery({
    queryKey: ["agent-workspace", "policy-hits", agentCode],
    enabled: Boolean(agentCode),
    queryFn: async (): Promise<AgentToolUseRow[]> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("policies_checked")
        .eq("agent_code", agentCode)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        const list = (row.policies_checked ?? []) as string[];
        for (const p of list) {
          counts.set(p, (counts.get(p) ?? 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .map(([policy, count]) => ({ policy, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });
}
