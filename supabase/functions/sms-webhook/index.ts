import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * SMS Webhook — forwards all inbound SMS to the unified tnz-inbound gateway.
 * TNZ sends inbound SMS here; we normalise the payload and proxy to tnz-inbound
 * which handles Iho routing, AI response, and reply delivery.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const payload = await req.json();

    // Normalise TNZ inbound SMS payload fields
    const normalised = {
      From: payload.From || payload.from || payload.Sender || payload.sender || "",
      To: payload.To || payload.to || payload.Destination || payload.destination || "",
      Message: payload.Message || payload.message || payload.Body || payload.body || "",
      MessageID: payload.MessageID || payload.messageId || payload.message_id || "",
      Channel: "sms",
    };

    if (!normalised.From || !normalised.Message) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Forward to unified tnz-inbound gateway
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
  } catch (err) {
    console.error("[sms-webhook] Error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Forwarding failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
