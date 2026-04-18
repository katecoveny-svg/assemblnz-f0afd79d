import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * HELM SMS — Tōro family agent inbound handler.
 * Now forwards all inbound messages to the unified tnz-inbound gateway
 * which handles Iho routing (will route family keywords → toroa agents).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const payload = await req.json();

    const normalised = {
      From: payload.From || payload.from || payload.Sender || payload.sender || "",
      To: payload.To || payload.to || payload.Destination || payload.destination || "",
      Message: payload.Message || payload.message || payload.Body || payload.body || "",
      MessageID: payload.MessageID || payload.messageId || "",
      Channel: payload.Channel || payload.channel || "sms",
    };

    if (!normalised.From || !normalised.Message) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(`${supabaseUrl}/functions/v1/tnz-inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify(normalised),
    });

    const result = await resp.json();
    return new Response(JSON.stringify({ ok: true, forwarded: true, source: "helm-sms", ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[helm-sms] Error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Forwarding failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
