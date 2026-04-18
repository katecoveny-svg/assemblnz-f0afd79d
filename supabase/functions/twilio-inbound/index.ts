import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Twilio Inbound — receives SMS webhooks from Twilio (application/x-www-form-urlencoded),
 * normalises the payload, forwards to the unified `tnz-inbound` gateway for Iho routing
 * and AI generation. tnz-inbound will send the AI reply via TNZ (NZ sender ID) to avoid
 * international SMS deliverability issues with the US Twilio number. This function then
 * returns an empty TwiML <Response/> to Twilio so it doesn't attempt to reply itself.
 *
 * Twilio webhook fields used:
 *   From      — sender's phone (E.164)
 *   To        — your Twilio number
 *   Body      — message text
 *   MessageSid — Twilio's message ID
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function emptyTwiml() {
  const body = `<?xml version="1.0" encoding="UTF-8"?><Response/>`;
  return new Response(body, {
    headers: { ...corsHeaders, "Content-Type": "application/xml" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Twilio sends application/x-www-form-urlencoded
    let from = "", to = "", body = "", sid = "";
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await req.formData();
      from = String(form.get("From") || "");
      to = String(form.get("To") || "");
      body = String(form.get("Body") || "");
      sid = String(form.get("MessageSid") || "");
    } else {
      // Allow JSON for testing
      const j = await req.json().catch(() => ({}));
      from = j.From || j.from || "";
      to = j.To || j.to || "";
      body = j.Body || j.body || j.Message || "";
      sid = j.MessageSid || j.messageId || "";
    }

    console.log("[twilio-inbound] from=%s to=%s body=%s", from, to, body.slice(0, 120));

    if (!from || !body) {
      console.log("[twilio-inbound] Missing From or Body — returning empty TwiML");
      return emptyTwiml();
    }

    // Forward to unified tnz-inbound for routing + AI generation + DELIVERY via TNZ.
    // ReplyMode "send" (the default) tells tnz-inbound to send the reply itself via TNZ,
    // which uses our registered NZ sender ID — avoids carrier filtering of international
    // SMS from the US Twilio long code.
    const resp = await fetch(`${supabaseUrl}/functions/v1/tnz-inbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}` },
      body: JSON.stringify({
        From: from,
        To: to,
        Message: body,
        MessageID: sid,
        Channel: "sms",
        ReplyMode: "send",
      }),
    });

    const result = await resp.json().catch(() => ({}));
    console.log("[twilio-inbound] tnz-inbound result:", JSON.stringify(result).slice(0, 300));

    // Return empty TwiML so Twilio doesn't send its own reply from the US number.
    // The customer reply is delivered separately via TNZ.
    return emptyTwiml();
  } catch (err) {
    console.error("[twilio-inbound] error:", err);
    return emptyTwiml();
  }
});
