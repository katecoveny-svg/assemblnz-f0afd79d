// ═══════════════════════════════════════════════════════════════
// Waihanga compliance audit logger
//
// Receives a single compliance decision from the Waihanga agent
// (inputs, derived action, evaluations, verdict) and persists it
// into `public.waihanga_compliance_audit` for full traceability.
//
// Designed to be fire-and-forget from the simulator/runtime.
// Validates shape, caps payload size, and writes via the service
// role so RLS doesn't block ingestion from anonymous demo users.
// ═══════════════════════════════════════════════════════════════

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncomingEvaluation {
  policyId?: unknown;
  passed?: unknown;
  severity?: unknown;
  message?: unknown;
}

interface IncomingAction {
  id?: unknown;
  kind?: unknown;
  payload?: unknown;
  confidence?: unknown;
  rationale?: unknown;
  proposedAt?: unknown;
}

interface IncomingDecision {
  action?: IncomingAction;
  evaluations?: IncomingEvaluation[];
  verdict?: unknown;
  explanation?: unknown;
}

interface IncomingPayload {
  pilotLabel?: unknown;
  decidedAt?: unknown;
  decision?: IncomingDecision;
  worldSnapshot?: unknown;
  applied?: unknown;
}

const MAX_BODY_BYTES = 200_000; // 200 KB per decision is plenty
const MAX_EVALUATIONS = 50;
const ALLOWED_VERDICTS = new Set(["allow", "needs_human", "block"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    let payload: IncomingPayload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const decision = payload.decision;
    if (!decision || typeof decision !== "object") {
      return json({ error: "missing_decision" }, 400);
    }

    const verdict =
      typeof decision.verdict === "string" ? decision.verdict : "";
    if (!ALLOWED_VERDICTS.has(verdict)) {
      return json(
        { error: "invalid_verdict", allowed: [...ALLOWED_VERDICTS] },
        400,
      );
    }

    const action = decision.action ?? {};
    const actionId = typeof action.id === "string" ? action.id : "";
    const actionKind = typeof action.kind === "string" ? action.kind : "";
    if (!actionId || !actionKind) {
      return json({ error: "invalid_action" }, 400);
    }

    const evaluations = Array.isArray(decision.evaluations)
      ? decision.evaluations.slice(0, MAX_EVALUATIONS)
      : [];

    const failedPolicyIds = evaluations
      .filter((e) => e && e.passed === false && typeof e.policyId === "string")
      .map((e) => e.policyId as string);

    const decidedAtRaw =
      typeof payload.decidedAt === "string" ? payload.decidedAt : null;
    const decidedAt =
      decidedAtRaw && !Number.isNaN(Date.parse(decidedAtRaw))
        ? decidedAtRaw
        : new Date().toISOString();

    const row = {
      decided_at: decidedAt,
      pilot_label:
        typeof payload.pilotLabel === "string" ? payload.pilotLabel : null,
      domain: "waihanga",

      action_id: actionId,
      action_kind: actionKind,
      action_confidence:
        typeof action.confidence === "number" && Number.isFinite(action.confidence)
          ? action.confidence
          : null,
      action_rationale:
        typeof action.rationale === "string" ? action.rationale : null,
      action_payload: isPlainObject(action.payload) ? action.payload : {},

      world_snapshot: isPlainObject(payload.worldSnapshot)
        ? payload.worldSnapshot
        : {},

      evaluations,
      failed_policy_ids: failedPolicyIds,

      verdict,
      explanation:
        typeof decision.explanation === "string" ? decision.explanation : null,
      applied: payload.applied === true,

      user_agent: req.headers.get("user-agent"),
      source_ip:
        req.headers.get("x-forwarded-for") ??
        req.headers.get("cf-connecting-ip") ??
        null,
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("waihanga-audit-log: missing SUPABASE_URL or SERVICE_ROLE_KEY");
      return json({ error: "server_misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("waihanga_compliance_audit")
      .insert(row)
      .select("id, created_at")
      .single();

    if (error) {
      console.error("waihanga-audit-log insert error:", error);
      return json({ error: "insert_failed", detail: error.message }, 500);
    }

    return json({
      ok: true,
      id: data.id,
      created_at: data.created_at,
      verdict,
      action_kind: actionKind,
    });
  } catch (err) {
    console.error("waihanga-audit-log unexpected error:", err);
    return json({ error: "unexpected", detail: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
