import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * KETE-TOROA-HANDLER
 * ==================
 * Pure handler for the TORO family concierge kete.
 *
 * Contract:
 *   Input:  { tenant_id, conversation_id, phone, body, mediaUrl?, history[], channel }
 *   Output: { reply, meta: { agent, model, tokens?, features_used[] } }
 */

const TORO_SYSTEM_PROMPT = `You are TORO, the Assembl family concierge for New Zealand whanau.

WHAT YOU DO:
- Meal planning & recipes (NZ ingredients, budget-friendly, dietary needs)
- School logistics (term dates, pick-ups, homework help, lunches)
- Family health navigation (GP bookings, medication reminders, dental, vet)
- Household budgeting & bill tracking
- Family calendar & activity planning
- Pet care reminders
- Home maintenance scheduling
- Local activity suggestions (NZ-specific)

PERSONALITY:
- Warm, practical, like a super-organised family member
- You know NZ life: school terms, Countdown vs New World, ACC, Plunket
- Proactive: if someone asks about dinner, also mention tomorrow's lunches
- Remember family details when provided (names, allergies, preferences, pets)

SMS/WHATSAPP RULES:
- Keep responses UNDER 400 characters when possible (max 1500)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable friend
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, favourite, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first

FORWARD THINKING:
- When answering about today, also hint at what's coming (weather, school events, etc.)
- If it's Sunday evening, suggest meal prep for the week
- If it's Friday, suggest weekend activities
- Be seasonally aware (NZ seasons: Dec-Feb summer, Jun-Aug winter)

Sign off with: — Toro, your whanau navigator`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const input = await req.json();
    const {
      tenant_id,
      conversation_id,
      phone,
      body,
      mediaUrl,
      history = [],
      channel = "sms",
    } = input;

    if (!body) {
      return new Response(
        JSON.stringify({ reply: null, meta: { error: "No message body" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const featuresUsed: string[] = [];

    // --- FAMILY MEMORY ---
    let familyContext = "";
    try {
      const { data: familyData } = await sb
        .from("toroa_families")
        .select("family_name, members, preferences, notes")
        .eq("phone_number", phone)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      if (familyData) {
        familyContext = `\n\nFAMILY CONTEXT (remembered from previous conversations):
Family name: ${familyData.family_name || "Unknown"}
Members: ${JSON.stringify(familyData.members || [])}
Preferences: ${JSON.stringify(familyData.preferences || {})}
Notes: ${familyData.notes || "None"}`;
        featuresUsed.push("family_memory");
      }
    } catch {
      // No family record yet
    }

    // --- VISION (image analysis) ---
    let visionContext = "";
    if (mediaUrl && LOVABLE_API_KEY) {
      try {
        const visionResp = await fetch(AI_GATEWAY_URL, {
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
                  { type: "text", text: "Describe this image briefly in 1-2 sentences. If it's food, identify the dish. If it's a document, summarise the key info. If it's a product, identify it." },
                  { type: "image_url", image_url: { url: mediaUrl } },
                ],
              },
            ],
            max_tokens: 200,
          }),
        });

        if (visionResp.ok) {
          const visionData = await visionResp.json();
          const description = visionData.choices?.[0]?.message?.content?.trim();
          if (description) {
            visionContext = `\n\nThe user sent an image. Description: ${description}`;
            featuresUsed.push("vision");
          }
        }
      } catch (e) {
        console.error("Vision analysis failed:", e);
      }
    }

    // --- TIME & WEATHER CONTEXT ---
    const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
    const nzDate = new Date().toLocaleDateString("en-NZ", {
      timeZone: "Pacific/Auckland",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const nzHour = parseInt(
      new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "numeric", hour12: false }),
      10
    );

    let timeContext = `Current NZ date/time: ${nzDate}, ${nzTime}`;

    if (nzHour < 9) {
      timeContext += "\nIt's morning — good time for breakfast/lunch planning, school prep.";
    } else if (nzHour >= 11 && nzHour < 13) {
      timeContext += "\nIt's around lunchtime.";
    } else if (nzHour >= 16 && nzHour < 18) {
      timeContext += "\nIt's late afternoon — good time for dinner planning, after-school activities.";
    } else if (nzHour >= 18 && nzHour < 21) {
      timeContext += "\nIt's evening — dinner time, homework, bedtime routines.";
    } else if (nzHour >= 21) {
      timeContext += "\nIt's late evening — prep for tomorrow, wind down.";
    }
    featuresUsed.push("time_awareness");

    const dayOfWeek = new Date().toLocaleDateString("en-NZ", { timeZone: "Pacific/Auckland", weekday: "long" });
    if (dayOfWeek === "Sunday") {
      timeContext += "\nIt's Sunday — great time to meal prep for the week ahead.";
    } else if (dayOfWeek === "Friday") {
      timeContext += "\nIt's Friday — weekend is coming, suggest activities or weekend meals.";
    }

    // --- WEATHER ---
    let weatherContext = "";
    const GOOGLE_MAPS_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (GOOGLE_MAPS_KEY && /\b(weather|rain|cold|hot|warm|umbrella|jacket)\b/i.test(body)) {
      weatherContext = "\nNote: User asked about weather. Give general NZ seasonal advice based on the current month.";
      featuresUsed.push("weather_hint");
    }

    // --- BUILD FULL PROMPT ---
    const fullPrompt = [
      TORO_SYSTEM_PROMPT,
      familyContext,
      visionContext,
      `\n${timeContext}`,
      weatherContext,
    ].join("");

    // --- CHAT HISTORY ---
    const chatMessages = [
      { role: "system" as const, content: fullPrompt },
      ...(history || []).slice(-15).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: body },
    ];

    // --- GENERATE RESPONSE ---
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          reply: "Kia ora! I'm having trouble connecting right now. Please try again shortly.\n\n— Toro, your whanau navigator",
          meta: { agent: "toroa", error: "LOVABLE_API_KEY not configured" },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let reply = "Kia ora! I'm having trouble processing that right now. Please try again shortly.\n\n— Toro, your whanau navigator";
    const model = "google/gemini-2.5-flash";
    let tokensUsed: number | undefined;

    try {
      const aiResp = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          max_tokens: 800,
        }),
      });

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        reply = aiData.choices?.[0]?.message?.content?.trim() || reply;
        tokensUsed = aiData.usage?.total_tokens;
      } else {
        const errText = await aiResp.text();
        console.error("Toro AI gateway error:", aiResp.status, errText);
      }
    } catch (aiErr) {
      console.error("Toro AI generation error:", aiErr);
    }

    // --- TRUNCATE FOR SMS ---
    const maxLen = channel === "sms" ? 1500 : 4000;
    if (reply.length > maxLen) {
      reply = reply.substring(0, maxLen - 50) + "\n\nReply MORE for the rest.\n\n— Toro, your whanau navigator";
    }

    // --- MEMORY EXTRACTION (logged for now; persistence handled elsewhere) ---
    const familyInfoPatterns = /\b(my (kid|child|daughter|son|partner|wife|husband|dog|cat|pet) is|allergic to|we('re| are) vegetarian|our family|my name is)\b/i;
    if (familyInfoPatterns.test(body)) {
      featuresUsed.push("memory_extraction");
      console.log(`[TORO] Family info detected from ${phone}: ${body.substring(0, 100)}`);
    }

    const responseTimeMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        reply,
        meta: {
          agent: "toroa",
          agent_name: "Toro",
          model,
          tokens: tokensUsed,
          features_used: featuresUsed,
          response_time_ms: responseTimeMs,
          conversation_id,
          tenant_id,
          signature: "— Toro, your whanau navigator",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("kete-toroa-handler error:", err);
    return new Response(
      JSON.stringify({
        reply: "Kia ora! Something went wrong on my end. Please try again.\n\n— Toro, your whanau navigator",
        meta: { agent: "toroa", error: String(err) },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
