// ════════════════════════════════════════════════════════════════════════
// cost-logger.ts — per-tenant, per-agent cost tracking
// ════════════════════════════════════════════════════════════════════════
// Writes one row to public.agent_cost_log per LLM invocation. Powers per-
// customer gross-margin analysis, usage caps, and Command Center observ-
// ability.
//
// Wired into supabase/functions/_shared/llm-call.ts — pass `meta` on
// LlmCallOptions and the call is logged automatically. Caller never needs
// to invoke logCost() directly.
//
// Failures are swallowed: cost logging MUST NEVER fail an agent run.
// ════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const USD_TO_NZD = 1.65;

// Rates per 1M tokens in USD. Keys must be the FULLY QUALIFIED model
// string passed to LlmCallOptions.model (e.g. "google/gemini-2.5-flash"),
// not the short form. Mirrors the prefix map in model-router.ts.
const MODEL_RATES_PER_MTOK_USD: Record<string, { input: number; output: number }> = {
  "anthropic/claude-opus-4-6":     { input: 15.0,  output: 75.0 },
  "anthropic/claude-sonnet-4-5":   { input:  3.0,  output: 15.0 },
  "anthropic/claude-haiku-4":      { input:  0.8,  output:  4.0 },
  "google/gemini-2.5-pro":         { input:  1.25, output:  5.0 },
  "google/gemini-2.5-flash":       { input:  0.075, output:  0.30 },
  "google/gemini-2.5-flash-lite":  { input:  0.075, output:  0.30 },
  "google/gemini-2.5-flash-image": { input:  0,    output:  0 },
  "google/gemini-3-flash-preview": { input:  0,    output:  0 },
  "google/gemini-3.1-pro-preview": { input:  1.25, output:  5.0 },
  "openai/gpt-5":                  { input:  3.0,  output: 12.0 },
  "openai/gpt-5-mini":              { input:  0.4,  output:  1.6 },
  "openai/gpt-5-nano":              { input:  0.1,  output:  0.4 },
  "openai/gpt-5.2":                 { input:  3.0,  output: 12.0 },
  "perplexity/sonar":               { input:  1.0,  output:  1.0 },
  "perplexity/sonar-pro":           { input:  3.0,  output: 15.0 },
};

function calculateCostNzd(model: string, tokensIn: number, tokensOut: number): number {
  const rate = MODEL_RATES_PER_MTOK_USD[model] ?? { input: 0, output: 0 };
  const usd = (tokensIn * rate.input + tokensOut * rate.output) / 1_000_000;
  return Math.round(usd * USD_TO_NZD * 1_000_000) / 1_000_000;
}

export interface CostEntry {
  tenantId: string;
  agentCode: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs?: number;
  requestId?: string;
  parentRequestId?: string;
  status?: "completed" | "error" | "timeout" | "cancelled";
  errorCode?: string;
}

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("[cost-logger] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required — logging disabled");
    return null;
  }
  _supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

/**
 * Write a single cost log row. Never throws — failures are logged to
 * stderr and swallowed so cost logging cannot break an agent response.
 */
export async function logCost(entry: CostEntry): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const cost_nzd = calculateCostNzd(entry.model, entry.tokensIn, entry.tokensOut);
    const { error } = await supabase.from("agent_cost_log").insert({
      tenant_id: entry.tenantId,
      agent_code: entry.agentCode,
      model: entry.model,
      tokens_in: entry.tokensIn,
      tokens_out: entry.tokensOut,
      cost_nzd,
      latency_ms: entry.latencyMs ?? null,
      request_id: entry.requestId ?? null,
      parent_request_id: entry.parentRequestId ?? null,
      status: entry.status ?? "completed",
      error_code: entry.errorCode ?? null,
    });
    if (error) {
      console.error("[cost-logger] insert failed", {
        agent: entry.agentCode,
        model: entry.model,
        error: error.message,
      });
    }
  } catch (err) {
    console.error("[cost-logger] unexpected error", err);
  }
}

/**
 * Pre-flight monthly cap check. Call from edge functions BEFORE expensive
 * LLM invocations. Returns true if the tenant has exceeded their cap.
 * Failures (no client, RPC error) fail OPEN — a metering blip must never
 * lock customers out of their own agents.
 */
export async function isOverMonthlyCap(
  tenantId: string,
  monthlyCapNzd: number = 250,
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { data, error } = await supabase.rpc("check_tenant_usage_cap", {
      p_tenant_id: tenantId,
      p_monthly_cap_nzd: monthlyCapNzd,
    });
    if (error) {
      console.error("[cost-logger] cap check failed", error);
      return false;
    }
    return data?.[0]?.is_over_cap ?? false;
  } catch {
    return false;
  }
}
