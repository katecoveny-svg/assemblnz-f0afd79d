import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Send — send SMS via TNZ Group API (v2.04, Basic auth — the working endpoint).
 * Used by dashboards, agent workflows, manual takeover, and pilot test sends.
 *
 * Body: { channel?, to, message, conversationId?, agentId?, kete? }
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
    const tnzFrom = Deno.env.get("TNZ_FROM_NUMBER") || "";

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

    const agentLabel = agentId || "manual";
    const keteLabel = kete || "unknown";
    const ref = `assembl-${keteLabel}-${agentLabel}-${crypto.randomUUID()}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;

    // Use the v2.04 SMS endpoint (Basic auth) — the same one sms-send uses successfully
    const tnzUrl = "https://api.tnz.co.nz/api/v2.04/send/sms";

    console.log(`[tnz-send] → ${to} (${keteLabel}/${agentLabel}) ref=${ref}`);

    const tnzResp = await fetch(tnzUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; encoding='utf-8'",
        Accept: "application/json; encoding='utf-8'",
        Authorization: `Basic ${tnzToken}`,
      },
      body: JSON.stringify({
        MessageData: {
          Message: message.substring(0, 1600),
          Destinations: [{ Recipient: to }],
          WebhookCallbackURL: webhookUrl,
          WebhookCallbackFormat: "JSON",
          Reference: ref,
          ...(tnzFrom ? { FromNumber: tnzFrom } : {}),
          SendMode: "Normal",
        },
      }),
    });

    const tnzText = await tnzResp.text();
    console.log(`[tnz-send] TNZ response ${tnzResp.status}: ${tnzText}`);

    let tnzData: any;
    try { tnzData = JSON.parse(tnzText); }
    catch { tnzData = { Result: tnzResp.ok ? "Success" : "Failed", raw: tnzText }; }

    const success = tnzData.Result === "Success";

    if (conversationId) {
      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tnz_message_id: tnzData.MessageID || null,
        direction: "outbound",
        to_number: to,
        from_number: tnzFrom,
        body: message.substring(0, 1600),
        channel: channel || "sms",
        status: success ? "sent" : "failed",
        agent_used: agentLabel,
        tnz_reference: ref,
      });
    }

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

    return new Response(JSON.stringify({
      ok: success,
      messageId: tnzData.MessageID,
      result: tnzData.Result,
      details: success ? undefined : tnzData,
      kete: keteLabel,
      agent: agentLabel,
    }), {
      status: success ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[tnz-send] Error:", err);
    return new Response(JSON.stringify({ error: "Send failed", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
