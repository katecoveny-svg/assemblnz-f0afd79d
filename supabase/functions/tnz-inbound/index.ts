import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * TNZ-INBOUND (Multi-Tenant Router · Multi-Channel)
 * ==================================================
 * Single gateway for ALL inbound messages.
 *
 * Inbound sources detected automatically:
 *   - TextBee SMS webhook  (event: "MESSAGE_RECEIVED")
 *   - Chatwoot webhook     (event: "message_created", message_type: "incoming")
 *   - TNZ legacy fallback  (From / Message style payloads)
 *
 * Outbound sender priority (when ENABLE_NEW_SENDERS=true):
 *   1. PWA push notification (free, instant — if user_id has subscriptions)
 *   2. Chatwoot reply API    (for webchat / WhatsApp / Facebook)
 *   3. TextBee SMS gateway   (for sms when configured)
 *   4. TNZ legacy            (final fallback)
 *
 * When ENABLE_NEW_SENDERS is not "true" the sender chain is bypassed and
 * every reply goes via the legacy sendViaTnz() — identical to pre-migration
 * behaviour. The flag must be flipped on explicitly per environment.
 *
 * Core routing intelligence (tenant resolution, kete picker, keyword
 * matching, handler dispatch, conversation history, audit logging) is
 * unchanged from the TNZ-only version. This change is surgical: only the
 * inbound parser and outbound sender layers move.
 *
 * Flow:
 *   1. Resolve tenant from the "to" phone number / account id
 *   2. Resolve owner user_id (for push notification routing)
 *   3. Handle STOP/START/HELP (UEMA compliance)
 *   4. Find/create conversation (tenant-scoped)
 *   5. Load tenant's enabled kete
 *   6. Kete picker (menu, greeting, numeric selection)
 *   7. Route by keyword to the right kete (Iho routing)
 *   8. If kete has handler_fn → POST to handler, return reply
 *   9. Otherwise → fall back to default Gemini path
 *  10. Truncate & send via the priority chain (or legacy TNZ if flag off)
 *  11. Audit log
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * ENABLE_NEW_SENDERS — feature flag for the multi-channel sender chain.
 *
 *   "true"   → sendMessage() routes via push → Chatwoot → TextBee → TNZ
 *   anything else (including unset) → sendMessage() proxies straight to
 *   the legacy sendViaTnz(), preserving exact pre-migration behaviour.
 *
 * This is the ONLY behavioural toggle in this PR. Inbound parsing always
 * accepts all three payload shapes — but with the flag off, the new
 * outbound paths are never invoked even if a TextBee/Chatwoot webhook
 * arrives. Flip this on per-environment once secrets and services are
 * provisioned.
 */
const ENABLE_NEW_SENDERS =
  (Deno.env.get("ENABLE_NEW_SENDERS") ?? "").trim().toLowerCase() === "true";

type SupabaseClient = ReturnType<typeof createClient>;

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
// SEND — Multi-channel (TextBee SMS + Chatwoot API + PWA Push)
// ============================================================================
//
// Each sender below is INERT unless its corresponding env vars are set. They
// are only invoked from sendMessage() when ENABLE_NEW_SENDERS=true. Until
// the flag flips, sendMessage() routes straight to sendViaTnz() and these
// functions never run.

async function sendViaTextBee(
  to: string,
  message: string,
  reference: string,
): Promise<{ messageId?: string; error?: string }> {
  const apiKey = Deno.env.get("TEXTBEE_API_KEY");
  const deviceId = Deno.env.get("TEXTBEE_DEVICE_ID");
  if (!apiKey || !deviceId) return { error: "TextBee not configured" };

  try {
    const resp = await fetch(
      `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          recipients: [to],
          message,
        }),
      },
    );

    const data = await resp.json().catch(() => ({}));
    if (resp.ok && (data.success || data.messageId || data._id)) {
      return { messageId: data.messageId || data._id || reference };
    }
    return { error: data.error || `TextBee send failed (HTTP ${resp.status})` };
  } catch (e) {
    return { error: `TextBee fetch error: ${(e as Error).message}` };
  }
}

async function replyViaChatwoot(
  conversationId: string,
  accountId: string,
  message: string,
): Promise<{ messageId?: string; error?: string }> {
  const chatwootUrl = Deno.env.get("CHATWOOT_API_URL");
  const chatwootToken = Deno.env.get("CHATWOOT_API_ACCESS_TOKEN");
  if (!chatwootUrl || !chatwootToken) {
    return { error: "Chatwoot not configured" };
  }
  if (!conversationId || !accountId) {
    return { error: "Chatwoot conversation/account id missing" };
  }

  try {
    const resp = await fetch(
      `${chatwootUrl.replace(/\/$/, "")}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_access_token: chatwootToken,
        },
        body: JSON.stringify({ content: message, message_type: "outgoing" }),
      },
    );

    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data.id) {
      return { messageId: String(data.id) };
    }
    return { error: data.error || `Chatwoot reply failed (HTTP ${resp.status})` };
  } catch (e) {
    return { error: `Chatwoot fetch error: ${(e as Error).message}` };
  }
}

async function sendPushNotification(
  sb: SupabaseClient,
  tenantId: string,
  userId: string,
  message: string,
): Promise<{ sent: boolean; error?: string }> {
  try {
    const { data: subs, error: queryErr } = await sb
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId);

    if (queryErr) return { sent: false, error: queryErr.message };
    if (!subs || subs.length === 0) {
      return { sent: false, error: "No push subscription found" };
    }

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPublic || !vapidPrivate) {
      return { sent: false, error: "VAPID keys not configured" };
    }

    let webPush: any;
    try {
      // Lazy import — only attempted when at least one subscription exists.
      // Wrapped because Deno's npm: shim has documented edge cases with
      // web-push's Node crypto deps.
      webPush = await import("npm:web-push");
    } catch (importErr) {
      console.warn("[push] web-push module load failed:", (importErr as Error).message);
      return { sent: false, error: "web-push module unavailable" };
    }

    try {
      webPush.setVapidDetails(
        "mailto:hello@assembl.co.nz",
        vapidPublic,
        vapidPrivate,
      );
    } catch (vapidErr) {
      console.warn("[push] setVapidDetails failed:", (vapidErr as Error).message);
      return { sent: false, error: "VAPID configuration failed" };
    }

    let anySent = false;
    for (const row of subs) {
      try {
        await webPush.sendNotification(
          row.subscription,
          JSON.stringify({ title: "Assembl", body: message }),
        );
        anySent = true;
      } catch (e: any) {
        const status = e?.statusCode;
        if (status === 410 || status === 404) {
          // Subscription gone — clean up the dead row by id.
          try {
            await sb.from("push_subscriptions").delete().eq("id", row.id);
          } catch {
            // non-critical
          }
        } else {
          console.warn("[push] send failed for subscription:", e?.message || e);
        }
      }
    }

    return anySent
      ? { sent: true }
      : { sent: false, error: "All push deliveries failed" };
  } catch (err) {
    console.warn("[push] unexpected error:", (err as Error).message);
    return { sent: false, error: (err as Error).message };
  }
}

/**
 * Unified send entry point. EVERY outbound reply in this file goes through
 * sendMessage() — there are no remaining direct sendViaTnz() call sites in
 * the handler.
 *
 * When ENABLE_NEW_SENDERS is NOT "true": delegates straight to sendViaTnz()
 * so this PR is a no-op behaviourally on deploy. Flip the flag per
 * environment once TextBee + Chatwoot + VAPID are provisioned.
 */
async function sendMessage(opts: {
  sb: SupabaseClient;
  channel: string;
  to: string;
  message: string;
  reference: string;
  tenantId: string;
  userId: string | null;
  chatwootConversationId?: string;
  chatwootAccountId?: string;
}): Promise<{ messageId?: string; error?: string; method: string }> {
  const {
    sb,
    channel,
    to,
    message,
    reference,
    tenantId,
    userId,
    chatwootConversationId,
    chatwootAccountId,
  } = opts;

  // Flag off → exact pre-migration behaviour.
  if (!ENABLE_NEW_SENDERS) {
    const r = await sendViaTnz(channel, to, message, reference);
    return { ...r, method: r.messageId ? "tnz" : "tnz_failed" };
  }

  // 1. PWA push (only if we have a user to target).
  if (userId) {
    const push = await sendPushNotification(sb, tenantId, userId, message);
    if (push.sent) {
      return { messageId: reference, method: "push" };
    }
  }

  // 2. Chatwoot (web chat / WhatsApp / Facebook inbound).
  const chatwootChannels = new Set(["webchat", "whatsapp", "facebook", "instagram", "telegram", "line"]);
  if (
    chatwootChannels.has(channel) &&
    chatwootConversationId &&
    chatwootAccountId &&
    Deno.env.get("CHATWOOT_API_URL") &&
    Deno.env.get("CHATWOOT_API_ACCESS_TOKEN")
  ) {
    const r = await replyViaChatwoot(chatwootConversationId, chatwootAccountId, message);
    if (r.messageId) return { ...r, method: "chatwoot" };
    // fall through to TextBee/TNZ if Chatwoot fails
  }

  // 3. TextBee SMS gateway (when configured for sms channel).
  if (
    channel === "sms" &&
    Deno.env.get("TEXTBEE_API_KEY") &&
    Deno.env.get("TEXTBEE_DEVICE_ID")
  ) {
    const r = await sendViaTextBee(to, message, reference);
    if (r.messageId) return { ...r, method: "textbee" };
    // fall through to TNZ on TextBee failure
  }

  // 4. Final fallback — legacy TNZ. Keeps SMS/WhatsApp working until TNZ
  // account is cancelled.
  const r = await sendViaTnz(channel, to, message, reference);
  return { ...r, method: r.messageId ? "tnz" : "tnz_failed" };
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
    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");

    // --- PARSE INBOUND PAYLOAD (multi-source: TextBee + Chatwoot + TNZ) ---
    const payload = await req.json();
    console.log("Inbound payload:", JSON.stringify(payload));

    let fromNumber = "";
    let toNumber = "";
    let messageBody = "";
    let channel = "sms";
    let sourceMessageId = "";
    let mediaUrl: string | null = null;
    let chatwootConversationId = "";
    let chatwootAccountId = "";
    let inboundSource: "textbee" | "chatwoot" | "tnz" | "unknown" = "unknown";

    // TextBee SMS webhook
    if (payload.event === "MESSAGE_RECEIVED" && payload.data?.sender) {
      inboundSource = "textbee";
      fromNumber = payload.data.sender;
      toNumber = payload.data.device?._id || Deno.env.get("TEXTBEE_DEVICE_ID") || "";
      messageBody = payload.data.message || "";
      channel = "sms";
      sourceMessageId = payload.data._id || "";
    }
    // Chatwoot webhook (web chat / WhatsApp / Facebook / Instagram / Telegram)
    else if (
      payload.event === "message_created" &&
      payload.message_type === "incoming"
    ) {
      inboundSource = "chatwoot";
      // Phone number if available, otherwise contact id as a stable identifier.
      fromNumber =
        payload.contact?.phone_number ||
        (payload.contact?.id != null ? String(payload.contact.id) : "") ||
        (payload.sender?.id != null ? String(payload.sender.id) : "") ||
        "";
      toNumber = payload.account?.id != null ? String(payload.account.id) : "";
      messageBody = payload.content || "";
      channel = (payload.conversation?.channel || "webchat").toString().toLowerCase();
      sourceMessageId = payload.id != null ? String(payload.id) : "";
      mediaUrl = payload.content_attributes?.media_url || null;
      chatwootConversationId =
        payload.conversation?.display_id != null
          ? String(payload.conversation.display_id)
          : payload.conversation?.id != null
          ? String(payload.conversation.id)
          : "";
      chatwootAccountId = toNumber;
    }
    // Legacy TNZ payload (kept during transition; remove after 1 week of stable TextBee/Chatwoot)
    else if (
      payload.From ||
      payload.from ||
      payload.Sender ||
      payload.sender ||
      payload.Message ||
      payload.message
    ) {
      inboundSource = "tnz";
      fromNumber = payload.From || payload.from || payload.Sender || payload.sender || "";
      toNumber = payload.To || payload.to || payload.Destination || payload.destination || "";
      messageBody = payload.Message || payload.message || payload.Body || payload.body || "";
      channel = (payload.Channel || payload.channel || "sms").toLowerCase();
      sourceMessageId = payload.MessageID || payload.messageId || "";
      mediaUrl = payload.MediaUrl || payload.mediaUrl || payload.Media || null;
    }

    // Backwards-compatible alias — code below still references tnzMessageId
    // when persisting to messaging_messages.tnz_message_id (column kept for
    // schema continuity; renaming is a separate cleanup PR).
    const tnzMessageId = sourceMessageId;

    if (!fromNumber || !messageBody) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing from/body", inboundSource }),
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

    console.log(
      `Tenant resolved: ${tenantId} for number ${toNumber} (source: ${inboundSource})`,
    );

    // --- STEP 1.5: RESOLVE OWNER USER_ID (for push notification routing) ---
    //
    // Looked up ONCE here, before any send call, so every send site can pass
    // the same userId into sendMessage(). Reused later by the cross-channel
    // memory persistence block to avoid a second query.
    let ownerUserId: string | null = null;
    try {
      const { data: ownerRow } = await sb
        .from("platform_org_members")
        .select("user_id")
        .eq("tenant_id", tenantId)
        .in("role", ["admin", "manager"])
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      ownerUserId = ownerRow?.user_id ?? null;
    } catch (lookupErr) {
      console.warn(
        `[tnz-inbound] owner user_id lookup failed (non-critical):`,
        (lookupErr as Error).message,
      );
    }

    // --- STEP 2: UEMA COMPLIANCE (STOP/START/HELP) ---
    const upper = messageBody.trim().toUpperCase();

    if (upper === "STOP" || upper === "UNSUBSCRIBE") {
      await sendMessage({
        sb,
        channel,
        to: fromNumber,
        message:
          "You've been unsubscribed from messages. Text START to re-subscribe anytime.",
        reference: `opt-out-${crypto.randomUUID()}`,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });
      return new Response(JSON.stringify({ ok: true, action: "opt-out" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (upper === "START" || upper === "SUBSCRIBE") {
      await sendMessage({
        sb,
        channel,
        to: fromNumber,
        message: "Kia ora! Welcome back. Text anything to get started.",
        reference: `opt-in-${crypto.randomUUID()}`,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });
      return new Response(JSON.stringify({ ok: true, action: "opt-in" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (upper === "HELP") {
      await sendMessage({
        sb,
        channel,
        to: fromNumber,
        message:
          "Assembl help:\n- Text MENU to see available services\n- Text STOP to unsubscribe\n- Text START to re-subscribe\n- Or just ask your question and we'll route you to the right specialist.",
        reference: `help-${crypto.randomUUID()}`,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });
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
      await sendMessage({
        sb,
        channel: validChannel,
        to: fromNumber,
        message: menuMsg,
        reference: ref,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });

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
      await sendMessage({
        sb,
        channel: validChannel,
        to: fromNumber,
        message: greetMsg,
        reference: ref,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });

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

    // --- STEP 6: PREFIX OVERRIDE → AI INTENT (IHO) → KEYWORD FALLBACK ---
    if (!selectedKete) {
      const prefixMatch = lower.match(/^(\w+):\s*(.+)/);
      if (prefixMatch) {
        const prefixSlug = prefixMatch[1];
        selectedKete = availableKete.find((k) => k.slug === prefixSlug) || null;
      }
    }

    // AI intent routing — Iho classifier (only if no prefix override)
    if (!selectedKete && availableKete.length > 1) {
      try {
        const intentResp = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/iho-intent-router`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              message: messageBody,
              kete: availableKete.map(k => ({
                slug: k.slug,
                display_name: k.display_name || k.name,
                keywords: k.keywords,
              })),
            }),
          }
        );
        if (intentResp.ok) {
          const intent = await intentResp.json();
          if (intent.kete && intent.confidence >= 0.4) {
            selectedKete = availableKete.find(k => k.slug === intent.kete) || null;
            console.log(`Iho AI routed to ${intent.kete} (confidence ${intent.confidence}): ${intent.reasoning}`);
          }
        }
      } catch (e) {
        console.error("Iho intent router error:", e);
      }
    }

    // Keyword fallback
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
      await sendMessage({
        sb,
        channel: validChannel,
        to: fromNumber,
        message: fallbackMsg,
        reference: `fallback-${crypto.randomUUID()}`,
        tenantId,
        userId: ownerUserId,
        chatwootConversationId,
        chatwootAccountId,
      });
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
    let modelUsed = "gemini-2.5-flash";
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
          const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
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
    const sendResult = await sendMessage({
      sb,
      channel: validChannel,
      to: fromNumber,
      message: aiReply,
      reference: ref,
      tenantId,
      userId: ownerUserId,
      chatwootConversationId,
      chatwootAccountId,
    });
    const responseTimeMs = Date.now() - startTime;

    // Telemetry: record which sender path actually fired (push / chatwoot /
    // textbee / tnz / *_failed). Logged to console rather than persisted to
    // avoid widening messaging_messages in this PR.
    console.log(
      `[tnz-inbound] outbound delivery method: ${sendResult.method} (ref: ${ref})`,
    );

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

    // ═══ CROSS-CHANNEL MEMORY PERSISTENCE ═══
    // Mirror SMS/WhatsApp turns into the canonical `conversations` table so
    // memory_extractor (which joins on conversations.id) can write into
    // agent_memory, and the dashboard /chat surface can recall facts the
    // user shared via text. Keyed on the tenant's primary admin user_id and
    // a channel-prefixed agent_id ("sms:<agent>") so SMS threads don't collide
    // with web /chat threads but DO share extracted agent_memory facts
    // (match_agent_memory filters on user_id, not agent_id).
    try {
      // ownerUserId was resolved once in step 1.5 — reuse it here so we
      // don't query tenant_members twice per request.
      if (ownerUserId) {
        const channelAgentId = `${validChannel}:${agentUsed}`;
        const newTurn = [
          { role: "user", content: messageBody, ts: new Date().toISOString() },
          { role: "assistant", content: aiReply, ts: new Date().toISOString() },
        ];

        const { data: existingConvo } = await sb
          .from("conversations")
          .select("id, messages")
          .eq("user_id", ownerUserId)
          .eq("agent_id", channelAgentId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let convoUuid: string | null = null;
        if (existingConvo?.id) {
          const prev = Array.isArray(existingConvo.messages) ? existingConvo.messages : [];
          const merged = [...prev, ...newTurn].slice(-200);
          await sb
            .from("conversations")
            .update({ messages: merged, updated_at: new Date().toISOString() })
            .eq("id", existingConvo.id);
          convoUuid = existingConvo.id;
        } else {
          const { data: created } = await sb
            .from("conversations")
            .insert({ user_id: ownerUserId, agent_id: channelAgentId, messages: newTurn })
            .select("id")
            .single();
          convoUuid = created?.id ?? null;
        }

        if (convoUuid) {
          const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
          const { data: recent } = await sb
            .from("memory_extraction_queue")
            .select("id")
            .eq("conversation_id", convoUuid)
            .gte("created_at", tenMinAgo)
            .limit(1);
          if (!recent || recent.length === 0) {
            await sb.from("memory_extraction_queue").insert({
              tenant_id: tenantId,
              user_id: ownerUserId,
              conversation_id: convoUuid,
              status: "pending",
            });
          }

          // Cross-channel summary so /chat MemoryPanel sees SMS activity too.
          await sb.from("conversation_summaries").insert({
            user_id: ownerUserId,
            agent_id: channelAgentId,
            summary: `[${validChannel.toUpperCase()}] ${messageBody.slice(0, 200)} → ${aiReply.slice(0, 160)}`,
            key_facts_extracted: {
              conversation_id: convoUuid,
              messaging_conversation_id: conversationId,
              channel: validChannel,
              tenant_id: tenantId,
            },
            original_message_count: 1,
            compression_level: 0,
          });
        }
      } else {
        console.warn(`[tnz-inbound] no admin/manager user found for tenant ${tenantId}; skipping memory mirror`);
      }
    } catch (memErr) {
      console.warn("[tnz-inbound] memory mirror failed (non-critical):", (memErr as Error).message);
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
