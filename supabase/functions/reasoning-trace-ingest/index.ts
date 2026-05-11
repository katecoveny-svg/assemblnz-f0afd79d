// reasoning-trace-ingest
// ---------------------------------------------------------------------------
// Captures one reasoning trace per model invocation. Called by mcp-chat,
// claude-chat, and any agent that wraps an LLM call.
//
// Two endpoints on one function:
//   POST /reasoning-trace-ingest                — write a new trace
//   POST /reasoning-trace-ingest?action=outcome — bind an outcome to one or
//                                                  more existing traces
//
// Spec: voyage-hybrid-services.md §7 follow-up.
// Schema: supabase/migrations/20260511150200_reasoning_outcome_ledger.sql
//
// Why a dedicated function rather than inlining the insert: the upstream
// chat functions stream tokens to the client and shouldn't block on a
// ledger write. They fire-and-forget to this function, which handles the
// hash-chain stamp and PII-already-masked invariant.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IngestRequest {
  tenantId: string;
  agentId: string;
  modelId: string;
  tier?: number;
  request: Record<string, unknown>;
  draft?: string;
  thinking?: string;
  toolCalls?: unknown[];
  inputTokens?: number;
  outputTokens?: number;
  thinkingTokens?: number;
  latencyMs?: number;
  costNzd?: number;
  selfCritique?: string;
  qualityScore?: number;
  flagged?: boolean;
  flagReason?: string;
  conversationId?: string;
  auditLogId?: string;
  evidencePackId?: string;
  escalationEventId?: string;
}

interface OutcomeRequest {
  tenantId: string;
  kind: string;
  result: "positive" | "neutral" | "negative";
  subjectRef?: string;
  subjectKind?: string;
  traceIds: string[];
  payload?: Record<string, unknown>;
  source: "webhook" | "operator" | "agent" | "inferred";
  observedAt?: string;
}

async function sha256(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.join("|"));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "trace";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "outcome") {
      return await handleOutcome(req, supa);
    }
    return await handleTrace(req, supa);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

async function handleTrace(
  req: Request,
  supa: ReturnType<typeof createClient>,
): Promise<Response> {
  const body = (await req.json()) as IngestRequest;

  if (!body.tenantId || !body.agentId || !body.modelId || !body.request) {
    return json(
      { error: "tenantId, agentId, modelId, and request are required" },
      400,
    );
  }

  // Hash-chain stamp. We read the most recent trace for this tenant and
  // chain off its this_hash. Genesis on first write.
  const { data: prevRow } = await supa
    .from("reasoning_traces")
    .select("this_hash")
    .eq("tenant_id", body.tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const prevHash =
    (prevRow?.this_hash as string | undefined) ?? "GENESIS";

  const payloadForHash = JSON.stringify({
    agentId: body.agentId,
    modelId: body.modelId,
    request: body.request,
    draft: body.draft ?? "",
    thinking: body.thinking ?? "",
  });
  const thisHash = await sha256([prevHash, payloadForHash]);

  const { data: inserted, error } = await supa
    .from("reasoning_traces")
    .insert({
      tenant_id: body.tenantId,
      agent_id: body.agentId,
      model_id: body.modelId,
      tier: body.tier ?? null,
      request: body.request,
      draft: body.draft ?? null,
      thinking: body.thinking ?? null,
      tool_calls: body.toolCalls ?? [],
      input_tokens: body.inputTokens ?? null,
      output_tokens: body.outputTokens ?? null,
      thinking_tokens: body.thinkingTokens ?? null,
      latency_ms: body.latencyMs ?? null,
      cost_nzd: body.costNzd ?? null,
      self_critique: body.selfCritique ?? null,
      quality_score: body.qualityScore ?? null,
      flagged: body.flagged ?? false,
      flag_reason: body.flagReason ?? null,
      conversation_id: body.conversationId ?? null,
      audit_log_id: body.auditLogId ?? null,
      evidence_pack_id: body.evidencePackId ?? null,
      escalation_event_id: body.escalationEventId ?? null,
      prev_hash: prevHash,
      this_hash: thisHash,
    })
    .select("id")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);

  return json({ traceId: inserted?.id, thisHash });
}

async function handleOutcome(
  req: Request,
  supa: ReturnType<typeof createClient>,
): Promise<Response> {
  const body = (await req.json()) as OutcomeRequest;

  if (
    !body.tenantId ||
    !body.kind ||
    !body.result ||
    !body.traceIds ||
    body.traceIds.length === 0 ||
    !body.source
  ) {
    return json(
      {
        error:
          "tenantId, kind, result, traceIds (non-empty), and source are required",
      },
      400,
    );
  }

  const { data: inserted, error } = await supa
    .from("outcome_events")
    .insert({
      tenant_id: body.tenantId,
      kind: body.kind,
      result: body.result,
      subject_ref: body.subjectRef ?? null,
      subject_kind: body.subjectKind ?? null,
      trace_ids: body.traceIds,
      payload: body.payload ?? {},
      source: body.source,
      observed_at: body.observedAt ?? new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);

  return json({ outcomeId: inserted?.id });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
