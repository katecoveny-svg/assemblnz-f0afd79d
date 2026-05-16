// Business Pulse weekly brief — edge function.
//
// SCAFFOLD (16 May 2026). Connector calls are stubbed. Wire each one
// against the real MCP server entry in plugins/mcp-servers/ before
// enabling the cron at scale. The brief never sends, posts, pays, or
// transmits — every recommended action is staged as a draft.
//
// Pattern mirrors morning-briefing/index.ts (same repo): hourly cron,
// per-tenant local-time gating against tenant_intake.timezone, so the
// schedule fires at local Monday 07:00 regardless of the tenant's
// timezone.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type TenantRow = {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean | null;
  metadata: Record<string, unknown> | null;
};

type IntakeRow = {
  contact_email: string | null;
  contact_name: string | null;
  timezone: string | null;
};

type ThreeThing = {
  source: "xero" | "stripe" | "calendar" | "hubspot" | "pilot";
  thing: string;
  next_action: string;
  draft_location: string | null;
  action_staged: boolean;
};

type BriefSections = {
  three_things: ThreeThing[];
  cash_position: Record<string, unknown> | null;
  pipeline_movement: Record<string, unknown> | null;
  weekly_commitments: Record<string, unknown> | null;
  pilot_health: Record<string, unknown> | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireServiceRole(req: Request): Response | null {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== SERVICE_ROLE) {
    return json({ error: "Service role required" }, 401);
  }
  return null;
}

function localDayAndHour(timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: part("weekday"),
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hour: Number(part("hour")),
  };
}

async function latestIntake(tenantId: string): Promise<IntakeRow | null> {
  const { data, error } = await adminDb
    .from("tenant_intake")
    .select("contact_email, contact_name, timezone")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[business-pulse] tenant_intake fetch failed:", tenantId, error.message);
    return null;
  }
  return data;
}

// -------------------------------------------------------------------
// Connector stubs. Replace each with the real MCP server call before
// shipping to a paying operator. None of these has credentials yet,
// which is intentional — the scaffold ships the shape, not live data.
// -------------------------------------------------------------------

async function fetchXeroCashPosition(_tenantId: string) {
  return {
    _stub: true,
    note: "Wire to mcp__xero__list_bank_balances + list_invoices + list_bills",
    bank_balance_nzd: null,
    ar_outstanding_nzd: null,
    ap_outstanding_nzd: null,
    forecast_14d_nzd: null,
    below_floor: false,
  };
}

async function fetchStripeSettlements(_tenantId: string) {
  return {
    _stub: true,
    note: "Wire to mcp__stripe__list_payouts + list_refunds + list_disputes",
    net_settlements_7d_nzd: null,
    refunds_7d_nzd: null,
    open_disputes: [] as unknown[],
  };
}

async function fetchCalendarWeekAhead(_tenantId: string) {
  return {
    _stub: true,
    note: "Wire to mcp__google-calendar__list_events or microsoft-calendar",
    events: [] as unknown[],
    external_meetings_count: 0,
    prep_required_today: false,
  };
}

async function fetchHubSpotPipeline(_tenantId: string) {
  return null; // optional connector — null when not connected
}

// -------------------------------------------------------------------
// Synthesis. This is the judgment layer described by
// plugins/arataki/skills/pulse-synthesis/SKILL.md. Scaffold scores
// candidates deterministically so the row shape is correct; replace
// with a model call to the arataki/business-pulse agent before
// enabling for paying operators.
// -------------------------------------------------------------------

function synthesise(
  cash: Awaited<ReturnType<typeof fetchXeroCashPosition>>,
  stripe: Awaited<ReturnType<typeof fetchStripeSettlements>>,
  cal: Awaited<ReturnType<typeof fetchCalendarWeekAhead>>,
  hubspot: Awaited<ReturnType<typeof fetchHubSpotPipeline>>,
): BriefSections {
  const candidates: ThreeThing[] = [];

  if (cash.below_floor) {
    candidates.push({
      source: "xero",
      thing: "14-day cash forecast is below your cash floor",
      next_action: "Review the AR aging report and consider follow-up on the largest outstanding invoice",
      draft_location: null,
      action_staged: false,
    });
  }

  for (const dispute of stripe.open_disputes as Array<{ id?: string; due_at?: string }>) {
    candidates.push({
      source: "stripe",
      thing: `Open Stripe dispute ${dispute.id ?? "(id pending)"}`,
      next_action: "Raise with the operator's payments contact for response",
      draft_location: null,
      action_staged: false,
    });
  }

  if (cal.prep_required_today) {
    candidates.push({
      source: "calendar",
      thing: "Meeting today needs prep and no prep block is scheduled",
      next_action: "Block 30 minutes before the meeting for preparation",
      draft_location: null,
      action_staged: false,
    });
  }

  return {
    three_things: candidates.slice(0, 3),
    cash_position: cash,
    pipeline_movement: hubspot,
    weekly_commitments: cal,
    pilot_health: null, // never populated on customer briefs
  };
}

// -------------------------------------------------------------------
// Compliance checks. Scaffold returns pass; real implementation calls
// assembl-core/tikanga-compliance and assembl-core/nz-privacy-act-2020
// skills via the agent runtime.
// -------------------------------------------------------------------

function tikangaCheck(_sections: BriefSections) {
  return { passed: true, notes: "Scaffold — wire to assembl-core/tikanga-compliance skill" };
}

function privacyCheck(_sections: BriefSections) {
  return { passed: true, notes: "Scaffold — wire to assembl-core/nz-privacy-act-2020 skill" };
}

// -------------------------------------------------------------------
// Per-tenant run. Gated to local Monday 07:00 in the tenant's timezone.
// -------------------------------------------------------------------

async function runForTenant(tenant: TenantRow, force: boolean) {
  const intake = await latestIntake(tenant.id);
  const tz = intake?.timezone ?? "Pacific/Auckland";
  const { weekday, date, hour } = localDayAndHour(tz);

  // Gate: only Monday 07:00 local, unless force.
  if (!force && (weekday !== "Mon" || hour !== 7)) {
    return { tenant_id: tenant.id, skipped: true, reason: `local time ${weekday} ${hour}:00 not Mon 07:00` };
  }

  // Don't re-run if a brief already exists for this date.
  const { data: existing } = await adminDb
    .from("business_pulse_briefs")
    .select("id, run_status")
    .eq("tenant_id", tenant.id)
    .eq("brief_date", date)
    .maybeSingle();

  if (existing && existing.run_status === "completed" && !force) {
    return { tenant_id: tenant.id, skipped: true, reason: "already-completed" };
  }

  const [cash, stripe, cal, hubspot] = await Promise.all([
    fetchXeroCashPosition(tenant.id),
    fetchStripeSettlements(tenant.id),
    fetchCalendarWeekAhead(tenant.id),
    fetchHubSpotPipeline(tenant.id),
  ]);

  const sections = synthesise(cash, stripe, cal, hubspot);
  const tikanga = tikangaCheck(sections);
  const privacy = privacyCheck(sections);

  const { data, error } = await adminDb
    .from("business_pulse_briefs")
    .upsert(
      {
        tenant_id: tenant.id,
        brief_date: date,
        timezone: tz,
        drive_path: `Assembl-Drive/${tenant.slug ?? tenant.id}/business-pulse/${date}-pulse.md`,
        three_things: sections.three_things,
        cash_position: sections.cash_position,
        pipeline_movement: sections.pipeline_movement,
        weekly_commitments: sections.weekly_commitments,
        pilot_health: sections.pilot_health,
        tikanga_check_passed: tikanga.passed,
        tikanga_notes: tikanga.notes,
        privacy_check_passed: privacy.passed,
        privacy_notes: privacy.notes,
        run_status: "completed",
        generated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,brief_date" },
    )
    .select("id")
    .single();

  if (error) {
    console.error("[business-pulse] upsert failed", tenant.id, error);
    return { tenant_id: tenant.id, error: error.message };
  }

  return { tenant_id: tenant.id, brief_id: data.id, skipped: false };
}

// -------------------------------------------------------------------
// Handler.
// -------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = requireServiceRole(req);
  if (auth) return auth;

  let body: { force?: boolean; tenant_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — defaults
  }

  const force = body.force === true;

  let tenantsQuery = adminDb
    .from("tenants")
    .select("id, name, slug, is_active, metadata")
    .neq("is_active", false);

  if (body.tenant_id) {
    tenantsQuery = tenantsQuery.eq("id", body.tenant_id);
  }

  const { data: tenants, error: tenantsError } = await tenantsQuery;
  if (tenantsError) {
    return json({ error: tenantsError.message }, 500);
  }

  const results = [];
  for (const t of (tenants ?? []) as TenantRow[]) {
    try {
      results.push(await runForTenant(t, force));
    } catch (err) {
      console.error("[business-pulse] tenant run failed", t.id, err);
      results.push({ tenant_id: t.id, error: String(err) });
    }
  }

  return json({ ran: results.length, results });
});
