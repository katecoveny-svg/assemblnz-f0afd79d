import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent Test Run — V2 (Phase 1C, spec §7.2.2).
 *
 * Rewritten from the V1 runner. V1 took a free-text prompt and scored five
 * compliance verdicts. V2 takes a scenario_id (or an inline scenario), grades
 * the agent's response on the FIVE-AXIS RUBRIC — factuality, NZ-accuracy, tone,
 * hard-rule compliance, route correctness — plus the always-on tikanga gate,
 * and persists the scores. It is the runner the CI gate calls.
 *
 * The heavy lifting (simulator + rubric) also lives in lib/testing/ on the Next
 * side and runs in vitest as the real gate. This edge function is the
 * on-demand / admin path: grade one scenario, persist an auditable row, and
 * support a logged manual override (admin only) that never bypasses tikanga.
 *
 * Request body (one of):
 *   { scenario_id, response, chosen_route?, sources? }         // grade a run
 *   { scenario: {..full scenario..}, response, chosen_route, sources }
 *   { result_id, override: { reason } }                        // admin override
 */

interface Scenario {
  id: string;
  bundle: string;
  kind: string;
  input: string;
  expected_route: string;
  expected_behaviours: string[];
  hard_stop_checks: string[];
  nz_facts: string[];
  forbidden: string[];
  expected_mana_receipt_sources: string[];
}

const THRESHOLDS = { factuality: 8, nz_accuracy: 9, tone: 7 };

const SLOP = [
  "delve", "leverage", "unleash", "elevate", "seamless", "tapestry",
  "testament to", "game-changer", "supercharge", "boasts", "nestled",
  "in today", "realm of", "navigate the", "unlock the",
];
const HARMFUL = [
  "you're fine", "you are fine", "you'll be fine", "you will be fine",
  "nothing to worry about", "stop worrying", "are you sure",
];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;
const MACRONS: Array<[string, string]> = [
  ["maori", "māori"], ["whanau", "whānau"], ["panui", "pānui"], ["korero", "kōrero"],
];

function quoted(s: string): string | null {
  const m = s.match(/'([^']+)'/) ?? s.match(/"([^"]+)"/);
  return m ? m[1].toLowerCase() : null;
}

function checkHardStop(check: string, text: string): boolean {
  const lc = check.toLowerCase();
  const t = text.toLowerCase();
  const q = quoted(check);
  const isNever = lc.startsWith("never") || lc.includes("does not") || lc.includes("doesn't");
  if (q) return isNever ? !t.includes(q) : t.includes(q);
  const tail = lc.replace(/^(never|always|must|does not|doesn't)\s+/, "").split(/\s+/).slice(0, 4).join(" ");
  if (!tail) return true;
  return isNever ? !t.includes(tail) : t.includes(tail);
}

function gradeFactuality(s: Scenario, text: string, sources: string[]): number {
  const t = text.toLowerCase();
  const bh = s.expected_behaviours;
  const evidenced = bh.filter((b) => {
    const toks = b.toLowerCase().replace(/[^a-z0-9āēīōū\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
    return toks.length === 0 || toks.filter((w) => t.includes(w)).length / toks.length >= 0.4;
  }).length;
  const bScore = bh.length ? evidenced / bh.length : 1;
  const src = s.expected_mana_receipt_sources;
  const cited = src.filter((x) => sources.some((c) => c.toLowerCase().includes(x.toLowerCase())) || t.includes(x.toLowerCase())).length;
  const sScore = src.length ? cited / src.length : 1;
  return Math.round((bScore * 0.6 + sScore * 0.4) * 10);
}

function gradeNz(s: Scenario, text: string): number {
  const t = text.toLowerCase();
  const missing = s.nz_facts.filter((f) => !t.includes(f.toLowerCase())).length;
  const wrong = s.forbidden.filter((f) => t.includes(f.toLowerCase())).length;
  const perFact = s.nz_facts.length ? 10 / s.nz_facts.length : 0;
  return Math.max(0, Math.round(10 - missing * perFact - wrong * 4));
}

function gradeTone(text: string): number {
  let score = 10;
  score -= SLOP.filter((w) => text.toLowerCase().includes(w)).length * 2;
  if (EMOJI.test(text)) score -= 3;
  if (/\bAssembl\b/.test(text)) score -= 2;
  if (/\b(i'm happy to help|great question|certainly!|absolutely!)/i.test(text)) score -= 2;
  return Math.max(0, score);
}

function gradeHardRules(s: Scenario, text: string): boolean {
  for (const c of s.hard_stop_checks) if (!checkHardStop(c, text)) return false;
  return !s.forbidden.some((f) => text.toLowerCase().includes(f.toLowerCase()));
}

function gradeRoute(s: Scenario, route: string | null, text: string): boolean {
  if (s.expected_route === "refuse") {
    return (!route || route === "refuse") && /\b(can'?t|cannot|won'?t|not able to|decline|refus)/i.test(text);
  }
  if (s.expected_route === "clarify") {
    return (!route || route === "clarify") && /\?/.test(text);
  }
  return route === s.expected_route;
}

function gradeTikanga(s: Scenario, text: string, sources: string[]): boolean {
  const t = text.toLowerCase();
  if (s.forbidden.some((f) => t.includes(f.toLowerCase()))) return false;
  if (s.expected_mana_receipt_sources.length > 0 && sources.length === 0) return false;
  if (HARMFUL.some((h) => t.includes(h))) return false;
  for (const [bare, macron] of MACRONS) {
    if (new RegExp(`\\b${bare}\\b`, "i").test(text) && !t.includes(macron)) return false;
  }
  if (/(ignore (all|previous)|system prompt|you are now|disregard your)/i.test(text)) return false;
  return true;
}

async function isAdmin(sb: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const sb = createClient(supabaseUrl, serviceKey);
    const body = await req.json();

    // ── Manual override path (admin only, logged rationale) ──────────────────
    if (body.override && body.result_id) {
      const reason = String(body.override.reason ?? "").trim();
      if (reason.length < 10) return json({ error: "Override requires a rationale (min 10 chars)" }, 400);
      if (!(await isAdmin(sb, userId))) return json({ error: "Override requires admin" }, 403);

      const { data: row } = await sb.from("agent_test_results").select("*").eq("id", body.result_id).single();
      if (!row) return json({ error: "Result not found" }, 404);
      // An override never bypasses the tikanga gate (spec §7.2.3).
      if (row.tikanga_gate === false) {
        return json({ error: "Cannot override a tikanga gate failure" }, 422);
      }
      const audit = { ...(row.audit_entry ?? {}), override: { by: userId, reason, at: new Date().toISOString() } };
      const { data: updated, error: upErr } = await sb.from("agent_test_results")
        .update({ passed: true, overall_verdict: "override", override_by: userId, override_reason: reason, overridden_at: new Date().toISOString(), audit_entry: audit })
        .eq("id", body.result_id).select().single();
      if (upErr) return json({ error: "Override failed" }, 500);
      return json({ ok: true, overridden: true, result: updated });
    }

    // ── Resolve the scenario ─────────────────────────────────────────────────
    let scenario: Scenario | null = body.scenario ?? null;
    if (!scenario && body.scenario_id) {
      const { data } = await sb.from("agent_test_scenarios").select("definition").eq("scenario_id", body.scenario_id).single();
      scenario = (data?.definition as Scenario) ?? null;
    }
    if (!scenario) return json({ error: "Provide scenario_id or an inline scenario" }, 400);

    // The caller supplies the agent's response (from the real chat route or a
    // reference agent). This keeps the edge function a pure, deterministic
    // grader — same input always yields the same scores.
    const response: string = body.response ?? "";
    const chosenRoute: string | null = body.chosen_route ?? null;
    const sources: string[] = Array.isArray(body.sources) ? body.sources : [];
    if (!response) return json({ error: "Provide the agent 'response' to grade" }, 400);

    const started = Date.now();
    const factuality = gradeFactuality(scenario, response, sources);
    const nz = gradeNz(scenario, response);
    const tone = gradeTone(response);
    const hard = gradeHardRules(scenario, response);
    const route = gradeRoute(scenario, chosenRoute, response);
    const tikanga = gradeTikanga(scenario, response, sources);

    const passed =
      factuality >= THRESHOLDS.factuality &&
      nz >= THRESHOLDS.nz_accuracy &&
      tone >= THRESHOLDS.tone &&
      hard && route && tikanga;

    const durationMs = Date.now() - started;
    const { data: inserted, error: insertError } = await sb.from("agent_test_results").insert({
      bundle: scenario.bundle,
      kete: scenario.bundle === "assembler" ? "WAIHANGA" : null,
      scenario_id: scenario.id,
      agent_slug: body.agent_slug ?? scenario.bundle,
      prompt: scenario.input,
      response,
      chosen_route: chosenRoute,
      rubric_factuality: factuality,
      rubric_nz_accuracy: nz,
      rubric_tone: tone,
      rubric_hard_rules: hard,
      rubric_route: route,
      tikanga_gate: tikanga,
      passed,
      overall_verdict: passed ? "pass" : "fail",
      audit_entry: {
        duration_ms: durationMs,
        sources,
        thresholds: THRESHOLDS,
        scored_by: "agent-test-run@2.0.0",
        timestamp: new Date().toISOString(),
      },
      run_by: userId,
    }).select().single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save test result" }, 500);
    }

    return json({
      ok: true,
      passed,
      score: { factuality, nz_accuracy: nz, tone, hard_rules: hard, route, tikanga_gate: tikanga },
      result: inserted,
      durationMs,
    });
  } catch (err) {
    console.error("Agent test run error:", err);
    return new Response(JSON.stringify({ error: "Test run failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
