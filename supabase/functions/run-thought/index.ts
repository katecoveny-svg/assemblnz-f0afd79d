// ============================================================================
// run-thought — user-triggered single execution of a registered thought.
// ----------------------------------------------------------------------------
// POST { thought_id: uuid }   — Authorization: Bearer <user JWT>
//
// Sister to /ambient-agent-loop:
//   - the ambient loop is service-role, runs on cron, picks any due thoughts
//   - this endpoint is user-auth'd, runs ONE thought on demand, verifies
//     the caller owns the row before invoking the LLM
//
// Used by the Thoughts UI to fire a "Run now" action.
//
// Returns: { ok, run_id, output, kb_hits, memory_hits, duration_ms }
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const Body = z.object({ thought_id: z.string().uuid() });

const AGENT_MODEL: Record<string, { toolset: string; model: string; prompt: string }> = {
  toro:     { toolset: "core",     model: "openai/gpt-5", prompt: "You are Tōro, the Assembl family life navigator. Be warm, brief, practical." },
  manaaki:  { toolset: "manaaki",  model: "openai/gpt-5", prompt: "You are Manaaki, Assembl's hospitality kete agent. Tikanga-aware." },
  waihanga: { toolset: "waihanga", model: "openai/gpt-5", prompt: "You are Waihanga, Assembl's construction kete agent. Cite Building Act references." },
  auaha:    { toolset: "auaha",    model: "openai/gpt-5", prompt: "You are Auaha, Assembl's creative kete agent. Use macrons; avoid AI cliché." },
  pakihi:   { toolset: "pakihi",   model: "openai/gpt-5", prompt: "You are Pakihi, Assembl's small business kete agent. Cite legislation." },
  pikau:    { toolset: "pikau",    model: "openai/gpt-5", prompt: "You are Pikau, Assembl's freight & customs kete agent. Be precise with HS codes." },
};

interface KbSnippet { content: string; source?: string | null }
interface MemHit { summary?: string | null; content?: string | null }

async function loadKb(vec: number[], pack: string): Promise<KbSnippet[]> {
  try {
    const { data, error } = await adminDb.rpc("match_kb_knowledge" as never, {
      query_embedding: vec, agent_pack: pack, top_k: 4,
    } as never);
    if (error) return [];
    return (data as KbSnippet[]) ?? [];
  } catch { return []; }
}

async function loadMemory(userId: string, vec: number[]): Promise<MemHit[]> {
  try {
    const { data, error } = await adminDb.rpc("match_agent_memory", {
      p_tenant_id: null, p_user_id: userId,
      p_query_embedding: vec as unknown as string,
      p_match_count: 6, p_min_similarity: 0.6,
    });
    if (error) return [];
    return (data as MemHit[]) ?? [];
  } catch { return []; }
}

function buildContextBlock(snippets: KbSnippet[], memories: MemHit[]): string {
  const out: string[] = [];
  if (snippets.length) {
    out.push("[Live knowledge — current as of this turn]\n" + snippets
      .map((s, i) => `${i + 1}.${s.source ? ` (${s.source})` : ""} ${String(s.content ?? "").trim()}`)
      .join("\n"));
  }
  if (memories.length) {
    out.push("[Remembered context for this user]\n" + memories
      .map((m, i) => `${i + 1}. ${String(m.summary ?? m.content ?? "").trim()}`)
      .join("\n"));
  }
  if (!out.length) return "";
  return "\n\n" + out.join("\n\n") + "\n\nGround your reply in the above when relevant.";
}

async function callGateway(systemPrompt: string, userPrompt: string, model: string) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { ok: false as const, status: r.status, error: `gateway_${r.status}: ${body.slice(0, 240)}` };
  }
  const json = await r.json() as { choices?: { message?: { content?: string } }[] };
  return { ok: true as const, text: json.choices?.[0]?.message?.content ?? "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 1. Auth — verify the caller's JWT and capture their user_id.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  // 2. Body validation
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "thought_id (uuid) required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. Load + ownership check (RLS would do this on user client too, but
  //    we use admin here so we can also bump last_run_at in one call).
  const { data: thought, error: tErr } = await adminDb
    .from("agent_thoughts")
    .select("id, user_id, agent_id, prompt, enabled")
    .eq("id", parsed.data.thought_id)
    .maybeSingle();
  if (tErr || !thought) {
    return new Response(JSON.stringify({ error: "Thought not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (thought.user_id !== userId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!thought.enabled) {
    return new Response(JSON.stringify({ error: "Thought is disabled" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const spec = AGENT_MODEL[thought.agent_id];
  if (!spec) {
    return new Response(JSON.stringify({ error: `Unknown agent: ${thought.agent_id}` }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const start = Date.now();
  let kbHits = 0, memHits = 0, contextBlock = "";

  if (GEMINI_API_KEY) {
    const vec = await embedText(thought.prompt, GEMINI_API_KEY, 768);
    if (vec) {
      const [kb, mem] = await Promise.all([
        loadKb(vec, spec.toolset),
        loadMemory(userId, vec),
      ]);
      kbHits = kb.length; memHits = mem.length;
      contextBlock = buildContextBlock(kb, mem);
    }
  }

  const result = await callGateway(spec.prompt + contextBlock, thought.prompt, spec.model);
  const ms = Date.now() - start;

  // Mark the thought as having just run so the ambient loop respects the
  // user's manual trigger when computing next_due_at.
  await adminDb
    .from("agent_thoughts")
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", thought.id);

  if (!result.ok) {
    const { data: errRun } = await adminDb
      .from("agent_thought_runs")
      .insert({
        thought_id: thought.id, user_id: userId, agent_id: thought.agent_id,
        status: result.status === 429 ? "denied" : "error",
        error_message: result.error,
        kb_hits: kbHits, memory_hits: memHits, duration_ms: ms,
      })
      .select("id")
      .single();
    return new Response(JSON.stringify({
      ok: false,
      run_id: errRun?.id ?? null,
      error: result.error,
    }), {
      status: result.status === 429 ? 429 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: run } = await adminDb
    .from("agent_thought_runs")
    .insert({
      thought_id: thought.id, user_id: userId, agent_id: thought.agent_id,
      output: result.text,
      status: "success",
      kb_hits: kbHits, memory_hits: memHits, duration_ms: ms,
    })
    .select("id")
    .single();

  return new Response(JSON.stringify({
    ok: true,
    run_id: run?.id ?? null,
    output: result.text,
    kb_hits: kbHits,
    memory_hits: memHits,
    duration_ms: ms,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
