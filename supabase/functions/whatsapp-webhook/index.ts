import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * WhatsApp Webhook — handles both:
 *  1. Twilio WhatsApp inbound messages → forwards to tnz-inbound unified gateway
 *  2. Twilio status callbacks (sent/delivered/read) → updates message status
 *
 * This acts as a Twilio fallback channel. Primary WhatsApp goes via TNZ → tnz-inbound.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Parse Twilio form-encoded or JSON body
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = String(value);
      }
    } else {
      body = await req.json();
    }

    const incomingBody = body.Body || body.body || "";
    const fromRaw = body.From || body.from || "";
    const fromNumber = fromRaw.replace("whatsapp:", "");
    const messageSid = body.MessageSid || body.message_sid || "";

    // ── Status callback (no body = delivery receipt) ──
    const messageStatus = body.MessageStatus || body.SmsStatus || "";
    if (messageStatus && body.MessageSid && !incomingBody) {
      await sb.from("agent_sms_messages")
        .update({ whatsapp_status: messageStatus })
        .eq("whatsapp_message_id", body.MessageSid);

      // Also try unified table
      await sb.from("messaging_messages")
        .update({ status: messageStatus === "delivered" ? "delivered" : messageStatus === "read" ? "read" : "sent" })
        .eq("tnz_message_id", body.MessageSid);

      return new Response(JSON.stringify({ ok: true, type: "status_callback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fromNumber) {
      return new Response("Missing From number", { status: 400, headers: corsHeaders });
    }

    // ── Forward inbound WhatsApp message to unified tnz-inbound gateway ──
    const normalised = {
      From: fromNumber,
      To: (body.To || "").replace("whatsapp:", ""),
      Message: incomingBody || "[Media message]",
      MessageID: messageSid,
      Channel: "whatsapp",
      // Pass media info if present
      MediaUrl: body.MediaUrl0 || undefined,
      MediaType: body.MediaContentType0 || undefined,
      NumMedia: body.NumMedia || "0",
    };

    const resp = await fetch(`${supabaseUrl}/functions/v1/tnz-inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify(normalised),
    });

    const result = await resp.json();
    return new Response(JSON.stringify({ ok: true, forwarded: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[whatsapp-webhook] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
