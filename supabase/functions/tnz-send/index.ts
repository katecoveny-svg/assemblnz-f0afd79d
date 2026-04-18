import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Send — send SMS or WhatsApp via TNZ API.
 * Used by dashboards, agent workflows, and manual takeover.
 *
 * Body: { channel, to, message, conversationId?, agentId?, kete? }
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");

    if (!tnzToken) {

    // Log outbound message
    if (conversationId) {
      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tnz_message_id: tnzData.MessageID || null,
        direction: "outbound",
        to_number: to,
        body: message,
        channel: channel || "sms",
        status: success ? "sent" : "failed",
        agent_used: agentLabel,
        tnz_reference: ref,
      });
    }

    // Audit trail
    if (agentId) {
      try {
        await sb.from("audit_log").insert({
          agent_code: agentId,
          agent_name: agentId.toUpperCase(),
          model_used: "manual",
          user_id: "00000000-0000-0000-0000-000000000000",
          request_summary: `[OUTBOUND ${(channel || "sms").toUpperCase()} → ${to}]`,
          response_summary: message.substring(0, 200),
          compliance_passed: true,
          data_classification: "INTERNAL",
        });
      } catch (e) {
        console.error("Audit error:", e);
      }
    }

    return new Response(JSON.stringify({ ok: success, messageId: tnzData.MessageID, kete: keteLabel, agent: agentLabel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ send error:", err);
    return new Response(JSON.stringify({ error: "Send failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
