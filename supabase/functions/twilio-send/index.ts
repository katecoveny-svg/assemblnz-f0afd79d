import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Twilio Send — outbound SMS via the Lovable Twilio connector gateway.
 * Used by agent dashboards / proactive automations to text customers.
 *
 * Body: { to: "+64...", agent_id: "kahu", message: "Kia ora..." }
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!TWILIO_API_KEY) {
      return new Response(JSON.stringify({ error: "TWILIO_API_KEY not configured (link Twilio connector)" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!TWILIO_FROM) {
      return new Response(JSON.stringify({ error: "TWILIO_PHONE_NUMBER not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, agent_id, message, from } = await req.json();
    if (!to || !agent_id || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, agent_id, message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromNumber = from || TWILIO_FROM;
    const trimmed = String(message).substring(0, 1600);

    // Send via Twilio REST (gateway prepends /2010-04-01/Accounts/{AccountSid})
    const tw = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: fromNumber, Body: trimmed }),
    });

    const data = await tw.json();
    console.log("[twilio-send] status=%s sid=%s err=%s", tw.status, data?.sid, data?.message);

    if (!tw.ok) {
      return new Response(JSON.stringify({ error: "Twilio send failed", details: data }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist outbound to messaging_conversations / messaging_messages
    const sb = createClient(supabaseUrl, serviceKey);
    const { data: existing } = await sb
      .from("messaging_conversations")
      .select("id")
      .eq("phone_number", to)
      .eq("channel", "sms")
      .eq("status", "active")
      .maybeSingle();

    let conversationId: string;
    if (existing) {
      conversationId = existing.id;
      await sb.from("messaging_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      const { data: created } = await sb
        .from("messaging_conversations")
        .insert({ phone_number: to, channel: "sms", status: "active", assigned_agent: agent_id })
        .select("id")
        .single();
      conversationId = created!.id;
    }

    await sb.from("messaging_messages").insert({
      conversation_id: conversationId,
      tnz_message_id: data.sid || null,
      direction: "outbound",
      to_number: to,
      from_number: fromNumber,
      body: trimmed,
      channel: "sms",
      status: "sent",
      agent_used: agent_id,
      tnz_reference: `twilio-${data.sid || crypto.randomUUID()}`,
    });

    return new Response(JSON.stringify({ success: true, sid: data.sid, provider: "twilio" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[twilio-send] error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
