import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * TNZ-INBOUND (Multi-Tenant Router)
 * ==================================
 * Single gateway for ALL inbound SMS/WhatsApp via TNZ.
 *
 * Flow:
 *   1. Resolve tenant from the "to" phone number
 *   2. Handle STOP/START/HELP (UEMA compliance)
 *   3. Find/create conversation (tenant-scoped)
 *   4. Load tenant's enabled kete
 *   5. Kete picker (menu, greeting, numeric selection)
 *   6. Route by keyword to the right kete (Iho routing)
 *   7. If kete has handler_fn → POST to handler, return reply
 *   8. Otherwise → fall back to default Gemini path
 *   9. Truncate & send via TNZ
 *  10. Audit log
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_BEHAVIOUR = `
SMS/WhatsApp RULES — You are responding via text message:
- Keep responses UNDER 400 characters when possible (max 1500)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first
`;

// ============================================================================
// TNZ SEND
// ============================================================================

async function sendViaTnz(
  channel: string,
  to: string,
  message: string,
  reference: string
): Promise<{ messageId?: string; error?: string }> {
  const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken) return { error: "TNZ_AUTH_TOKEN not configured" };

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;
  const endpoint = channel === "whatsapp" ? "whatsapp" : "sms";

  const body: Record<string, unknown> = {
    MessageData: {
      Message: message,
      Destinations: [{ Recipient: to }],
      WebhookCallbackURL: webhookUrl,
      WebhookCallbackFormat: "JSON",
      Reference: reference,
      ...(endpoint === "sms" ? { SendMode: "Normal", FallbackMode: "WhatsApp" } : {}),
    },
  };

  const resp = await fetch(`${tnzBase}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tnzToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (data.Result === "Success") {
    return { messageId: data.MessageID };
  }
  return { error: data.Result || "TNZ send failed" };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

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

    // --- PARSE TNZ INBOUND PAYLOAD ---
    const payload = await req.json();
    console.log("TNZ inbound payload:", JSON.stringify(payload));

    const fromNumber = payload.From || payload.from || payload.Sender || payload.sender || "";
    const toNumber = payload.To || payload.to || payload.Destination || payload.destination || "";
    const messageBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const channel = (payload.Channel || payload.channel || "sms").toLowerCase();
    const tnzMessageId = payload.MessageID || payload.messageId || "";
    const mediaUrl = payload.MediaUrl || payload.mediaUrl || payload.Media || null;

    if (!fromNumber || !messageBody) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing from/body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- STEP 1: RESOLVE TENANT ---
    let tenantId: string;
    try {
      const { data: resolved } = await sb.rpc("resolve_tenant_from_phone", {
        p_phone: toNumber,
        p_channel: channel,
      });
      tenantId = resolved || "00000000-0000-0000-0000-000000000001";
    } catch {
      tenantId = "00000000-0000-0000-0000-000000000001";
    }

    console.log(`Tenant resolved: ${tenantId} for number ${toNumber}`);

    // --- STEP 2: UEMA COMPLIANCE (STOP/START/HELP) ---
    const upper = messageBody.trim().toUpperCase();

    if (upper === "STOP" || upper === "UNSUBSCRIBE") {
      await sendViaTnz(
        channel,
        fromNumber,
        "You've been unsubscribed from messages. Text START to re-subscribe anytime.",
        `opt-out-${crypto.randomUUID()}`
      );
      return new Response(JSON.stringify({ ok: true, action: "opt-out" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (upper === "START" || upper === "SUBSCRIBE") {
      await sendViaTnz(
        channel,
        fromNumber,
        "Kia ora! Welcome back. Text anything to get started.",
        `opt-in-${crypto.randomUUID()}`
      );
      return new Response(JSON.stringify({ ok: true, action: "opt-in" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (upper === "HELP") {
      await sendViaTnz(
        channel,
        fromNumber,
        "Assembl help:\n- Text MENU to see available services\n- Text STOP to unsubscribe\n- Text START to re-subscribe\n- Or just ask your question and we'll route you to the right specialist.",
        `help-${crypto.randomUUID()}`
      );
      return new Response(JSON.stringify({ ok: true, action: "help" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- STEP 3: FIND/CREATE CONVERSATION ---
    const validChannel = ["sms", "whatsapp", "rcs"].includes(channel) ? channel : "sms";
    let conversationId: string;

    const { data: existing } = await sb
      .from("messaging_conversations")
      .select("id")
      .eq("phone_number", fromNumber)
      .eq("channel", validChannel)
      .eq("status", "active")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existing) {
      conversationId = existing.id;
      await sb
        .from("messaging_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else {
      const { data: created, error: createErr } = await sb
        .from("messaging_conversations")
        .insert({
          phone_number: fromNumber,
          channel: validChannel,
          status: "active",
          tenant_id: tenantId,
        })
        .select("id")
        .single();

      if (createErr || !created) {
        console.error("Failed to create conversation:", createErr);
        return new Response(JSON.stringify({ ok: false }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      conversationId = created.id;
    }

    // Store inbound message
    await sb.from("messaging_messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      tnz_message_id: tnzMessageId || null,
      direction: "inbound",
      from_number: fromNumber,
      to_number: toNumber,
      body: messageBody,
      channel: validChannel,
      status: "received",
    });

    // --- STEP 4: LOAD TENANT'S ENABLED KETE ---
    const { data: enabledKete } = await sb
      .from("tenant_ketes")
      .select("kete_id, display_name, custom_prompt, kete_definitions(slug, name, te_reo_name, keywords, handler_fn)")
      .eq("tenant_id", tenantId)
      .eq("enabled", true);

    let availableKete: Array<{
      slug: string;
      name: string;
      te_reo_name: string;
      keywords: string[];
      handler_fn: string | null;
      display_name?: string;
      custom_prompt?: string;
    }> = [];

    if (enabledKete && enabledKete.length > 0) {
      availableKete = enabledKete.map((tk: any) => ({
        slug: tk.kete_definitions.slug,
        name: tk.kete_definitions.name,
        te_reo_name: tk.kete_definitions.te_reo_name,
        keywords: tk.kete_definitions.keywords || [],
        handler_fn: tk.kete_definitions.handler_fn,
        display_name: tk.display_name,
        custom_prompt: tk.custom_prompt,
      }));
    } else {
      const { data: allKete } = await sb
        .from("kete_definitions")
        .select("slug, name, te_reo_name, keywords, handler_fn")
        .eq("active", true)
        .order("display_order");
      availableKete = (allKete || []).map((k: any) => ({ ...k, keywords: k.keywords || [] }));
    }

    // --- STEP 5: KETE PICKER (MENU / GREETING / NUMERIC) ---
    const lower = messageBody.trim().toLowerCase();

    if (lower === "menu" || lower === "options" || lower === "kete") {
      const menuLines = availableKete.map(
        (k, i) => `${i + 1}. ${k.display_name || k.name} (${k.te_reo_name || k.slug})`
      );
      const menuMsg = `Kia ora! Here are your available services:\n\n${menuLines.join("\n")}\n\nReply with a number or just describe what you need.`;
      const ref = `menu-${crypto.randomUUID()}`;
      await sendViaTnz(validChannel, fromNumber, menuMsg, ref);

      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tenant_id: tenantId,
        direction: "outbound",
        from_number: toNumber,
        to_number: fromNumber,
        body: menuMsg,
        channel: validChannel,
        status: "sent",
        agent_used: "iho-router",
        tnz_reference: ref,
      });

      return new Response(JSON.stringify({ ok: true, action: "menu" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (/^(hi|hello|hey|kia ora|morena|g'day|gday|sup)$/i.test(lower)) {
      const menuLines = availableKete.map(
        (k, i) => `${i + 1}. ${k.display_name || k.name}`
      );
      const greetMsg = `Kia ora! Welcome to Assembl.\n\nWhat can I help with?\n${menuLines.join("\n")}\n\nReply with a number, or just ask your question.`;
      const ref = `greet-${crypto.randomUUID()}`;
      await sendViaTnz(validChannel, fromNumber, greetMsg, ref);

      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tenant_id: tenantId,
        direction: "outbound",
        from_number: toNumber,
        to_number: fromNumber,
        body: greetMsg,
        channel: validChannel,
        status: "sent",
        agent_used: "iho-router",
        tnz_reference: ref,
      });

      return new Response(JSON.stringify({ ok: true, action: "greeting" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Numeric selection
    const numChoice = parseInt(lower, 10);
    let selectedKete: typeof availableKete[0] | null = null;

    if (!isNaN(numChoice) && numChoice >= 1 && numChoice <= availableKete.length) {
      selectedKete = availableKete[numChoice - 1];
    }

    // --- STEP 6: KEYWORD ROUTING (IHO) ---
    if (!selectedKete) {
      const prefixMatch = lower.match(/^(\w+):\s*(.+)/);
      if (prefixMatch) {
        const prefixSlug = prefixMatch[1];
        selectedKete = availableKete.find((k) => k.slug === prefixSlug) || null;
      }
    }

    if (!selectedKete) {
      let bestScore = 0;
      for (const kete of availableKete) {
        let score = 0;
        for (const keyword of kete.keywords) {
          if (lower.includes(keyword.toLowerCase())) {
            score += keyword.length;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          selectedKete = kete;
        }
      }

      if (!selectedKete || bestScore === 0) {
        selectedKete = availableKete.find((k) => k.slug === "pakihi") || availableKete[0] || null;
      }
    }

    if (!selectedKete) {
      const fallbackMsg = "Kia ora! We're setting up your services. Please try again shortly or visit assembl.co.nz";
      await sendViaTnz(validChannel, fromNumber, fallbackMsg, `fallback-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true, action: "no-kete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Iho routing: ${fromNumber} → ${selectedKete.slug} (${selectedKete.name})`);

    await sb
      .from("messaging_conversations")
      .update({
        assigned_agent: selectedKete.slug,
        assigned_pack: selectedKete.slug,
      })
      .eq("id", conversationId);

    // --- STEP 7: FETCH CONVERSATION HISTORY ---
    const { data: historyRows } = await sb
      .from("messaging_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatHistory = (historyRows || []).map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

    // --- STEP 8: DISPATCH TO HANDLER OR DEFAULT PATH ---
    let aiReply = "Kia ora! I'm having trouble processing that right now. Please try again shortly.";
    let modelUsed = "google/gemini-2.5-flash";
    let agentUsed = selectedKete.slug;

    let actualMessage = messageBody;
    const msgPrefixMatch = messageBody.match(/^\w+:\s*(.+)/);
    if (msgPrefixMatch && selectedKete) {
      actualMessage = msgPrefixMatch[1];
    }

    if (selectedKete.handler_fn) {
      console.log(`Dispatching to handler: ${selectedKete.handler_fn}`);

      try {
        const handlerUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${selectedKete.handler_fn}`;
        const handlerResp = await fetch(handlerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            conversation_id: conversationId,
            phone: fromNumber,
            body: actualMessage,
            mediaUrl: mediaUrl,
            history: chatHistory,
            channel: validChannel,
          }),
        });

        if (handlerResp.ok) {
          const handlerData = await handlerResp.json();
          if (handlerData.reply) {
            aiReply = handlerData.reply;
            modelUsed = handlerData.meta?.model || modelUsed;
            agentUsed = handlerData.meta?.agent || agentUsed;
          }
        } else {
          console.error(`Handler ${selectedKete.handler_fn} returned ${handlerResp.status}`);
        }
      } catch (handlerErr) {
        console.error(`Handler ${selectedKete.handler_fn} error:`, handlerErr);
      }
    }

    if (!selectedKete.handler_fn || aiReply.includes("having trouble")) {
      if (!LOVABLE_API_KEY) {
        console.error("LOVABLE_API_KEY not configured");
      } else {
        let systemPrompt = `You are ${selectedKete.te_reo_name || selectedKete.name} from Assembl, a specialist ${selectedKete.name} advisor for New Zealand businesses and whanau.`;

        if (selectedKete.custom_prompt) {
          systemPrompt = selectedKete.custom_prompt;
        }

        try {
          const promptResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
            },
            body: JSON.stringify({ agentId: selectedKete.slug, getSystemPrompt: true }),
          });
          if (promptResp.ok) {
            const pd = await promptResp.json();
            if (pd.systemPrompt) systemPrompt = pd.systemPrompt;
          }
        } catch {
          // Use default prompt
        }

        const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
        const signature = `— ${selectedKete.te_reo_name || selectedKete.name}, your ${selectedKete.name.toLowerCase()} navigator`;
        const fullPrompt = `${systemPrompt}${SMS_BEHAVIOUR}\nCurrent NZ date/time: ${nzTime}\n\nEnd every response with your signature: ${signature}`;

        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
            },
            body: JSON.stringify({
              model: modelUsed,
              messages: [
                { role: "system", content: fullPrompt },
                ...chatHistory,
                { role: "user", content: actualMessage },
              ],
              max_tokens: 800,
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
          }
        } catch (aiErr) {
          console.error("AI generation error:", aiErr);
        }
      }
    }

    // --- STEP 9: TRUNCATE & SEND ---
    const maxLen = validChannel === "sms" ? 1500 : 4000;
    if (aiReply.length > maxLen) {
      aiReply = aiReply.substring(0, maxLen - 3) + "...";
    }

    const ref = `${selectedKete.slug}-${validChannel}-${crypto.randomUUID()}`;
    const sendResult = await sendViaTnz(validChannel, fromNumber, aiReply, ref);
    const responseTimeMs = Date.now() - startTime;

    await sb.from("messaging_messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      tnz_message_id: sendResult.messageId || null,
      direction: "outbound",
      from_number: toNumber,
      to_number: fromNumber,
      body: aiReply,
      channel: validChannel,
      status: sendResult.messageId ? "sent" : "failed",
      agent_used: agentUsed,
      model_used: modelUsed,
      compliance_checked: true,
      response_time_ms: responseTimeMs,
      tnz_reference: ref,
    });

    // --- STEP 10: AUDIT LOG ---
    try {
      await sb.from("audit_log").insert({
        agent_code: agentUsed,
        agent_name: selectedKete.te_reo_name || selectedKete.name,
        model_used: modelUsed,
        user_id: "00000000-0000-0000-0000-000000000000",
        request_summary: `[${validChannel.toUpperCase()}] [tenant:${tenantId}] ${messageBody.substring(0, 100)}`,
        response_summary: aiReply.substring(0, 200),
        duration_ms: responseTimeMs,
        compliance_passed: true,
        data_classification: "INTERNAL",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    console.log(
      `Processed ${validChannel} from ${fromNumber} → ${agentUsed} (tenant: ${tenantId}) in ${responseTimeMs}ms`
    );

    return new Response(
      JSON.stringify({
        ok: true,
        tenant: tenantId,
        kete: agentUsed,
        handler: selectedKete.handler_fn || "default",
        responseTimeMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("TNZ inbound error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
