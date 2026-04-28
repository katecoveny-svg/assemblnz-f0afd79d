// RAG v1 Pilot Validator — runs scenarios end-to-end through `chat`
// so the real RAG grounding + Mana verification fire. Scores must_cite,
// must_flag and hard_fails, then persists to rag_pilot_runs.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Scenario {
  scenario_id: string;
  agent_id: string;
  kete: string;
  category: string;
  weight: string;
  title: string;
  prompt: string;
  must_cite: string[];
  must_flag: string[];
  hard_fails: string[];
  pass_criteria: string | null;
}

// ----- Scoring -------------------------------------------------------------

function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function fuzzyContains(haystack: string, needle: string): boolean {
  const H = normalise(haystack);
  const N = normalise(needle);
  if (!N) return false;
  if (H.includes(N)) return true;
  const tokens = N.split(" ").filter((t) => t.length > 2);
  if (tokens.length < 2) return false;
  let cursor = 0, firstIdx = -1;
  for (const t of tokens) {
    const idx = H.indexOf(t, cursor);
    if (idx === -1) return false;
    if (firstIdx === -1) firstIdx = idx;
    if (idx - firstIdx > 250) return false;
    cursor = idx + t.length;
  }
  return true;
}

function score(scenario: Scenario, response: string) {
  const must_cite_hits: string[] = [];
  const must_cite_misses: string[] = [];
  const must_flag_hits: string[] = [];
  const must_flag_misses: string[] = [];
  const hard_fails_triggered: string[] = [];

  for (const c of scenario.must_cite) {
    (fuzzyContains(response, c) ? must_cite_hits : must_cite_misses).push(c);
  }
  for (const f of scenario.must_flag) {
    (fuzzyContains(response, f) ? must_flag_hits : must_flag_misses).push(f);
  }
  for (const hf of scenario.hard_fails) {
    try {
      const re = new RegExp(hf, "i");
      if (re.test(response)) hard_fails_triggered.push(hf);
    } catch {
      if (response.toLowerCase().includes(hf.toLowerCase())) hard_fails_triggered.push(hf);
    }
  }

  const cite_coverage = scenario.must_cite.length === 0 ? 1 : must_cite_hits.length / scenario.must_cite.length;
  const flag_coverage = scenario.must_flag.length === 0 ? 1 : must_flag_hits.length / scenario.must_flag.length;
  const pass = hard_fails_triggered.length === 0 && cite_coverage >= 0.5 && flag_coverage >= 0.6;

  return {
    must_cite_hits, must_cite_misses,
    must_flag_hits, must_flag_misses,
    hard_fails_triggered,
    cite_coverage, flag_coverage,
    pass,
  };
}

// ----- Call chat fn end-to-end --------------------------------------------

async function callChatAgent(
  scenario: Scenario,
  authHeader: string,
  model?: string,
): Promise<{ text: string; sources: unknown[]; confidence: string | null; mana: string | null; latency_ms: number; modelUsed: string }> {
  const t0 = Date.now();
  const url = `${SUPABASE_URL}/functions/v1/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      agentId: scenario.agent_id,
      messages: [{ role: "user", content: scenario.prompt }],
      model,
      testMode: true,
    }),
  });
  const latency_ms = Date.now() - t0;
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`chat ${res.status}: ${errTxt.slice(0, 400)}`);
  }
  const json = await res.json();
  const text: string = json?.message ?? json?.response ?? json?.text ?? json?.choices?.[0]?.message?.content ?? "";
  const grounding = json?.grounding ?? {};
  return {
    text,
    sources: Array.isArray(grounding?.sources) ? grounding.sources : [],
    confidence: grounding?.confidence_signal ?? null,
    mana: grounding?.verification?.status ?? grounding?.mana_verdict ?? null,
    latency_ms,
    modelUsed: json?.model_used ?? json?.model ?? "unknown",
  };
}

// ----- Handler -------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return json({ error: "Missing Authorization" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(jwt);
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const {
      agent_ids,            // optional: ['apex','aura','privacy-lead']
      scenario_ids,         // optional: explicit list
      categories,           // optional: ['must_cite','must_flag','hard_fail']
      limit = 25,
      model,                // optional override
    } = body as {
      agent_ids?: string[];
      scenario_ids?: string[];
      categories?: string[];
      limit?: number;
      model?: string;
    };

    let q = admin.from("rag_pilot_scenarios").select("*").eq("active", true);
    if (agent_ids?.length) q = q.in("agent_id", agent_ids);
    if (scenario_ids?.length) q = q.in("scenario_id", scenario_ids);
    if (categories?.length) q = q.in("category", categories);
    q = q.limit(Math.min(limit, 50));

    const { data: scenarios, error: sErr } = await q;
    if (sErr) throw sErr;
    if (!scenarios || scenarios.length === 0) {
      return json({ error: "No scenarios matched" }, 404);
    }

    const run_batch = crypto.randomUUID();
    const results: Array<Record<string, unknown>> = [];

    for (const raw of scenarios) {
      const s: Scenario = {
        ...raw,
        must_cite: Array.isArray(raw.must_cite) ? raw.must_cite : [],
        must_flag: Array.isArray(raw.must_flag) ? raw.must_flag : [],
        hard_fails: Array.isArray(raw.hard_fails) ? raw.hard_fails : [],
      };
      try {
        const { text, sources, confidence, mana, latency_ms, modelUsed } =
          await callChatAgent(s, authHeader, model);
        const sc = score(s, text);
        const verdict = sc.pass ? "pass" : "fail";

        await admin.from("rag_pilot_runs").insert({
          run_batch,
          scenario_id: s.scenario_id,
          agent_id: s.agent_id,
          kete: s.kete,
          model_used: modelUsed,
          agent_response: text.slice(0, 8000),
          rag_sources: sources,
          rag_confidence: confidence,
          mana_verdict: mana,
          must_cite_hits: sc.must_cite_hits,
          must_cite_misses: sc.must_cite_misses,
          must_flag_hits: sc.must_flag_hits,
          must_flag_misses: sc.must_flag_misses,
          hard_fails_triggered: sc.hard_fails_triggered,
          cite_coverage: Number(sc.cite_coverage.toFixed(3)),
          flag_coverage: Number(sc.flag_coverage.toFixed(3)),
          pass: sc.pass,
          verdict,
          latency_ms,
          created_by: userId,
        });

        results.push({
          scenario_id: s.scenario_id,
          agent_id: s.agent_id,
          kete: s.kete,
          category: s.category,
          weight: s.weight,
          title: s.title,
          pass: sc.pass,
          cite_coverage: sc.cite_coverage,
          flag_coverage: sc.flag_coverage,
          must_cite_misses: sc.must_cite_misses,
          must_flag_misses: sc.must_flag_misses,
          hard_fails_triggered: sc.hard_fails_triggered,
          rag_confidence: confidence,
          rag_source_count: sources.length,
          mana_verdict: mana,
          latency_ms,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("scenario err", s.scenario_id, msg);
        await admin.from("rag_pilot_runs").insert({
          run_batch,
          scenario_id: s.scenario_id,
          agent_id: s.agent_id,
          kete: s.kete,
          model_used: model ?? null,
          verdict: "error",
          pass: false,
          error: msg.slice(0, 500),
          created_by: userId,
        });
        results.push({
          scenario_id: s.scenario_id,
          agent_id: s.agent_id,
          pass: false,
          error: msg,
        });
      }
    }

    // Per-agent rollup
    const byAgent: Record<string, { total: number; passed: number }> = {};
    for (const r of results) {
      const a = String(r.agent_id ?? "unknown");
      byAgent[a] ??= { total: 0, passed: 0 };
      byAgent[a].total += 1;
      if (r.pass) byAgent[a].passed += 1;
    }

    return json({
      summary: {
        run_batch,
        model: model ?? "default",
        total: results.length,
        passed: results.filter((r) => r.pass).length,
        failed: results.filter((r) => !r.pass).length,
        pass_rate: results.length ? results.filter((r) => r.pass).length / results.length : 0,
        by_agent: byAgent,
      },
      results,
    }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("rag-pilot-validator error:", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
