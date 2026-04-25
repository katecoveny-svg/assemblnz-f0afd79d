// ============================================================================
// ambient-agent-loop — background reflection + proactive nudge worker
// ----------------------------------------------------------------------------
// Triggered by:
//   • pg_cron (every 15min) with shared-secret header
//   • Admins via authenticated POST { triggered_by: "manual" }
//
// Behaviour (all three behaviours combined):
//   1. Reflection — scan recent mcp_tool_calls (last 60min). For each org with
//      activity, group by agent and write one 'reflection' thought per agent
//      summarising volume, errors, denials, p50 latency.
//   2. Nudge — scan scheduled_tasks where status='active' AND next_run_at < now()
//      that are overdue > 10min. Write 'nudge' thoughts (severity=action_required).
//   3. Health — write a top-level run row with totals so admins can see loop
//      cadence in /admin/mcp.
//
// Per-stage 'chat' thought rows are written by mcp-chat directly, not here.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CRON_SECRET = Deno.env.get("AMBIENT_LOOP_CRON_SECRET") ?? "";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Auth: cron via shared secret OR admin via JWT
// ---------------------------------------------------------------------------
async function authoriseRequest(req: Request): Promise<{ ok: true; triggered_by: "cron" | "manual" } | { ok: false; reason: string; status: number }> {
  // Cron path
  const cronHeader = req.headers.get("x-cron-secret");
  if (cronHeader && CRON_SECRET && cronHeader === CRON_SECRET) {
    return { ok: true, triggered_by: "cron" };
  }

  // Admin JWT path
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, reason: "Unauthorized", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error } = await userClient.auth.getClaims(token);
  if (error || !claimsData?.claims) {
    return { ok: false, reason: "Invalid token", status: 401 };
  }
  const userId = claimsData.claims.sub as string;
  const { data: hasAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!hasAdmin) {
    return { ok: false, reason: "Admin role required", status: 403 };
  }
  return { ok: true, triggered_by: "manual" };
}

// ---------------------------------------------------------------------------
// Reflection: summarise recent agent activity
// ---------------------------------------------------------------------------
type ToolCall = {
  tool_name: string;
  toolset_slug: string | null;
  user_id: string | null;
  org_id: string | null;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  called_at: string;
};

async function runReflectionPass(): Promise<{ thoughts: number; errors: string[] }> {
  const errors: string[] = [];
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const { data, error } = await admin
    .from("mcp_tool_calls")
    .select("tool_name, toolset_slug, user_id, org_id, status, duration_ms, error_message, called_at")
    .gte("called_at", since)
    .like("tool_name", "chat:%")
    .limit(2000);

  if (error) {
    errors.push(`reflection_query: ${error.message}`);
    return { thoughts: 0, errors };
  }

  const calls = (data ?? []) as ToolCall[];
  if (!calls.length) return { thoughts: 0, errors };

  // Group by (org_id ?? user_id ?? 'anon') + agent
  const groups = new Map<string, ToolCall[]>();
  for (const c of calls) {
    const agent = c.tool_name.replace(/^chat:/, "");
    const key = `${c.org_id ?? c.user_id ?? "anon"}::${agent}`;
    const arr = groups.get(key) ?? [];
    arr.push(c);
    groups.set(key, arr);
  }

  const rows: Array<Record<string, unknown>> = [];
  for (const [key, list] of groups.entries()) {
    const [, agent] = key.split("::");
    const total = list.length;
    const errs = list.filter((x) => x.status === "error").length;
    const denied = list.filter((x) => x.status === "denied").length;
    const durs = list.map((x) => x.duration_ms ?? 0).filter((x) => x > 0).sort((a, b) => a - b);
    const p50 = durs.length ? durs[Math.floor(durs.length / 2)] : 0;
    const errPct = total ? Math.round((errs / total) * 100) : 0;

    let severity: "info" | "warn" | "action_required" = "info";
    if (errPct >= 25 || denied >= 5) severity = "action_required";
    else if (errPct >= 10 || denied >= 2) severity = "warn";

    const reasoning =
      `Last 60min: ${total} calls, ${errs} errors (${errPct}%), ${denied} denials, p50 latency ${p50}ms.`;

    rows.push({
      org_id: list[0].org_id,
      user_id: list[0].user_id,
      agent_id: agent,
      toolset_slug: list[0].toolset_slug,
      source: "reflection",
      stage: "reflection",
      thought:
        severity === "action_required"
          ? `Agent "${agent}" is degrading — error/denial rate is high.`
          : severity === "warn"
            ? `Agent "${agent}" is showing some friction.`
            : `Agent "${agent}" is operating normally.`,
      reasoning,
      metadata: { total, errors: errs, denied, p50_latency_ms: p50, window_minutes: 60 },
      severity,
      outcome: severity === "action_required" ? "needs_attention" : "ok",
    });
  }

  if (rows.length) {
    const { error: insErr } = await admin.from("agent_thoughts").insert(rows);
    if (insErr) errors.push(`reflection_insert: ${insErr.message}`);
  }
  return { thoughts: rows.length, errors };
}

// ---------------------------------------------------------------------------
// Nudge: detect overdue scheduled_tasks
// ---------------------------------------------------------------------------
async function runNudgePass(): Promise<{ nudges: number; errors: string[] }> {
  const errors: string[] = [];
  const overdueBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data, error } = await admin
    .from("scheduled_tasks")
    .select("id, user_id, agent_id, task_type, title, description, next_run_at")
    .eq("status", "active")
    .lt("next_run_at", overdueBefore)
    .limit(200);

  if (error) {
    errors.push(`nudge_query: ${error.message}`);
    return { nudges: 0, errors };
  }

  const tasks = data ?? [];
  if (!tasks.length) return { nudges: 0, errors };

  const rows = tasks.map((t: any) => {
    const overdueMin = Math.round((Date.now() - new Date(t.next_run_at).getTime()) / 60_000);
    return {
      org_id: null,
      user_id: t.user_id,
      agent_id: t.agent_id ?? "system",
      toolset_slug: null,
      source: "nudge",
      stage: "nudge",
      thought: `Scheduled task "${t.title ?? t.task_type}" is ${overdueMin}min overdue.`,
      reasoning: t.description ?? null,
      metadata: { task_id: t.id, task_type: t.task_type, overdue_minutes: overdueMin },
      severity: overdueMin > 60 ? "action_required" : "warn",
      outcome: "pending_action",
    };
  });

  const { error: insErr } = await admin.from("agent_thoughts").insert(rows);
  if (insErr) errors.push(`nudge_insert: ${insErr.message}`);
  return { nudges: rows.length, errors };
}

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // --health endpoint (GET) for monitoring
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.has("health")) {
      const { data: lastRun } = await admin
        .from("agent_thought_runs")
        .select("status, started_at, finished_at, thoughts_generated, nudges_generated")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return json({ ok: true, last_run: lastRun ?? null });
    }
    return json({ ok: true, message: "ambient-agent-loop healthy" });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const auth = await authoriseRequest(req);
  if (!auth.ok) return json({ error: auth.reason }, auth.status);

  const start = Date.now();

  // Open a run row
  const { data: runRow, error: runErr } = await admin
    .from("agent_thought_runs")
    .insert({ triggered_by: auth.triggered_by, status: "running" })
    .select()
    .single();
  if (runErr || !runRow) {
    return json({ error: `Failed to open run: ${runErr?.message}` }, 500);
  }

  let thoughts = 0;
  let nudges = 0;
  const errors: string[] = [];

  try {
    const reflection = await runReflectionPass();
    thoughts += reflection.thoughts;
    errors.push(...reflection.errors);

    const nudge = await runNudgePass();
    nudges += nudge.nudges;
    errors.push(...nudge.errors);
  } catch (e) {
    errors.push(`unexpected: ${(e as Error).message}`);
  }

  const finished_at = new Date().toISOString();
  const duration_ms = Date.now() - start;
  const status = errors.length ? "failed" : "completed";

  await admin
    .from("agent_thought_runs")
    .update({
      status,
      thoughts_generated: thoughts,
      nudges_generated: nudges,
      errors,
      duration_ms,
      finished_at,
    })
    .eq("id", runRow.id);

  return json({
    ok: status === "completed",
    run_id: runRow.id,
    triggered_by: auth.triggered_by,
    thoughts_generated: thoughts,
    nudges_generated: nudges,
    errors,
    duration_ms,
  });
});
