import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_SYSTEM_ADDON = `

SMS RULES — You are responding via text message (SMS):
- Keep responses UNDER 400 characters when possible (max 1600)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first
`;

/** Send reply via TNZ API */
async function sendViaTnz(channel: string, to: string, message: string, reference: string): Promise<{ messageId?: string }> {
  const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken) return {};

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;
  const resp = await fetch(`${tnzBase}/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tnzToken}` },
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

/**
 * SMS Webhook — handles inbound SMS via TNZ.
 * Routes to the correct agent based on the receiving number.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const sb = createClient(supabaseUrl, serviceKey);

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse TNZ inbound payload
    const payload = await req.json();
    const fromNumber = payload.From || payload.from || payload.Sender || payload.sender || "";
    const toNumber = payload.To || payload.to || payload.Destination || payload.destination || "";
    const messageBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const tnzMessageId = payload.MessageID || payload.messageId || "";

    if (!fromNumber || !messageBody) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up which agent is assigned to this number
    const { data: phoneMapping } = await sb
      .from("sms_phone_numbers")
      .select("*")
      .eq("tnz_number", toNumber)
      .eq("is_active", true)
      .single();

    if (!phoneMapping) {
      return new Response(JSON.stringify({ ok: true, message: "No agent for this number" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agentId = phoneMapping.agent_id;
    const agentName = phoneMapping.agent_name;

    // Find or create conversation
    let conversation: any;
    const { data: existing } = await sb
      .from("sms_conversations")
      .select("*")
      .eq("phone_number", fromNumber)
      .eq("agent_id", agentId)
      .single();

    if (existing) {
      conversation = existing;
      await sb.from("sms_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created } = await sb
        .from("sms_conversations")
        .insert({
          phone_number: fromNumber,
          agent_id: agentId,
          sms_phone_number_id: phoneMapping.id,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();
      conversation = created;
    }

    // Store inbound message
    await sb.from("sms_messages").insert({
      conversation_id: conversation.id,
      direction: "inbound",
      body: messageBody,
      tnz_message_id: tnzMessageId,
      status: "received",
    });

    // Load conversation history (last 20 messages)
    const { data: history } = await sb
      .from("sms_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Get agent system prompt
    const chatUrl = `${supabaseUrl}/functions/v1/chat`;
    const promptRes = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ agentId, getSystemPrompt: true }),
    });

    let systemPrompt = `You are ${agentName} from Assembl, a specialist business advisor for New Zealand.`;
    if (promptRes.ok) {
      const promptData = await promptRes.json();
      if (promptData.systemPrompt) systemPrompt = promptData.systemPrompt;
    }

    const fullSystemPrompt = systemPrompt + SMS_SYSTEM_ADDON + `\nCurrent date/time: ${new Date().toISOString()}`;

    const isNewConversation = !history || history.length <= 1;
    const messages: Array<{ role: string; content: string }> = [];

    if (isNewConversation) {
      messages.push({
        role: "system",
        content: fullSystemPrompt + `\n\nThis is a NEW conversation. Introduce yourself briefly: "Kia ora, I'm ${agentName} from Assembl. [one sentence about your specialty]. How can I help?"`,
      });
    } else {
      messages.push({ role: "system", content: fullSystemPrompt });
    }

    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.body,
        });
      }
    }

    // Call AI via Lovable gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 800,
      }),
    });

    let reply = "Sorry, I'm having trouble right now. Try again shortly or visit assembl.co.nz.";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content || reply;
    }

    if (reply.length > 1500) {
      reply = reply.substring(0, 1497) + "...";
    }

    // Send reply via TNZ
    const ref = `assembl-sms-${crypto.randomUUID()}`;
    const sendResult = await sendViaTnz("sms", fromNumber, reply, ref);

    // Store outbound message
    await sb.from("sms_messages").insert({
      conversation_id: conversation.id,
      direction: "outbound",
      body: reply,
      tnz_message_id: sendResult.messageId || null,
      status: sendResult.messageId ? "sent" : "failed",
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
