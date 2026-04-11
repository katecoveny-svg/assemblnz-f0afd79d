import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TaRequest {
  requestId: string;
  userId: string;
  kete: string;
  agent: string;
  model: string;
  actionType: string;
  payload: Record<string, unknown>;
  context?: Record<string, unknown>;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function log(
  requestId: string,
  userId: string,
  kete: string,
  actionType: string,
  step: string,
  status: string,
  details: Record<string, unknown>
) {
  const supabase = getSupabase();
  await supabase.from("pipeline_audit_logs").insert({
    request_id: requestId,
    user_id: userId,
    kete,
    action_type: actionType,
    step,
    status,
    details,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TaRequest = await req.json();
    const { requestId, userId, kete, actionType, payload } = body;

    if (!requestId || !userId || !kete || !actionType) {
      return new Response(
        JSON.stringify({ error: "requestId, userId, kete, and actionType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Policy check via Kahu
    await log(requestId, userId, kete, actionType, "policy_check", "started", {});

    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const kahuRes = await fetch(`${baseUrl}/functions/v1/kahu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: "check_compliance",
        kete,
        actionType,
        context: body.context,
      }),
    });
    const kahuData = await kahuRes.json();

    if (kahuData.decision === "forbidden") {
      await log(requestId, userId, kete, actionType, "policy_check", "forbidden", kahuData);
      return new Response(
        JSON.stringify({
          requestId,
          success: false,
          status: "forbidden",
          error: `Blocked: ${kahuData.reasoning}`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (kahuData.decision === "approval_required") {
      const supabase = getSupabase();
      const { data: queueItem } = await supabase
        .from("approval_queue")
        .insert({
          request_id: requestId,
          action_type: actionType,
          kete,
          context: payload,
          requested_by: userId,
        })
        .select()
        .single();

      await log(requestId, userId, kete, actionType, "approval_queued", "pending", {
        queueId: queueItem?.id,
      });

      return new Response(
        JSON.stringify({
          requestId,
          success: true,
          status: "approval_required",
          approvalId: queueItem?.id,
          message: kahuData.reasoning,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Execute — route to kete-specific agent
    await log(requestId, userId, kete, actionType, "execution", "started", {
      agent: body.agent,
      model: body.model,
    });

    const agentUrl = `${baseUrl}/functions/v1/agent-${kete.toLowerCase()}`;
    let agentResult: Record<string, unknown> = {};

    try {
      const agentRes = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify(body),
      });
      agentResult = await agentRes.json();
    } catch (agentErr) {
      // Agent function may not exist yet — log and continue with empty result
      agentResult = {
        status: "agent_unavailable",
        message: `Agent function agent-${kete.toLowerCase()} not yet deployed`,
        error: agentErr instanceof Error ? agentErr.message : String(agentErr),
      };
    }

    await log(requestId, userId, kete, actionType, "execution", "completed", agentResult);

    // Step 3: Capture in Mahara + Mana (fire-and-forget, don't block response)
    const maharaPromise = fetch(`${baseUrl}/functions/v1/mahara`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: "capture_outcome",
        userId,
        kete,
        requestId,
        outcome: agentResult,
      }),
    }).catch((e) => console.error("Mahara capture error:", e));

    const manaPromise = fetch(`${baseUrl}/functions/v1/mana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: "generate_evidence",
        requestId,
        userId,
        kete,
        actionType,
        explanations: (agentResult as Record<string, unknown>).explanations || [],
        outcome: agentResult,
      }),
    }).catch((e) => console.error("Mana capture error:", e));

    await Promise.all([maharaPromise, manaPromise]);

    return new Response(
      JSON.stringify({
        requestId,
        success: true,
        status: "executed",
        result: agentResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Tā execution error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
