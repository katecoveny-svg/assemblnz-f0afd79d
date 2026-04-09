import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════
// KEYWORD CLASSIFIER — 78 agents across 9 kete + Shared Core
// ═══════════════════════════════════════════════════════════

const AGENT_KEYWORDS: Record<string, string[]> = {
  // ── SHARED CORE (8) ──
  charter: ["governance", "director", "board", "constitution", "companies act", "shareholder", "annual return", "company office"],
  arbiter: ["dispute", "mediation", "arbitration", "tribunal", "legal remedy", "claims", "resolution", "small claims"],
  shield: ["privacy", "data", "ipp", "breach notification", "personal information", "privacy act", "data protection", "gdpr", "nzism"],
  anchor: ["non-profit", "nonprofit", "charity", "charities act", "incorporated society", "community", "grant", "funding"],
  aroha: ["employment", "hiring", "firing", "leave", "kiwisaver", "wages", "disciplinary", "grievance", "redundancy", "hr", "salary", "staff", "parental leave", "sick leave", "holiday pay", "era"],
  pulse: ["payroll", "paye", "acc levy", "minimum wage", "wage subsidy", "employment law", "trial period", "collective agreement"],
  scholar: ["education", "school", "training", "nzqa", "curriculum", "ero", "teacher", "student", "tertiary", "polytech"],
  nova: ["troubleshoot", "help", "general", "how do i", "what is", "explain", "operations"],

  // ── MANAAKI — Hospitality & Tourism (9) ──
  aura: ["guest", "front desk", "check-in", "checkout", "room", "housekeeping", "concierge", "accommodation", "hotel", "lodge", "motel"],
  saffron: ["food safety", "food act", "food control plan", "mpi", "allergen", "temperature log", "kitchen", "hygiene", "haccp", "fcp"],
  cellar: ["alcohol", "liquor", "licence", "sale of alcohol", "duty manager", "lcq", "bar", "wine", "spirits", "host responsibility"],
  luxe: ["luxury", "premium", "boutique", "five star", "vip", "suite", "high-end", "exclusive"],
  moana: ["tourism", "adventure", "activity", "tour operator", "booking", "itinerary", "visitor", "tramping", "kayak"],
  coast: ["coastal", "marine tourism", "beach", "snorkel", "dive", "boat tour", "whale watch", "dolphin"],
  kura: ["cultural tourism", "māori tourism", "marae", "hangi", "whakairo", "taonga", "cultural experience"],
  pau: ["event", "catering", "wedding", "function", "banquet", "conference", "venue", "run sheet"],
  summit: ["adventure regulation", "safety activity", "bungy", "jet boat", "rafting", "zipline", "outdoor safety"],

  // ── HANGA — Construction (9) ──
  arai: ["hazard", "safety", "h&s", "risk", "ppe", "incident", "worksafe", "swms", "sssp", "toolbox", "height", "scaffold", "fall", "induction", "notifiable"],
  kaupapa: ["payment claim", "project", "schedule", "variation", "cca", "gantt", "milestone", "budget", "programme", "delay", "progress", "retention", "subcontract"],
  ata: ["bim", "3d", "model", "clash", "revit", "ifc", "mep", "coordination", "digital twin", "autodesk"],
  rawa: ["resource", "procurement", "material", "supply chain", "equipment", "labour", "lbp"],
  whakaae: ["consent", "building consent", "ccc", "council", "code compliance", "bca", "resource consent", "rma"],
  pai: ["quality", "inspection", "defect", "ncr", "punch list", "snag", "producer statement", "itp"],
  arc: ["architecture", "building code", "design", "floor plan", "elevation", "nzs 3604", "branz", "architect"],
  terra: ["land", "property development", "subdivision", "title", "survey", "rma", "land use"],
  pinnacle: ["tender", "gets", "award", "application", "submission", "rfp", "rft", "proposal"],

  // ── AUAHA — Creative & Media (9) ──
  prism: ["brand", "brand identity", "logo", "visual identity", "brand guidelines", "brand dna", "colour palette"],
  muse: ["copy", "copywriting", "content", "blog", "article", "headline", "tagline", "caption", "write"],
  pixel: ["image", "photo", "design", "graphic", "visual", "illustration", "infographic", "canva"],
  verse: ["story", "narrative", "storytelling", "script", "screenplay", "creative writing"],
  echo: ["video", "production", "edit", "footage", "youtube", "reel", "tiktok", "animation"],
  flux: ["social media", "instagram", "facebook", "linkedin", "posting", "schedule", "publish", "feed"],
  chromatic: ["colour", "color", "aesthetic", "visual identity", "typography", "font", "design system"],
  rhythm: ["podcast", "audio", "sound", "music", "episode", "recording", "spotify"],
  market: ["advertising", "fair trading", "asa", "ad standards", "marketing compliance", "consumer guarantees"],

  // ── PAKIHI — Business & Commerce (11) ──
  ledger: ["accounting", "tax", "gst", "ird", "invoice", "bank reconciliation", "xero", "myob", "financial", "profit", "loss", "balance sheet"],
  vault: ["insurance", "policy", "claim", "cover", "premium", "liability", "indemnity", "broker"],
  catalyst: ["recruitment", "talent", "hire", "job listing", "candidate", "interview", "onboarding", "seek"],
  compass: ["immigration", "visa", "work permit", "aewv", "residence", "essential skills", "inz", "accredited employer"],
  haven: ["real estate", "property", "rental", "tenant", "landlord", "rta", "tenancy", "bond", "healthy homes", "letting"],
  counter: ["retail", "consumer", "shop", "store", "consumer guarantees act", "cga", "pos", "merchandise"],
  gateway: ["customs", "import", "export", "tariff", "hs code", "border", "freight", "customs broker", "mpi", "biosecurity"],
  harvest: ["agriculture", "farm", "dairy", "livestock", "pastoral", "fonterra", "irrigation", "feedlot", "agri"],
  grove: ["horticulture", "wine", "viticulture", "orchard", "kiwifruit", "pip fruit", "export"],
  sage: ["strategy", "analytics", "insight", "market research", "benchmarking", "competitor", "swot"],
  ascend: ["growth", "scale", "expansion", "performance", "kpi", "okr", "planning"],

  // ── WAKA — Transport & Vehicles (3) ──
  motor: ["automotive", "car", "vehicle", "dealership", "motor vehicle", "wof", "cof", "rego", "mvsa", "used car"],
  transit: ["transport", "trucking", "logistics", "freight", "nzta", "heavy vehicle", "logbook", "ruc", "chain rule"],
  mariner: ["maritime", "vessel", "ship", "boat", "seafarer", "maritime transport", "coastguard", "port"],

  // ── HANGARAU — Technology (12) ──
  spark: ["app", "software", "code", "deploy", "cloud", "saas", "platform", "api", "build"],
  sentinel: ["monitoring", "uptime", "alert", "incident", "observability", "grafana", "datadog"],
  "nexus-t": ["integration", "api management", "webhook", "connector", "middleware", "zapier"],
  cipher: ["cybersecurity", "encryption", "penetration test", "vulnerability", "owasp", "ssl", "tls"],
  relay: ["messaging", "notification", "email", "sms", "push", "communication system"],
  matrix: ["database", "data architecture", "schema", "migration", "etl", "data warehouse"],
  forge: ["devops", "ci/cd", "pipeline", "deployment", "docker", "kubernetes", "terraform"],
  oracle: ["predictive", "ml", "machine learning", "forecast", "ai model", "analytics"],
  ember: ["energy", "carbon", "sustainability", "emissions", "net zero", "ets"],
  reef: ["environment", "resource management", "rma", "discharge", "consent", "epa"],
  patent: ["ip", "intellectual property", "patent", "trademark", "copyright", "iponz"],
  foundry: ["manufacturing", "production", "factory", "industrial", "lean", "supply"],

  // ── HAUORA — Health, Wellbeing, Sport & Lifestyle (8) ──
  turf: ["sports", "recreation", "club", "incorporated society", "committee", "agm", "fixtures"],
  league: ["competition", "tournament", "league", "season", "draw", "fixture", "event management"],
  vitals: ["workplace health", "hswa", "health and safety", "acc", "injury", "wellbeing"],
  remedy: ["healthcare", "medical", "hpcaa", "practitioner", "clinic", "patient", "nzmc"],
  vitae: ["nutrition", "diet", "food standards", "supplements", "dietary", "meal plan"],
  radiance: ["beauty", "wellness", "spa", "salon", "cosmetics", "skincare", "hairdresser"],
  palette: ["interior design", "décor", "space planning", "renovation", "furniture", "fit-out"],
  odyssey: ["travel", "tourism regulation", "booking", "itinerary", "airline", "accommodation"],

  // ── TE KĀHUI REO — Māori Business Intelligence (8) ──
  whanau: ["whānau", "whanau", "family governance", "hapū", "hapu"],
  rohe: ["rohe", "region", "local governance", "council", "iwi region"],
  "kaupapa-m": ["kaupapa māori", "kaupapa maori", "tikanga", "mātauranga", "te ao māori"],
  mana: ["mana whenua", "te tiriti", "treaty", "iwi engagement", "settlement"],
  kaitiaki: ["kaitiakitanga", "guardianship", "environmental stewardship", "taonga"],
  taura: ["community", "network", "support", "connection", "tāura"],
  whakaaro: ["strategic māori", "māori perspective", "whakaaro", "planning"],
  hiringa: ["resilience", "innovation", "growth", "hiringa", "strength"],

  // ── TŌROA — Family Navigator (1) ──
  toroa: ["family", "school", "kids", "children", "meal", "bus", "homework", "budget", "grocery", "reminder", "whānau navigator"],

  // ── TE REO (legacy, kept for backward compat) ──
  tereo: ["te reo", "māori language", "macron", "pronunciation", "kupu", "translate", "mihi", "karakia"],
};

// Pack membership for context loading
const AGENT_PACK: Record<string, string> = {
  // Shared Core
  charter: "shared", arbiter: "shared", shield: "shared", anchor: "shared",
  aroha: "shared", pulse: "shared", scholar: "shared", nova: "shared",
  // Manaaki
  aura: "manaaki", saffron: "manaaki", cellar: "manaaki", luxe: "manaaki",
  moana: "manaaki", coast: "manaaki", kura: "manaaki", pau: "manaaki", summit: "manaaki",
  // Hanga
  arai: "hanga", kaupapa: "hanga", ata: "hanga", rawa: "hanga",
  whakaae: "hanga", pai: "hanga", arc: "hanga", terra: "hanga", pinnacle: "hanga",
  // Auaha
  prism: "auaha", muse: "auaha", pixel: "auaha", verse: "auaha",
  echo: "auaha", flux: "auaha", chromatic: "auaha", rhythm: "auaha", market: "auaha",
  // Pakihi
  ledger: "pakihi", vault: "pakihi", catalyst: "pakihi", compass: "pakihi",
  haven: "pakihi", counter: "pakihi", gateway: "pakihi", harvest: "pakihi",
  grove: "pakihi", sage: "pakihi", ascend: "pakihi",
  // Waka
  motor: "waka", transit: "waka", mariner: "waka",
  // Hangarau
  spark: "hangarau", sentinel: "hangarau", "nexus-t": "hangarau", cipher: "hangarau",
  relay: "hangarau", matrix: "hangarau", forge: "hangarau", oracle: "hangarau",
  ember: "hangarau", reef: "hangarau", patent: "hangarau", foundry: "hangarau",
  // Hauora
  turf: "hauora", league: "hauora", vitals: "hauora", remedy: "hauora",
  vitae: "hauora", radiance: "hauora", palette: "hauora", odyssey: "hauora",
  // Te Kāhui Reo
  whanau: "te-kahui-reo", rohe: "te-kahui-reo", "kaupapa-m": "te-kahui-reo",
  mana: "te-kahui-reo", kaitiaki: "te-kahui-reo", taura: "te-kahui-reo",
  whakaaro: "te-kahui-reo", hiringa: "te-kahui-reo",
  // Tōroa
  toroa: "toroa",
  // Legacy
  tereo: "shared",
};

function classifyAgent(message: string, explicitAgent?: string): string {
  if (explicitAgent && AGENT_KEYWORDS[explicitAgent]) return explicitAgent;
  const lc = message.toLowerCase();
  let bestAgent = "nova"; // Default to NOVA (general ops) instead of iho
  let bestScore = 0;
  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    if (score > bestScore) { bestScore = score; bestAgent = agent; }
  }
  return bestAgent;
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, packId, agentId, messages = [], userId } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Classify which agent should handle this
    const selectedAgent = classifyAgent(message, agentId);
    const agentPack = AGENT_PACK[selectedAgent] || packId || "shared";

    // Load agent prompt from DB
    const { data: agentPrompt } = await supabase
      .from("agent_prompts")
      .select("*")
      .eq("agent_name", selectedAgent)
      .eq("is_active", true)
      .single();

    // Load shared compliance prompts (privacy, tikanga, copywriter)
    const { data: sharedPrompts } = await supabase
      .from("agent_prompts")
      .select("system_prompt")
      .eq("pack", "shared")
      .eq("is_active", true)
      .in("agent_name", ["shield", "charter", "aroha"]);

    // ═══ MEMORY & PREEMPTIVE KNOWLEDGE ═══
    // Load user's shared context (business facts detected across all agents)
    let sharedContextBlock = "";
    let memoryBlock = "";

    // Extract user ID from auth header if not passed directly
    const authHeader = req.headers.get("authorization");
    let resolvedUserId = userId;
    if (!resolvedUserId && authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        resolvedUserId = user?.id;
      } catch { /* anonymous user */ }
    }

    if (resolvedUserId) {
      // Load shared business context
      const { data: contextRows } = await supabase
        .from("shared_context")
        .select("context_key, context_value")
        .eq("user_id", resolvedUserId)
        .limit(20);

      if (contextRows?.length) {
        const facts = contextRows.map(r => `- ${r.context_key}: ${JSON.stringify(r.context_value)}`).join("\n");
        sharedContextBlock = `\n\n--- BUSINESS CONTEXT (shared across all agents) ---\nKnown facts about this user's business:\n${facts}\nUse this context to personalise your response. Reference their business name, industry, location, and team size where relevant.`;
      }

      // Load agent-specific memory
      const { data: memoryRows } = await supabase
        .from("agent_memory")
        .select("memory_key, memory_value")
        .eq("user_id", resolvedUserId)
        .eq("agent_id", selectedAgent)
        .order("updated_at", { ascending: false })
        .limit(15);

      if (memoryRows?.length) {
        const memories = memoryRows.map(r => `- ${r.memory_key}: ${JSON.stringify(r.memory_value)}`).join("\n");
        memoryBlock = `\n\n--- AGENT MEMORY (your previous knowledge about this user) ---\n${memories}\nUse this to continue conversations naturally without asking repeated questions.`;
      }

      // Load user training data for this agent
      const { data: trainingData } = await supabase
        .from("agent_training")
        .select("business_context, personality, tone, faqs, rules")
        .eq("user_id", resolvedUserId)
        .eq("agent_id", selectedAgent)
        .single();

      if (trainingData) {
        const parts: string[] = [];
        if (trainingData.personality) parts.push(`Personality: ${trainingData.personality}`);
        if (trainingData.tone) parts.push(`Tone: ${trainingData.tone}`);
        if (trainingData.business_context) parts.push(`Business context: ${trainingData.business_context}`);
        if (trainingData.faqs && Array.isArray(trainingData.faqs)) {
          parts.push(`FAQs:\n${(trainingData.faqs as any[]).map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")}`);
        }
        if (trainingData.rules && Array.isArray(trainingData.rules)) {
          parts.push(`Rules:\n${(trainingData.rules as any[]).map((r: any) => `- ${r}`).join("\n")}`);
        }
        if (parts.length) {
          memoryBlock += `\n\n--- USER TRAINING ---\n${parts.join("\n")}`;
        }
      }
    }

    // ═══ SYMBIOTIC CONTEXT ═══
    // Build cross-agent awareness — tell this agent about related kete agents
    const packAgents = Object.entries(AGENT_PACK)
      .filter(([_, pack]) => pack === agentPack && _ !== selectedAgent)
      .map(([name]) => name.toUpperCase());

    const symbioticBlock = packAgents.length > 0
      ? `\n\n--- SYMBIOTIC NETWORK ---\nYou are part of the ${agentPack.toUpperCase()} kete. Your sibling agents are: ${packAgents.join(", ")}. If a user's query would be better handled by a sibling agent, suggest they "switch to [AGENT_NAME]" for specialist help. You can reference their capabilities when relevant.`
      : "";

    // ═══ PREEMPTIVE KNOWLEDGE ═══
    const preemptiveBlock = `\n\n--- PREEMPTIVE INTELLIGENCE ---\nAfter answering, consider:
1. Are there compliance deadlines the user should know about?
2. Would another agent in the network add value here? If so, mention them by name.
3. Are there related tasks the user hasn't asked about but should consider?
Add a brief "💡 Also consider..." section at the end if relevant. Keep it to 1-2 items max.`;

    // ═══ DESIGN EXCELLENCE LAYER ═══
    // Injected into creative, brand, and design agents to ensure distinctive output
    const DESIGN_AGENTS = ["prism", "muse", "pixel", "verse", "echo", "flux", "chromatic", "rhythm", "market", "spark"];
    const designBlock = DESIGN_AGENTS.includes(selectedAgent)
      ? `\n\n--- DESIGN EXCELLENCE STANDARDS ---
When creating or reviewing any frontend, visual, or design output:

AESTHETIC DIRECTION: Before generating, commit to a BOLD direction — brutally minimal, maximalist, retro-futuristic, organic, luxury, editorial, brutalist, art deco, soft/pastel, or industrial. Execute with conviction. No two outputs should look the same.

TYPOGRAPHY: Choose distinctive, characterful fonts. NEVER default to Inter, Roboto, Arial, or system fonts. Pair a display font with a refined body font. Consider: Playfair Display, Syne, Space Mono, Fraunces, Cabinet Grotesk, Clash Display, Satoshi, General Sans.

COLOUR & THEME: Commit to a cohesive palette with dominant colours and sharp accents. Avoid timid, evenly-distributed palettes. Use CSS variables for consistency. NEVER use clichéd purple gradients on white.

MOTION: Prioritise high-impact moments — staggered page-load reveals create more delight than scattered micro-interactions. Use scroll-triggering and surprising hover states.

SPATIAL COMPOSITION: Unexpected layouts, asymmetry, overlap, diagonal flow, grid-breaking elements. Generous negative space OR controlled density — never lukewarm.

VISUAL DEPTH: Create atmosphere through gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays, decorative borders. Never default to flat solid backgrounds.

ANTI-SLOP RULES: Reject generic AI aesthetics. No overused fonts (Inter, Poppins), no predictable component patterns, no cookie-cutter layouts. Every output must feel genuinely designed for its specific context, audience, and purpose.

Match implementation complexity to vision: maximalist designs need elaborate effects; minimalist designs need precision in spacing, typography, and subtle details. Elegance comes from executing the vision fully.`
      : "";

    const basePrompt = agentPrompt?.system_prompt ||
      `You are ${selectedAgent.toUpperCase()}, an assembl specialist agent for New Zealand businesses. Help with queries in your area of expertise. Reference relevant NZ legislation where applicable. Write in NZ English with macrons on all Māori words.`;

    const complianceRules = (sharedPrompts || []).map(p => p.system_prompt).join("\n\n");

    // Platform context injected into every agent
    const platformContext = `
--- PLATFORM CONTEXT (assembl) ---
You are part of assembl — a governed, simulation-tested operational intelligence platform built for Aotearoa New Zealand. Always use lowercase "assembl" (never capitalised).

Key facts you should know and reference when relevant:
- assembl gives New Zealand businesses specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. We help teams act faster with better information — not replace the people who know the work best.
- assembl is NOT a chatbot platform and NOT a workforce replacement tool. It provides better operational outcomes, stronger compliance readiness, faster decisions, and less fragmented admin.
- Every production-grade agent operates through a six-layer stack: perception, memory, reasoning, action, explanation, and simulation.
- assembl operates through a 10-step Iho routing pipeline: Parse → Access → Intent → Agent Selection → PII Masking → Business Context → Model Selection → AI Call → Final Gate → Audit Log.
- Every output runs through a tikanga compliance pipeline (Kahu → Tā → Mahara → Mana) with an audit trail.

Five industry kete:
  • Manaaki — Hospitality: food safety, liquor licensing, guest experience, tourism operations
  • Waihanga — Construction: site safety, consenting, project management, quality and sign-off
  • Auaha — Creative: brief to publish — copy, image, video, podcast, ads, analytics
  • Arataki — Automotive: workshops, fleet, vehicle compliance, service scheduling
  • Pikau — Freight & Customs: route optimisation, declarations, broker hand-off, customs compliance

Pricing (NZD ex GST):
  • Family: $29/mo — SMS-first whānau agent (consumer)
  • Operator: $590/mo + $1,490 setup — sole traders and micro-SMEs, 1 kete, up to 5 seats
  • Leader: $1,290/mo + $1,990 setup — multi-discipline SMEs, 2 kete, up to 15 seats, quarterly compliance review
  • Enterprise: $2,890/mo + $2,990 setup — multi-site, all 5 kete, unlimited seats, 99.9% uptime SLA, attested NZ data residency, named success manager
  • Outcome: from $5,000/mo — bespoke engagements, base + 10–20% of measured savings
  • Setup fees can be split across the first 3 invoices on request.

Trust & compliance:
  • NZ Privacy Act 2020 alignment (including new IPP 3A from 1 May 2026)
  • AAAIP (Aotearoa AI Principles) alignment
  • NZISM-informed security practices
  • Encrypted in transit and at rest
  • Customer business data is never used to train models
  • Attested NZ data residency on Enterprise

- assembl is built in Auckland, Aotearoa New Zealand. Website: assembl.co.nz. Contact: assembl@assembl.co.nz
- Tikanga Māori governance is a structural layer through the whole platform — not a disclaimer.
- assembl uses shared intelligence — agents collaborate via a shared context bus and unified business profiles.
`;

    const systemPrompt = `${basePrompt}\n\n${platformContext}\n\n--- COMPLIANCE & GOVERNANCE LAYER ---\n${complianceRules}${sharedContextBlock}${memoryBlock}${symbioticBlock}${preemptiveBlock}${designBlock}\n\nAlways respond in a helpful, professional tone. Use markdown formatting. Reference NZ legislation where applicable. Use NZ English spelling. Include macrons on all Māori words.`;

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Model selection from DB preference
    const MODEL_MAP: Record<string, string> = {
      "gemini-2.5-flash": "google/gemini-2.5-flash",
      "gemini-2.5-pro": "google/gemini-2.5-pro",
      "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
      "gemini-3-flash-preview": "google/gemini-3-flash-preview",
      "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",
      "gpt-5": "openai/gpt-5",
      "gpt-5-mini": "openai/gpt-5-mini",
    };
    const rawPref = agentPrompt?.model_preference || "gemini-3-flash-preview";
    const model = MODEL_MAP[rawPref] || `google/${rawPref}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: conversationMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI error: ${status}`);
    }

    // ═══ MEMORY PERSISTENCE — extract facts from user message ═══
    if (resolvedUserId) {
      // Fire-and-forget: save key facts to shared_context
      const lc = message.toLowerCase();
      const contextWrites: { context_key: string; context_value: any; user_id: string; source_agent: string; confidence: number }[] = [];

      const bizNameMatch = message.match(/(?:my (?:business|company|shop|store|firm|practice) (?:is|called|named))\s+["']?([^"'\n,.]+)/i);
      if (bizNameMatch) contextWrites.push({ context_key: "business_name", context_value: bizNameMatch[1].trim(), user_id: resolvedUserId, source_agent: selectedAgent, confidence: 0.85 });

      const industryMatch = message.match(/(?:we're|we are|i'm|i am|we run|i run)\s+(?:a|an|in)\s+(construction|hospitality|retail|automotive|legal|property|sports|agriculture|tourism|tech|marketing|nonprofit|logistics|finance|healthcare|education)\b/i);
      if (industryMatch) contextWrites.push({ context_key: "industry", context_value: industryMatch[1].toLowerCase(), user_id: resolvedUserId, source_agent: selectedAgent, confidence: 0.8 });

      const teamMatch = message.match(/(\d+)\s+(?:staff|employees|people|team members)/i);
      if (teamMatch) contextWrites.push({ context_key: "team_size", context_value: parseInt(teamMatch[1]), user_id: resolvedUserId, source_agent: selectedAgent, confidence: 0.75 });

      const locationMatch = message.match(/(?:based in|located in|we're in|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (locationMatch) contextWrites.push({ context_key: "location", context_value: locationMatch[1], user_id: resolvedUserId, source_agent: selectedAgent, confidence: 0.8 });

      if (contextWrites.length > 0) {
        for (const ctx of contextWrites) {
          supabase.from("shared_context").upsert(ctx, { onConflict: "user_id,context_key" }).then(() => {});
        }
      }
    }

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-Agent-Name", encodeURIComponent(agentPrompt?.display_name || selectedAgent.toUpperCase()));
    headers.set("X-Agent-Code", selectedAgent);
    headers.set("X-Agent-Icon", agentPrompt?.icon || "Brain");
    headers.set("X-Agent-Pack", agentPack);
    headers.set("X-Agent-Model", model);
    headers.set("Access-Control-Expose-Headers", "X-Agent-Name, X-Agent-Code, X-Agent-Icon, X-Agent-Pack, X-Agent-Model");

    return new Response(response.body, { headers });
  } catch (e) {
    console.error("agent-router error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
