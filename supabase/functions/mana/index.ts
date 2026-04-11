import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body.action === "generate_evidence") {
      if (!body.requestId || !body.userId || !body.kete || !body.actionType) {
        return new Response(
          JSON.stringify({ error: "requestId, userId, kete, and actionType are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const watermark = `ASSEMBL-${body.kete}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      const evidencePack = {
        requestId: body.requestId,
        userId: body.userId,
        kete: body.kete,
        actionType: body.actionType,
        explanations: body.explanations || [],
        outcome: body.outcome || {},
        decisionTrail: body.decisionTrail || [],
        watermark,
        generatedAt: new Date().toISOString(),
        version: "1.0",
        platform: "Assembl",
      };

      // Store explanation objects
      const explanations = body.explanations || [];
      if (explanations.length > 0) {
        const explanationRows = explanations.map((exp: Record<string, unknown>) => ({
          request_id: body.requestId,
          action: (exp.action as string) || "unknown",
          reasoning: (exp.reasoning as string) || "",
          sources: (exp.sources as string[]) || [],
          confidence: (exp.confidence as number) || 0,
          regulations: (exp.regulations as string[]) || [],
        }));

        await supabase.from("explanation_objects").insert(explanationRows);
      }

      // Store evidence pack
      const { error } = await supabase.from("evidence_packs").insert({
        request_id: body.requestId,
        user_id: body.userId,
        kete: body.kete,
        action_type: body.actionType,
        evidence_json: evidencePack,
        watermark,
      });

      return new Response(
        JSON.stringify({ success: !error, evidencePack, watermark, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "sign_evidence") {
      if (!body.requestId || !body.approverUserId) {
        return new Response(
          JSON.stringify({ error: "requestId and approverUserId are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("evidence_packs")
        .update({ signed_by: body.approverUserId, signed_at: now })
        .eq("request_id", body.requestId);

      return new Response(
        JSON.stringify({ success: !error, signedAt: now, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "retrieve_evidence") {
      if (!body.requestId) {
        return new Response(
          JSON.stringify({ error: "requestId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("evidence_packs")
        .select("evidence_json, watermark, signed_by, signed_at, created_at")
        .eq("request_id", body.requestId)
        .single();

      return new Response(
        JSON.stringify({ success: !error, ...data, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: generate_evidence, sign_evidence, retrieve_evidence" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Mana error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
