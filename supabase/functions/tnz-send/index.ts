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
    const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");

    if (!tnzToken) {
      return new Response(JSON.stringify({ error: "TNZ_AUTH_TOKEN not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { channel, to, message, conversationId, agentId, kete } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'message'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = channel === "whatsapp" ? "whatsapp" : "sms";
    const agentLabel = agentId || "manual";
    const keteLabel = kete || "unknown";
    const ref = `assembl-${keteLabel}-${agentLabel}-${crypto.randomUUID()}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;

    const tnzResp = await fetch(`${tnzBase}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tnzToken}`,
      },
      body: JSON.stringify({
        MessageData: {
          Message: message,
          Destinations: [{ Recipient: to }],
          WebhookCallbackURL: webhookUrl,
          WebhookCallbackFormat: "JSON",
          Reference: ref,
          ...(endpoint === "sms" ? { SendMode: "Normal" } : {}),
        },
      }),
    });

    const tnzData = await tnzResp.json();
    const success = tnzData.Result === "Success";

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
