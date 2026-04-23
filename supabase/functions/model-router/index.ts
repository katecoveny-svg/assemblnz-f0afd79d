import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEFAULT_MODEL = "google/gemini-2.5-flash";
const PROVIDER_PREFIXES = ["google/", "anthropic/", "openai/", "meta/", "deepseek/", "qwen/", "sambanova/", "perplexity/", "mistral/", "cohere/", "xai/"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalise(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return DEFAULT_MODEL;
  for (const prefix of PROVIDER_PREFIXES) {
    if (trimmed.startsWith(prefix)) return trimmed;
  }
  return `google/${trimmed}`;
}

async function resolveModel(callerSlug: string, supabase: ReturnType<typeof createClient>) {
  const slug = callerSlug.trim().toLowerCase();
  if (!slug) return { model: DEFAULT_MODEL, agentName: null, isFallback: true, fallbackReason: "empty_slug" };

  const { data, error } = await supabase
    .from("agent_prompts")
    .select("agent_name, model_preference")
    .eq("is_active", true)
    .eq("agent_name", slug)
    .maybeSingle();

  let model: string, agentName: string | null = null, isFallback = false, fallbackReason: string | null = null;

  if (error) {
    model = DEFAULT_MODEL; isFallback = true; fallbackReason = `db_error: ${error.message}`;
  } else if (!data) {
    model = DEFAULT_MODEL; isFallback = true; fallbackReason = `no_match_for_slug: ${slug}`;
  } else {
    agentName = data.agent_name;
    if (data.model_preference) { model = normalise(data.model_preference); }
    else { model = DEFAULT_MODEL; isFallback = true; fallbackReason = "agent_has_no_model_preference"; }
  }

  supabase.from("routing_log").insert({
    caller_slug: slug, resolved_agent_name: agentName,
    resolved_model: model, is_fallback: isFallback, fallback_reason: fallbackReason,
  }).then(({ error: logErr }) => { if (logErr) console.error("routing_log insert failed:", logErr.message); });

  return { model, agentName, isFallback, fallbackReason };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json();
    const slug = body?.slug ?? body?.agent ?? body?.caller;
    if (!slug || typeof slug !== "string") return json({ error: "missing_slug", hint: 'POST { "slug": "toro" }' }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_misconfigured" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const result = await resolveModel(slug, supabase);

    return json({ ok: true, slug: slug.trim().toLowerCase(), resolved_model: result.model,
      agent_name: result.agentName, is_fallback: result.isFallback, fallback_reason: result.fallbackReason });
  } catch (err) {
    return json({ error: "unexpected", detail: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
