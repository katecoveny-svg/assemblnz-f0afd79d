import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * SMS Send — sends outbound SMS via TNZ Group API.
 * Used by agent dashboards to send messages to customers.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // TNZ_API_BASE may point to v3.00 (workflow API); SMS sending uses the v2.04 REST endpoint
    const tnzSmsUrl = "https://api.tnz.co.nz/api/v2.04/send/sms";
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
    const tnzFrom = Deno.env.get("TNZ_FROM_NUMBER");
    const sb = createClient(supabaseUrl, serviceKey);

    if (!tnzToken) {
      return new Response(
        JSON.stringify({ error: "TNZ credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, agent_id, message } = body;

    if (!to || !agent_id || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, agent_id, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via TNZ API
    const ref = `assembl-agent-${agent_id}-${crypto.randomUUID()}`;
    const webhookUrl = `${supabaseUrl}/functions/v1/tnz-webhook`;

    const smsResponse = await fetch(tnzSmsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; encoding='utf-8'",
        "Accept": "application/json; encoding='utf-8'",
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

    const smsText = await smsResponse.text();
    console.log("TNZ raw response:", smsResponse.status, smsText);
    let smsData: any;
    try { smsData = JSON.parse(smsText); } catch { smsData = { Result: smsResponse.ok ? "Success" : "Failed", raw: smsText }; }

    if (smsData.Result !== "Success") {
      console.error("TNZ send error:", smsData);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or create conversation in messaging_conversations
    const { data: existing } = await sb
      .from("messaging_conversations")
      .select("id")
      .eq("phone_number", to)
      .eq("channel", "sms")
      .eq("status", "active")
      .single();

    let conversationId: string;
    if (existing) {
      conversationId = existing.id;
      await sb.from("messaging_conversations").update({ updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created } = await sb
        .from("messaging_conversations")
        .insert({
          phone_number: to,
          channel: "sms",
          status: "active",
          assigned_agent: agent_id,
        })
        .select("id")
        .single();
      conversationId = created!.id;
    }

    // Store outbound message
    await sb.from("messaging_messages").insert({
      conversation_id: conversationId,
      tnz_message_id: smsData.MessageID || null,
      direction: "outbound",
      to_number: to,
      from_number: tnzFrom || "",
      body: message.substring(0, 1600),
      channel: "sms",
      status: "sent",
      agent_used: agent_id,
      tnz_reference: ref,
    });

    return new Response(
      JSON.stringify({ success: true, messageId: smsData.MessageID }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SMS send error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
