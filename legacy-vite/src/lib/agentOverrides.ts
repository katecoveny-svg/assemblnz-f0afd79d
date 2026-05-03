// ═══════════════════════════════════════════════════════════════
// Agent overrides — admin-managed catalog layer.
// Loads rows from `agent_overrides` and merges them on top of the
// hard-coded agents in src/data/agents.ts. Code stays the source of
// defaults; the DB row wins when present (override-on-top model).
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";
import type { Agent } from "@/data/agents";

export interface AgentOverride {
  agent_id: string;
  name: string | null;
  role: string | null;
  tagline: string | null;
  pack: string | null;
  is_active: boolean;
  traits: string[];
  expertise: string[];
  starters: string[];
  updated_at?: string;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export function normalizeOverride(row: Record<string, unknown>): AgentOverride {
  return {
    agent_id: String(row.agent_id),
    name: (row.name as string) ?? null,
    role: (row.role as string) ?? null,
    tagline: (row.tagline as string) ?? null,
    pack: (row.pack as string) ?? null,
    is_active: row.is_active !== false,
    traits: toStringArray(row.traits),
    expertise: toStringArray(row.expertise),
    starters: toStringArray(row.starters),
    updated_at: (row.updated_at as string) ?? undefined,
  };
}

export async function fetchAgentOverrides(): Promise<Record<string, AgentOverride>> {
  const { data, error } = await supabase
    .from("agent_overrides")
    .select("*");
  if (error) {
    console.warn("[agentOverrides] fetch failed", error.message);
    return {};
  }
  const map: Record<string, AgentOverride> = {};
  for (const row of data ?? []) {
    const o = normalizeOverride(row as Record<string, unknown>);
    map[o.agent_id] = o;
  }
  return map;
}

/** Merge a single override on top of a code-defined agent. Pure. */
export function mergeAgentOverride(agent: Agent, override?: AgentOverride): Agent {
  if (!override) return agent;
  return {
    ...agent,
    name: override.name?.trim() ? override.name : agent.name,
    role: override.role?.trim() ? override.role : agent.role,
    tagline: override.tagline?.trim() ? override.tagline : agent.tagline,
    pack: override.pack?.trim() ? override.pack : agent.pack,
    traits: override.traits.length > 0 ? override.traits : agent.traits,
    expertise: override.expertise.length > 0 ? override.expertise : agent.expertise,
    starters: override.starters.length > 0 ? override.starters : agent.starters,
  };
}

export async function upsertAgentOverride(
  override: Omit<AgentOverride, "updated_at">,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("agent_overrides").upsert(
    {
      agent_id: override.agent_id,
      name: override.name,
      role: override.role,
      tagline: override.tagline,
      pack: override.pack,
      is_active: override.is_active,
      traits: override.traits,
      expertise: override.expertise,
      starters: override.starters,
    },
    { onConflict: "agent_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAgentOverride(agentId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("agent_overrides").delete().eq("agent_id", agentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
