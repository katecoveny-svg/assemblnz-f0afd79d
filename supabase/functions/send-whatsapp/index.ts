import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * send-whatsapp — outbound WhatsApp via Twilio.
 * Now supports rich media: images, videos, PDFs.
 *
 * Body: { phoneNumber, message?, mediaUrl?, mediaUrls?, agentId?, userId? }
 *  - mediaUrl: single public URL (image/video/pdf)
 *  - mediaUrls: up to 10 public URLs (Twilio limit)
 *  - message can be omitted if media is provided
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { phoneNumber, message, mediaUrl, mediaUrls, agentId, userId, conversationId } = await req.json();

    if (!phoneNumber || (!message && !mediaUrl && (!mediaUrls || mediaUrls.length === 0))) {
      return new Response(
        JSON.stringify({ error: "phoneNumber and (message or mediaUrl) required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalise media list (Twilio supports up to 10 MediaUrl[])
    const media: string[] = [];
    if (mediaUrl) media.push(mediaUrl);
    if (Array.isArray(mediaUrls)) for (const u of mediaUrls.slice(0, 10 - media.length)) media.push(u);

    const params = new URLSearchParams();
    params.append("From", `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
    params.append("To", `whatsapp:${phoneNumber}`);
    if (message) params.append("Body", message);
    media.forEach(u => params.append("MediaUrl", u));

    const twilioResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!twilioResp.ok) {
      const errText = await twilioResp.text();
      console.error("Twilio error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp message", detail: errText.slice(0, 300) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilioData = await twilioResp.json();

    // Persist to agent_sms_messages for backward compat
    await sb.from("agent_sms_messages").insert({
      agent_id: agentId || "echo",
      user_id: userId || "00000000-0000-0000-0000-000000000000",
      phone_number: phoneNumber,
      body: message || (media[0] ? `[media] ${media[0]}` : ""),
      direction: "outbound",
      status: "sent",
      channel: "whatsapp",
      whatsapp_message_id: twilioData.sid,
      whatsapp_status: "sent",
      twilio_sid: twilioData.sid,
      media_url: media[0] || null,
      media_type: media[0] ? (media[0].endsWith(".mp4") ? "video/mp4" : media[0].match(/\.(jpe?g|png|webp|gif)$/i) ? "image" : "application/octet-stream") : null,
    });

    // Mirror into messaging_messages if a conversation context is supplied
    if (conversationId) {
      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        direction: "outbound",
        from_number: TWILIO_WHATSAPP_NUMBER,
        to_number: phoneNumber,
        body: message || "",
        channel: "whatsapp",
        status: "sent",
        agent_used: agentId || "manual",
        media_url: media[0] || null,
        media_type: media[0] ? (media[0].endsWith(".mp4") ? "video/mp4" : "image") : null,
        tnz_message_id: twilioData.sid,
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioData.sid, mediaCount: media.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-whatsapp error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
