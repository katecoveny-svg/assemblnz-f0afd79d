import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * COUNCIL — Multi-agent answer.
 * One question → fan-out to 2-4 relevant specialists in parallel,
 * each grounded in shared_context + business_memory, then return all answers
 * plus a synthesised summary. Powers /workflows page and the "Ask the Council"
 * button in chat & SMS.
 */

interface CouncilRequest {
  question: string;
  userId?: string;
  /** Optional: explicit agent IDs. If omitted, classifier picks 3. */
  agentIds?: string[];
  /** Optional: max number of agents to consult (default 3, max 5) */
  maxAgents?: number;
  /** Optional: include a synth summary written by IHO at the end */
  synthesise?: boolean;
}

// ─── Lightweight intent classifier (mirrors tnz-inbound for parity) ─────
function pickAgents(question: string, max = 3): { id: string; name: string; kete: string }[] {
  const lower = question.toLowerCase();
  const candidates: { id: string; name: string; kete: string; score: number }[] = [];

  const score = (regex: RegExp, id: string, name: string, kete: string, weight = 1) => {
    const matches = lower.match(regex);
    if (matches) candidates.push({ id, name, kete, score: matches.length * weight });
  };

  // Industry kete
  score(/\b(food|menu|hospitality|hotel|guest|booking|alcohol|cafe|restaurant)\b/g, "aura", "AURA", "manaaki");
  score(/\b(build|construct|safety|consent|site|scaffold|hswa|lbp)\b/g, "arc", "ARC", "waihanga");
  score(/\b(safety|hazard|worksafe|ppe|toolbox|incident)\b/g, "arai", "ĀRAI", "waihanga");
  score(/\b(consent|building\s?act|ccc|producer\s?statement)\b/g, "whakaae", "WHAKAAĒ", "waihanga");
  score(/\b(brand|design|marketing|campaign|creative|content|social)\b/g, "prism", "PRISM", "auaha");
  score(/\b(copy|headline|tagline|email|newsletter)\b/g, "verse", "VERSE", "auaha");
  score(/\b(vehicle|car|fleet|wof|rego|ruc|workshop)\b/g, "ember", "EMBER", "arataki");
  score(/\b(ev|electric|battery|charging)\b/g, "spark", "SPARK", "arataki");
  score(/\b(freight|customs|import|export|shipping|hs\s?code|tariff)\b/g, "gateway", "GATEWAY", "pikau");
  score(/\b(biosecurity|mpi|fumigat|quarantine)\b/g, "sentinel", "SENTINEL", "pikau");
  score(/\b(family|kids|school|trip|holiday|meal|grocery|whānau|whanau)\b/g, "helm", "TŌRO", "toroa");
  score(/\b(farm|dairy|crop|livestock|harvest|fonterra|orchard)\b/g, "harvest", "TŌRO", "toro");
  score(/\b(property|landlord|tenant|rent|lease|tenancy|healthy\s?homes)\b/g, "haven", "HAVEN", "whenua");

  // Cross-cutting specialists (very common)
  score(/\b(tax|gst|ird|paye|payroll|invoice|accounting)\b/g, "ledger", "LEDGER", "pakihi", 1.2);
  score(/\b(law|legal|contract|deed|agreement|terms)\b/g, "anchor", "ANCHOR", "pakihi", 1.2);
  score(/\b(employ|hr|hiring|leave|wage|kiwisaver|recruit)\b/g, "aroha-core", "AROHA", "shared", 1.1);
  score(/\b(privacy|data|breach|pii|gdpr)\b/g, "privacy", "PRIVACY", "shared");
  score(/\b(security|cyber|password|mfa|encryption)\b/g, "shield-agent", "SHIELD", "shared");
  score(/\b(te\s?reo|māori|maori|tikanga|karakia|iwi|hapū|hapu)\b/g, "tereo", "Te Reo Specialist", "shared");
  score(/\b(compliance|policy|legislation|regulation|act\b)\b/g, "kahu", "KAHU", "shared");
  score(/\b(assembl|pricing|onboard|demo|kete)\b/g, "echo", "ECHO", "assembl", 1.3);

  // De-dupe by id, keep highest score, sort, then take top N
  const byId = new Map<string, { id: string; name: string; kete: string; score: number }>();
  for (const c of candidates) {
    const existing = byId.get(c.id);
    if (!existing || existing.score < c.score) byId.set(c.id, c);
  }
  const sorted = [...byId.values()].sort((a, b) => b.score - a.score);

  // Always include LEDGER + ANCHOR for safety net if question is general/business
  if (sorted.length < 2) {
    if (!byId.has("ledger")) sorted.push({ id: "ledger", name: "LEDGER", kete: "pakihi", score: 0 });
    if (!byId.has("anchor")) sorted.push({ id: "anchor", name: "ANCHOR", kete: "pakihi", score: 0 });
  }

  return sorted.slice(0, Math.min(max, 5)).map(({ id, name, kete }) => ({ id, name, kete }));
}

// ─── Single-agent call (parallel-safe) ──────────────────────────────────
async function askOne(
  agent: { id: string; name: string; kete: string },
  question: string,
  sharedBlock: string,
  apiKey: string,
  systemPromptDb: string | null
): Promise<{ agentId: string; agentName: string; kete: string; answer: string; ms: number }> {
  const t0 = Date.now();
  const baseSystem = systemPromptDb || `You are ${agent.name}, a ${agent.kete} specialist at Assembl (NZ). Give a concise, expert answer in your domain. Use NZ English and cite legislation where relevant. Max 200 words.`;

  const fullSystem = baseSystem + sharedBlock + `\n\nCOUNCIL MODE: You are one of several specialists answering the same question in parallel. Stay in YOUR lane. Do not repeat what other kete would cover. Be concise.`;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystem },
          { role: "user", content: question },
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { agentId: agent.id, agentName: agent.name, kete: agent.kete, answer: `[${agent.name} unavailable: ${resp.status}] ${txt.slice(0, 100)}`, ms: Date.now() - t0 };
    }

    const data = await resp.json();
    const answer = data.choices?.[0]?.message?.content || "[no response]";
    return { agentId: agent.id, agentName: agent.name, kete: agent.kete, answer, ms: Date.now() - t0 };
  } catch (e) {
    return { agentId: agent.id, agentName: agent.name, kete: agent.kete, answer: `[error: ${e instanceof Error ? e.message : String(e)}]`, ms: Date.now() - t0 };
  }
}

// ─── Synthesiser (IHO summarises all agent answers) ─────────────────────
async function synthesise(question: string, answers: { agentName: string; kete: string; answer: string }[], apiKey: string): Promise<string> {
  const sys = `You are IHO, the Assembl Brain. Multiple specialists have answered the same user question. Your job: weave their perspectives into ONE crisp practical summary (max 120 words, NZ English). Highlight any conflicts. Do not repeat their full answers. Bullet the 3 most actionable next steps.`;

  const ctx = answers.map(a => `--- ${a.agentName} (${a.kete}) ---\n${a.answer}`).join("\n\n");

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Question: ${question}\n\n${ctx}` },
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
    });
    if (!resp.ok) return "(synth unavailable)";
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "(empty synth)";
  } catch {
    return "(synth error)";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: CouncilRequest = await req.json();
    if (!body.question?.trim()) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ── Pick agents ──
    let chosen: { id: string; name: string; kete: string }[];
    if (body.agentIds?.length) {
      // Resolve names from agent_prompts
      const { data: rows } = await sb
        .from("agent_prompts")
        .select("agent_name, display_name, pack")
        .in("agent_name", body.agentIds);
      chosen = (rows || []).map(r => ({ id: r.agent_name, name: (r.display_name || r.agent_name).toUpperCase(), kete: r.pack || "shared" }));
    } else {
      chosen = pickAgents(body.question, body.maxAgents || 3);
    }

    if (chosen.length === 0) {
      return new Response(JSON.stringify({ error: "could not pick any agents for this question" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Load shared_context for the user (one-shot) ──
    let sharedBlock = "";
    if (body.userId) {
      const { data: ctxRows } = await sb
        .from("shared_context")
        .select("context_key, context_value, source_agent")
        .eq("user_id", body.userId)
        .limit(30);
      if (ctxRows?.length) {
        sharedBlock = `\n\n[BUSINESS PROFILE — shared across all agents]\n` +
          ctxRows.map(r => `• ${r.context_key}: ${JSON.stringify(r.context_value)} (from ${r.source_agent || "unknown"})`).join("\n");
      }
    }

    // ── Load all chosen agents' system prompts in one query ──
    const { data: prompts } = await sb
      .from("agent_prompts")
      .select("agent_name, system_prompt")
      .in("agent_name", chosen.map(c => c.id));
    const promptMap = new Map((prompts || []).map(p => [p.agent_name, p.system_prompt as string]));

    // ── Fan-out in parallel ──
    const t0 = Date.now();
    const answers = await Promise.all(
      chosen.map(a => askOne(a, body.question, sharedBlock, apiKey, promptMap.get(a.id) || null))
    );

    // ── Optional synthesis ──
    let summary: string | undefined;
    if (body.synthesise !== false && answers.length > 1) {
      summary = await synthesise(body.question, answers, apiKey);
    }

    // ── Log to agent_triggers for visibility ──
    if (body.userId) {
      try {
        await sb.from("agent_triggers").insert({
          user_id: body.userId,
          trigger_agent: "council",
          trigger_event: "multi_agent_answer",
          target_agent: chosen.map(c => c.id).join(","),
          target_action: "council_answer",
          payload: { question: body.question.slice(0, 500), agents: chosen.map(c => c.name), durationMs: Date.now() - t0 },
        });
      } catch { /* non-blocking */ }
    }

    return new Response(JSON.stringify({
      success: true,
      question: body.question,
      agents: chosen,
      answers,
      summary,
      totalMs: Date.now() - t0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("council error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
