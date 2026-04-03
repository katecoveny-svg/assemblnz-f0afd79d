import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const { from, message, mediaUrl } = body;

    if (!from || !message) {
      return new Response(JSON.stringify({ error: "Missing 'from' or 'message'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Find or create family profile
    let { data: family } = await sb
      .from("toroa_families")
      .select("*")
      .eq("primary_phone", from)
      .single();

    if (!family) {
      const { data: newFamily } = await sb
        .from("toroa_families")
        .insert({ primary_phone: from, status: "trial", messages_remaining: 10 })
        .select()
        .single();
      family = newFamily;
    }

    if (!family) {
      return new Response(JSON.stringify({ error: "Failed to create family profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check message allowance
    if (family.status === "trial" && family.messages_remaining <= 0) {
      const upgradeMsg = "Kia ora! You've used your free trial messages. Subscribe for $29/mo to keep using Tōroa: https://assembl.co.nz/toroa";
      await sendSms(from, upgradeMsg);
      return new Response(JSON.stringify({ status: "trial_expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Log inbound message
    await sb.from("toroa_messages").insert({
      family_id: family.id,
      direction: "inbound",
      from_number: from,
      body: message,
      media_url: mediaUrl || null,
    });

    // 4. Get Tōroa system prompt
    const { data: agent } = await sb
      .from("agent_prompts")
      .select("system_prompt")
      .eq("agent_name", "toroa")
      .single();

    const systemPrompt = agent?.system_prompt || "You are Tōroa, an SMS-first family navigator for NZ whānau. Be warm, concise, and helpful. Use te reo naturally.";

    // 5. Get conversation history
    const { data: history } = await sb
      .from("toroa_messages")
      .select("direction, body")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationHistory = (history || []).reverse().map((msg: any) => ({
      role: msg.direction === "inbound" ? "user" : "assistant",
      content: msg.body,
    }));

    // 6. Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        await sendSms(from, "Kia ora! Tōroa's a bit busy right now. Try again in a minute.");
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const replyText = aiResult.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again?";

    // 7. Send reply via TNZ Group
    await sendSms(from, replyText);

    // 8. Log outbound message
    await sb.from("toroa_messages").insert({
      family_id: family.id,
      direction: "outbound",
      from_number: Deno.env.get("TNZ_FROM_NUMBER") || "TOROA",
      body: replyText,
    });

    // 9. Decrement trial messages
    if (family.status === "trial") {
      await sb
        .from("toroa_families")
        .update({ messages_remaining: family.messages_remaining - 1 })
        .eq("id", family.id);
    }

    return new Response(JSON.stringify({ success: true, reply: replyText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("toroa-sms error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendSms(to: string, message: string) {
  const TNZ_AUTH_TOKEN = Deno.env.get("TNZ_AUTH_TOKEN");
  const TNZ_API_BASE = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v2.02";
  const TNZ_FROM = Deno.env.get("TNZ_FROM_NUMBER") || "TOROA";

  if (!TNZ_AUTH_TOKEN) {
    console.warn("TNZ_AUTH_TOKEN not set — SMS not sent");
    return;
  }

  try {
    await fetch(`${TNZ_API_BASE}/send/sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${TNZ_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        MessageData: {
          Message: message,
          Destinations: [{ Recipient: to }],
          Reference: `toroa-${Date.now()}`,
          FromNumber: TNZ_FROM,
        },
      }),
    });
  } catch (err) {
    console.error("SMS send error:", err);
  }
}
