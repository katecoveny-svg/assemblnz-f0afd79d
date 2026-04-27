import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are PIKAU, the Freight & Customs kete agent for Assembl (NZ).

You answer importer/exporter questions covering:
- Tariff classification (Working Tariff Document)
- Customs and Excise Act 2018 entry/valuation
- Biosecurity Act 1993 + MPI Import Health Standards (IHS)
- HSNO Act 1996 (hazardous substances, lithium batteries)
- NZ Free Trade Agreements (preferential origin)
- Restricted/excise goods

RULES (strict):
1. Always cite the relevant KB source(s) inline using the exact path style
   "kb/nz/<source>/index.md" or the named instrument (e.g. "WTD Chapter 87",
   "Vehicle and Machinery IHS").
2. Surface every applicable regime — never silently drop biosecurity, HSNO,
   FTA, or excise considerations.
3. Never assert a specific 10-digit HSTC code or duty rate without the
   "draft / verify in current WTD" caveat.
4. Never sign a Certificate of Origin or issue an MPI clearance — flag and
   defer to the licensed party.
5. Plain-English first, then the legal/standard cite.

Format your answer as a short structured response with an "Applies:" list
of regimes/flags and a "References:" list of cites.`;

interface Scenario {
  scenario_id: string;
  workflow: number;
  type: string;
  weight: string;
  title: string;
  prompt: string;
  must_flag: string[];
  must_cite: string[];
  hard_fails: string[];
  pass_criteria: string;
}

// --- Validator: deterministic string-match scoring ----------------------------

function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Returns true if `needle` appears in `haystack` using a relaxed match:
 * - case-insensitive
 * - whitespace-collapsed
 * - also matches when all whitespace-separated tokens of needle appear in order
 *   within a 200-char window (handles minor wording variation)
 */
function fuzzyContains(haystack: string, needle: string): boolean {
  const H = normalise(haystack);
  const N = normalise(needle);
  if (!N) return false;
  if (H.includes(N)) return true;

  const tokens = N.split(" ").filter((t) => t.length > 2);
  if (tokens.length < 2) return false;

  // ordered token search within a sliding window
  let cursor = 0;
  let firstIdx = -1;
  for (const t of tokens) {
    const idx = H.indexOf(t, cursor);
    if (idx === -1) return false;
    if (firstIdx === -1) firstIdx = idx;
    if (idx - firstIdx > 250) return false;
    cursor = idx + t.length;
  }
  return true;
}

function scoreScenario(scenario: Scenario, response: string) {
  const must_flag_hits: string[] = [];
  const must_flag_misses: string[] = [];
  const must_cite_hits: string[] = [];
  const must_cite_misses: string[] = [];
  const hard_fails_triggered: string[] = [];

  for (const f of scenario.must_flag) {
    (fuzzyContains(response, f) ? must_flag_hits : must_flag_misses).push(f);
  }
  for (const c of scenario.must_cite) {
    (fuzzyContains(response, c) ? must_cite_hits : must_cite_misses).push(c);
  }
  for (const hf of scenario.hard_fails) {
    // hard_fails are described in plain English (e.g. "Asserting a duty rate
    // without caveat"). We treat them as "triggered" only when an LLM judge
    // confirms it. The deterministic pass below is a quick heuristic for
    // common patterns.
    if (/without (a |the )?caveat/i.test(hf) && /\b\d+(\.\d+)?\s*%/.test(response) && !/draft|verify|current wtd/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
    if (/missing the IHS/i.test(hf) && !/IHS|Import Health Standard/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
    if (/missing.*battery/i.test(hf) && !/lithium|battery/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
  }

  const flagCoverage = scenario.must_flag.length === 0 ? 1 : must_flag_hits.length / scenario.must_flag.length;
  const citeCoverage = scenario.must_cite.length === 0 ? 1 : must_cite_hits.length / scenario.must_cite.length;
  const pass =
    hard_fails_triggered.length === 0 &&
    flagCoverage >= 0.75 &&
    citeCoverage >= 0.5;

  return {
    must_flag_hits,
    must_flag_misses,
    must_cite_hits,
    must_cite_misses,
    hard_fails_triggered,
    flagCoverage,
    citeCoverage,
    pass,
  };
}

// --- AI call -----------------------------------------------------------------

async function callPikau(prompt: string, model: string): Promise<{ text: string; latency_ms: number }> {
  const t0 = Date.now();
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lovable AI ${res.status}: ${t.slice(0, 300)}`);
  }
  const json = await res.json();
  const text: string = json.choices?.[0]?.message?.content ?? "";
  return { text, latency_ms: Date.now() - t0 };
}

// --- Main handler ------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));

    // Admin auth via JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      scenario_ids,         // optional: specific IDs to run
      workflow,             // optional: filter by workflow 1-9
      weight,               // optional: 'high'|'medium'|'low'
      limit = 25,
      model = "google/gemini-2.5-flash",
    } = body as {
      scenario_ids?: string[];
      workflow?: number;
      weight?: string;
      limit?: number;
      model?: string;
    };

    let q = supabase
      .from("pikau_eval_scenarios")
      .select("*")
      .eq("active", true);
    if (scenario_ids && scenario_ids.length) q = q.in("scenario_id", scenario_ids);
    if (typeof workflow === "number") q = q.eq("workflow", workflow);
    if (weight) q = q.eq("weight", weight);
    q = q.limit(Math.min(limit, 50));

    const { data: scenarios, error: sErr } = await q;
    if (sErr) throw sErr;
    if (!scenarios || scenarios.length === 0) {
      return new Response(JSON.stringify({ error: "No scenarios matched" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const run_batch = crypto.randomUUID();
    const results: Array<Record<string, unknown>> = [];

    for (const s of scenarios as Scenario[]) {
      try {
        const { text, latency_ms } = await callPikau(s.prompt, model);
        const score = scoreScenario(s, text);
        const verdict = score.pass ? "pass" : "fail";

        const { error: insErr } = await supabase.from("pikau_eval_runs").insert({
          scenario_id: s.scenario_id,
          run_batch,
          model_used: model,
          pikau_response: text,
          judge_model: "deterministic-v1",
          judge_verdict: verdict,
          must_flag_hits: score.must_flag_hits,
          must_flag_misses: score.must_flag_misses,
          must_cite_hits: score.must_cite_hits,
          must_cite_misses: score.must_cite_misses,
          hard_fails_triggered: score.hard_fails_triggered,
          judge_notes: `flag_coverage=${score.flagCoverage.toFixed(2)} cite_coverage=${score.citeCoverage.toFixed(2)}`,
          pass: score.pass,
          latency_ms,
          created_by: user.id,
        });
        if (insErr) console.error("insert err", s.scenario_id, insErr);

        results.push({
          scenario_id: s.scenario_id,
          title: s.title,
          weight: s.weight,
          pass: score.pass,
          flag_coverage: score.flagCoverage,
          cite_coverage: score.citeCoverage,
          must_flag_misses: score.must_flag_misses,
          must_cite_misses: score.must_cite_misses,
          hard_fails_triggered: score.hard_fails_triggered,
          latency_ms,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("scenario err", s.scenario_id, msg);
        await supabase.from("pikau_eval_runs").insert({
          scenario_id: s.scenario_id,
          run_batch,
          model_used: model,
          judge_model: "deterministic-v1",
          judge_verdict: "error",
          pass: false,
          error: msg.slice(0, 500),
          created_by: user.id,
        });
        results.push({ scenario_id: s.scenario_id, pass: false, error: msg });
      }
    }

    const summary = {
      run_batch,
      model,
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      failed: results.filter((r) => !r.pass).length,
      pass_rate: results.length ? results.filter((r) => r.pass).length / results.length : 0,
    };

    return new Response(JSON.stringify({ summary, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("pikau-validator error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
