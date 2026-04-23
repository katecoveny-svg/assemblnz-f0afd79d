import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * KETE-DEFAULT-HANDLER
 * ====================
 * Universal handler for every kete that doesn't have a bespoke handler_fn.
 *
 * Flow (Iho is the brain):
 *   1. Resolve identity (auth → phone → anon)
 *   2. Load kete persona + memory + shared_context (for the system prompt)
 *   3. Hand the message to iho-router with our composed systemPromptOverride
 *      → Iho selects the model (Claude direct / Gemini gateway), enforces
 *        Kahu PII masking, retrieves Mahara memory, runs Mana on the reply,
 *        and returns the final response + audit metadata.
 *   4. Persist memory write-back (last_exchange + turn_count).
 *
 * Contract (called by tnz-inbound):
 *   Input:  { tenant_id, conversation_id, phone, body, mediaUrl?, history[], channel, kete_slug? }
 *   Output: { reply, meta: { agent, model, provider, features_used[] } }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_RULES = `
SMS/WhatsApp rules:
- Keep replies under 400 chars when possible (max 1500)
- Short sentences, line breaks, no markdown
- NZ English, no emojis unless user uses them
- Lead with the answer, then offer "Reply MORE for details" if needed
`;

interface HandlerPayload {
  tenant_id?: string;
  conversation_id?: string;
  phone?: string;
  body: string;
  mediaUrl?: string | null;
  history?: { role: string; content: string }[];
  channel?: string;
  kete_slug?: string;
}

// Map kete slug → Iho agent code so Iho's registry picks the right specialist.
const KETE_TO_IHO_AGENT: Record<string, string> = {
  manaaki: "AURA",
  waihanga: "APEX",
  auaha: "PRISM",
  pakihi: "LEDGER",
  arataki: "ARATAKI",
  pikau: "PIKAU",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    const payload: HandlerPayload = await req.json();
    const { body, history = [], channel = "sms", phone, conversation_id, tenant_id, mediaUrl } = payload;

    // ── 1. Resolve kete ──────────────────────────────────────────
    let keteSlug = payload.kete_slug;
    if (!keteSlug && conversation_id) {
      const { data: conv } = await sb
        .from("messaging_conversations")
        .select("assigned_pack, assigned_agent")
        .eq("id", conversation_id)
        .maybeSingle();
      keteSlug = conv?.assigned_pack || conv?.assigned_agent || "pakihi";
    }
    keteSlug = keteSlug || "pakihi";

    const { data: kete } = await sb
      .from("kete_definitions")
      .select("slug, display_name, te_reo_name, description")
      .eq("slug", keteSlug)
      .maybeSingle();

    const displayName = kete?.display_name || keteSlug;
    const teReo = kete?.te_reo_name || displayName;
    const description = kete?.description || "";

    // ── 2. Resolve user_id (auth → phone) ────────────────────────
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    try {
      if (authHeader?.startsWith("Bearer ")) {
        const { data: { user } } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
        if (user?.id) userId = user.id;
      }
    } catch (_) { /* fall through */ }

    if (!userId && phone) {
      const { data: tcfg } = await sb
        .from("agent_sms_config")
        .select("user_id")
        .eq("twilio_phone_number", phone)
        .maybeSingle();
      userId = tcfg?.user_id ?? null;
    }

    // ── 3. Memory + shared context for the system prompt ─────────
    let memoryBlock = "";
    if (userId) {
      const { data: mem } = await sb
        .from("agent_memory")
        .select("memory_key, memory_value")
        .eq("user_id", userId)
        .eq("agent_id", keteSlug)
        .order("updated_at", { ascending: false })
        .limit(8);
      if (mem && mem.length > 0) {
        memoryBlock = "\n\nWHAT YOU REMEMBER ABOUT THIS USER:\n" +
          mem.map(m => `- ${m.memory_key}: ${typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : m.memory_value}`).join("\n");
      }
    }

    let sharedBlock = "";
    if (tenant_id) {
      const { data: shared } = await sb
        .from("shared_context")
        .select("context_key, context_value")
        .eq("tenant_id", tenant_id)
        .order("updated_at", { ascending: false })
        .limit(5);
      if (shared && shared.length > 0) {
        sharedBlock = "\n\nSHARED BUSINESS CONTEXT (other agents may be working on these too):\n" +
          shared.map(s => `- ${s.context_key}: ${typeof s.context_value === "object" ? JSON.stringify(s.context_value) : s.context_value}`).join("\n");
      }
    }

    const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
    const systemPrompt = `You are ${teReo} (${displayName}), an Assembl specialist for New Zealand businesses and whānau.

${description}

${SMS_RULES}

Current NZ date/time: ${nzTime}
${memoryBlock}
${sharedBlock}

Sign off with: — ${teReo}, your ${displayName.toLowerCase()} navigator`;

    // ── 4. Hand off to Iho (the brain) ───────────────────────────
    // Iho will: pick the model (Claude/Gemini/Anthropic-direct), run Kahu PII
    // checks, pull Mahara memory, call the model, run Mana, log to audit_log.
    const ihoUrl = `${SUPABASE_URL}/functions/v1/iho-router`;
    const ihoBody = {
      message: body,
      agentId: KETE_TO_IHO_AGENT[keteSlug] || undefined,
      packId: keteSlug,
      mode: "respond",
      hasAttachments: !!mediaUrl,
      systemPromptOverride: systemPrompt,
      context: {
        previousMessages: (history || []).slice(-10),
      },
    };

    let reply = "";
    let modelUsed = "iho-routed";
    let providerUsed = "iho";

    try {
      const ihoResp = await fetch(ihoUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward auth (lets Iho see the same user) — service role used by Iho for memory.
          ...(authHeader ? { Authorization: authHeader } : { Authorization: `Bearer ${SERVICE_ROLE}` }),
        },
        body: JSON.stringify(ihoBody),
      });

      if (ihoResp.ok) {
        const ihoData = await ihoResp.json();
        reply = (ihoData?.response || "").trim();
        modelUsed = ihoData?.modelUsed || ihoData?.agentUsed?.model || modelUsed;
        providerUsed = ihoData?.providerUsed || providerUsed;
      } else {
        const errTxt = await ihoResp.text();
        console.error(`[${keteSlug}-handler] iho-router error ${ihoResp.status}:`, errTxt.slice(0, 300));
      }
    } catch (err) {
      console.error(`[${keteSlug}-handler] iho-router call failed:`, err);
    }

    if (!reply) {
      reply = `Kia ora — ${teReo} is having a quick moment. Please try again shortly.`;
    }

    // ── 5. Memory write-back (last_exchange + turn_count) ────────
    if (userId) {
      try {
        const nowIso = new Date().toISOString();
        await sb.from("agent_memory").upsert({
          user_id: userId,
          agent_id: keteSlug,
          memory_key: "last_exchange",
          memory_value: {
            question: body.slice(0, 240),
            answer: reply.slice(0, 480),
            channel,
            at: nowIso,
          },
        }, { onConflict: "user_id,agent_id,memory_key" });

        const { data: existing } = await sb
          .from("agent_memory")
          .select("memory_value")
          .eq("user_id", userId)
          .eq("agent_id", keteSlug)
          .eq("memory_key", "turn_count")
          .maybeSingle();
        const prevCount = (existing?.memory_value as any)?.count ?? 0;
        await sb.from("agent_memory").upsert({
          user_id: userId,
          agent_id: keteSlug,
          memory_key: "turn_count",
          memory_value: { count: prevCount + 1, last_at: nowIso },
        }, { onConflict: "user_id,agent_id,memory_key" });
      } catch (memErr) {
        console.error(`[${keteSlug}-handler] memory write failed:`, memErr);
      }
    }

    return new Response(
      JSON.stringify({
        reply,
        meta: {
          agent: keteSlug,
          model: modelUsed,
          provider: providerUsed,
          features_used: ["iho_router", "memory_injection", "shared_context", "kete_persona"],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("kete-default-handler error:", err);
    return new Response(
      JSON.stringify({ reply: "Kia ora — there was a hiccup on our side. Please try again shortly." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
