import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type PipelineDecision = "allowed" | "approval_required" | "forbidden";

export type PipelineRequest = {
  requestId?: string;
  request_id?: string;
  userId?: string;
  user_id?: string;
  tenant_id?: string;
  action?: string;
  actionType?: string;
  payload?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export type ExplanationObject = {
  id: string;
  action_id: string;
  layer: "Kahu" | "Iho" | "Tā" | "Mahara" | "Mana";
  rationale: string;
  rules_applied: string[];
  confidence_score: number;
  timestamp: string;
};

export type TaResult = {
  decision: PipelineDecision;
  actionResult: string;
  complianceStatus: Record<string, boolean>;
  riskScore: number;
  rules: string[];
};

export type KeteLogic = {
  kete: "AKO" | "MATAURANGA" | "HOKO";
  keteSlug: "ako" | "matauranga" | "hoko";
  entityLabel: string;
  defaultAction: string;
  subjectId: (payload: Record<string, unknown>) => string;
  kahu: (input: NormalizedPipelineInput) => ExplanationObject;
  iho: (input: NormalizedPipelineInput) => ExplanationObject;
  mahara: (
    input: NormalizedPipelineInput,
    supabase: SupabaseClient,
  ) => Promise<{ explanation: ExplanationObject; memory: Record<string, unknown> }>;
  ta: (
    input: NormalizedPipelineInput,
    memory: Record<string, unknown>,
  ) => Promise<TaResult>;
  mana: (
    input: NormalizedPipelineInput,
    ta: TaResult,
    explanations: ExplanationObject[],
  ) => ExplanationObject;
};

export type NormalizedPipelineInput = {
  requestId: string;
  userId: string;
  tenantId: string | null;
  action: string;
  subjectId: string;
  payload: Record<string, unknown>;
  context: Record<string, unknown>;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function makeExplanation(
  layer: ExplanationObject["layer"],
  actionId: string,
  rationale: string,
  rules: string[],
  confidence: number,
): ExplanationObject {
  return {
    id: `${layer.toLowerCase()}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    action_id: actionId,
    layer,
    rationale,
    rules_applied: rules,
    confidence_score: confidence,
    timestamp: new Date().toISOString(),
  };
}

export async function runKetePipeline(req: Request, logic: KeteLogic): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const raw = (await req.json().catch(() => ({}))) as PipelineRequest;
    const supabase = getSupabase();
    const input = normalize(raw, logic);
    const explanations: ExplanationObject[] = [];

    explanations.push(logic.kahu(input));
    explanations.push(logic.iho(input));
    const { explanation: mahara, memory } = await logic.mahara(input, supabase);
    explanations.push(mahara);
    const ta = await logic.ta(input, memory);
    explanations.push(makeExplanation("Tā", input.action, ta.actionResult, ["draft_generation", "policy_gate"], 0.9));
    explanations.push(logic.mana(input, ta, explanations));

    await supabase.from("pipeline_audit_logs").insert({
      request_id: input.requestId,
      user_id: input.userId,
      kete: logic.kete,
      action_type: input.action,
      step: "agent_complete",
      status: ta.decision,
      details: {
        tenant_id: input.tenantId,
        subject_id: input.subjectId,
        compliance_status: ta.complianceStatus,
        risk_score: ta.riskScore,
      },
    });

    return json({
      request_id: input.requestId,
      kete: logic.keteSlug,
      [logic.entityLabel]: input.subjectId,
      decision: ta.decision,
      risk_score: ta.riskScore,
      compliance_status: ta.complianceStatus,
      explanation_objects: explanations,
      explanations: explanations.map((item) => ({
        action: item.action_id,
        reasoning: item.rationale,
        sources: item.rules_applied,
        confidence: item.confidence_score,
        regulations: item.rules_applied.filter(isRegulatoryRule),
      })),
      audit_log_entry: `${input.requestId}|${logic.kete}|${input.action}|${ta.decision}`,
    });
  } catch (error) {
    console.error(`${logic.kete} agent error:`, error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function recallMahara(
  input: NormalizedPipelineInput,
  kete: string,
): Promise<unknown[]> {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const response = await fetch(`${url}/functions/v1/mahara`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ action: "get_context", userId: input.userId, kete }),
    });
    const data = await response.json();
    return Array.isArray(data.context) ? data.context : [];
  } catch {
    return [];
  }
}

export function bool(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalize(raw: PipelineRequest, logic: KeteLogic): NormalizedPipelineInput {
  const payload = raw.payload ?? {};
  return {
    requestId: raw.requestId ?? raw.request_id ?? `${logic.keteSlug}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    userId: raw.userId ?? raw.user_id ?? "anonymous",
    tenantId: raw.tenant_id ?? null,
    action: raw.actionType ?? raw.action ?? logic.defaultAction,
    subjectId: logic.subjectId(payload),
    payload,
    context: raw.context ?? {},
  };
}

function getSupabase() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRegulatoryRule(rule: string) {
  const lc = rule.toLowerCase();
  return lc.includes("act") || lc.includes("regulation") || lc.includes("criteria") ||
    lc.includes("privacy") || lc.includes("ncea") || lc.includes("cga") ||
    lc.includes("fair trading") || lc.includes("ero");
}
