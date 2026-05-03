import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hooks for the agent_thoughts table — the standing prompts the
 * /ambient-agent-loop edge function picks up on a cron schedule.
 *
 * Schema (locked by 20260425145148_ambient_agent_thoughts.sql):
 *   agent_thoughts(id, user_id, agent_id, title, prompt,
 *                  cadence_minutes, enabled, last_run_at, next_due_at,
 *                  created_at, updated_at)
 *   agent_thought_runs(id, thought_id, user_id, agent_id, output,
 *                      kb_hits, memory_hits, duration_ms, status,
 *                      error_message, created_at)
 *
 * Reads/writes go through the user-scoped supabase client; RLS
 * (auth.uid() = user_id) enforces ownership server-side.
 */

export interface AgentThought {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  prompt: string;
  cadence_minutes: number;
  enabled: boolean;
  last_run_at: string | null;
  next_due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentThoughtRun {
  id: string;
  thought_id: string;
  user_id: string;
  agent_id: string;
  output: string | null;
  kb_hits: number;
  memory_hits: number;
  duration_ms: number | null;
  status: "success" | "error" | "denied";
  error_message: string | null;
  created_at: string;
}

const KEYS = {
  list: ["agent-thoughts"] as const,
  runs: (thoughtId: string) => ["agent-thought-runs", thoughtId] as const,
};

// ── Query ────────────────────────────────────────────────────────────────

export function useThoughts() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: async (): Promise<AgentThought[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("agent_thoughts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AgentThought[];
    },
    refetchInterval: 30_000,
  });
}

export function useThoughtRuns(thoughtId: string | null, limit = 10) {
  return useQuery({
    queryKey: thoughtId ? [...KEYS.runs(thoughtId), limit] : ["agent-thought-runs:none"],
    enabled: Boolean(thoughtId),
    queryFn: async (): Promise<AgentThoughtRun[]> => {
      if (!thoughtId) return [];
      const { data, error } = await supabase
        .from("agent_thought_runs")
        .select("*")
        .eq("thought_id", thoughtId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AgentThoughtRun[];
    },
  });
}

// ── Mutations ────────────────────────────────────────────────────────────

interface CreateThoughtInput {
  agent_id: string;
  title: string;
  prompt: string;
  cadence_minutes: number;
}

export function useCreateThought() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateThoughtInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required to register a thought.");
      const { data, error } = await supabase
        .from("agent_thoughts")
        .insert({
          user_id: user.id,
          agent_id: input.agent_id,
          title: input.title,
          prompt: input.prompt,
          cadence_minutes: input.cadence_minutes,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as AgentThought;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useUpdateThought() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Pick<AgentThought, "title" | "prompt" | "cadence_minutes" | "enabled">> }) => {
      const { data, error } = await supabase
        .from("agent_thoughts")
        .update(input.patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as AgentThought;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useDeleteThought() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agent_thoughts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

/** Fire a thought immediately via the /run-thought edge function. */
export function useRunThoughtNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (thoughtId: string) => {
      const { data, error } = await supabase.functions.invoke("run-thought", {
        body: { thought_id: thoughtId },
      });
      if (error) throw error;
      const result = data as {
        ok: boolean; run_id: string | null; output?: string;
        kb_hits?: number; memory_hits?: number; duration_ms?: number; error?: string;
      };
      if (!result.ok) throw new Error(result.error || "Run failed");
      return result;
    },
    onSuccess: (_, thoughtId) => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.runs(thoughtId) });
    },
  });
}
