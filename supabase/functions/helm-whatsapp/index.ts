import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WhatsApp Cloud API sends JSON webhooks (unlike Twilio's form-encoded)
// Supports both TŌRO (family-scoped) and generic agent routing

Deno.serve(async (req) => {
  // WhatsApp webhook verification (GET request)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "assembl-helm-verify";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const sb = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();

    // WhatsApp Cloud API webhook structure
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.length) {
      // Status update or other non-message event
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = value.messages[0];
    const fromNumber = message.from; // WhatsApp number (e.g., 6421xxxx)
    const incomingBody = message.text?.body || "";
    const messageId = message.id;
    const waId = value.metadata?.phone_number_id;

    if (!incomingBody.trim()) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalise NZ number
    const normalised = fromNumber.startsWith("64")
      ? `+${fromNumber}`
      : fromNumber.startsWith("+")
      ? fromNumber
      : `+64${fromNumber.replace(/^0/, "")}`;

    // === Determine if this is TŌRO or a generic agent ===
    // Check if the phone is linked to a TŌRO family conversation
    let { data: helmConvo } = await sb
      .from("helm_sms_conversations")
      .select("*, families(name, nz_region)")
      .eq("phone_number", normalised)
      .single();

    // Also check agent_sms_config to see if this WhatsApp number maps to a specific agent
    let agentId = "operations"; // default to TŌRO
    let systemPrompt = "";

    if (!helmConvo) {
      // Check if any agent_sms_config maps this WhatsApp number
      const { data: agentConfig } = await sb
        .from("agent_sms_config")
        .select("agent_id")
        .eq("whatsapp_number", waId)
        .single();

      if (agentConfig) {
        agentId = agentConfig.agent_id;
      }
    }

    // === Get conversation history ===
    const { data: recentMessages } = await sb
      .from("helm_sms_messages")
      .select("direction, body")
      .eq("conversation_id", helmConvo?.id || "none")
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (recentMessages || []).reverse().map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

    // === Build system prompt ===
    if (helmConvo?.family_id) {
      // TŌRO family context
      const [familyRes, childrenRes] = await Promise.all([
        sb.from("families").select("name, nz_region").eq("id", helmConvo.family_id).single(),
        sb.from("children").select("name, year_level, school").eq("family_id", helmConvo.family_id),
      ]);

      let familyContext = "";
      if (familyRes.data) {
        familyContext += `\nFamily: ${familyRes.data.name}`;
        if (familyRes.data.nz_region) familyContext += ` (${familyRes.data.nz_region})`;
      }
      if (childrenRes.data?.length) {
        familyContext += `\nChildren: ${childrenRes.data.map((c: any) => `${c.name}${c.year_level ? ` (Year ${c.year_level})` : ""}`).join(", ")}`;
      }

      systemPrompt = `You are TŌRO, a family life admin assistant for NZ families, communicating via WhatsApp.

RULES FOR WHATSAPP:
- You can use *bold*, _italic_, and ~strikethrough~ formatting (WhatsApp supports these)
- Use emojis naturally
- Keep responses concise but you can be slightly longer than SMS
- Be warm and helpful — like a super-organised family member
- Use NZ English
- For lists, use line breaks with emojis as bullets

SMART COMMANDS (detect intent and act):
- "Add [items] to groceries" → Add items to the grocery list
- "Book [title] on [date] at [time]" → Create an appointment
- "What's coming up?" → List upcoming appointments and tasks
- "Shopping list" → Read back current grocery list

When you detect a grocery request, include: ###ACTION:GROCERY###{"items":["milk","bread"]}###
When you detect an appointment request: ###ACTION:APPOINTMENT###{"title":"Dentist","date":"2026-04-02","time":"14:00","for":"Max","category":"medical"}###
When you detect a task request: ###ACTION:TASK###{"title":"Pack lunches","assigned_to":"Mum"}###

${familyContext ? `\nFAMILY CONTEXT:${familyContext}` : ""}
Current date/time: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}`;
    } else {
      // Generic agent — fetch system prompt
      try {
        const { data: promptData } = await sb.functions.invoke("chat", {
          body: { agentId, getSystemPrompt: true },
        });
        systemPrompt = (promptData?.systemPrompt || "You are a helpful AI assistant.") +
          "\n\nYou are communicating via WhatsApp. Use *bold* and emojis naturally. Keep responses concise.";
      } catch {
        systemPrompt = "You are a helpful AI assistant communicating via WhatsApp. Be concise and helpful.";
      }
    }

    // === Call AI ===
    let aiReply = "Sorry, I'm temporarily unavailable. Please try again shortly.";

    if (LOVABLE_API_KEY) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: systemPrompt },
              ...chatHistory,
              { role: "user", content: incomingBody },
            ],
            max_tokens: 800,
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
        }
      } catch (err) {
        console.error("WhatsApp AI error:", err);
      }
    }

    // === Process action blocks (same as SMS) ===
    const actionRegex = /###ACTION:(\w+)###(\{.*?\})###/g;
    let match;
    while ((match = actionRegex.exec(aiReply)) !== null) {
      const actionType = match[1];
      try {
        const actionData = JSON.parse(match[2]);
        const familyIdForAction = helmConvo?.family_id;

        if (actionType === "GROCERY" && familyIdForAction && actionData.items) {
          let { data: activeList } = await sb
            .from("helm_grocery_lists")
            .select("id")
            .eq("family_id", familyIdForAction)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!activeList) {
            const { data: newList } = await sb
              .from("helm_grocery_lists")
              .insert({ family_id: familyIdForAction, name: "Shopping List", created_by: familyIdForAction })
              .select("id")
              .single();
            activeList = newList;
          }

          if (activeList) {
            await sb.from("helm_grocery_items").insert(
              (actionData.items as string[]).map((name: string, i: number) => ({
                list_id: activeList!.id, name: name.trim(), category: "other", sort_order: i,
              }))
            );

            await sb.from("helm_family_chat").insert({
              family_id: familyIdForAction,
              sender_name: "TŌRO",
              content: `Added to groceries via WhatsApp: ${(actionData.items as string[]).join(", ")}`,
              msg_type: "grocery_update",
              metadata: { source: "whatsapp", items: actionData.items },
            });
          }
        }

        if (actionType === "APPOINTMENT" && familyIdForAction && actionData.title) {
          const dateStr = actionData.date || new Date().toISOString().slice(0, 10);
          const timeStr = actionData.time || "09:00";
          await sb.from("helm_appointments").insert({
            family_id: familyIdForAction,
            title: actionData.title,
            start_time: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
            category: actionData.category || "general",
            for_member: actionData.for || null,
            booked_via: "whatsapp",
            created_by: familyIdForAction,
          });

          await sb.from("helm_family_chat").insert({
            family_id: familyIdForAction,
            sender_name: "TŌRO",
            content: `Appointment booked via WhatsApp: ${actionData.title} on ${dateStr} at ${timeStr}`,
            msg_type: "appointment_update",
          });
        }

        if (actionType === "TASK" && familyIdForAction && actionData.title) {
          await sb.from("helm_tasks").insert({
            family_id: familyIdForAction,
            title: actionData.title,
            assigned_to: actionData.assigned_to || null,
            priority: actionData.priority || "normal",
            created_by: familyIdForAction,
          });
        }
      } catch (actionErr) {
        console.error("WhatsApp action error:", actionErr);
      }
    }

    // Strip action blocks from reply
    const cleanReply = aiReply.replace(/###ACTION:\w+###\{.*?\}###/g, "").trim();

    // === Log messages ===
    if (helmConvo?.id) {
      await sb.from("helm_sms_messages").insert([
        { conversation_id: helmConvo.id, direction: "inbound", body: incomingBody, twilio_sid: messageId, status: "received" },
        { conversation_id: helmConvo.id, direction: "outbound", body: cleanReply, status: "sent" },
      ]);
    }

    // === Send reply via WhatsApp Cloud API ===
    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
      await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: fromNumber,
          type: "text",
          text: { body: cleanReply },
        }),
      });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(JSON.stringify({ status: "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
