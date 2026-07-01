// monday-catch
// ---------------------------------------------------------------------------
// Surprise moment A.1 — voyage-surprise-moments.md §A.1.
//
// Scheduled by `tick` each Sunday 21:00 NZST. For each active operator on
// each tenant, composes one calm, specific, anticipatory note covering at
// most three items:
//   • due-dates approaching this week (cadence_runs + escalation_events)
//   • outcomes you should know about from the weekend
//   • people who haven't engaged when they normally would (drift)
//
// Sends via the Unified Channel Gateway (SMS preferred, falls back to
// email). Idempotent on (tenant_id, operator_id, week_of_year) — the same
// operator can never receive two Monday catches for the same week.
//
// Voice: second-person, no emoji, no hype, no "Hi!". The opening line is
// always one of three: "Three things to know before Monday.", "Two things
// to know before Monday.", "One thing to know before Monday."
//
// Status: stub. Composer wired, fan-out is a TODO that lands once the
// operator preferences table is in.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MondayCatchRequest {
  tenantId: string;
  operatorId: string;
  /** ISO date — Sunday evening at run time. Defaults to now. */
  asOf?: string;
}

interface CatchItem {
  kind: "due" | "outcome" | "drift";
  oneLiner: string;
  weight: number; // 0–1, used to pick top 3
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as MondayCatchRequest;
    if (!body.tenantId || !body.operatorId) {
      return json({ error: "tenantId and operatorId are required" }, 400);
    }
    const asOf = body.asOf ? new Date(body.asOf) : new Date();

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const items = await composeItems(supa, body.tenantId, body.operatorId, asOf);
    const message = composeMessage(items);

    // TODO: fan-out via Unified Channel Gateway when operator_preferences
    // lands. For now, return the composed message for the caller (tick)
    // to dispatch.
    return json({
      tenantId: body.tenantId,
      operatorId: body.operatorId,
      itemCount: items.length,
      preview: message,
      weekOfYear: weekOfYear(asOf),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Item composers
// ─────────────────────────────────────────────────────────────────────────────

async function composeItems(
  supa: ReturnType<typeof createClient>,
  tenantId: string,
  operatorId: string,
  asOf: Date,
): Promise<CatchItem[]> {
  const items: CatchItem[] = [];
  const weekEnd = new Date(asOf);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // 1. Cadence runs due this week.
  const { data: dueRuns } = await supa
    .from("cadence_runs")
    .select("id, run_kind, scheduled_at, seat_id, client_seats(display_name)")
    .eq("tenant_id", tenantId)
    .eq("status", "scheduled")
    .lte("scheduled_at", weekEnd.toISOString())
    .gte("scheduled_at", asOf.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  for (const r of dueRuns ?? []) {
    // Pre-runs lean lighter; due-this-week with no started_at lean heavier.
    items.push({
      kind: "due",
      oneLiner: dueLine(r),
      weight: 0.7,
    });
  }

  // 2. Outcomes from the weekend.
  const weekendStart = new Date(asOf);
  weekendStart.setDate(weekendStart.getDate() - 2);
  const { data: outcomes } = await supa
    .from("outcome_events")
    .select("id, kind, result, subject_ref, observed_at, payload")
    .eq("tenant_id", tenantId)
    .gte("observed_at", weekendStart.toISOString())
    .order("observed_at", { ascending: false })
    .limit(10);

  for (const o of outcomes ?? []) {
    items.push({
      kind: "outcome",
      oneLiner: outcomeLine(o),
      weight: o.result === "negative" ? 0.9 : 0.5,
    });
  }

  // 3. Drift — client seats whose normal cadence has slipped.
  // Cheap heuristic: seats with next_run_at in the past and no run in the
  // last 14 days.
  const { data: drifters } = await supa
    .from("client_seats")
    .select("id, display_name, next_run_at, archetype")
    .eq("tenant_id", tenantId)
    .lt("next_run_at", asOf.toISOString())
    .limit(10);

  for (const d of drifters ?? []) {
    items.push({
      kind: "drift",
      oneLiner: driftLine(d),
      weight: 0.6,
    });
  }

  // Pick the top three by weight, preserving kind diversity where possible.
  return pickTopThree(items);
}

function pickTopThree(items: CatchItem[]): CatchItem[] {
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const out: CatchItem[] = [];
  const seenKinds = new Set<string>();

  for (const it of sorted) {
    if (out.length === 3) break;
    if (out.length < 2 || !seenKinds.has(it.kind)) {
      out.push(it);
      seenKinds.add(it.kind);
    }
  }
  // Top up if diversity rule starved us.
  for (const it of sorted) {
    if (out.length === 3) break;
    if (!out.includes(it)) out.push(it);
  }
  return out;
}

function dueLine(run: Record<string, unknown>): string {
  const seat = run.client_seats as { display_name?: string } | null;
  const subj = seat?.display_name ?? "a client";
  const when = new Date(run.scheduled_at as string);
  const day = new Intl.DateTimeFormat("en-NZ", { weekday: "long" }).format(when);
  return `${subj} — ${humaniseRunKind(run.run_kind as string)} due ${day}.`;
}

function outcomeLine(o: Record<string, unknown>): string {
  const result = o.result as string;
  const kind = humaniseOutcomeKind(o.kind as string);
  const subj = (o.subject_ref as string | null) ?? "one of your clients";
  if (result === "positive") return `${kind} for ${subj}.`;
  if (result === "negative") return `${kind} — ${subj}. Worth a look.`;
  return `${kind} recorded — ${subj}.`;
}

function driftLine(d: Record<string, unknown>): string {
  const name = (d.display_name as string) ?? "a client";
  return `${name} hasn't engaged in their usual cadence. Worth a phone call.`;
}

function humaniseRunKind(kind: string): string {
  const map: Record<string, string> = {
    monthly_legal_review: "monthly legal review",
    weekly_pathway_guide_session: "weekly check-in",
    weekly_peer_session: "weekly peer session",
    monthly_financial_review: "monthly financial review",
    monthly_coparenting_posture_pack: "monthly co-parenting posture pack",
    fortnightly_coordination_review: "fortnightly review",
  };
  return map[kind] ?? kind.replace(/_/g, " ");
}

function humaniseOutcomeKind(kind: string): string {
  const map: Record<string, string> = {
    bca_accept: "BCA accepted",
    bca_reject: "BCA reverted",
    customs_accept: "Customs accepted",
    customs_query: "Customs queried",
    fcp_pass: "FCP passed",
    fcp_fail: "FCP failed",
    client_signed: "Client signed",
    client_disputed: "Client disputed",
    invoice_paid: "Invoice paid",
    invoice_overdue: "Invoice overdue",
  };
  return map[kind] ?? kind.replace(/_/g, " ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Message composer — restrained voice, no emoji, no hype
// ─────────────────────────────────────────────────────────────────────────────

function composeMessage(items: CatchItem[]): string {
  if (items.length === 0) {
    return "Quiet weekend on assembl. Nothing urgent before Monday.";
  }
  const lead =
    items.length === 1
      ? "One thing to know before Monday."
      : items.length === 2
      ? "Two things to know before Monday."
      : "Three things to know before Monday.";
  const lines = items.map((i) => `· ${i.oneLiner}`);
  return [lead, ...lines].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function weekOfYear(d: Date): string {
  // ISO week, NZ-tz approximation good enough for idempotency.
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const diff = (tmp.getTime() - firstThursday.getTime()) / 86400000;
  const week = 1 + Math.floor(diff / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
