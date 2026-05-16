import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  buildAmbientPrompt,
  fallbackAmbientDraft,
  fleetForKete,
  isKeteSlug,
  requiredScopesForAmbientRun,
  type AmbientAgentSpec,
  type AmbientDraft,
  type KeteSlug,
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
const FROM_DOMAIN = Deno.env.get("ASSEMBL_EMAIL_FROM_DOMAIN") ?? "assembl.co.nz";
const SENDER_DOMAIN = Deno.env.get("RESEND_SENDER_DOMAIN") ?? FROM_DOMAIN;

const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type TenantRow = {
  id: string;
  name: string;
  slug?: string | null;
  plan?: string | null;
  billing_email?: string | null;
  is_active?: boolean | null;
  metadata?: Record<string, unknown> | null;
  kete_primary?: string | null;
  status?: string | null;
};

type IntakeRow = {
  contact_email?: string | null;
  contact_name?: string | null;
  timezone?: string | null;
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

function localParts(timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hour: Number(part("hour")),
  };
}

function isActiveTenant(tenant: TenantRow): boolean {
  if (tenant.is_active === false) return false;
  if (!tenant.status) return true;
  return ["active", "provisioned", "trial"].includes(tenant.status);
}

function keteForTenant(tenant: TenantRow): KeteSlug {
  const raw = tenant.kete_primary ?? tenant.metadata?.kete_primary ?? tenant.metadata?.kete;
  return isKeteSlug(raw) ? raw : "waihanga";
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
    console.warn("[morning-briefing] intake lookup failed", error.message);
    return null;
  }
  return data as IntakeRow | null;
}

async function operatorUserId(tenantId: string): Promise<string | null> {
  const { data, error } = await adminDb
    .from("tenant_members")
    .select("user_id, role")
    .eq("tenant_id", tenantId)
    .in("role", ["operator", "admin", "manager"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[morning-briefing] operator lookup failed", error.message);
    return null;
  }
  return (data as { user_id?: string } | null)?.user_id ?? null;
}

async function callKeteEndpoint(
  tenant: TenantRow,
  kete: KeteSlug,
  agent: AmbientAgentSpec,
  liveContext: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await adminDb.functions.invoke(agent.endpoint, {
    body: {
      action: "morning-briefing",
      actionType: "morning-briefing",
      project_id: tenant.id,
      user_id: tenant.id,
      userId: tenant.id,
      kete,
      agent: agent.slug,
      payload: { tenant_slug: tenant.slug, phase: agent.phase },
      context: liveContext,
      requestId: `morning-${tenant.id}-${agent.slug}-${Date.now()}`,
    },
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "X-Assembl-Agent": agent.slug,
      "X-Assembl-Kete": kete,
    },
  });
  if (error) {
    return { endpoint_unavailable: true, message: error.message };
  }
  return (data as Record<string, unknown>) ?? null;
}

async function callGatewayDraft(
  tenant: TenantRow,
  kete: KeteSlug,
  agent: AmbientAgentSpec,
  liveContext: Record<string, unknown>,
  endpointSignal: Record<string, unknown> | null,
): Promise<AmbientDraft | null> {
  if (!LOVABLE_API_KEY) return null;
  const prompt = buildAmbientPrompt({
    action: "morning-briefing",
    tenant_id: tenant.id,
    tenant_slug: tenant.slug ?? tenant.name,
    kete,
    agent: agent.slug,
    phase: agent.phase,
    live_context: liveContext,
    metadata: { endpoint_signal: endpointSignal },
  }, agent);
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-5",
      messages: [
        {
          role: "system",
          content:
            agent.systemPrompt +
            " Return strict JSON with title, body, confidence, citations, and extracted_actions. Do not send anything.",
        },
        {
          role: "user",
          content: [
            prompt,
            "",
            "[Live data snapshot]",
            JSON.stringify(liveContext).slice(0, 12000),
            "",
            "[Kete endpoint signal]",
            JSON.stringify(endpointSignal ?? {}).slice(0, 4000),
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    }),
  });
  if (!response.ok) return null;
  const json = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as Partial<AmbientDraft>;
    if (!parsed.title || !parsed.body) return null;
    return {
      title: parsed.title,
      body: parsed.body,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.72,
      citations: Array.isArray(parsed.citations) ? parsed.citations.map(String) : [],
      extracted_actions: Array.isArray(parsed.extracted_actions)
        ? parsed.extracted_actions.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
        : [],
    };
  } catch {
    return null;
  }
}

async function insertDraft(
  tenant: TenantRow,
  kete: KeteSlug,
  agent: AmbientAgentSpec,
  draft: AmbientDraft,
  liveContext: Record<string, unknown>,
  endpointSignal: Record<string, unknown> | null,
) {
  // No auto-send: every morning briefing item waits for operator review.
  const { error } = await adminDb.from("toro_drafts").insert({
    tenant_id: tenant.id,
    source: "ambient",
    source_metadata: {
      action: "morning-briefing",
      kete,
      agent: agent.slug,
      agent_name: agent.name,
      phase: agent.phase,
      title: draft.title,
      citations: draft.citations,
      live_context: liveContext,
      endpoint_signal: endpointSignal,
    },
    retention_class: "standard",
    contact_name: tenant.name,
    contact_identifier: tenant.slug ?? tenant.id,
    incoming_body: "Daily operator briefing",
    draft_body: draft.body,
    confidence: draft.confidence,
    status: "pending_approval",
    created_by_agent: agent.slug,
    extracted_actions: draft.extracted_actions,
  });
  if (error) throw error;
}

async function enqueueSummaryEmail(to: string, tenant: TenantRow, draftCount: number, timezone: string) {
  const messageId = crypto.randomUUID();
  const subject = `${draftCount} drafts ready for ${tenant.name}`;
  const text = [
    "Mahi that earns its proof.",
    "",
    `${draftCount} drafts are ready in your operator inbox for today's briefing.`,
    `Tenant: ${tenant.name}`,
    `Timezone: ${timezone}`,
    "",
    `Open /app/${tenant.slug ?? tenant.id}/inbox to review, edit, approve, reject, or defer.`,
  ].join("\n");
  const html = text
    .split("\n")
    .map((line) => line ? `<p>${line.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>` : "<br />")
    .join("");

  await adminDb.from("email_send_log").insert({
    message_id: messageId,
    template_name: "morning-briefing",
    recipient_email: to,
    status: "pending",
    metadata: { tenant_id: tenant.id, draft_count: draftCount },
  });

  const { error } = await adminDb.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `Assembl <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      template_name: "morning-briefing",
      metadata: { tenant_id: tenant.id, draft_count: draftCount },
    },
  });
  if (error) throw error;
}

async function processTenant(
  req: Request,
  tenant: TenantRow,
  opts: { scheduled: boolean; dryRun: boolean; force: boolean; maxAgents: number },
) {
  const intake = await latestIntake(tenant.id);
  const timezone = intake?.timezone || "Pacific/Auckland";
  const local = localParts(timezone);

  if (opts.scheduled && !opts.force && local.hour !== 6) {
    return { tenant_id: tenant.id, skipped: true, reason: "not_6am_local", timezone, local };
  }

  let runId: string | null = null;
  if (!opts.dryRun) {
    const { data, error } = await adminDb
      .from("morning_briefing_runs")
      .insert({
        tenant_id: tenant.id,
        briefing_date: local.date,
        timezone,
        status: "running",
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505" && !opts.force) {
        return { tenant_id: tenant.id, skipped: true, reason: "already_ran", timezone, local };
      }
      throw error;
    }
    runId = (data as { id: string }).id;
  }

  const kete = keteForTenant(tenant);
  const agents = fleetForKete(kete).slice(0, Math.max(1, Math.min(opts.maxAgents, 12)));
  const operatorId = await operatorUserId(tenant.id);
  const created: Array<{ agent: string; phase: string; title: string }> = [];

  try {
    for (const agent of agents) {
      const liveCtx = await buildLiveDataContext(req, {
        agentCode: agent.slug,
        kete,
        tenantId: tenant.id,
        requiredScopes: [...requiredScopesForAmbientRun(kete, "morning-briefing")] as LiveDataScope[],
      });
      const liveSnapshot = await buildLiveDataSnapshot(liveCtx, {
        kete,
        query: `Morning briefing for ${tenant.name} by ${agent.name}`,
        include: [...requiredScopesForAmbientRun(kete, "morning-briefing")] as LiveDataScope[],
      });
      const endpointSignal = await callKeteEndpoint(tenant, kete, agent, liveSnapshot);
      const generated = await callGatewayDraft(tenant, kete, agent, liveSnapshot, endpointSignal);
      const draft = generated ?? fallbackAmbientDraft({
        action: "morning-briefing",
        tenant_id: tenant.id,
        tenant_slug: tenant.slug ?? tenant.name,
        kete,
        agent: agent.slug,
        phase: agent.phase,
        live_context: liveSnapshot,
        metadata: { endpoint_signal: endpointSignal },
      }, agent);

      if (!opts.dryRun) {
        await insertDraft(tenant, kete, agent, draft, liveSnapshot, endpointSignal);
        await liveCtx.audit({
          action: "morning_briefing_draft_created",
          scope: "memory",
          request_summary: `${kete}/${agent.slug}/${agent.phase}`,
          response_summary: draft.title,
        });
      }
      created.push({ agent: agent.slug, phase: agent.phase, title: draft.title });
    }

    const to = tenant.billing_email || intake?.contact_email;
    if (to && created.length && !opts.dryRun) {
      await enqueueSummaryEmail(to, tenant, created.length, timezone);
    }

    if (runId) {
      await adminDb
        .from("morning_briefing_runs")
        .update({
          status: "success",
          drafts_created: created.length,
          completed_at: new Date().toISOString(),
          summary: { kete, drafts: created, emailed: Boolean(to) },
        })
        .eq("id", runId);
    }

    return {
      tenant_id: tenant.id,
      tenant_slug: tenant.slug,
      kete,
      timezone,
      local,
      drafts_created: created.length,
      email_queued: Boolean(to && created.length && !opts.dryRun),
      operator_user_id: operatorId,
    };
  } catch (error) {
    if (runId) {
      await adminDb
        .from("morning_briefing_runs")
        .update({
          status: "error",
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const unauthorized = requireServiceRole(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({})) as {
    tenant_id?: string;
    scheduled?: boolean;
    dry_run?: boolean;
    force?: boolean;
    limit?: number;
    max_agents_per_tenant?: number;
  };

  let query = adminDb
    .from("tenants")
    .select("id, name, slug, plan, billing_email, is_active, metadata, kete_primary, status")
    .eq("plan", "industry-pack")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(Math.max(1, Math.min(body.limit ?? 25, 100)));
  if (body.tenant_id) query = query.eq("id", body.tenant_id);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);

  const tenants = ((data as TenantRow[]) ?? []).filter(isActiveTenant);
  const results: Array<Record<string, unknown>> = [];
  for (const tenant of tenants) {
    try {
      results.push(await processTenant(req, tenant, {
        scheduled: body.scheduled !== false,
        dryRun: body.dry_run === true,
        force: body.force === true,
        maxAgents: body.max_agents_per_tenant ?? 9,
      }));
    } catch (error) {
      results.push({
        tenant_id: tenant.id,
        tenant_slug: tenant.slug,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return json({
    ok: true,
    tenants_checked: tenants.length,
    drafts_created: results.reduce((sum, item) => sum + (typeof item.drafts_created === "number" ? item.drafts_created : 0), 0),
    results,
  });
});
