// ═══════════════════════════════════════════════════════════════════════
// Level B Model Router — shared helper for resolving an agent's preferred
// model from the database (`agent_prompts.model_preference` keyed by
// case-insensitive `agent_name`). Falls through to a safe default if no
// preference is set, the table is unreachable, or the slug is unknown.
//
// Every resolution — successful or fallback — is logged fire-and-forget
// to `routing_log` so we can audit which kete actually have preferences
// wired up vs. which are silently using DEFAULT_MODEL.
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

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

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

// Fire-and-forget audit log. Never blocks, never throws.
function logRouting(
  supabase: SupabaseClient,
  keteSlug: string,
  agentName: string,
  selectedModel: string,
  confidence: number,
): void {
  supabase
    .from("routing_log")
    .insert({
      request_id: crypto.randomUUID(),
      user_input: "[model_selection]",
      detected_intent: null,
      selected_kete: keteSlug,
      selected_agent: agentName,
      selected_model: selectedModel,
      confidence_score: confidence,
      routing_time_ms: 0,
    })
    .then(({ error: logError }: { error: { message: string } | null }) => {
      if (logError) {
        console.error("[model-router] routing_log insert failed:", logError.message);
      }
    });
}

/**
 * Resolve the preferred model for an agent slug.
 * - keteSlug: case-insensitive agent_name (e.g. "flux", "iho", "ARATAKI").
 * - supabase: a service-role or anon client. Used for both the lookup
 *   and the fire-and-forget routing_log insert.
 *
 * If the lookup fails for any reason, returns DEFAULT_MODEL — never throws.
 * Every resolution path (hit, miss, error) writes one row to routing_log.
 */
export async function resolveModel(
  keteSlug: string,
  supabase: SupabaseClient,
): Promise<string> {
  if (!keteSlug) {
    logRouting(supabase, "[empty]", "[empty]", DEFAULT_MODEL, 0.3);
    return DEFAULT_MODEL;
  }
  try {
    const { data, error } = await supabase
      .from("agent_prompts")
      .select("agent_name, model_preference")
      .ilike("agent_name", keteSlug)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    // Lookup failed or no row — log fallback at low confidence.
    if (error || !data) {
      logRouting(supabase, keteSlug, keteSlug, DEFAULT_MODEL, 0.3);
      return DEFAULT_MODEL;
    }

    // Successful resolution — log at full confidence with stored agent_name casing.
    const selectedModel = normalise(data.model_preference);
    const confidence = data.model_preference ? 1.0 : 0.3; // null preference = soft fallback
    logRouting(supabase, keteSlug, data.agent_name ?? keteSlug, selectedModel, confidence);
    return selectedModel;
  } catch {
    logRouting(supabase, keteSlug, keteSlug, DEFAULT_MODEL, 0.3);
    return DEFAULT_MODEL;
  }
}
