import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generic Agent SMS Webhook — TNZ edition.
 *
 * Routes incoming SMS/WhatsApp to any Assembl agent based on the
 * phone number configured in agent_sms_config.
 *
 * TNZ inbound webhook URL:
 *   POST /functions/v1/agent-sms
 */

const SMS_BEHAVIOUR = `\n\nSMS RULES — You are responding via text message (SMS):
- Keep responses UNDER 400 characters when possible
- Use short, clear sentences
- Use line breaks for lists, not bullets or markdown
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- Current date/time: `;

/** Send reply via TNZ API */
async function sendViaTnz(to: string, message: string, reference: string): Promise<{ messageId?: string }> {
  const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken) return {};

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;
  const resp = await fetch(`${tnzBase}/send/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json; encoding='utf-8'", "Accept": "application/json; encoding='utf-8'", Authorization: `Basic ${tnzToken}` },
    body: JSON.stringify({
      MessageData: {
        Message: message,
        Destinations: [{ Recipient: to }],
        WebhookCallbackURL: webhookUrl,
        WebhookCallbackFormat: "JSON",
        Reference: reference,
        SendMode: "Normal",
      },
    }),
  });
  const data = await resp.json();
  return { messageId: data.Result === "Success" ? data.MessageID : undefined };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const sb = createClient(supabaseUrl, serviceKey);

    // Parse TNZ inbound payload
    const payload = await req.json();
    const fromNumber = payload.From || payload.from || payload.Sender || payload.sender || "";
    const toNumber = payload.To || payload.to || payload.Destination || payload.destination || "";
    const incomingBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const tnzMessageId = payload.MessageID || payload.messageId || "";

    if (!fromNumber || !incomingBody) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle opt-out
    const upperBody = incomingBody.trim().toUpperCase();
    if (upperBody === "STOP" || upperBody === "UNSUBSCRIBE") {
      await sendViaTnz(fromNumber, "You've been unsubscribed. Text START to re-subscribe anytime.", `assembl-optout-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (upperBody === "START" || upperBody === "SUBSCRIBE") {
      await sendViaTnz(fromNumber, "Welcome back! Text anything to get started.", `assembl-optin-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Look up which agent this number belongs to
    const { data: smsConfig } = await sb
      .from("agent_sms_config")
      .select("*")
      .eq("tnz_phone_number", toNumber)
      .eq("enabled", true)
      .single();

    if (!smsConfig) {
      // Fallback: try matching without formatting
      const cleanTo = toNumber.replace(/\D/g, "");
      const { data: allConfigs } = await sb
        .from("agent_sms_config")
        .select("*")
        .eq("enabled", true)
        .limit(50);

      const matched = allConfigs?.find(
        (c: any) => (c.tnz_phone_number || c.twilio_phone_number)?.replace(/\D/g, "") === cleanTo
      );

      if (!matched) {
        await sendViaTnz(fromNumber, "This number is not currently configured. Please contact the business directly.", `assembl-noagent-${crypto.randomUUID()}`);
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return await handleAgentSms(sb, matched, fromNumber, incomingBody, tnzMessageId, LOVABLE_API_KEY, supabaseUrl);
    }

    return await handleAgentSms(sb, smsConfig, fromNumber, incomingBody, tnzMessageId, LOVABLE_API_KEY, supabaseUrl);
  } catch (error) {
    console.error("Agent SMS webhook error:", error);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function handleAgentSms(
  sb: any,
  config: any,
  fromNumber: string,
  incomingBody: string,
  tnzMessageId: string,
  apiKey: string | undefined,
  supabaseUrl: string
): Promise<Response> {
  const agentId = config.agent_id;
  const userId = config.user_id;

  // Log inbound message
  await sb.from("agent_sms_messages").insert({
    user_id: userId,
    agent_id: agentId,
    phone_number: fromNumber,
    direction: "inbound",
    body: incomingBody,
    status: "received",
  });

  // Fetch recent conversation history
  const { data: recentMessages } = await sb
    .from("agent_sms_messages")
    .select("direction, body, created_at")
    .eq("user_id", userId)
    .eq("agent_id", agentId)
    .eq("phone_number", fromNumber)
    .order("created_at", { ascending: false })
    .limit(10);

  const chatHistory = (recentMessages || [])
    .reverse()
    .map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

  // Fetch agent system prompt
  let systemPrompt = "";
  try {
    const promptResp = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({ agentId, getSystemPrompt: true }),
    });
    if (promptResp.ok) {
      const promptData = await promptResp.json();
      systemPrompt = promptData.systemPrompt || "";
    }
  } catch (e) {
    console.error("Failed to fetch agent prompt:", e);
  }

  const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
  const fullPrompt = systemPrompt + SMS_BEHAVIOUR + nzTime;

  if (!apiKey) {
    await sendViaTnz(fromNumber, "This agent is temporarily unavailable. Please try again shortly.", `assembl-unavail-${crypto.randomUUID()}`);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let aiReply = "Sorry, I couldn't process that. Please try again.";

  try {
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: fullPrompt },
          ...chatHistory,
          { role: "user", content: incomingBody },
        ],
        max_tokens: 500,
      }),
    });

    if (aiResp.ok) {
      const aiData = await aiResp.json();
      aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
      if (aiReply.length > 1500) {
        aiReply = aiReply.substring(0, 1497) + "...";
      }
    }
  } catch (aiErr) {
    console.error("Agent SMS AI error:", aiErr);
  }

  // Send reply via TNZ
  const ref = `assembl-agent-${agentId}-${crypto.randomUUID()}`;
  const sendResult = await sendViaTnz(fromNumber, aiReply, ref);

  // Log outbound
  await sb.from("agent_sms_messages").insert({
    user_id: userId,
    agent_id: agentId,
    phone_number: fromNumber,
    direction: "outbound",
    body: aiReply,
    status: sendResult.messageId ? "sent" : "failed",
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
