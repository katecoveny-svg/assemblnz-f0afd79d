// PIKAU Run/Score endpoint
// ----------------------------------------------------------------------------
// Processes the full 50-scenario harness (or a filtered subset) in deterministic
// workflow order and returns a rich dashboard summary including failure-reason
// breakdowns (missing flags, missing cites, hard fails, errors), per-workflow
// pass rates, weight-class pass rates, and the worst-offending scenarios.
//
// POST /functions/v1/pikau-run-score
//   { model?: string, workflow?: number, weight?: 'high'|'medium'|'low',
//     scenario_ids?: string[], limit?: number, concurrency?: number }
//
// Admin-gated via has_role(uid,'admin'). Persists every run row to
// pikau_eval_runs under a single run_batch UUID.
// ----------------------------------------------------------------------------

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
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
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

// --- Scoring (mirrors pikau-validator deterministic scorer) ------------------

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

  for (const f of scenario.must_flag ?? []) {
    (fuzzyContains(response, f) ? must_flag_hits : must_flag_misses).push(f);
  }
  for (const c of scenario.must_cite ?? []) {
    (fuzzyContains(response, c) ? must_cite_hits : must_cite_misses).push(c);
  }
  for (const hf of scenario.hard_fails ?? []) {
    if (
      /without (a |the )?caveat/i.test(hf) &&
      /\b\d+(\.\d+)?\s*%/.test(response) &&
      !/draft|verify|current wtd/i.test(response)
    ) {
      hard_fails_triggered.push(hf);
    }
    if (/missing the IHS/i.test(hf) && !/IHS|Import Health Standard/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
    if (/missing.*battery/i.test(hf) && !/lithium|battery/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
    if (/asbestos/i.test(hf) && !/asbestos/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
    if (/prohibited/i.test(hf) && !/prohibit|banned|not permitted/i.test(response)) {
      hard_fails_triggered.push(hf);
    }
  }

  const flagCoverage =
    !scenario.must_flag?.length ? 1 : must_flag_hits.length / scenario.must_flag.length;
  const citeCoverage =
    !scenario.must_cite?.length ? 1 : must_cite_hits.length / scenario.must_cite.length;
  const pass =
    hard_fails_triggered.length === 0 && flagCoverage >= 0.75 && citeCoverage >= 0.5;

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

async function callPikau(
  prompt: string,
  model: string,
): Promise<{ text: string; latency_ms: number }> {
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

// --- Failure-reason classification -------------------------------------------

type FailureReason =
  | "hard_fail_triggered"
  | "insufficient_flags"
  | "insufficient_cites"
  | "ai_error"
  | "passed";

function classifyFailure(r: {
  pass: boolean;
  error?: string | null;
  hard_fails_triggered: string[];
  flagCoverage: number;
  citeCoverage: number;
}): FailureReason {
  if (r.error) return "ai_error";
  if (r.pass) return "passed";
  if (r.hard_fails_triggered.length) return "hard_fail_triggered";
  if (r.flagCoverage < 0.75) return "insufficient_flags";
  if (r.citeCoverage < 0.5) return "insufficient_cites";
  return "insufficient_flags";
}

// --- Main handler ------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Admin auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      scenario_ids,
      workflow,
      weight,
      limit = 50,
      model = "google/gemini-2.5-flash",
      concurrency = 4,
    } = body as {
      scenario_ids?: string[];
      workflow?: number;
      weight?: string;
      limit?: number;
      model?: string;
      concurrency?: number;
    };

    // Fetch scenarios in deterministic order: workflow ASC, scenario_id ASC
    let q = supabase.from("pikau_eval_scenarios").select("*").eq("active", true);
    if (scenario_ids?.length) q = q.in("scenario_id", scenario_ids);
    if (typeof workflow === "number") q = q.eq("workflow", workflow);
    if (weight) q = q.eq("weight", weight);
    q = q.order("workflow", { ascending: true })
         .order("scenario_id", { ascending: true })
         .limit(Math.min(limit, 50));

    const { data: scenarios, error: sErr } = await q;
    if (sErr) throw sErr;
    if (!scenarios?.length) {
      return new Response(JSON.stringify({ error: "No scenarios matched" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const run_batch = crypto.randomUUID();
    const started_at = new Date().toISOString();
    const t_start = Date.now();
    const cap = Math.max(1, Math.min(8, concurrency));

    type Result = {
      scenario_id: string;
      workflow: number;
      weight: string;
      title: string;
      pass: boolean;
      flag_coverage: number;
      cite_coverage: number;
      must_flag_misses: string[];
      must_cite_misses: string[];
      hard_fails_triggered: string[];
      latency_ms: number;
      error?: string | null;
      failure_reason: FailureReason;
    };

    const results: Result[] = [];

    async function runOne(s: Scenario): Promise<Result> {
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

        const r = {
          scenario_id: s.scenario_id,
          workflow: s.workflow,
          weight: s.weight,
          title: s.title,
          pass: score.pass,
          flag_coverage: score.flagCoverage,
          cite_coverage: score.citeCoverage,
          must_flag_misses: score.must_flag_misses,
          must_cite_misses: score.must_cite_misses,
          hard_fails_triggered: score.hard_fails_triggered,
          latency_ms,
          error: null,
          failure_reason: classifyFailure({
            pass: score.pass,
            error: null,
            hard_fails_triggered: score.hard_fails_triggered,
            flagCoverage: score.flagCoverage,
            citeCoverage: score.citeCoverage,
          }),
        };
        return r;
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
        return {
          scenario_id: s.scenario_id,
          workflow: s.workflow,
          weight: s.weight,
          title: s.title,
          pass: false,
          flag_coverage: 0,
          cite_coverage: 0,
          must_flag_misses: [],
          must_cite_misses: [],
          hard_fails_triggered: [],
          latency_ms: 0,
          error: msg.slice(0, 500),
          failure_reason: "ai_error",
        };
      }
    }

    // Run scenarios in deterministic order with bounded concurrency. We
    // preserve order by index, slice into chunks of `cap`, and await each chunk.
    for (let i = 0; i < scenarios.length; i += cap) {
      const chunk = (scenarios as Scenario[]).slice(i, i + cap);
      const settled = await Promise.all(chunk.map(runOne));
      results.push(...settled);
    }

    // ----- Build dashboard summary --------------------------------------------
    const total = results.length;
    const passed = results.filter((r) => r.pass).length;
    const failed = total - passed;

    const failure_breakdown: Record<FailureReason, number> = {
      passed,
      hard_fail_triggered: 0,
      insufficient_flags: 0,
      insufficient_cites: 0,
      ai_error: 0,
    };
    for (const r of results) failure_breakdown[r.failure_reason]++;

    // Per-workflow pass rate
    const workflows: Record<
      string,
      { workflow: number; total: number; passed: number; pass_rate: number }
    > = {};
    for (const r of results) {
      const k = String(r.workflow);
      workflows[k] ??= { workflow: r.workflow, total: 0, passed: 0, pass_rate: 0 };
      workflows[k].total++;
      if (r.pass) workflows[k].passed++;
    }
    for (const k of Object.keys(workflows)) {
      const w = workflows[k];
      w.pass_rate = w.total ? w.passed / w.total : 0;
    }
    const per_workflow = Object.values(workflows).sort((a, b) => a.workflow - b.workflow);

    // Per-weight pass rate
    const weights: Record<string, { weight: string; total: number; passed: number; pass_rate: number }> = {};
    for (const r of results) {
      weights[r.weight] ??= { weight: r.weight, total: 0, passed: 0, pass_rate: 0 };
      weights[r.weight].total++;
      if (r.pass) weights[r.weight].passed++;
    }
    for (const k of Object.keys(weights)) {
      const w = weights[k];
      w.pass_rate = w.total ? w.passed / w.total : 0;
    }
    const per_weight = Object.values(weights);

    // Top-missed flags & cites
    const flagMissCount = new Map<string, number>();
    const citeMissCount = new Map<string, number>();
    const hardFailCount = new Map<string, number>();
    for (const r of results) {
      for (const f of r.must_flag_misses) flagMissCount.set(f, (flagMissCount.get(f) ?? 0) + 1);
      for (const c of r.must_cite_misses) citeMissCount.set(c, (citeMissCount.get(c) ?? 0) + 1);
      for (const h of r.hard_fails_triggered) hardFailCount.set(h, (hardFailCount.get(h) ?? 0) + 1);
    }
    const top = (m: Map<string, number>) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([item, count]) => ({ item, count }));

    // Worst-offending scenarios (failed + lowest combined coverage)
    const worst_scenarios = results
      .filter((r) => !r.pass)
      .map((r) => ({
        scenario_id: r.scenario_id,
        title: r.title,
        workflow: r.workflow,
        weight: r.weight,
        failure_reason: r.failure_reason,
        flag_coverage: r.flag_coverage,
        cite_coverage: r.cite_coverage,
        combined: (r.flag_coverage + r.cite_coverage) / 2,
        hard_fails: r.hard_fails_triggered,
        error: r.error,
      }))
      .sort((a, b) => a.combined - b.combined)
      .slice(0, 10);

    const latencies = results.map((r) => r.latency_ms).filter((n) => n > 0).sort((a, b) => a - b);
    const pct = (p: number) =>
      latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] : 0;

    const summary = {
      run_batch,
      model,
      started_at,
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - t_start,
      total,
      passed,
      failed,
      pass_rate: total ? passed / total : 0,
      failure_breakdown,
      per_workflow,
      per_weight,
      top_missed_flags: top(flagMissCount),
      top_missed_cites: top(citeMissCount),
      top_hard_fails: top(hardFailCount),
      worst_scenarios,
      latency: {
        p50_ms: pct(0.5),
        p90_ms: pct(0.9),
        p99_ms: pct(0.99),
        avg_ms: latencies.length
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : 0,
      },
    };

    return new Response(JSON.stringify({ summary, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("pikau-run-score error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
