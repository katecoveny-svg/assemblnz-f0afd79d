// ═══════════════════════════════════════════════════════════════════════
// Level B Model Router — shared helper for resolving an agent's preferred
// model from the database (`agent_prompts.model_preference` keyed by
// case-insensitive `agent_name`). Falls through to a safe default if no
// preference is set, the table is unreachable, or the slug is unknown.
//
// Usage (inside an edge function):
//
//   import { resolveModel } from "../_shared/model-router.ts";
//   const model = await resolveModel("flux", supabase);
//   // → e.g. "google/gemini-3-flash-preview" or DEFAULT_MODEL
//
// When Iho Level C (full router) ships in `_shared/iho.ts`, this helper
// becomes a thin sub-call of that router. For now it is the only Level B
// resolver — DO NOT inline the lookup elsewhere.
// ═══════════════════════════════════════════════════════════════════════

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const DEFAULT_MODEL = "google/gemini-2.5-flash";

// Maps DB-stored short names ("gemini-2.5-flash") to fully-qualified
// gateway model strings ("google/gemini-2.5-flash"). Mirrors the prefix
// normaliser in agent-router/index.ts (Map A) so behaviour is consistent.
const PREFIX_MAP: Record<string, string> = {
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",
  "gemini-2.5-flash-image": "google/gemini-2.5-flash-image",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5-nano": "openai/gpt-5-nano",
  "gpt-5.2": "openai/gpt-5.2",
  "claude-sonnet-4-5": "anthropic/claude-sonnet-4-5",
};

function normalise(pref: string | null | undefined): string {
  if (!pref) return DEFAULT_MODEL;
  if (pref.includes("/")) return pref; // already fully qualified
  return PREFIX_MAP[pref] || `google/${pref}`;
}

/**
 * Resolve the preferred model for an agent slug.
 * - keteSlug: case-insensitive agent_name (e.g. "flux", "iho", "ARATAKI").
 * - supabase: a service-role or anon client (only `.from("agent_prompts").select` is used).
 *
 * If the lookup fails for any reason, returns DEFAULT_MODEL — never throws.
 */
export async function resolveModel(
  keteSlug: string,
  supabase: SupabaseClient,
): Promise<string> {
  if (!keteSlug) return DEFAULT_MODEL;
  try {
    const { data, error } = await supabase
      .from("agent_prompts")
      .select("model_preference")
      .ilike("agent_name", keteSlug)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (error || !data) return DEFAULT_MODEL;
    return normalise(data.model_preference);
  } catch {
    return DEFAULT_MODEL;
  }
}
