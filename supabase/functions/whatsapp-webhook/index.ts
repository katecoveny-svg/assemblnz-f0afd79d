import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_BEHAVIOUR = `\n\nWHATSAPP RULES — You are responding via WhatsApp:
- WhatsApp supports rich formatting: *bold*, _italic_, ~strikethrough~
- Use bullet lists and numbered lists for clarity
- Keep responses under 4096 characters
- Use NZ English (colour, organise, licence, recognised, centre, programme)
- If an image was sent, acknowledge it and respond to its content

VOICE (WhatsApp):
You are not a textbook. You are the friend who happens to know the subject really well.
- Use conversational NZ English: "No worries", "Sweet as", "That's a tricky one"
- Start with the plain answer, then add the legal/technical backing
- Don't lead with section numbers — lead with what the person needs to know
- If something is genuinely complicated, say so: "This one's a bit of a minefield, actually"
- Light humour is fine. Talk like a smart Kiwi colleague, not a corporate chatbot.
- NEVER say "I'm just an AI". INSTEAD say "I can tell you what the law says, but if you're in a tricky spot, [specific next step]."
- Current date/time: `;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Parse form-encoded body from Twilio
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
    const numMedia = parseInt(body.NumMedia || "0", 10);

    // Handle status callbacks (sent/delivered/read)
    const messageStatus = body.MessageStatus || body.SmsStatus || "";
    if (messageStatus && body.MessageSid && !incomingBody && numMedia === 0) {
      // This is a status callback, update the message
      await sb.from("agent_sms_messages")
        .update({ whatsapp_status: messageStatus })
        .eq("whatsapp_message_id", body.MessageSid);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fromNumber) {
      return new Response("Missing From number", { status: 400, headers: corsHeaders });
    }

    // Process media attachments
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    let imageDescription: string | null = null;

    if (numMedia > 0) {
      mediaUrl = body.MediaUrl0 || null;
      const mediaContentType = body.MediaContentType0 || "";
      mediaType = mediaContentType.split("/")[0] || null;

      // Use Lovable AI to describe images
      if (mediaType === "image" && mediaUrl && LOVABLE_API_KEY) {
        try {
          const imgResp = await fetch(mediaUrl, {
            headers: { Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}` },
          });
          if (imgResp.ok) {
            const imgBuf = await imgResp.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuf)));

            const visionResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "image_url", image_url: { url: `data:${mediaContentType};base64,${base64}` } },
                      { type: "text", text: "Describe this image concisely in 1-2 sentences." },
                    ],
                  },
                ],
                max_tokens: 200,
              }),
            });

            if (visionResp.ok) {
              const visionData = await visionResp.json();
              imageDescription = visionData.choices?.[0]?.message?.content || null;
            }
          }
        } catch (e) {
          console.error("Image analysis error:", e);
          imageDescription = "Image received but could not be analysed";
        }
      }
    }

    // Look up agent config for WhatsApp (use first enabled WhatsApp agent, or default to echo)
    const { data: agentConfig } = await sb.from("agent_sms_config")
      .select("*")
      .eq("channel", "whatsapp")
      .eq("enabled", true)
      .limit(1)
      .maybeSingle();

    const agentId = agentConfig?.agent_id || "echo";
    const userId = agentConfig?.user_id || "00000000-0000-0000-0000-000000000000";

    // Store inbound message
    await sb.from("agent_sms_messages").insert({
      agent_id: agentId,
      user_id: userId,
      phone_number: fromNumber,
      body: incomingBody || "[Media message]",
      direction: "inbound",
      status: "received",
      channel: "whatsapp",
      whatsapp_message_id: messageSid,
      media_url: mediaUrl,
      media_type: mediaType,
      image_description: imageDescription,
      twilio_sid: messageSid,
    });

    // Build context from recent messages
    const { data: recentMsgs } = await sb.from("agent_sms_messages")
      .select("body, direction, image_description, created_at")
      .eq("phone_number", fromNumber)
      .eq("channel", "whatsapp")
      .order("created_at", { ascending: false })
      .limit(10);

    const history = (recentMsgs || []).reverse().map((m) => {
      const role = m.direction === "inbound" ? "Customer" : "Assistant";
      let text = m.body;
      if (m.image_description) text += ` [Image: ${m.image_description}]`;
      return `${role}: ${text}`;
    }).join("\n");

    // Get agent training context
    const { data: training } = await sb.from("agent_training")
      .select("business_context, tone, personality, rules, faqs")
      .eq("agent_id", agentId)
      .limit(1)
      .maybeSingle();

    let systemPrompt = `You are ${agentId.toUpperCase()}, an AI specialist by Assembl (assembl.co.nz).`;
    if (training?.business_context) systemPrompt += `\n\nBusiness context: ${training.business_context}`;
    if (training?.tone) systemPrompt += `\nTone: ${training.tone}`;
    if (training?.personality) systemPrompt += `\nPersonality: ${training.personality}`;
    systemPrompt += WHATSAPP_BEHAVIOUR + new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });

    // Compliance footer
    systemPrompt += `\n\nCOMPLIANCE:
- This is an AI assistant. Always identify as AI when asked.
- NZ Privacy Act 2020: Never share personal information
- Fair Trading Act: Be honest and transparent
- Reply STOP to opt out at any time`;

    let userMessage = incomingBody;
    if (imageDescription) userMessage += `\n\n[Image attached: ${imageDescription}]`;

    // Handle opt-out
    if (incomingBody.trim().toUpperCase() === "STOP") {
      const stopReply = "You've been unsubscribed from Assembl WhatsApp messages. Reply START to re-subscribe. 🙏";
      await sendWhatsApp(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, fromNumber, stopReply);
      await sb.from("agent_sms_messages").insert({
        agent_id: agentId, user_id: userId, phone_number: fromNumber,
        body: stopReply, direction: "outbound", status: "sent", channel: "whatsapp",
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI response
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not set");
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Conversation history:\n${history}\n\nLatest message: ${userMessage}` },
        ],
        max_tokens: 1024,
      }),
    });

    let replyText = "Sorry, I'm unable to respond right now. Please try again shortly.";
    if (aiResp.ok) {
      const aiData = await aiResp.json();
      replyText = aiData.choices?.[0]?.message?.content || replyText;
    }

    // Truncate to WhatsApp limit
    if (replyText.length > 4096) {
      replyText = replyText.slice(0, 4090) + "...";
    }

    // Send reply via Twilio
    const twilioResult = await sendWhatsApp(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, fromNumber, replyText);

    // Store outbound message
    await sb.from("agent_sms_messages").insert({
      agent_id: agentId, user_id: userId, phone_number: fromNumber,
      body: replyText, direction: "outbound", status: "sent", channel: "whatsapp",
      whatsapp_message_id: twilioResult?.sid || null, whatsapp_status: "sent",
      twilio_sid: twilioResult?.sid || null,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendWhatsApp(
  accountSid: string, authToken: string, fromNumber: string,
  toNumber: string, message: string
): Promise<{ sid: string } | null> {
  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${toNumber}`,
          Body: message,
        }),
      }
    );
    if (!resp.ok) {
      console.error("Twilio send error:", await resp.text());
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error("Twilio send exception:", e);
    return null;
  }
}
