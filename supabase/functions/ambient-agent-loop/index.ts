// ============================================================================
// ambient-agent-loop — runs standing prompts on a pg_cron schedule.
// ----------------------------------------------------------------------------
// Picks up to 5 due rows from public.agent_thoughts via pick_due_thoughts(),
// embeds each prompt, pulls relevant KB + per-user memory, calls the
// Lovable AI Gateway, and writes the result to agent_thought_runs.
//
// Service-role only. No JWT / no auth. Call surface (POST):
//   { batch_size?: number }   — defaults to 5; capped at 10
//
// Cost guardrails:
//   - batch_size hard cap of 10 per tick
//   - cron schedule = every 1 minute (so worst-case 600 thoughts/hour total)
//   - per-thought cadence_minutes is user-controlled but DB-checked >= 5
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";
import {
  agentSpecFor,
  buildAmbientPrompt,
  fallbackAmbientDraft,
  inferKeteForAgent,
  isAmbientAction,
  isKeteSlug,
  requiredScopesForAmbientRun,
} from "../_shared/ambient-agent-contract.ts";
import {
  buildLiveDataContext,
  buildLiveDataSnapshot,
  type LiveDataScope,
} from "../_shared/live-data-context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const KB_TOP_K = 4;
const MEM_TOP_K = 6;
const MEM_MIN_SIM = 0.6;

interface KbSnippet { content: string; source?: string | null }
interface MemHit { summary?: string | null; content?: string | null }

async function loadKb(vec: number[], pack: string): Promise<KbSnippet[]> {
  try {
    const { data, error } = await adminDb.rpc("match_kb_knowledge" as never, {
      query_embedding: vec, agent_pack: pack, top_k: KB_TOP_K,
    } as never);
    if (error) { console.warn("[ambient] kb error", error.message); return []; }
    return (data as KbSnippet[]) ?? [];
  } catch (e) { console.warn("[ambient] kb exception", (e as Error).message); return []; }
}

async function loadMemory(userId: string, tenantId: string | null, vec: number[]): Promise<MemHit[]> {
  try {
    const { data, error } = await adminDb.rpc("match_agent_memory", {
      p_tenant_id: tenantId, p_user_id: userId,
      p_query_embedding: vec as unknown as string,
      p_match_count: MEM_TOP_K, p_min_similarity: MEM_MIN_SIM,
    });
    if (error) { console.warn("[ambient] mem error", error.message); return []; }
    return (data as MemHit[]) ?? [];
  } catch (e) { console.warn("[ambient] mem exception", (e as Error).message); return []; }
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

async function callGateway(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string; status: number }> {
  if (!LOVABLE_API_KEY) {
    return { ok: false, status: 503, error: "gateway_not_configured" };
  }
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
    return { ok: false, status: r.status, error: `gateway_${r.status}: ${body.slice(0, 240)}` };
  }
  const json = await r.json() as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? "";
  return { ok: true, text };
}

interface DueThought {
  id: string;
  user_id: string;
  tenant_id: string | null;
  agent_id: string;
  kete: string | null;
  action: string | null;
  title: string;
  prompt: string;
  metadata: Record<string, unknown> | null;
}

async function processOne(t: DueThought): Promise<{ id: string; ok: boolean; ms: number }> {
  const start = Date.now();
  const kete = isKeteSlug(t.kete) ? t.kete : inferKeteForAgent(t.agent_id);
  const action = isAmbientAction(t.action) ? t.action : "ambient-thought";
  const spec = agentSpecFor(kete, t.agent_id);
  const tenantId = t.tenant_id ?? undefined;
  const liveReq = new Request("https://ambient.local/loop", {
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "X-Assembl-Trace-Id": `ambient-${t.id}`,
    },
  });
  const liveContext = await buildLiveDataContext(liveReq, {
    agentCode: spec.slug,
    kete,
    tenantId,
    requiredScopes: [...requiredScopesForAmbientRun(kete, action)] as LiveDataScope[],
  });
  const liveSnapshot = await buildLiveDataSnapshot(liveContext, {
    kete,
    query: t.prompt,
    include: [...requiredScopesForAmbientRun(kete, action)] as LiveDataScope[],
  });

  let kbHits = 0, memHits = 0;
  let contextBlock = "";
  if (GEMINI_API_KEY) {
    const vec = await embedText(t.prompt, GEMINI_API_KEY, 768);
    if (vec) {
      const [kb, mem] = await Promise.all([
        loadKb(vec, kete),
        loadMemory(t.user_id, t.tenant_id, vec),
      ]);
      kbHits = kb.length; memHits = mem.length;
      contextBlock = buildContextBlock(kb, mem);
    }
  }

  const ambientPrompt = buildAmbientPrompt({
    action,
    tenant_id: t.tenant_id ?? "00000000-0000-0000-0000-000000000001",
    kete,
    agent: spec.slug,
    phase: spec.phase,
    prompt: t.prompt,
    live_context: liveSnapshot,
    metadata: t.metadata ?? {},
  }, spec);
  const userPrompt = [
    ambientPrompt,
    "",
    "[Live data snapshot]",
    JSON.stringify(liveSnapshot).slice(0, 12000),
  ].join("\n");
  const result = await callGateway(spec.systemPrompt + contextBlock, userPrompt, "openai/gpt-5");
  const ms = Date.now() - start;

  if (!result.ok) {
    await adminDb.from("agent_thought_runs").insert({
      thought_id: t.id, user_id: t.user_id, agent_id: t.agent_id,
      tenant_id: t.tenant_id,
      kete,
      action,
      status: result.status === 429 ? "denied" : "error",
      error_message: result.error,
      kb_hits: kbHits, memory_hits: memHits,
      duration_ms: ms,
      output_metadata: { live_context: liveSnapshot, trace_id: liveContext.identity.traceId },
    });
    return { id: t.id, ok: false, ms };
  }

  const fallback = fallbackAmbientDraft({
    action,
    tenant_id: t.tenant_id ?? "00000000-0000-0000-0000-000000000001",
    kete,
    agent: spec.slug,
    phase: spec.phase,
    prompt: t.prompt,
    live_context: liveSnapshot,
    metadata: t.metadata ?? {},
  }, spec);

  await adminDb.from("agent_thought_runs").insert({
    thought_id: t.id, user_id: t.user_id, agent_id: t.agent_id,
    tenant_id: t.tenant_id,
    kete,
    action,
    output: result.text,
    status: "success",
    kb_hits: kbHits, memory_hits: memHits,
    duration_ms: ms,
    output_metadata: {
      title: fallback.title,
      citations: fallback.citations,
      live_context: liveSnapshot,
      trace_id: liveContext.identity.traceId,
    },
  });
  return { id: t.id, ok: true, ms };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const start = Date.now();

  // Optional batch_size in body, capped at 10.
  let batchSize = 5;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.batch_size === "number") {
      batchSize = Math.max(1, Math.min(10, Math.floor(body.batch_size)));
    }
  } catch { /* ignore */ }

  // Pull + lock due thoughts in one round-trip.
  const { data: due, error } = await adminDb.rpc("pick_due_thoughts", { _limit: batchSize });
  if (error) {
    console.error("[ambient] pick_due_thoughts error", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const thoughts = (due as DueThought[]) ?? [];
  if (!thoughts.length) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Process serially to keep memory low and stay polite to the gateway.
  // Five thoughts × ~3s each = ~15s well within the function's 60s ceiling.
  const results: { id: string; ok: boolean; ms: number }[] = [];
  for (const t of thoughts) {
    try {
      results.push(await processOne(t));
    } catch (e) {
      const ms = Date.now() - start;
      console.error("[ambient] processOne crashed", (e as Error).message);
      await adminDb.from("agent_thought_runs").insert({
        thought_id: t.id, user_id: t.user_id, agent_id: t.agent_id,
        tenant_id: t.tenant_id,
        kete: isKeteSlug(t.kete) ? t.kete : inferKeteForAgent(t.agent_id),
        action: isAmbientAction(t.action) ? t.action : "ambient-thought",
        status: "error",
        error_message: (e as Error).message.slice(0, 400),
        duration_ms: ms,
      });
      results.push({ id: t.id, ok: false, ms });
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    processed: results.length,
    succeeded: results.filter((r) => r.ok).length,
    duration_ms: Date.now() - start,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
