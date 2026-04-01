import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TŌROA system prompt (condensed for SMS)
const TOROA_SMS_PROMPT = `You are TŌROA, a family life admin assistant for NZ families, communicating via text message (SMS).

RULES FOR SMS:
- Keep responses UNDER 300 characters when possible (SMS-friendly)
- Use short, punchy sentences — no fluff
- Use line breaks for lists, not bullets
- Never use markdown formatting
- Be warm but concise — like texting a super-organised friend
- Use NZ English (colour, organise, etc.)
- If asked about something complex, give the key answer first then offer "Reply MORE for details"
- For meal plans, give today's meals only unless asked for the week
- For reminders, confirm with the specific date/time
- For school dates, give the next upcoming one
- Sign off naturally (no "TŌROA" signature needed)

CAPABILITIES:
- Family schedule and calendar queries
- Meal planning and grocery suggestions (NZ supermarkets)
- School admin (NZ term dates 2026: T1 3 Feb-17 Apr, T2 5 May-4 Jul, T3 21 Jul-26 Sep, T4 13 Oct-16 Dec)
- Budget and bill reminders
- Quick reminders and to-do tracking
- Health appointment tracking
- NZ-specific info (ACC, school systems, local services)
- GROCERY LIST management
- APPOINTMENT booking
- FAMILY TASKS

SMART COMMANDS (detect intent and act):
- "Add [items] to groceries" → Add items to the active grocery list
- "What's on the shopping list?" → Read back current unchecked grocery items
- "Book [title] on [date] at [time]" → Create an appointment
- "What appointments are coming up?" → List next 5 appointments
- "Remind [person] to [task]" → Create a task assigned to that person
- "Add task: [description]" → Create a family task

When you detect a grocery request, output your reply AND include a JSON action block:
###ACTION:GROCERY###{"items":["milk","bread","eggs"],"store":"PAK'nSAVE"}###
When you detect an appointment request:
###ACTION:APPOINTMENT###{"title":"Dentist","date":"2026-04-02","time":"14:00","for":"Max","category":"medical"}###
When you detect a task request:
###ACTION:TASK###{"title":"Pack lunches","assigned_to":"Mum","priority":"normal"}###

Include the action block AFTER your friendly reply text.

When you detect a meal planning request, consider NZ seasonal produce and supermarket pricing.`;

/** Send reply via TNZ API */
async function sendViaTnz(to: string, message: string, reference: string): Promise<{ messageId?: string }> {
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
    const incomingBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const tnzMessageId = payload.MessageID || payload.messageId || "";

    if (!fromNumber || !incomingBody) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle opt-in / opt-out
    const upperBody = incomingBody.trim().toUpperCase();
    if (upperBody === "STOP" || upperBody === "UNSUBSCRIBE") {
      await sb
        .from("helm_sms_conversations")
        .update({ opted_in: false, updated_at: new Date().toISOString() })
        .eq("phone_number", fromNumber);

      await sendViaTnz(fromNumber, "You've been unsubscribed from TŌROA. Text START to re-subscribe anytime.", `toroa-optout-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (upperBody === "START" || upperBody === "SUBSCRIBE") {
      await sb
        .from("helm_sms_conversations")
        .update({ opted_in: true, updated_at: new Date().toISOString() })
        .eq("phone_number", fromNumber);

      await sendViaTnz(fromNumber, "Welcome back to TŌROA! Your family assistant is ready. Text anything to get started.", `toroa-optin-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Look up or create conversation
    let { data: convo } = await sb
      .from("helm_sms_conversations")
      .select("*")
      .eq("phone_number", fromNumber)
      .single();

    if (!convo) {
      const { data: newConvo } = await sb
        .from("helm_sms_conversations")
        .insert({
          phone_number: fromNumber,
          display_name: fromNumber,
          verified: false,
          opted_in: true,
        })
        .select()
        .single();
      convo = newConvo;
    }

    if (!convo) {
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!convo.opted_in) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log inbound message
    await sb.from("helm_sms_messages").insert({
      conversation_id: convo.id,
      direction: "inbound",
      body: incomingBody,
      tnz_message_id: tnzMessageId,
      status: "received",
    });

    // If not linked to a family, prompt setup
    if (!convo.family_id) {
      const trimmedBody = incomingBody.trim();
      if (trimmedBody.length >= 4 && trimmedBody.length <= 20) {
        const { data: invite } = await sb
          .from("family_invites")
          .select("family_id")
          .eq("code", trimmedBody)
          .is("used_by", null)
          .single();

        if (invite) {
          await sb
            .from("helm_sms_conversations")
            .update({ family_id: invite.family_id, verified: true, updated_at: new Date().toISOString() })
            .eq("id", convo.id);

          const { data: family } = await sb
            .from("families")
            .select("name")
            .eq("id", invite.family_id)
            .single();

          const replyText = `Connected to ${family?.name || "your family"}! I'm TŌROA, your family assistant. Try:\n\n"What's for dinner?"\n"Remind me to pack lunches at 7am"\n"When does Term 2 start?"`;

          await sendViaTnz(fromNumber, replyText, `toroa-linked-${crypto.randomUUID()}`);
          await sb.from("helm_sms_messages").insert({ conversation_id: convo.id, direction: "outbound", body: replyText, status: "sent" });

          return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      const setupReply = "Kia ora! I'm TŌROA, your family assistant. To get started, text me your family invite code from the TŌROA dashboard at assembl.co.nz. Or ask your family admin to add your number in Settings.";
      await sendViaTnz(fromNumber, setupReply, `toroa-setup-${crypto.randomUUID()}`);
      await sb.from("helm_sms_messages").insert({ conversation_id: convo.id, direction: "outbound", body: setupReply, status: "sent" });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch conversation history
    const { data: recentMessages } = await sb
      .from("helm_sms_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (recentMessages || [])
      .reverse()
      .map((m: any) => ({
        role: m.direction === "inbound" ? "user" : "assistant",
        content: m.body,
      }));

    // Fetch family context
    let familyContext = "";
    if (convo.family_id) {
      const [familyRes, childrenRes] = await Promise.all([
        sb.from("families").select("name, nz_region").eq("id", convo.family_id).single(),
        sb.from("children").select("name, year_level, school").eq("family_id", convo.family_id),
      ]);

      if (familyRes.data) {
        familyContext += `\nFamily: ${familyRes.data.name}`;
        if (familyRes.data.nz_region) familyContext += ` (${familyRes.data.nz_region})`;
      }
      if (childrenRes.data?.length) {
        familyContext += `\nChildren: ${childrenRes.data.map((c: any) => `${c.name}${c.year_level ? ` (Year ${c.year_level})` : ""}${c.school ? ` at ${c.school}` : ""}`).join(", ")}`;
      }
    }

    const fullPrompt = TOROA_SMS_PROMPT +
      (familyContext ? `\n\nFAMILY CONTEXT:${familyContext}` : "") +
      `\n\nCurrent date/time: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}`;

    if (!LOVABLE_API_KEY) {
      const fallback = "TŌROA is temporarily unavailable. Please try again shortly.";
      await sendViaTnz(fromNumber, fallback, `toroa-unavail-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let aiReply = "Sorry, I couldn't process that. Please try again.";

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
      console.error("TŌROA SMS AI error:", aiErr);
    }

    // Process action blocks
    const actionRegex = /###ACTION:(\w+)###(\{.*?\})###/g;
    let match;
    while ((match = actionRegex.exec(aiReply)) !== null) {
      const actionType = match[1];
      try {
        const actionData = JSON.parse(match[2]);
        const familyIdForAction = convo.family_id;

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
              .insert({ family_id: familyIdForAction, name: "Shopping List", store: actionData.store || null, created_by: familyIdForAction })
              .select("id")
              .single();
            activeList = newList;
          }

          if (activeList) {
            const items = (actionData.items as string[]).map((name: string, i: number) => ({
              list_id: activeList!.id,
              name: name.trim(),
              category: "other",
              sort_order: i,
            }));
            await sb.from("helm_grocery_items").insert(items);
            await sb.from("helm_family_chat").insert({
              family_id: familyIdForAction,
              sender_name: "TŌROA",
              content: `Added to groceries: ${(actionData.items as string[]).join(", ")}`,
              msg_type: "grocery_update",
              metadata: { list_id: activeList.id, items: actionData.items },
            });
          }
        }

        if (actionType === "APPOINTMENT" && familyIdForAction && actionData.title) {
          const dateStr = actionData.date || new Date().toISOString().slice(0, 10);
          const timeStr = actionData.time || "09:00";
          const startTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();

          await sb.from("helm_appointments").insert({
            family_id: familyIdForAction,
            title: actionData.title,
            start_time: startTime,
            category: actionData.category || "general",
            for_member: actionData.for || null,
            location: actionData.location || null,
            booked_via: "sms",
            created_by: familyIdForAction,
          });
          await sb.from("helm_family_chat").insert({
            family_id: familyIdForAction,
            sender_name: "TŌROA",
            content: `Appointment booked: ${actionData.title} on ${dateStr} at ${timeStr}${actionData.for ? ` for ${actionData.for}` : ""}`,
            msg_type: "appointment_update",
            metadata: actionData,
          });
        }

        if (actionType === "TASK" && familyIdForAction && actionData.title) {
          await sb.from("helm_tasks").insert({
            family_id: familyIdForAction,
            title: actionData.title,
            assigned_to: actionData.assigned_to || null,
            priority: actionData.priority || "normal",
            category: actionData.category || "general",
            created_by: familyIdForAction,
          });
          await sb.from("helm_family_chat").insert({
            family_id: familyIdForAction,
            sender_name: "TŌROA",
            content: `New task: ${actionData.title}${actionData.assigned_to ? ` (assigned to ${actionData.assigned_to})` : ""}`,
            msg_type: "system",
          });
        }
      } catch (actionErr) {
        console.error("Action processing error:", actionErr);
      }
    }

    // Strip action blocks from reply
    const cleanReply = aiReply.replace(/###ACTION:\w+###\{.*?\}###/g, "").trim();

    // Send reply via TNZ
    const ref = `toroa-sms-${crypto.randomUUID()}`;
    const sendResult = await sendViaTnz(fromNumber, cleanReply, ref);

    // Log outbound message
    await sb.from("helm_sms_messages").insert({
      conversation_id: convo.id,
      direction: "outbound",
      body: cleanReply,
      tnz_message_id: sendResult.messageId || null,
      status: sendResult.messageId ? "sent" : "failed",
    });

    await sb.from("helm_sms_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convo.id);

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("TŌROA SMS webhook error:", error);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
