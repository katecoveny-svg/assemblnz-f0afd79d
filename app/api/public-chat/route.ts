import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { isKeteSlug } from '@/lib/public-chat/tenant';
import { uuidOrNew } from '@/lib/public-chat/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED_AGENT_ENDPOINTS = new Set([
  'waihanga',
  'manaaki',
  'pikau',
  'arataki',
  'auaha',
  'ako',
  'matauranga',
  'hoko',
  'toro',
]);
const MAX_SESSION_MESSAGES = 20;
const MAX_SESSION_TOKENS = 10_000;
const ESTIMATED_COST_PER_MESSAGE_NZD = 0.12;
const FALLBACK_EMAIL = 'hello@assembl.co.nz';

type ChatRequest = {
  slug?: string;
  kete?: string;
  agent?: string;
  message?: string;
  sessionId?: string;
  chatId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  imageDataUrl?: string;
  redactPii?: boolean;
};

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  kete_primary: string | null;
  billing_email: string | null;
  is_active: boolean | null;
  status?: string | null;
  metadata: Record<string, unknown> | null;
};

// iho-router response shape. Mirrors IhoResponse in supabase/functions/iho-router/index.ts.
// We do not redeclare the full type — we only access the fields the public-chat
// surface needs, with defensive parsing because edge-function output is JSON.
type IhoRouterResponse = {
  response?: string;
  agentUsed?: { code?: string; name?: string; pack?: string; model?: string };
  modelUsed?: string;
  providerUsed?: 'anthropic' | 'gemini';
  tokensUsed?: { input?: number; output?: number; total?: number };
  cost?: { usd?: number; nzdAmount?: number };
  complianceStatus?: {
    passed?: boolean;
    piiDetected?: boolean;
    piiMasked?: boolean;
    dataClassification?: string;
    policies?: string[];
    mana?: { passed?: boolean; blockers?: string[]; warnings?: string[] };
  };
  auditLog?: { requestId?: string };
  error?: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function estimateTokens(text: string): number {
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.35);
}

function takingABreak(email: string | null) {
  return `Our chat is taking a short break. Please email ${email || FALLBACK_EMAIL}.`;
}

function streamText(text: string, init?: ResponseInit) {
  const encoder = new TextEncoder();
  const words = text.match(/\S+\s*/g) ?? [text];
  return new Response(
    new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        controller.close();
      },
    }),
    {
      ...init,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...(init?.headers ?? {}),
      },
    },
  );
}

function tenantIsActive(tenant: TenantRow) {
  if (tenant.is_active === false) return false;
  if (!tenant.status) return true;
  return ['active', 'provisioned', 'trial'].includes(tenant.status);
}

function pickKete(tenant: TenantRow, requested?: string) {
  if (isKeteSlug(requested)) return requested;
  if (isKeteSlug(tenant.kete_primary)) return tenant.kete_primary;
  const metadataKete = tenant.metadata?.kete_primary ?? tenant.metadata?.kete;
  if (isKeteSlug(metadataKete)) return metadataKete;
  return 'waihanga';
}

function optionalNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function agentText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return String(payload ?? '');
  const data = payload as Record<string, unknown>;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.content === 'string') return data.content;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.draft === 'string') return data.draft;
  if (typeof data.action === 'string') return data.action;
  if (Array.isArray(data.explanations)) {
    return data.explanations
      .map((item) => {
        if (!item || typeof item !== 'object') return '';
        const row = item as Record<string, unknown>;
        return typeof row.reasoning === 'string' ? row.reasoning : '';
      })
      .filter(Boolean)
      .join('\n\n');
  }
  return JSON.stringify(data, null, 2);
}

async function sessionUsage(service: ReturnType<typeof getServiceClient>, sessionId: string) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data } = await service
    .from('agent_analytics')
    .select('input_tokens,output_tokens,estimated_cost_nzd')
    .eq('session_id', sessionId)
    .gte('created_at', monthStart.toISOString());

  const rows = (data ?? []) as Array<{
    input_tokens?: number | null;
    output_tokens?: number | null;
    estimated_cost_nzd?: number | null;
  }>;

  return rows.reduce(
    (acc, row) => ({
      messages: acc.messages + 1,
      tokens: acc.tokens + Number(row.input_tokens ?? 0) + Number(row.output_tokens ?? 0),
      spend: acc.spend + Number(row.estimated_cost_nzd ?? 0),
    }),
    { messages: 0, tokens: 0, spend: 0 },
  );
}

async function tenantMonthSpend(service: ReturnType<typeof getServiceClient>, tenantId: string) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data } = await service
    .from('agent_analytics')
    .select('estimated_cost_nzd')
    .eq('user_id', tenantId)
    .gte('created_at', monthStart.toISOString());

  return ((data ?? []) as Array<{ estimated_cost_nzd?: number | null }>).reduce(
    (sum, row) => sum + Number(row.estimated_cost_nzd ?? 0),
    0,
  );
}

async function logPublicAnalytics(args: {
  tenant: TenantRow;
  kete: string;
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  costNzd?: number;
  modelUsed?: string;
  agentCode?: string;
  error?: string;
}) {
  const service = getServiceClient();
  const base = {
    user_id: args.tenant.id,
    agent_name: args.agentCode ?? `agent-${args.kete}`,
    session_id: args.sessionId,
    message_count: 1,
    input_tokens: args.inputTokens,
    output_tokens: args.outputTokens,
    model_used: args.modelUsed ?? `agent-${args.kete}`,
    complexity: 'public-widget',
    estimated_cost_nzd: args.costNzd ?? ESTIMATED_COST_PER_MESSAGE_NZD,
    response_time_ms: args.responseTimeMs,
    error: Boolean(args.error),
    error_message: args.error ?? null,
  };

  const withChannel = { ...base, channel: 'public-widget' };
  const first = await service.from('agent_analytics').insert(withChannel);
  if (first.error) {
    await service.from('agent_analytics').insert(base);
  }

  await service.from('assembl_agent_analytics').insert({
    user_id: null,
    organisation_id: args.tenant.id,
    session_id: args.sessionId,
    agent_code: args.agentCode ?? `agent-${args.kete}`,
    kete_code: args.kete,
    model_used: args.modelUsed ?? `agent-${args.kete}`,
    model_tier: 'iho-router',
    intent_category: 'public_chat',
    input_tokens: args.inputTokens,
    output_tokens: args.outputTokens,
    latency_ms: args.responseTimeMs,
    success: !args.error,
    error_type: args.error ?? null,
    workflow_type: 'public-widget',
    metadata: { channel: 'public-widget', tenant_slug: args.tenant.slug },
  });
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  const body = (await req.json().catch(() => ({}))) as ChatRequest;
  const slug = body.slug?.trim();
  const message = body.message?.trim() ?? '';
  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  const redactPii = Boolean(body.redactPii);
  // Two downstream sinks (assembl_agent_analytics.session_id and
  // agent_cost_log.request_id) are typed `uuid`, and their inserts swallow
  // errors. A non-UUID id from a widget caller drops two of three analytics
  // rows silently. Coerce to a fresh UUID when the caller's value isn't one.
  const sessionId = uuidOrNew(body.sessionId);
  const chatId = uuidOrNew(body.chatId);

  if (!slug || (!message && !imageDataUrl)) return json({ error: 'Missing tenant slug or message' }, 400);

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    return streamText(takingABreak(null), {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }

  const { data, error } = await service
    .from('tenants')
    .select('id,slug,name,kete_primary,billing_email,is_active,status,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return streamText(takingABreak(null), {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }
  if (!data) return json({ error: 'Tenant not found' }, 404);

  const tenant = data as TenantRow;
  if (!tenantIsActive(tenant)) {
    return streamText(takingABreak(tenant.billing_email), {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }

  const kete = pickKete(tenant, body.kete);
  const email = tenant.billing_email ?? (typeof tenant.metadata?.contact_email === 'string' ? tenant.metadata.contact_email : null);
  const inputTokensEstimate = estimateTokens(message || 'Attached file') + (body.history ?? []).reduce((sum, item) => sum + estimateTokens(item.content), 0);
  const usage = await sessionUsage(service, sessionId);
  const creditNzd = optionalNumber(tenant.metadata?.credit_nzd);
  const tenantSpend = creditNzd > 0 ? await tenantMonthSpend(service, tenant.id) : 0;

  if (
    usage.messages >= MAX_SESSION_MESSAGES ||
    usage.tokens + inputTokensEstimate > MAX_SESSION_TOKENS ||
    (creditNzd > 0 && tenantSpend >= creditNzd)
  ) {
    const fallback = takingABreak(email);
    await logPublicAnalytics({
      tenant,
      kete,
      sessionId,
      inputTokens: inputTokensEstimate,
      outputTokens: estimateTokens(fallback),
      responseTimeMs: Date.now() - started,
      error: 'public_chat_cap',
    });
    return streamText(fallback, {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }

  if (!SUPPORTED_AGENT_ENDPOINTS.has(kete)) {
    const fallback = takingABreak(email);
    await logPublicAnalytics({
      tenant,
      kete,
      sessionId,
      inputTokens: inputTokensEstimate,
      outputTokens: estimateTokens(fallback),
      responseTimeMs: Date.now() - started,
      error: 'agent_endpoint_unavailable',
    });
    return streamText(fallback, {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }

  // ── 2026-05-19 LAUNCH-DAY HOTFIX ──
  // iho-router was returning 500 intermittently on plain-text public chat
  // (model dispatch path failing on launch traffic). Route all public-chat
  // requests through public-chat-llm — the proven path from 17 May launch
  // that loads kete system prompts from agent_prompts and calls Gemini
  // Flash directly. iho-router stays available for authed dashboard chats
  // until the dispatch path is debugged.
  //
  // public-chat-llm already handles:
  //  • per-kete system prompts from agent_prompts
  //  • sub-agent prompts via `agent` param
  //  • image_url multimodal payload
  //  • NZ-tuned PII redaction
  //  • public-chat preamble (NO PII collection, soft handoff to Pilot Sprint)
  //
  // What we lose: Kahu/Mana compliance pipeline + audit hash chain. Those
  // are still active for authed surfaces. Public chat is a demo surface
  // not deemed compliance-critical — the preamble enforces no-PII posture.
  {
    const { data: agentData, error: invokeError } = await service.functions.invoke(
      'public-chat-llm',
      {
        body: {
          kete,
          agent: body.agent ? body.agent.toLowerCase() : undefined,
          message,
          history: body.history?.slice(-8) ?? [],
          tenantId: tenant.id,
          sessionId,
          imageDataUrl: imageDataUrl || undefined,
          redactPii,
        },
      },
    );

    const responseText = invokeError ? takingABreak(email) : agentText(agentData) || takingABreak(email);
    const payload = (agentData ?? {}) as {
      inputTokens?: number;
      outputTokens?: number;
      model?: string;
      redactionSummary?: string;
    };
    const inputTokensForAnalytics = optionalNumber(payload.inputTokens) || inputTokensEstimate;
    const outputTokensForAnalytics = optionalNumber(payload.outputTokens) || estimateTokens(responseText);

    await logPublicAnalytics({
      tenant,
      kete,
      sessionId,
      inputTokens: inputTokensForAnalytics,
      outputTokens: outputTokensForAnalytics,
      responseTimeMs: Date.now() - started,
      modelUsed: payload.model,
      agentCode: `public-chat-${kete}`,
      error: invokeError?.message,
    });

    const headers: Record<string, string> = {
      'X-Chat-Id': chatId,
      'X-Session-Id': sessionId,
      'X-Agent-Code': `public-chat-${kete}`,
    };
    if (payload.model) headers['X-Model-Used'] = payload.model;
    if (payload.redactionSummary) headers['X-Pii-Redaction'] = payload.redactionSummary;
    if (redactPii) headers['X-Pii-Masked'] = 'true';
    if (imageDataUrl) headers['X-Attachment-Read'] = 'true';
    return streamText(responseText, { status: 200, headers });
  }

}
