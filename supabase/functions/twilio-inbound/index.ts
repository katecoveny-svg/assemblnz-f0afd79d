import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Twilio Inbound — receives SMS webhooks from Twilio (application/x-www-form-urlencoded),
 * normalises the payload, forwards to the unified `tnz-inbound` gateway for Iho routing
 * and AI generation, then replies to Twilio with TwiML <Message> so the agent's reply
 * is delivered back to the customer in the same HTTP response.
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

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twiml(message?: string) {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response/>`;
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
      return twiml("Sorry — we couldn't read your message. Please try again.");
    }

    // Forward to unified tnz-inbound for routing + AI generation
    const resp = await fetch(`${supabaseUrl}/functions/v1/tnz-inbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}` },
      body: JSON.stringify({
        From: from,
        To: to,
        Message: body,
        MessageID: sid,
        Channel: "sms",
        // Tell tnz-inbound NOT to send via TNZ — we'll reply via TwiML instead
        ReplyMode: "return",
      }),
    });

    const result = await resp.json().catch(() => ({}));
    console.log("[twilio-inbound] tnz-inbound result:", JSON.stringify(result).slice(0, 300));

    const reply =
      result.reply ||
      result.message ||
      result.response ||
      "Kia ora! Thanks for your message — we'll be in touch shortly.";

    return twiml(reply);
  } catch (err) {
    console.error("[twilio-inbound] error:", err);
    return twiml("Sorry — we hit a technical hiccup. Please try again in a moment.");
  }
});
