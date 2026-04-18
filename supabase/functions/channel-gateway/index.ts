import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * ═══════════════════════════════════════════════════════════
 * ASSEMBL UNIFIED CHANNEL GATEWAY
 * Single entry point — all platforms hit this
 * SMS, WhatsApp, Email, Web → UnifiedMessage → Iho → Agent → Deliver
 * ═══════════════════════════════════════════════════════════
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Types ─────────────────────────────────────────────
interface UnifiedMessage {
  platform: "whatsapp" | "sms" | "email" | "web";
  userId: string | null;
  senderPhone?: string;
  senderEmail?: string;
  text: string;
  agentId?: string;
  sessionKey: string;
  mediaUrl?: string;
  rawPayload?: Record<string, any>;
}

// ─── Platform behaviour rules ──────────────────────────
const PLATFORM_RULES: Record<string, string> = {
  sms: `\n\nSMS RULES — You are responding via text message:
- Keep responses UNDER 400 characters when possible (max 1600)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first`,

  whatsapp: `\n\nWHATSAPP RULES — You are responding via WhatsApp:
- WhatsApp supports rich formatting: *bold*, _italic_, ~strikethrough~
- Use bullet lists and numbered lists for clarity
- Keep responses under 4096 characters
- Use NZ English
- Light humour is fine. Talk like a smart Kiwi colleague, not a corporate chatbot.`,

  email: `\n\nEMAIL RULES — You are responding via email:
- Use professional but warm email formatting
- Include a clear subject-relevant opening line
- Structure with paragraphs, not bullet lists
- Sign off warmly (e.g., "Ngā mihi, [Agent Name] — Assembl")
- Keep under 500 words unless detail is requested
- Use NZ English`,

  web: "",
};

// ─── Iho: Intent classification + agent routing ────────
// Mirrors the keyword classifier from agent-router
const AGENT_KEYWORDS: Record<string, string[]> = {
  // Shared Core
  charter: ["governance", "director", "board", "constitution", "companies act"],
  arbiter: ["dispute", "mediation", "tribunal", "claims", "resolution"],
  shield: ["privacy", "data", "breach", "personal information", "privacy act"],
  aroha: ["employment", "hiring", "leave", "kiwisaver", "wages", "redundancy", "hr", "salary"],
  ledger: ["accounting", "tax", "gst", "ird", "invoice", "xero", "myob", "financial"],
  // Manaaki (Hospitality & Tourism)
  aura: ["guest", "check-in", "room", "housekeeping", "hotel", "lodge", "booking", "front desk",
    "food safety", "chiller", "temperature", "fcp", "food control plan", "opening checks",
    "closing checks", "corrective action", "food handler", "menu", "allergen"],
  saffron: ["food act", "haccp", "verification", "verifier", "mpi", "food hygiene",
    "kitchen", "supplier records", "traceability", "food recall"],
  cellar: ["alcohol", "liquor", "licence", "duty manager", "bar", "wine", "host responsibility",
    "intoxication", "ssaa", "manager certificate", "on licence", "off licence"],
  // Waihanga (Construction)
  apex: ["site", "site ops", "construction", "foreman", "builder"],
  arai: ["hazard", "safety", "h&s", "worksafe", "ppe", "incident", "scaffold", "hswa", "notifiable"],
  kaupapa: ["payment claim", "variation", "cca", "retention", "subcontract", "progress claim", "contract"],
  ata: ["bim", "model", "3d", "clash", "revit", "ifc"],
  rawa: ["materials", "procurement", "supplier", "stock", "order"],
  pai: ["quality", "defect", "snag", "inspection result", "non-conformance"],
  whakaae: ["consent", "building consent", "council", "resource consent", "ccc", "lbp", "producer statement"],
  // Auaha (Creative & Marketing)
  prism: ["brand", "logo", "visual identity", "brand guidelines", "creative", "design", "image", "graphic"],
  echo: ["content calendar", "posting schedule", "engagement", "analytics", "performance", "what worked"],
  spark: ["app", "digital", "website", "tool", "calculator", "integration"],
  muse: ["copy", "content", "blog", "headline", "write", "caption", "email copy"],
  flux: ["social media", "instagram", "facebook", "linkedin", "posting", "reel", "carousel", "story"],
  // Arataki
  motu: ["vehicle", "registration", "wof", "cof", "rego", "nzta"],
  tuatahi: ["dealership", "car sales", "trade-in", "stock"],
  // Pikau
  customs: ["customs", "import", "export", "tariff", "hs code", "biosecurity"],
  freight: ["freight", "shipping", "cargo", "container", "logistics"],
  // Tōro / family + trips
  operations: ["family", "groceries", "school", "pickup", "kids", "dinner", "trip", "travel", "holiday", "vacation", "itinerary", "italy", "italia", "rome", "florence", "venice", "milan", "amalfi", "sicily", "flights", "airbnb"],
  // Ahuwhenua (Agriculture)
  terra: ["farm", "dairy", "cattle", "sheep", "lambing", "calving", "milking", "nait", "fep",
    "effluent", "ets", "emissions", "milk price", "schedule price", "kgms", "stock units",
    "paddock", "pasture", "silage", "hay", "supplement", "water consent", "irrigation",
    "fonterra", "silver fern", "alliance", "drought", "flood", "rural", "succession",
    "overseer", "nutrient", "stocking rate", "drenching", "dipping", "shearing",
    "mating", "weaning", "scanning", "fencing", "forestry", "carbon", "nzu"],
  // Fallback
  nova: ["help", "general", "how do i", "what is"],
};

function classifyIntent(text: string, hintAgentId?: string): string {
  if (hintAgentId) return hintAgentId;

  const lower = text.toLowerCase();
  let bestAgent = "nova";
  let bestScore = 0;

  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(" ").length; // multi-word = higher weight
    }
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }
  return bestAgent;
}

// ─── Platform adapters: parse webhook → UnifiedMessage ─
function parseSmsWebhook(body: Record<string, any>): Omit<UnifiedMessage, "sessionKey" | "userId"> {
  // TNZ v2.04 normalisation (handles both capitalised and lowercase)
  const senderPhone = body.From || body.from || body.Sender || body.sender || "";
  const text = body.Message || body.message || body.Body || body.body || body.MessageText || body.messageText || "";
  return {
    platform: "sms",
    senderPhone,
    text,
    rawPayload: body,
  };
}

function parseWhatsAppWebhook(body: Record<string, any>): Omit<UnifiedMessage, "sessionKey" | "userId"> {
  // Twilio WhatsApp format
  const fromRaw = body.From || body.from || "";
  const senderPhone = fromRaw.replace("whatsapp:", "");
  const text = body.Body || body.body || "";
  const mediaUrl = body.MediaUrl0 || body.mediaUrl0 || undefined;
  return {
    platform: "whatsapp",
    senderPhone,
    text,
    mediaUrl,
    rawPayload: body,
  };
}

function parseEmailWebhook(body: Record<string, any>): Omit<UnifiedMessage, "sessionKey" | "userId"> {
  // Standard inbound email parse (SendGrid / generic)
  const senderEmail = body.from || body.sender || body.envelope?.from || "";
  const text = body.text || body.plain || body.body || body.subject || "";
  return {
    platform: "email",
    senderEmail,
    text,
    rawPayload: body,
  };
}

function parseWebMessage(body: Record<string, any>): Omit<UnifiedMessage, "sessionKey" | "userId"> {
  return {
    platform: "web",
    text: body.message || body.text || "",
    agentId: body.agentId,
    rawPayload: body,
  };
}

const ADAPTERS: Record<string, (body: any) => Omit<UnifiedMessage, "sessionKey" | "userId">> = {
  sms: parseSmsWebhook,
  whatsapp: parseWhatsAppWebhook,
  email: parseEmailWebhook,
  web: parseWebMessage,
};

// ─── Delivery adapters: send response back through platform ─
async function deliverSms(msg: UnifiedMessage, reply: string): Promise<void> {
  const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken || !msg.senderPhone) return;

  // Truncate for SMS
  const truncated = reply.length > 1500 ? reply.substring(0, 1497) + "..." : reply;

  await fetch(`${tnzBase}/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tnzToken}` },
    body: JSON.stringify({
      MessageData: {
        Message: truncated,
        Destinations: [{ Recipient: msg.senderPhone }],
        Reference: `gw-sms-${crypto.randomUUID().slice(0, 8)}`,
        SendMode: "Normal",
      },
    }),
  });
}

async function deliverWhatsApp(msg: UnifiedMessage, reply: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
  if (!accountSid || !authToken || !fromNumber || !msg.senderPhone) return;

  const truncated = reply.length > 4000 ? reply.substring(0, 3997) + "..." : reply;

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({
        To: `whatsapp:${msg.senderPhone}`,
        From: `whatsapp:${fromNumber}`,
        Body: truncated,
      }),
    }
  );
}

async function deliverEmail(msg: UnifiedMessage, reply: string): Promise<void> {
  // Route through transactional email function if available
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  if (!msg.senderEmail) return;

  await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      to: msg.senderEmail,
      subject: `Re: Your Assembl enquiry`,
      html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <p>${reply.replace(/\n/g, "<br>")}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        <p style="font-size: 12px; color: #888;">Powered by Assembl · assembl.co.nz</p>
      </div>`,
      purpose: "transactional",
      idempotency_key: `gw-email-${crypto.randomUUID().slice(0, 8)}`,
    }),
  }).catch(() => {});
}

const DELIVERERS: Record<string, (msg: UnifiedMessage, reply: string) => Promise<void>> = {
  sms: deliverSms,
  whatsapp: deliverWhatsApp,
  email: deliverEmail,
  web: async () => {}, // Web responses are returned inline
};

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // ─── 1. Detect platform from URL param or body ─────
    const url = new URL(req.url);
    const platformParam = url.searchParams.get("platform") || "web";
    const platform = platformParam as UnifiedMessage["platform"];

    const adapter = ADAPTERS[platform];
    if (!adapter) {
      return new Response(JSON.stringify({ error: `Unknown platform: ${platform}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse platform-specific payload
    let rawBody: any;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      rawBody = {};
      for (const [key, value] of formData.entries()) rawBody[key] = String(value);
    } else {
      rawBody = await req.json();
    }

    const parsed = adapter(rawBody);

    if (!parsed.text?.trim()) {
      return new Response(JSON.stringify({ ok: true, message: "Empty message, skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── 2. Resolve Assembl user (or create guest session) ─
    let userId: string | null = null;
    const identifier = parsed.senderPhone || parsed.senderEmail || null;

    if (identifier) {
      // Try to find existing user by phone or email
      if (parsed.senderPhone) {
        const { data: phoneUser } = await sb
          .from("sms_conversations")
          .select("user_id")
          .eq("phone_number", parsed.senderPhone)
          .not("user_id", "is", null)
          .limit(1)
          .single();
        userId = phoneUser?.user_id || null;
      }

      if (!userId && parsed.senderEmail) {
        const { data: { users } } = await sb.auth.admin.listUsers();
        const emailUser = users?.find(u => u.email === parsed.senderEmail);
        userId = emailUser?.id || null;
      }
    }

    // For web platform, try auth header
    if (!userId && platform === "web") {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await sb.auth.getUser(token);
          userId = user?.id || null;
        } catch { /* anonymous */ }
      }
    }

    // ─── 3. Classify intent via Iho ────────────────────
    const agentId = classifyIntent(parsed.text, parsed.agentId || rawBody.agentId);
    const sessionKey = `${platform}:${identifier || "anon"}:${agentId}`;

    const message: UnifiedMessage = {
      ...parsed,
      platform,
      userId,
      agentId,
      sessionKey,
    };

    console.log(`[gateway] ${platform} → agent=${agentId}, session=${sessionKey}, user=${userId || "guest"}`);

    // ─── 4. Load session history ───────────────────────
    const { data: sessionRows } = await sb
      .from("agent_sms_messages")
      .select("direction, body, created_at")
      .eq("phone_number", identifier || sessionKey)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true })
      .limit(20);

    const history: Array<{ role: string; content: string }> = (sessionRows || []).map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

    // ─── 5. Load shared context (business facts) ───────
    let contextBlock = "";
    if (userId) {
      const { data: contextRows } = await sb
        .from("shared_context")
        .select("context_key, context_value")
        .eq("user_id", userId)
        .limit(20);

      if (contextRows?.length) {
        const facts = contextRows.map(r => `- ${r.context_key}: ${r.context_value}`).join("\n");
        contextBlock = `\n\n--- BUSINESS CONTEXT ---\n${facts}`;
      }
    }

    // ─── 6. Load agent system prompt ───────────────────
    const { data: agentPrompt } = await sb
      .from("agent_prompts")
      .select("system_prompt, display_name")
      .eq("agent_name", agentId)
      .eq("is_active", true)
      .single();

    const agentName = agentPrompt?.display_name || agentId;
    let systemPrompt = agentPrompt?.system_prompt ||
      `You are ${agentName} from Assembl, a specialist business advisor for New Zealand.`;

    // Append platform rules + context + time
    systemPrompt += (PLATFORM_RULES[platform] || "")
      + contextBlock
      + `\nCurrent date/time: ${new Date().toISOString()}`;

    // ─── 7. Build messages array ───────────────────────
    const isNew = history.length === 0;
    const aiMessages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: isNew
          ? systemPrompt + `\n\nThis is a NEW conversation. Introduce yourself briefly: "Kia ora, I'm ${agentName} from Assembl. [one sentence about your specialty]. How can I help?"`
          : systemPrompt,
      },
      ...history,
      { role: "user", content: parsed.text },
    ];

    // ─── 8. Call AI via Lovable Gateway ────────────────
    const maxTokens = platform === "sms" ? 400 : platform === "email" ? 1500 : 800;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        max_tokens: maxTokens,
      }),
    });

    let reply = "Sorry, I'm having trouble right now. Try again shortly or visit assembl.co.nz.";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content || reply;
    } else {
      const errText = await aiResponse.text();
      console.error(`[gateway] AI error ${aiResponse.status}:`, errText);

      if (aiResponse.status === 429) {
        reply = "I'm getting a lot of messages right now. Please try again in a minute.";
      } else if (aiResponse.status === 402) {
        reply = "Service temporarily unavailable. Please try again later.";
      }
    }

    // ─── 9. Save to session history ────────────────────
    const logBase = {
      agent_id: agentId,
      phone_number: identifier || sessionKey,
      user_id: userId || "00000000-0000-0000-0000-000000000000",
      channel: platform,
    };

    await sb.from("agent_sms_messages").insert([
      { ...logBase, direction: "inbound", body: parsed.text, status: "received" },
      { ...logBase, direction: "outbound", body: reply, status: "sent" },
    ]);

    // ─── 10. Extract facts to shared_context (fire-and-forget) ─
    if (userId) {
      // Simple fact extraction for key patterns
      const factPatterns = [
      { pattern: /my (?:company|business) (?:is |name is )(.+?)(?:\.|$)/i, key: "company.name" },
        { pattern: /(?:we have|there are) (\d+) (?:staff|employees|team)/i, key: "company.team_size" },
        { pattern: /(?:based in|located in|from) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i, key: "company.location" },
        { pattern: /(?:revenue|turnover) (?:is |of )?\$?([\d,.]+[kmb]?)/i, key: "company.revenue" },
        // Waihanga construction-specific patterns
        { pattern: /consent (?:ref|number|#)[\s:]*([A-Z]{2,5}-\d{4}-\d+)/i, key: "project.consent_ref" },
        { pattern: /lbp (?:number|#|licence)[\s:]*([A-Z]{2}\d{4,6})/i, key: "participants.lbp_number" },
        { pattern: /(?:at|address|site)[\s:]+(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Rd|Ave|Dr|Pl|Tce|Cr|Way|Lane))/i, key: "project.address" },
        { pattern: /(?:clause|code)\s+((?:B|C|E|F|G|H)\d(?:\/AS\d)?)/i, key: "code_decision.clause_ref" },
        { pattern: /(?:inspection|stage)[\s:]+(?:is\s+)?(pre-line|framing|post-line|pre-clad|final)/i, key: "project.inspection_stage" },
        { pattern: /(?:scaffold|scaffolding)\s+(?:tag|cert).*?(?:expir(?:es|y)|due)[\s:]+(\d{1,2}\s+\w+)/i, key: "safety.scaffold_expiry" },
        // Auaha creative-specific patterns
        { pattern: /(?:brand|primary)\s+colou?r[\s:]+([#\w]+)/i, key: "brand.dna.primary_colour" },
        { pattern: /(?:engagement|eng)\s+(?:rate|%)[\s:]+(\d+\.?\d*%?)/i, key: "brand.last_engagement_rate" },
        { pattern: /(?:best|top)\s+(?:day|posting day)[\s:]+(\w+day)/i, key: "brand.audience.best_day" },
        { pattern: /(?:don't|dont|never|avoid|stop)\s+(?:use|using|say|saying)\s+["']?(\w[\w\s]{2,20})["']?/i, key: "brand.forbidden_words" },
        { pattern: /(?:tone|voice)[\s:]+(\d+)\/10/i, key: "brand.dna.voice_formality" },
        { pattern: /(?:approve|approved|lock|locked|✅)/i, key: "_content_approval" },
        // Ahuwhenua (Agriculture) patterns
        { pattern: /nait (?:number|#|location)[\s:]*([A-Z\d-]{6,})/i, key: "farm.nait_number" },
        { pattern: /supplier (?:number|#|no)[\s:]*(\d{4,})/i, key: "farm.supplier_number" },
        { pattern: /(?:farm|property)[\s:]+(\d+)\s*(?:ha|hectares)/i, key: "farm.effective_area_ha" },
        { pattern: /(\d+)\s*(?:kgms|kg\s*ms|milk\s*solids)/i, key: "farm.milk_production_kgms" },
        { pattern: /(?:fep|farm environment plan)[\s:]+(?:status\s+)?(none|draft|submitted|audited)/i, key: "farm.fep_status" },
        { pattern: /(?:water|resource)\s+consent[\s:#]*([A-Z]{2,5}[\d./-]+)/i, key: "farm.water_consent" },
        { pattern: /(?:effluent|pond)[\s:]+(?:system\s+)?(storage pond|spray irrigation|two-pond|lined pond|herd home)/i, key: "farm.effluent_system" },
        { pattern: /(\d+)\s*(?:stock units|su)\b/i, key: "farm.stock_units" },
        { pattern: /(?:lamb|beef|mutton|venison)\s+(?:schedule|price)[\s:]*\$?([\d.]+)\/kg/i, key: "farm.schedule_price" },
        { pattern: /(?:calving|lambing|mating|shearing|weaning)[\s:]+(\w+\s+\d{4}|\d{1,2}\s+\w+)/i, key: "farm.seasonal_event" },
        { pattern: /(?:ets|carbon|nzu)[\s:]+(\d+)\s*(?:units|credits|nzu)/i, key: "farm.ets_nzu_balance" },
        { pattern: /(?:regional council|council)[\s:]+(\w+(?:\s+\w+)?)/i, key: "farm.region_council" },
        // Manaaki (Hospitality) patterns
        { pattern: /(?:chiller|fridge|freezer)\s*(?:\d+)?[\s:]+(\d+\.?\d*)\s*(?:°?c|degrees)/i, key: "hospitality.temp_reading" },
        { pattern: /(?:food control plan|fcp)[\s:]+(?:type\s+)?(sss\s*level\s*\d|custom|national programme)/i, key: "hospitality.fcp_type" },
        { pattern: /(?:liquor|alcohol)\s+licen[cs]e[\s:#]*([A-Z\d/-]+)/i, key: "hospitality.liquor_licence" },
        { pattern: /(?:manager|duty manager)\s+cert(?:ificate)?[\s:#]*([A-Z]{2}-?\d{6,})/i, key: "hospitality.manager_cert" },
        { pattern: /(?:covers|seats|capacity)[\s:]+(\d+)\s*(?:per day|daily|avg|average)?/i, key: "hospitality.covers_avg" },
        { pattern: /(?:food cost|cost of goods)[\s:]+(\d+\.?\d*)%/i, key: "hospitality.food_cost_pct" },
        { pattern: /(?:verification|verifier)\s+(?:date|due|visit)[\s:]+(\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2})/i, key: "hospitality.verification_due" },
        { pattern: /(?:host responsibility|hr training)[\s:]+(?:completed|done|passed)\s*(\d{1,2}\s+\w+)?/i, key: "hospitality.host_responsibility_training" },
        { pattern: /(?:waste|spoilage)[\s:]+\$?([\d,.]+)\s*(?:this week|today|per week)?/i, key: "hospitality.waste_cost" },
      ];

      for (const { pattern, key } of factPatterns) {
        const match = parsed.text.match(pattern);
        if (match?.[1]) {
          sb.from("shared_context").upsert(
            { user_id: userId, context_key: key, context_value: match[1].trim(), source_agent: agentId, confidence: 0.7 },
            { onConflict: "user_id,context_key" }
          ).then(() => {}).catch(() => {});
        }
      }
    }

    // ─── 11. Deliver response back through platform ────
    const deliverer = DELIVERERS[platform];
    if (deliverer) {
      await deliverer(message, reply);
    }

    // ─── 12. Return response (web gets inline reply) ───
    return new Response(
      JSON.stringify({
        ok: true,
        platform,
        agent: agentId,
        agentName,
        reply: platform === "web" ? reply : undefined,
        sessionKey,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[gateway] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
