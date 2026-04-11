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

    if (body.action === "capture_outcome") {
      if (!body.userId || !body.kete) {
        return new Response(
          JSON.stringify({ error: "userId and kete are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Store in business_memory (existing table) with pipeline metadata
      const { error } = await supabase.from("business_memory").insert({
        user_id: body.userId,
        category: `pipeline_${body.kete.toLowerCase()}`,
        content: JSON.stringify(body.outcome || {}),
        metadata: {
          kete: body.kete,
          request_id: body.requestId,
          memory_type: "outcome",
          captured_at: new Date().toISOString(),
        },
        tags: [body.kete, "pipeline", "outcome"],
      });

      return new Response(
        JSON.stringify({ success: !error, stored: !error, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "get_context") {
      if (!body.userId || !body.kete) {
        return new Response(
          JSON.stringify({ error: "userId and kete are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data } = await supabase
        .from("business_memory")
        .select("*")
        .eq("user_id", body.userId)
        .eq("category", `pipeline_${body.kete.toLowerCase()}`)
        .order("relevance_score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      // Apply temporal decay to relevance scores
      const now = Date.now();
      const THIRTY_DAYS_MS = 30 * 86400000;
      const enriched = (data || []).map((m) => ({
        ...m,
        effective_relevance:
          (m.relevance_score ?? 1.0) *
          Math.exp(-(now - new Date(m.created_at!).getTime()) / THIRTY_DAYS_MS),
      }));

      return new Response(
        JSON.stringify({ success: true, context: enriched }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "store_preference") {
      if (!body.userId || !body.kete || !body.key || !body.value) {
        return new Response(
          JSON.stringify({ error: "userId, kete, key, and value are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase.from("business_memory").insert({
        user_id: body.userId,
        category: `preference_${body.kete.toLowerCase()}`,
        content: JSON.stringify({ key: body.key, value: body.value }),
        metadata: { kete: body.kete, memory_type: "preference" },
        tags: [body.kete, "preference", body.key],
        relevance_score: 1.0,
      });

      return new Response(
        JSON.stringify({ success: !error, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: capture_outcome, get_context, store_preference" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Mahara error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
