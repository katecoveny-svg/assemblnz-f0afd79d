import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { isKeteSlug } from '@/lib/public-chat/tenant';

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
  message?: string;
  sessionId?: string;
  chatId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  kete_primary: string | null;
  billing_email: string | null;
  credit_nzd: number | string | null;
  is_active: boolean | null;
  status?: string | null;
  metadata: Record<string, unknown> | null;
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
  error?: string;
}) {
  const service = getServiceClient();
  const base = {
    user_id: args.tenant.id,
    agent_name: `agent-${args.kete}`,
    session_id: args.sessionId,
    message_count: 1,
    input_tokens: args.inputTokens,
    output_tokens: args.outputTokens,
    model_used: `agent-${args.kete}`,
    complexity: 'public-widget',
    estimated_cost_nzd: ESTIMATED_COST_PER_MESSAGE_NZD,
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
    agent_code: `agent-${args.kete}`,
    kete_code: args.kete,
    model_used: `agent-${args.kete}`,
    model_tier: 'tenant-agent',
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
  const message = body.message?.trim();
  const sessionId = body.sessionId?.trim() || crypto.randomUUID();
  const chatId = body.chatId?.trim() || crypto.randomUUID();

  if (!slug || !message) return json({ error: 'Missing tenant slug or message' }, 400);

  const service = getServiceClient();
  const { data, error } = await service
    .from('tenants')
    .select('id,slug,name,kete_primary,billing_email,credit_nzd,is_active,status,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
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
  const inputTokens = estimateTokens(message) + (body.history ?? []).reduce((sum, item) => sum + estimateTokens(item.content), 0);
  const usage = await sessionUsage(service, sessionId);
  const creditNzd = Number(tenant.credit_nzd ?? 0);
  const tenantSpend = creditNzd > 0 ? await tenantMonthSpend(service, tenant.id) : 0;

  if (
    usage.messages >= MAX_SESSION_MESSAGES ||
    usage.tokens + inputTokens > MAX_SESSION_TOKENS ||
    (creditNzd > 0 && tenantSpend >= creditNzd)
  ) {
    const fallback = takingABreak(email);
    await logPublicAnalytics({
      tenant,
      kete,
      sessionId,
      inputTokens,
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
      inputTokens,
      outputTokens: estimateTokens(fallback),
      responseTimeMs: Date.now() - started,
      error: 'agent_endpoint_unavailable',
    });
    return streamText(fallback, {
      status: 200,
      headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
    });
  }

  const { data: agentData, error: invokeError } = await service.functions.invoke(`agent-${kete}`, {
    body: {
      action: 'public_chat',
      actionType: 'public_chat',
      project_id: tenant.id,
      user_id: tenant.id,
      userId: tenant.id,
      kete,
      payload: {
        message,
        tenant_slug: slug,
        history: body.history?.slice(-8) ?? [],
        channel: 'public-widget',
        session_id: sessionId,
        chat_id: chatId,
      },
      context: {
        channel: 'public-widget',
        tenant_slug: slug,
        previousMessages: body.history?.slice(-8) ?? [],
      },
      requestId: chatId,
    },
  });

  const responseText = invokeError
    ? takingABreak(email)
    : agentText(agentData) || takingABreak(email);
  await logPublicAnalytics({
    tenant,
    kete,
    sessionId,
    inputTokens,
    outputTokens: estimateTokens(responseText),
    responseTimeMs: Date.now() - started,
    error: invokeError?.message,
  });

  return streamText(responseText, {
    status: 200,
    headers: { 'X-Chat-Id': chatId, 'X-Session-Id': sessionId },
  });
}
