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

  // ── WAIHANGA — Construction (9) ──
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

  // ── WAIHANGARAU — Technology (12) ──
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

  // ── TŌRO — Family Navigator (1) ──
  toroa: ["family", "school", "kids", "children", "meal", "bus", "homework", "budget", "grocery", "reminder", "whānau navigator"],

  // ── PILOT — Founder EA (1) ──
  pilot: ["pilot", "kate", "prospect", "outreach", "pipeline", "weekly briefing", "content schedule", "sales", "founder"],

  // ── TE REO (legacy, kept for backward compat) ──
  tereo: ["te reo", "māori language", "macron", "pronunciation", "kupu", "translate", "mihi", "karakia"],

  // ── HOKO — Import / Export (4) ──
  "anchor-hoko": ["incoterm", "fob", "cif", "ddp", "exw", "letter of credit", "lc", "bill of lading", "bol", "export contract", "trade contract", "international contract"],
  "flux-hoko":   ["export market", "trade promotion", "nzte", "market entry", "buyer outreach", "trade show", "export marketing", "international launch"],
  "nova-hoko":   ["export readiness", "tariff lookup", "hs classification", "fta", "cptpp", "rcep", "uk fta", "eu fta", "china fta", "trade compliance", "anti-dumping", "rules of origin", "certificate of origin"],
  "prism-hoko":  ["export brand", "international brand", "label translation", "packaging compliance", "global brand", "export packaging"],

  // ── WHENUA — Agriculture (canonical = harvest, kept for keyword strength) ──
  // (harvest already mapped above under PAKIHI; reinforced via SOURCE_AGENT_MAP)

  // ── AKO — Early Childhood Education (3) ──
  "apex-ako": ["ece", "early childhood", "kindergarten", "kōhanga reo", "kohanga reo", "education review office", "ero visit", "licensing criteria", "20 hours ece", "te whāriki", "te whariki", "regulation 47", "graduated enforcement", "centre licence", "centre license"],
  "nova-ako": ["enrolment form", "20 hours agreement", "transparency pack", "complaints procedure", "operational document", "parent handbook", "centre policy"],
  "mana-ako": ["ece funding", "rs7", "attendance record", "ministry funding claim", "child wellbeing", "incident register", "notifiable incident ece", "child protection ece"],
};

// Pack membership for context loading
const AGENT_PACK: Record<string, string> = {
  // Shared Core
  charter: "shared", arbiter: "shared", shield: "shared", anchor: "shared",
  aroha: "shared", pulse: "shared", scholar: "shared", nova: "shared",
  // Manaaki
  aura: "manaaki", saffron: "manaaki", cellar: "manaaki", luxe: "manaaki",
  moana: "manaaki", coast: "manaaki", kura: "manaaki", pau: "manaaki", summit: "manaaki",
  // Waihanga
  arai: "waihanga", kaupapa: "waihanga", ata: "waihanga", rawa: "waihanga",
  whakaae: "waihanga", pai: "waihanga", arc: "waihanga", terra: "waihanga", pinnacle: "waihanga",
  // Auaha
  prism: "auaha", muse: "auaha", pixel: "auaha", verse: "auaha",
  echo: "auaha", flux: "auaha", chromatic: "auaha", rhythm: "auaha", market: "auaha",
  // Pakihi
  ledger: "pakihi", vault: "pakihi", catalyst: "pakihi", compass: "pakihi",
  haven: "pakihi", counter: "pakihi", gateway: "pakihi", harvest: "pakihi",
  grove: "pakihi", sage: "pakihi", ascend: "pakihi",
  // Waka
  motor: "waka", transit: "waka", mariner: "waka",
  // Waihangarau
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
  // Tōro
  toroa: "toroa",
  // Pilot
  pilot: "shared",
  // Legacy
  tereo: "shared",
  // HOKO — Import/Export
  "anchor-hoko": "hoko", "flux-hoko": "hoko", "nova-hoko": "hoko", "prism-hoko": "hoko",
  // AKO — Early Childhood Education
  "apex-ako": "ako", "nova-ako": "ako", "mana-ako": "ako",
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
    const { message, packId, agentId, messages = [], userId, systemPromptOverride } = await req.json();
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
    let industryContextBlock = "";

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

    // ═══ EXPERT MODE — Active for ALL agents ═══
    // Confidence scoring, citations, proactive intelligence, handoff, action queue
    let expertBlock = `\n\n--- EXPERT MODE — ACTIVE ---

CONFIDENCE: For every factual claim, rate your confidence:
🟢 HIGH: Current rate/law verified. Example: "Minimum wage is $23.15/hr from 1 Apr 2025 🟢"
🟡 MEDIUM: Likely current but may have changed. Example: "ACC employer levy ~$0.63/$100 — verify at acc.co.nz 🟡"
🔴 CHECK: May be outdated or region-specific. Example: "Regional council requirement — verify with your local council 🔴"

CITATIONS: Always cite the specific Act, section, and regulation. Not "you might need consent" but "under s9 RMA 1991, this activity requires resource consent as a discretionary activity." Include the full legislative reference.

PROACTIVE: At conversation start, consider:
- Upcoming deadlines relevant to this user's business
- Action items from previous conversations
- Seasonal reminders relevant to your domain
Surface the top 2-3 items as a brief alert. Don't lecture — just flag.

HANDOFF: If a question is outside your expertise, show:
"This is a [domain] question — [AGENT_NAME] is better suited. Here's what I'd brief them:"
[2-3 sentence context summary]
[Switch to AGENT_NAME →]

AGENTIC: When given a complex goal, present a numbered plan first, then execute each step showing progress. Don't ask "shall I continue?" between steps unless the step requires a decision.

ACTION QUEUE: When the user commits to an action ("I'll update that agreement", "I need to file that"), note it clearly with ✅ ACTION: [description]. These will be tracked and followed up on next visit.

COMPLIANCE FEED: If there's a recent high-impact legislative change relevant to this conversation, mention it proactively: "Heads up — [change] took effect [date]. This affects [specific thing you're discussing]."

MEMORY: If you have context from previous conversations, use it naturally. Don't ask the user to repeat themselves. If you remember something, reference it: "Last time we discussed [topic]..."

OUTPUT VERSIONING: When generating documents or structured outputs, label them as v1.0. If the user requests edits, increment to v1.1. Note the version clearly.`;

    // ═══ TRUTH PROTOCOL — Anti-Hallucination Stack ═══
    const truthProtocol = `\n\n--- TRUTH PROTOCOL — NON-NEGOTIABLE ---

1. NEVER invent Act names, section numbers, case names, or source URLs.
2. NEVER state a rate, threshold, or date without checking agent_knowledge_base first.
3. If unsure → "I believe [X] — verify at [source] 🟡" — NEVER state uncertain facts as certain.
4. If you don't know → "I don't have verified current information on this. Check [authority]."
5. Every legislative reference: Act name + section + year. No exceptions.
6. Every rate/threshold: include effective date. "Minimum wage $23.95/hr (from 1 April 2026 🟢)"
7. For calculations: use tool functions, not mental arithmetic. Tools can't hallucinate.
8. Common NZ pitfalls to avoid:
   - Sick leave: 10 days after 6 MONTHS (not 3)
   - Trial period: 90 days, employers with FEWER than 20 employees (since Feb 2026 amendment)
   - KiwiSaver employer: 3.5% from 1 April 2026 (was 3%)
   - GST: 15% (not 10% or 12.5% — those are old/other countries)
   - Minimum wage: check agent_knowledge_base — this changes 1 April each year
9. An honest "I'm not sure — check [authority]" is always better than a confident wrong answer.`;

    // ═══ ASSEMBL PROTOCOL — Mandatory Compliance Layer ═══
    const assembleProtocol = `\n\n--- ASSEMBL PROTOCOL — MANDATORY COMPLIANCE LAYER ---

KAHU (Guardian): Before responding, check:
- Does this output reference NZ legislation? → Cite specific Act, section, date
- Does it involve Māori data, te reo, or tikanga? → Apply cultural safety rules
- Does it involve a high-risk domain (legal, medical, financial, employment)? → Add disclaimer
- Does it make a factual claim about rates/thresholds/dates? → Verify against agent_knowledge_base

TĀ (Apply):
- NZ English spelling: analyse, colour, organisation, programme, centre, licence (noun)
- Te reo Māori: correct macrons always (ā, ē, ī, ō, ū). Kia ora not Kia Ora. Aotearoa not aotearoa.
- Brand voice: confident, warm, Kiwi-authentic, direct, technically accurate
- Never: American spellings, US-centric examples, exclamation marks in professional content, "cutting-edge", "revolutionary", "leverage", "synergy"
- Formatting: Space Grotesk headings, clean hierarchy, no emoji walls

MAHARA (Verify):
- Every legislative reference: include Act name + section + year
- Every rate/threshold: include effective date + source URL
- Confidence scoring: 🟢 HIGH / 🟡 MEDIUM / 🔴 CHECK on every factual claim
- If information is from agent_knowledge_base AND last_verified > 90 days → flag as stale

MANA (Approve):
- High-risk agents (COMPASS, ANCHOR, VITAE, CLINIC, VAULT, SHIELD, REMEDY, AROHA, LEDGER):
  ALWAYS include: "This is general information, not professional [legal/medical/financial] advice. Consult a qualified [lawyer/doctor/financial adviser] for your specific situation."
- Māori data outputs: "I can't generate or reproduce Māori cultural patterns or restricted knowledge. If this relates to iwi/hapū taonga, work with the appropriate rights-holders."
- All outputs: Kaitiakitanga posture — guardianship of data and outcomes.`;

    expertBlock += truthProtocol + assembleProtocol;

    // ═══ KNOWLEDGE BASE GROUNDING — Anti-Hallucination Layer 2 ═══
    let knowledgeBlock = "";
    {
      const { data: kbEntries } = await supabase
        .from("agent_knowledge_base")
        .select("topic, content, confidence, last_verified")
        .eq("agent_id", selectedAgent)
        .eq("is_active", true)
        .gte("confidence", 0.7)
        .order("confidence", { ascending: false })
        .limit(15);

      if (kbEntries?.length) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();
        const facts = kbEntries.map((k: any) => {
          const stale = k.last_verified < ninetyDaysAgo ? " ⚠️ STALE — verify before citing" : "";
          return `- [${k.topic}] ${k.content} (confidence: ${k.confidence}${stale})`;
        }).join("\n");
        knowledgeBlock = `\n\n--- VERIFIED KNOWLEDGE BASE ---\nUse these verified facts when answering. Cite them with 🟢 HIGH confidence:\n${facts}\nIf a fact is marked STALE, downgrade to 🟡 MEDIUM and suggest the user verify.`;
      }
    }
    expertBlock += knowledgeBlock;

    // Load recent compliance updates for proactive intelligence
    let complianceAlertBlock = "";
    if (resolvedUserId) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: recentUpdates } = await supabase
        .from("compliance_updates")
        .select("title, change_summary, impact_level, affected_agents, effective_date")
        .gte("created_at", thirtyDaysAgo)
        .in("impact_level", ["high", "medium"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentUpdates?.length) {
        // Filter to updates relevant to this agent
        const relevant = recentUpdates.filter((u: any) =>
          !u.affected_agents?.length || u.affected_agents.includes(selectedAgent)
        );
        if (relevant.length) {
          const alerts = relevant.map((u: any) =>
            `⚡ ${u.impact_level.toUpperCase()}: ${u.title} (effective ${u.effective_date || "now"}) — ${u.change_summary}`
          ).join("\n");
          complianceAlertBlock = `\n\n--- RECENT COMPLIANCE CHANGES ---\n${alerts}\nReference these in your response if relevant to the user's question.`;
        }
      }

      // Load pending action items for this user
      const { data: actionItems } = await supabase
        .from("action_queue")
        .select("description, created_at")
        .eq("user_id", resolvedUserId)
        .eq("agent_id", selectedAgent)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);

      if (actionItems?.length) {
        const items = actionItems.map((a: any) => `- ${a.description}`).join("\n");
        expertBlock += `\n\n--- PENDING ACTION ITEMS ---\nThis user has outstanding items:\n${items}\nMention the most relevant one briefly at conversation start.`;
      }

      // Load FTS memory for this query
      const { data: memoryHits } = await supabase
        .rpc("search_memory", {
          p_user_id: resolvedUserId,
          p_query: message,
          p_agent_id: selectedAgent,
          p_limit: 3,
        });

      if (memoryHits?.length) {
        const memories = memoryHits.map((m: any) => `- ${m.summary}`).join("\n");
        expertBlock += `\n\n--- RELEVANT PAST CONVERSATIONS ---\n${memories}\nUse this context naturally. Don't repeat what the user already knows.`;
      }
    }

    // ═══ SYMBIOTIC CONTEXT ═══
    const packAgents = Object.entries(AGENT_PACK)
      .filter(([_, pack]) => pack === agentPack && _ !== selectedAgent)
      .map(([name]) => name.toUpperCase());

    const symbioticBlock = packAgents.length > 0
      ? `\n\n--- SYMBIOTIC NETWORK ---\nYou are part of the ${agentPack.toUpperCase()} kete. Your sibling agents are: ${packAgents.join(", ")}. If a user's query would be better handled by a sibling agent, suggest they "switch to [AGENT_NAME]" for specialist help. You can reference their capabilities when relevant.`
      : "";

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

    const basePrompt = systemPromptOverride || agentPrompt?.system_prompt ||
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

Seven industry kete + Tōro:
  • Manaaki — Hospitality: food safety, liquor licensing, guest experience, tourism operations
  • Waihanga — Construction: site safety, consenting, project management, quality and sign-off
  • Auaha — Creative: brief to publish — copy, image, video, podcast, ads, analytics
  • Arataki — Automotive: workshops, fleet, vehicle compliance, service scheduling
  • Pikau — Freight & Customs (domestic): route optimisation, declarations, broker hand-off, customs compliance
  • Hoko — Import / Export: tariffs, FTA preference, Incoterms, market entry, export brand
  • Whenua — Agriculture & Primary: dairy, beef + lamb, horticulture, FEP, NAIT, emissions readiness
  • Ako — Early Childhood Education: 20 April 2026 licensing criteria, transparency pack, graduated enforcement readiness (administrative-only, HIGH-RISK)
  • Tōro — Family life navigator (consumer SMS-first companion)

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

    const systemPrompt = `${basePrompt}\n\n${platformContext}\n\n--- COMPLIANCE & GOVERNANCE LAYER ---\n${complianceRules}${sharedContextBlock}${memoryBlock}${expertBlock}${complianceAlertBlock}${symbioticBlock}${designBlock}${industryContextBlock}\n\nAlways respond in a helpful, professional tone. Use markdown formatting. Reference NZ legislation where applicable. Use NZ English spelling. Include macrons on all Māori words.`;

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


    // ═══ DYNAMIC TOOL REGISTRY + INDUSTRY-AWARE LOADING ═══
    let agentTools: any[] = [];
    {
      // 1. Load base tools from agent_toolsets
      const { data: toolLinks } = await supabase
        .from("agent_toolsets")
        .select("tool_name")
        .eq("agent_id", selectedAgent);

      // 2. Industry-aware tool loading: detect user's active packs
      const packToolNames: string[] = [];
      if (resolvedUserId) {
        // Check agent_access for pack subscriptions
        const { data: accessRows } = await supabase
          .from("agent_access")
          .select("pack_id")
          .eq("is_enabled", true);

        const activePacks: string[] = accessRows?.length
          ? [...new Set(accessRows.map((a: any) => a.pack_id))] as string[]
          : [];

        // Fallback: detect industry from shared_context
        if (!activePacks.length) {
          const { data: ctxRows } = await supabase
            .from("shared_context")
            .select("context_key, context_value")
            .eq("user_id", resolvedUserId)
            .like("context_key", "company.industry%")
            .limit(5);

          const industryMap: Record<string, string> = {
            hospitality: "manaaki", restaurant: "manaaki", cafe: "manaaki", hotel: "manaaki",
            construction: "waihanga", building: "waihanga", contractor: "waihanga",
            creative: "auaha", marketing: "auaha", design: "auaha",
            automotive: "arataki", dealership: "arataki", workshop: "arataki",
            freight: "pikau", logistics: "pikau", customs: "pikau",
            farming: "toro", agriculture: "toro", dairy: "toro",
          };

          for (const c of ctxRows || []) {
            const val = String(c.context_value).toLowerCase();
            for (const [kw, pack] of Object.entries(industryMap)) {
              if (val.includes(kw) && !activePacks.includes(pack)) activePacks.push(pack);
            }
          }
        }

        // Load pack-specific toolsets for industry packs
        const INDUSTRY_TOOLSETS: Record<string, string[]> = {
          manaaki: ["assembl_aura_fcp_daily_check", "assembl_aura_temp_logger", "assembl_aura_verifier_pack", "assembl_aura_liquor_licence_renewal"],
          hanga: ["assembl_apex_safety_plan", "assembl_kaupapa_progress_claim", "assembl_arai_hazard_register", "assembl_whakaae_consent_checklist"],
          auaha: ["assembl_prism_brand_scanner", "assembl_prism_campaign_engine", "assembl_echo_content_calendar", "assembl_echo_analytics_feedback"],
          arataki: ["assembl_forge_ruc_calculator", "assembl_forge_cin_generator", "assembl_forge_wof_tracker", "assembl_forge_service_reminder", "assembl_forge_fleet_dashboard"],
          pikau: ["assembl_gateway_customs_entry", "assembl_gateway_hs_lookup", "assembl_gateway_tariff_calculator"],
          toro: ["assembl_toro_nait_tracker", "assembl_toro_fep_builder", "assembl_toro_ets_calculator", "assembl_toro_milk_price", "assembl_toro_weather_ops", "assembl_toro_seasonal_sweep"],
        };

        // Pack agents membership
        const PACK_AGENTS: Record<string, string[]> = {
          manaaki: ["aura", "saffron", "cellar", "luxe", "moana", "coast", "kura", "pau", "summit"],
          hanga: ["arai", "kaupapa", "ata", "rawa", "whakaae", "pai", "arc", "terra", "pinnacle"],
          auaha: ["prism", "muse", "pixel", "verse", "echo", "flux", "chromatic", "rhythm", "market"],
          arataki: ["motor", "transit", "mariner"],
          pikau: ["gateway", "harvest", "grove"],
          toro: ["toroa"],
        };

        for (const pack of activePacks) {
          const agents = PACK_AGENTS[pack] || [];
          if (agents.includes(selectedAgent)) {
            const tools = INDUSTRY_TOOLSETS[pack] || [];
            packToolNames.push(...tools);
          }
        }

        // Shared agents get industry context
        const SHARED_AGENTS = ["ledger", "aroha", "anchor", "vault", "shield", "nova", "pilot"];
        if (SHARED_AGENTS.includes(selectedAgent) && activePacks.length > 0) {
          const packLabels: Record<string, string> = {
            manaaki: "Hospitality & Tourism", hanga: "Construction", auaha: "Creative & Media",
            arataki: "Automotive", pikau: "Freight & Customs", toro: "Agriculture & Farming",
          };
          const names = activePacks.map(p => packLabels[p] || p).join(", ");
          industryContextBlock = `\n\n--- INDUSTRY CONTEXT ---\nThis user has active packs: ${names}.\nLoad industry-specific templates and compliance rules for their sector(s). Tailor all advice, calculations, and documents to their industry.`;
        }
      }

      // 3. Combine base + industry tools and load schemas
      const allToolNames = [
        ...(toolLinks || []).map((t: any) => t.tool_name),
        ...packToolNames,
      ];
      const uniqueToolNames = [...new Set(allToolNames)];

      if (uniqueToolNames.length) {
        const { data: tools } = await supabase
          .from("tool_registry")
          .select("tool_name, tool_schema, requires_integration")
          .in("tool_name", uniqueToolNames)
          .eq("is_active", true);

        if (tools?.length) {
          let userIntegrations: string[] = [];
          if (resolvedUserId) {
            const { data: connections } = await supabase
              .from("tenant_tool_connections")
              .select("tool_name")
              .eq("is_active", true);
            userIntegrations = (connections || []).map((c: any) => c.tool_name);
          }

          agentTools = tools
            .filter((t: any) => {
              if (!t.requires_integration?.length) return true;
              return t.requires_integration.every((req: string) => userIntegrations.includes(req));
            })
            .map((t: any) => t.tool_schema)
            .filter((schema: any) => schema && Object.keys(schema).length > 0);
        }
      }
    }

    const aiRequestBody: any = {
      model,
      messages: conversationMessages,
      stream: true,
    };
    if (agentTools.length > 0) {
      aiRequestBody.tools = agentTools;
    }

    // ═══ PRIMARY: Lovable AI Gateway ═══
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiRequestBody),
    });

    // ═══ FALLBACK: OpenRouter (if Lovable AI fails) ═══
    if (!response.ok) {
      const status = response.status;
      // Surface rate-limit and credit errors directly — don't fallback for these
      if (status === 429) {
        console.warn("Lovable AI rate-limited, attempting OpenRouter fallback...");
      }
      if (status === 402) {
        console.warn("Lovable AI credits exhausted, attempting OpenRouter fallback...");
      }

      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (OPENROUTER_API_KEY) {
        console.log(`Primary AI failed (${status}), falling back to OpenRouter...`);

        // Map Lovable model names to OpenRouter equivalents
        const OPENROUTER_MODEL_MAP: Record<string, string> = {
          "google/gemini-2.5-flash": "google/gemini-2.5-flash",
          "google/gemini-2.5-pro": "google/gemini-2.5-pro",
          "google/gemini-3.1-pro-preview": "google/gemini-2.5-pro",
          "google/gemini-3-flash-preview": "google/gemini-2.5-flash",
          "google/gemini-2.5-flash-lite": "google/gemini-2.5-flash",
          "openai/gpt-5": "openai/gpt-4o",
          "openai/gpt-5-mini": "openai/gpt-4o-mini",
        };
        const fallbackModel = OPENROUTER_MODEL_MAP[model] || "google/gemini-2.5-flash";

        const fallbackBody = { ...aiRequestBody, model: fallbackModel };
        // Remove tools if not supported by fallback model
        if (fallbackBody.tools) delete fallbackBody.tools;

        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://assembl.co.nz",
            "X-Title": "assembl",
          },
          body: JSON.stringify(fallbackBody),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("OpenRouter fallback also failed:", response.status, errText);
          throw new Error(`AI error: both primary and fallback failed`);
        }
        console.log("OpenRouter fallback succeeded");
      } else {
        // No fallback available — surface original error
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
