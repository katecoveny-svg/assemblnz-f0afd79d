import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * KETE-DEFAULT-HANDLER
 * ====================
 * Universal handler for every kete that doesn't have a bespoke handler_fn.
 * Pulls the kete's persona, injects shared symbiotic context + memory,
 * routes to the Lovable AI gateway, and writes facts back to agent_memory.
 *
 * Contract (called by tnz-inbound):
 *   Input:  { tenant_id, conversation_id, phone, body, mediaUrl?, history[], channel, kete_slug? }
 *   Output: { reply, meta: { agent, model, features_used[] } }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ reply: "AI gateway not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: HandlerPayload = await req.json();
    const { body, history = [], channel = "sms", phone, conversation_id, tenant_id } = payload;

    // The path used by tnz-inbound passes the kete via the URL — but we also
    // accept a slug in the body, and otherwise we infer it from the messaging conversation.
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

    // Pull kete persona
    const { data: kete } = await sb
      .from("kete_definitions")
      .select("slug, display_name, te_reo_name, description")
      .eq("slug", keteSlug)
      .maybeSingle();

    const displayName = kete?.display_name || keteSlug;
    const teReo = kete?.te_reo_name || displayName;
    const description = kete?.description || "";

    // Resolve user_id from phone (best effort, for memory)
    let userId: string | null = null;
    if (phone) {
      const { data: tcfg } = await sb
        .from("agent_sms_config")
        .select("user_id")
        .eq("twilio_phone_number", phone)
        .maybeSingle();
      userId = tcfg?.user_id ?? null;
    }

    // Memory injection: pull recent agent_memory + last conversation_summary
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

    // Symbiotic shared_context (cross-agent flags this tenant set)
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
    const systemPrompt = `You are ${teReo} (${displayName}), an Assembl specialist for New Zealand businesses and whanau.

${description}

${SMS_RULES}

Current NZ date/time: ${nzTime}
${memoryBlock}
${sharedBlock}

Sign off with: — ${teReo}, your ${displayName.toLowerCase()} navigator`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: body },
    ];

    const aiResp = await fetch(AI_GATEWAY, {
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

    if (!aiResp.ok) {
      const errTxt = await aiResp.text();
      console.error(`[${keteSlug}-handler] AI error ${aiResp.status}:`, errTxt.slice(0, 200));
      return new Response(
        JSON.stringify({ reply: `Kia ora — ${teReo} is having a quick moment. Please try again shortly.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const reply = aiData.choices?.[0]?.message?.content?.trim() ||
      `Kia ora! ${teReo} here — could you re-send that?`;

    // Memory write-back: extract any obvious facts (best-effort, non-blocking)
    if (userId) {
      // Lightweight fact extraction — store the latest exchange under "last_exchange"
      sb.from("agent_memory").upsert({
        user_id: userId,
        agent_id: keteSlug,
        memory_key: "last_exchange",
        memory_value: { question: body.slice(0, 200), answer: reply.slice(0, 200), at: new Date().toISOString() },
      }, { onConflict: "user_id,agent_id,memory_key" }).then(() => {}).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        reply,
        meta: {
          agent: keteSlug,
          model: "google/gemini-2.5-flash",
          features_used: ["memory_injection", "shared_context", "kete_persona"].filter(Boolean),
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
