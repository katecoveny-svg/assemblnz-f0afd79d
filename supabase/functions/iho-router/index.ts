import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════
// IHO ROUTER — The Central Brain of Assembl
// 10-step pipeline: Kanohi → Mana → Iho → Kahu → Mahara → Router → AI → Tā → Mahara → Response
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

interface IhoRequest {
  message: string;
  agentId?: string;
  packId?: string;
  context?: {
    projectId?: string;
    previousMessages?: { role: string; content: string }[];
  };
}

interface IhoResponse {
  response: string;
  agentUsed: { code: string; name: string; pack: string; model: string };
  modelUsed: string;
  tokensUsed: { input: number; output: number; total: number };
  cost: { usd: number; nzdAmount: number };
  complianceStatus: {
    passed: boolean;
    piiDetected: boolean;
    piiMasked: boolean;
    dataClassification: string;
    policies: string[];
  };
  auditLog: { requestId: string; timestamp: string; agentId: string; modelUsed: string; tokensUsed: number; costNZD: number };
}

type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
type UserRole = "admin" | "manager" | "operator" | "viewer" | "trial";

// ═══════════════════════════════════════
// AGENT REGISTRY (44 agents, 5 packs)
// ═══════════════════════════════════════

interface AgentConfig {
  code: string;
  name: string;
  pack: string;
  primaryModel: "claude" | "gemini";
  skills: string[];
  keywords: string[];
}

const AGENT_REGISTRY: AgentConfig[] = [
  // MANAAKI — Hospitality & Tourism
  { code: "ASM-001", name: "AURA", pack: "manaaki", primaryModel: "gemini", skills: ["food_safety", "licensing", "hospitality_compliance"], keywords: ["food", "restaurant", "café", "kitchen", "liquor", "hospitality", "hotel", "accommodation", "bar", "menu", "guest"] },
  { code: "ASM-002", name: "HAVEN", pack: "manaaki", primaryModel: "gemini", skills: ["guest_experience", "reputation", "property_management"], keywords: ["guest", "booking", "room", "housekeeping", "reservation", "occupancy", "check-in"] },
  { code: "ASM-003", name: "TIDE", pack: "manaaki", primaryModel: "gemini", skills: ["tourism", "itinerary", "experience_design"], keywords: ["tour", "itinerary", "activity", "tourism", "destination", "travel", "attraction"] },
  { code: "ASM-004", name: "BEACON", pack: "manaaki", primaryModel: "gemini", skills: ["event_management", "functions"], keywords: ["event", "function", "wedding", "conference", "catering", "venue"] },
  { code: "ASM-005", name: "COAST", pack: "manaaki", primaryModel: "gemini", skills: ["marine_tourism", "water_safety"], keywords: ["beach", "water", "marine", "coastal", "swimming", "diving", "surfing"] },
  { code: "ASM-006", name: "EMBER", pack: "manaaki", primaryModel: "claude", skills: ["bar_operations", "alcohol_compliance"], keywords: ["bar", "cocktail", "wine", "beer", "spirits", "liquor licence", "duty manager"] },
  { code: "ASM-007", name: "FLORA", pack: "manaaki", primaryModel: "gemini", skills: ["garden_venue", "outdoor_management"], keywords: ["garden", "landscape", "outdoor", "plant", "grounds"] },
  { code: "ASM-008", name: "CREST", pack: "manaaki", primaryModel: "gemini", skills: ["luxury_hospitality", "concierge"], keywords: ["luxury", "premium", "vip", "concierge", "bespoke", "fine dining"] },

  // HANGA — Construction & Property
  { code: "ASM-009", name: "APEX", pack: "hanga", primaryModel: "claude", skills: ["project_management", "construction_compliance", "bim"], keywords: ["construction", "build", "project", "site", "contractor", "sssp", "h&s", "safety"] },
  { code: "ASM-010", name: "ATA", pack: "hanga", primaryModel: "gemini", skills: ["bim_modeling", "3d_visualization"], keywords: ["bim", "3d", "model", "design", "plans", "cad", "revit", "clash"] },
  { code: "ASM-011", name: "ĀRAI", pack: "hanga", primaryModel: "claude", skills: ["health_safety", "risk_assessment"], keywords: ["h&s", "safety", "hazard", "risk", "ppe", "incident", "worksafe", "swms"] },
  { code: "ASM-012", name: "KAUPAPA", pack: "hanga", primaryModel: "claude", skills: ["project_governance", "planning"], keywords: ["project plan", "gantt", "milestone", "governance", "scope", "charter"] },
  { code: "ASM-013", name: "RAWA", pack: "hanga", primaryModel: "claude", skills: ["resource_management", "consenting"], keywords: ["resource consent", "rma", "council", "environment", "consent"] },
  { code: "ASM-014", name: "WHAKAAĒ", pack: "hanga", primaryModel: "claude", skills: ["building_consent", "building_code"], keywords: ["building consent", "building code", "ccc", "inspection", "compliance schedule"] },
  { code: "ASM-015", name: "PAI", pack: "hanga", primaryModel: "gemini", skills: ["quality_assurance", "defect_management"], keywords: ["quality", "defect", "snag", "inspection", "workmanship", "punch list"] },

  // AUAHA — Creative & Digital
  { code: "ASM-016", name: "PRISM", pack: "auaha", primaryModel: "gemini", skills: ["brand_strategy", "campaign_design", "content_creation"], keywords: ["brand", "campaign", "marketing", "content", "social media", "design", "logo", "creative"] },
  { code: "ASM-017", name: "MUSE", pack: "auaha", primaryModel: "claude", skills: ["copywriting", "content_writing"], keywords: ["copy", "writing", "blog", "article", "email", "press release", "caption"] },
  { code: "ASM-018", name: "PIXEL", pack: "auaha", primaryModel: "gemini", skills: ["visual_design", "graphics"], keywords: ["design", "graphic", "visual", "image", "infographic", "icon", "ui", "ux"] },
  { code: "ASM-019", name: "VERSE", pack: "auaha", primaryModel: "gemini", skills: ["video_production", "motion"], keywords: ["video", "animation", "motion", "reel", "tiktok", "youtube", "film"] },
  { code: "ASM-020", name: "CANVAS", pack: "auaha", primaryModel: "gemini", skills: ["event_design", "experiential"], keywords: ["webinar", "livestream", "virtual event", "trade show", "pop-up", "exhibition"] },
  { code: "ASM-021", name: "REEL", pack: "auaha", primaryModel: "gemini", skills: ["social_media", "community"], keywords: ["instagram", "linkedin", "tiktok", "facebook", "social", "community", "hashtag", "influencer"] },
  { code: "ASM-022", name: "QUILL", pack: "auaha", primaryModel: "claude", skills: ["technical_writing", "documentation"], keywords: ["documentation", "manual", "api docs", "help article", "knowledge base", "technical writing"] },

  // PAKIHI — Business Operations
  { code: "ASM-023", name: "LEDGER", pack: "pakihi", primaryModel: "claude", skills: ["finance", "accounting", "tax", "gst"], keywords: ["gst", "tax", "invoice", "paye", "accounting", "xero", "myob", "financial", "profit", "loss", "balance sheet", "budget"] },
  { code: "ASM-024", name: "AROHA", pack: "pakihi", primaryModel: "claude", skills: ["hr", "employment_law", "payroll"], keywords: ["employment", "hr", "leave", "sick", "holiday", "kiwisaver", "payroll", "contract", "agreement", "redundancy", "grievance", "hiring", "firing", "wage", "minimum wage", "salary", "staff", "employee", "employer", "parental leave", "bereavement"] },
  { code: "ASM-025", name: "TURF", pack: "pakihi", primaryModel: "claude", skills: ["marketing_strategy", "brand_positioning"], keywords: ["market research", "competitor", "positioning", "go-to-market", "launch", "persona", "advertising", "paid ads"] },
  { code: "ASM-026", name: "SAGE", pack: "pakihi", primaryModel: "claude", skills: ["business_strategy", "planning"], keywords: ["business plan", "strategy", "kpi", "strategic", "growth", "swot", "exit", "merger"] },
  { code: "ASM-027", name: "COMPASS", pack: "pakihi", primaryModel: "claude", skills: ["risk_management", "compliance"], keywords: ["risk", "compliance", "audit", "iso", "soc", "regulation", "continuity", "disaster recovery"] },
  { code: "ASM-028", name: "ANCHOR", pack: "pakihi", primaryModel: "claude", skills: ["operations", "process_optimization"], keywords: ["process", "workflow", "sop", "efficiency", "lean", "supply chain", "operations"] },
  { code: "ASM-029", name: "FLUX", pack: "pakihi", primaryModel: "claude", skills: ["sales", "crm", "revenue"], keywords: ["sales", "lead", "pipeline", "crm", "deal", "proposal", "negotiation", "revenue", "forecast"] },
  { code: "ASM-030", name: "SHIELD", pack: "pakihi", primaryModel: "claude", skills: ["insurance", "risk_mitigation"], keywords: ["insurance", "liability", "indemnity", "coverage", "claim", "broker"] },
  { code: "ASM-031", name: "VAULT", pack: "pakihi", primaryModel: "claude", skills: ["data_security", "privacy"], keywords: ["data", "privacy", "gdpr", "encryption", "backup", "breach", "security"] },
  { code: "ASM-032", name: "MINT", pack: "pakihi", primaryModel: "claude", skills: ["financial_forecasting", "budgeting"], keywords: ["forecast", "budget", "cashflow", "projection", "variance", "capex", "depreciation"] },
  { code: "ASM-033", name: "AXIS", pack: "pakihi", primaryModel: "claude", skills: ["analytics", "performance"], keywords: ["analytics", "dashboard", "kpi", "metric", "reporting", "data", "benchmark", "cohort"] },
  { code: "ASM-034", name: "KINDLE", pack: "pakihi", primaryModel: "claude", skills: ["innovation", "product_development"], keywords: ["product", "innovation", "mvp", "prototype", "roadmap", "feature", "ideation", "beta"] },

  // HANGARAU — Technology & Infrastructure
  { code: "ASM-035", name: "SPARK", pack: "hangarau", primaryModel: "claude", skills: ["software_development", "architecture"], keywords: ["code", "api", "database", "typescript", "python", "architecture", "deploy", "ci/cd"] },
  { code: "ASM-036", name: "SENTINEL", pack: "hangarau", primaryModel: "claude", skills: ["monitoring", "alerting"], keywords: ["monitoring", "uptime", "alert", "incident", "error", "log", "status"] },
  { code: "ASM-037", name: "NEXUS", pack: "hangarau", primaryModel: "claude", skills: ["integration", "data_pipelines"], keywords: ["integration", "api", "webhook", "etl", "sync", "migration", "pipeline"] },
  { code: "ASM-038", name: "CIPHER", pack: "hangarau", primaryModel: "claude", skills: ["cryptography", "security"], keywords: ["encryption", "jwt", "oauth", "tls", "ssl", "penetration", "vulnerability", "owasp"] },
  { code: "ASM-039", name: "RELAY", pack: "hangarau", primaryModel: "claude", skills: ["messaging", "event_systems"], keywords: ["queue", "kafka", "redis", "pub/sub", "event", "async", "notification"] },
  { code: "ASM-040", name: "SIGNAL", pack: "hangarau", primaryModel: "claude", skills: ["network_security", "devops_security"], keywords: ["firewall", "waf", "ddos", "vpn", "zero trust", "container", "kubernetes"] },
  { code: "ASM-041", name: "FORGE", pack: "hangarau", primaryModel: "claude", skills: ["devops", "deployment"], keywords: ["deploy", "ci/cd", "docker", "kubernetes", "terraform", "github actions", "pipeline"] },

  // ARATAKI — Automotive (pilot, claude/arataki-pikau-pilot-build)
  { code: "ASM-042", name: "ARATAKI", pack: "arataki", primaryModel: "claude",
    skills: ["vehicle_listing_compliance", "customer_enquiry_drafting", "finance_disclosure"],
    keywords: ["dealership", "vehicle listing", "vin", "wof", "warrant of fitness", "odometer",
               "test drive", "trade-in", "trade in", "cccfa", "mvsa", "motor vehicle trader",
               "consumer information notice", "cin", "finance disclosure", "loan disclosure",
               "dealer", "car sale", "car finance", "automotive", "warranty claim"] },

  // PIKAU — Freight + Customs (pilot, claude/arataki-pikau-pilot-build)
  { code: "ASM-043", name: "PIKAU", pack: "pikau", primaryModel: "claude",
    skills: ["customs_entry_pre_check", "freight_quote_compare", "dangerous_goods_check"],
    keywords: ["customs", "nzcs", "tariff", "hs code", "harmonised", "broker", "import",
               "export", "freight", "forwarder", "incoterm", "fob", "cif", "ddp",
               "biosecurity", "mpi clearance", "imdg", "dangerous goods", "un number",
               "landed cost", "duty", "gst zero rate", "customs entry", "shipment"] },
];

// ═══════════════════════════════════════
// STEP 3-4: INTENT CLASSIFICATION & AGENT SELECTION (Iho)
// ═══════════════════════════════════════

interface IntentResult {
  agent: AgentConfig;
  confidence: number;
  taskType: string;
  packMatch: string;
}

function classifyIntent(message: string, requestedAgentCode?: string, requestedPack?: string): IntentResult {
  const lc = message.toLowerCase();

  // If agent explicitly requested, use it
  if (requestedAgentCode) {
    const agent = AGENT_REGISTRY.find(a => a.code === requestedAgentCode || a.name.toLowerCase() === requestedAgentCode.toLowerCase());
    if (agent) return { agent, confidence: 1.0, taskType: detectTaskType(lc), packMatch: agent.pack };
  }

  // Score each agent by keyword matches
  const scores = AGENT_REGISTRY.map(agent => {
    let score = 0;
    for (const kw of agent.keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1; // longer keywords = stronger signal
    }
    // Pack bonus
    if (requestedPack && agent.pack === requestedPack) score += 3;
    return { agent, score };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const confidence = best.score > 0 ? Math.min(best.score / 10, 1.0) : 0.1;

  // Default to ECHO (general) if no strong match
  const selectedAgent = best.score > 0
    ? best.agent
    : { code: "ASM-000", name: "ECHO", pack: "cross-pack", primaryModel: "claude" as const, skills: ["general"], keywords: [] };

  return { agent: selectedAgent, confidence, taskType: detectTaskType(lc), packMatch: selectedAgent.pack };
}

function detectTaskType(message: string): string {
  if (/generat|creat|writ|draft|build|make|design/.test(message)) return "content_generation";
  if (/calculat|comput|how much|percentage|total/.test(message)) return "calculation";
  if (/compli|legal|act |regulation|privacy|law/.test(message)) return "compliance";
  if (/analys|review|assess|audit|evaluat/.test(message)) return "analysis";
  if (/explain|what is|how does|tell me about/.test(message)) return "knowledge";
  return "decision_support";
}

// ═══════════════════════════════════════
// STEP 5: KAHU — Compliance Engine
// ═══════════════════════════════════════

interface ComplianceResult {
  passed: boolean;
  piiDetected: boolean;
  piiMasked: boolean;
  dataClassification: DataClassification;
  policies: string[];
  maskedMessage: string;
}

const PII_PATTERNS: { name: string; regex: RegExp; classification: DataClassification }[] = [
  { name: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, classification: "CONFIDENTIAL" },
  { name: "nz_phone", regex: /(?:\+?64|0)[- ]?[2-9]\d[- ]?\d{3}[- ]?\d{4}/g, classification: "CONFIDENTIAL" },
  { name: "ird_number", regex: /\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/g, classification: "RESTRICTED" },
  { name: "bank_account", regex: /\b\d{2}[- ]?\d{4}[- ]?\d{7,8}[- ]?\d{2,3}\b/g, classification: "RESTRICTED" },
  { name: "credit_card", regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g, classification: "RESTRICTED" },
  { name: "nz_passport", regex: /\b[A-Z]{1,2}\d{6}\b/g, classification: "RESTRICTED" },
];

function checkCompliance(message: string): ComplianceResult {
  let piiDetected = false;
  let maskedMessage = message;
  let highestClassification: DataClassification = "PUBLIC";
  const policies: string[] = ["privacy_act_2020"];

  for (const pattern of PII_PATTERNS) {
    if (pattern.regex.test(message)) {
      piiDetected = true;
      maskedMessage = maskedMessage.replace(pattern.regex, `[${pattern.name.toUpperCase()}_MASKED]`);
      if (classificationLevel(pattern.classification) > classificationLevel(highestClassification)) {
        highestClassification = pattern.classification;
      }
    }
    pattern.regex.lastIndex = 0; // reset global regex
  }

  // Check for health-related content
  if (/\b(health|medical|diagnosis|medication|prescription|mental health|disability)\b/i.test(message)) {
    policies.push("health_information_privacy_code");
    if (classificationLevel("CONFIDENTIAL") > classificationLevel(highestClassification)) {
      highestClassification = "CONFIDENTIAL";
    }
  }

  // Employment-related content
  if (/\b(salary|wage|kiwisaver|redundancy|grievance|disciplinary|performance review)\b/i.test(message)) {
    policies.push("employment_relations_act_2000");
  }

  // H&S related
  if (/\b(safety|hazard|incident|injury|worksafe|ppe)\b/i.test(message)) {
    policies.push("health_safety_at_work_act_2015");
  }

  return {
    passed: highestClassification !== "RESTRICTED", // Block RESTRICTED data from external models
    piiDetected,
    piiMasked: piiDetected,
    dataClassification: highestClassification,
    policies,
    maskedMessage: piiDetected ? maskedMessage : message,
  };
}

function classificationLevel(c: DataClassification): number {
  const levels: Record<DataClassification, number> = { PUBLIC: 0, INTERNAL: 1, CONFIDENTIAL: 2, RESTRICTED: 3 };
  return levels[c];
}

// ═══════════════════════════════════════
// STEP 7: MODEL ROUTER
// ═══════════════════════════════════════

interface ModelConfig {
  model: string;
  provider: "lovable" | "anthropic" | "gemini";
  maxTokens: number;
}

function selectModel(agent: AgentConfig, taskType: string, hasAttachments: boolean): ModelConfig {
  // Multimodal / real-time → Gemini
  if (hasAttachments) return { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: 4096 };

  // Compliance / legal / code → Claude
  if (["compliance", "calculation"].includes(taskType)) {
    return { model: "openai/gpt-5-mini", provider: "lovable", maxTokens: 4096 };
  }

  // Use agent's preferred model
  if (agent.primaryModel === "gemini") {
    return { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: 4096 };
  }

  return { model: "openai/gpt-5-mini", provider: "lovable", maxTokens: 4096 };
}

// ═══════════════════════════════════════
// COST ESTIMATION (NZD)
// ═══════════════════════════════════════

function estimateCost(model: string, inputTokens: number, outputTokens: number): { usd: number; nzd: number } {
  const rates: Record<string, { input: number; output: number }> = {
    "google/gemini-2.5-flash": { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
    "openai/gpt-5-mini": { input: 0.40 / 1_000_000, output: 1.60 / 1_000_000 },
  };
  const rate = rates[model] || { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 };
  const usd = (inputTokens * rate.input) + (outputTokens * rate.output);
  return { usd, nzd: usd * 1.65 }; // approximate USD→NZD
}

// ═══════════════════════════════════════
// MAIN HANDLER — 10-Step Pipeline
// ═══════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  try {
    // STEP 1: Parse request from Kanohi
    const body: IhoRequest = await req.json();
    const { message, agentId, packId, context } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 2: MANA — Access Control
    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let userId = "anonymous";
    let userRole: UserRole = "trial";
    let tenantId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) {
        userId = user.id;
        // Check tenant membership
        const { data: membership } = await sb.from("tenant_members").select("tenant_id, role").eq("user_id", user.id).limit(1).maybeSingle();
        if (membership) {
          tenantId = membership.tenant_id;
          userRole = membership.role as UserRole;
        }
      }
    }

    // Trial users: limited to 5 messages (check usage)
    if (userRole === "trial" && userId !== "anonymous") {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await sb.from("audit_log").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", today);
      if ((count || 0) >= 10) {
        return new Response(JSON.stringify({ error: "Trial limit reached (10 messages/day). Upgrade for unlimited access." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // STEP 3-4: IHO — Intent Classification & Agent Selection
    const intent = classifyIntent(message, agentId, packId);

    // STEP 5: KAHU — Compliance Check
    const compliance = checkCompliance(message);
    if (!compliance.passed) {
      // Log blocked request
      await sb.from("audit_log").insert({
        request_id: requestId, user_id: userId, tenant_id: tenantId,
        agent_code: intent.agent.code, agent_name: intent.agent.name, pack_id: intent.agent.pack,
        model_used: "blocked", compliance_passed: false, data_classification: compliance.dataClassification,
        pii_detected: true, pii_masked: true, policies_checked: compliance.policies,
        request_summary: message.substring(0, 100), error_message: "Blocked: restricted data detected",
        duration_ms: Date.now() - startTime,
      });
      return new Response(JSON.stringify({
        error: "Request blocked by compliance engine (Kahu). Restricted data detected.",
        complianceStatus: { passed: false, dataClassification: compliance.dataClassification },
      }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 6: MAHARA — Retrieve Business Context
    let businessContext = "";
    if (userId !== "anonymous") {
      const { data: memories } = await sb.from("business_memory")
        .select("content, category, relevance_score")
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("relevance_score", { ascending: false })
        .limit(5);

      if (memories?.length) {
        businessContext = "\n\nBUSINESS CONTEXT (from Mahara):\n" +
          memories.map(m => `[${m.category}] ${m.content}`).join("\n");
      }
    }

    // STEP 7: MODEL ROUTER — Select AI Model
    const hasAttachments = false; // future: detect from request
    const modelConfig = selectModel(intent.agent, intent.taskType, hasAttachments);

    // STEP 8: CALL AI MODEL
    const safeMessage = compliance.piiDetected ? compliance.maskedMessage : message;
    const systemPrompt = buildSystemPrompt(intent.agent, businessContext);

    const messages = [
      { role: "system", content: systemPrompt },
      ...(context?.previousMessages || []),
      { role: "user", content: safeMessage },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({ model: modelConfig.model, messages, max_completion_tokens: modelConfig.maxTokens }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI model error (${aiResponse.status}): ${errText}`);
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content || "I couldn't generate a response.";
    const usage = aiData.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const cost = estimateCost(modelConfig.model, inputTokens, outputTokens);
    const durationMs = Date.now() - startTime;

    // STEP 9: TĀ — Audit Log
    await sb.from("audit_log").insert({
      request_id: requestId, user_id: userId, tenant_id: tenantId,
      agent_code: intent.agent.code, agent_name: intent.agent.name, pack_id: intent.agent.pack,
      model_used: modelConfig.model, input_tokens: inputTokens, output_tokens: outputTokens,
      total_tokens: totalTokens, cost_nzd: cost.nzd,
      compliance_passed: compliance.passed, data_classification: compliance.dataClassification,
      pii_detected: compliance.piiDetected, pii_masked: compliance.piiMasked,
      policies_checked: compliance.policies,
      request_summary: message.substring(0, 200), response_summary: responseContent.substring(0, 200),
      duration_ms: durationMs,
    }).then(() => {}).catch(e => console.error("Audit log error:", e));

    // STEP 10: MAHARA — Store Context
    if (userId !== "anonymous" && responseContent.length > 50) {
      // Extract and store key context from this interaction
      const contextCategory = intent.taskType === "compliance" ? "decision_log"
        : intent.taskType === "content_generation" ? "process_template"
        : "project_context";

      await sb.from("business_memory").insert({
        user_id: userId, tenant_id: tenantId,
        category: contextCategory,
        tags: [intent.agent.name.toLowerCase(), intent.agent.pack, intent.taskType],
        content: `[${intent.agent.name}] Q: ${message.substring(0, 100)}... A: ${responseContent.substring(0, 200)}...`,
        relevance_score: 0.7,
        ttl_days: 90,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }).then(() => {}).catch(e => console.error("Mahara store error:", e));
    }

    // RESPONSE — Return to Kanohi
    const response: IhoResponse = {
      response: responseContent,
      agentUsed: { code: intent.agent.code, name: intent.agent.name, pack: intent.agent.pack, model: modelConfig.model },
      modelUsed: modelConfig.model,
      tokensUsed: { input: inputTokens, output: outputTokens, total: totalTokens },
      cost: { usd: cost.usd, nzdAmount: cost.nzd },
      complianceStatus: {
        passed: compliance.passed,
        piiDetected: compliance.piiDetected,
        piiMasked: compliance.piiMasked,
        dataClassification: compliance.dataClassification,
        policies: compliance.policies,
      },
      auditLog: {
        requestId, timestamp: new Date().toISOString(),
        agentId: intent.agent.code, modelUsed: modelConfig.model,
        tokensUsed: totalTokens, costNZD: cost.nzd,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Iho router error:", error);
    return new Response(JSON.stringify({
      error: "Pipeline error. The Iho brain encountered an issue.",
      detail: error instanceof Error ? error.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// ═══════════════════════════════════════
// SYSTEM PROMPT BUILDER
// ═══════════════════════════════════════

function buildSystemPrompt(agent: AgentConfig, businessContext: string): string {
  return `You are ${agent.name} (${agent.code}), a specialist AI agent in the Assembl platform, part of the ${agent.pack.toUpperCase()} industry pack.

ROLE: You are an expert in ${agent.skills.join(", ")}. You operate with deep New Zealand business expertise.

AOTEAROA INTELLIGENCE:
- Reference specific NZ Acts with section numbers where relevant
- Current minimum wage: $23.95/hr (from 1 April 2026)
- KiwiSaver employer minimum: 3.5% (from 1 April 2026, now includes 16-17 year olds)
- GST: 15%, Company tax: 28%, Trust tax: 39%
- Always use correct macrons: Māori, whānau, Kāinga Ora, Tāmaki Makaurau
- NZ English: colour, organise, licence (noun), centre, programme

VOICE:
You are not a textbook. You are the friend who happens to know the subject really well.
- Use conversational NZ English: "No worries", "Sweet as", "That's a tricky one", "Keen?"
- Start with the plain answer, then add the legal/technical backing
- Don't lead with section numbers — lead with what the person needs to know
- Use "you" and "your" — talk to them, not about the law
- If something is genuinely complicated, say so: "This one's a bit of a minefield, actually"
- Light humour is fine: "The Holidays Act is... not exactly beach reading"
- Mirror the user's language and energy. Ask before you assume.
- Frame solutions as collaborative: "What if we..." not "You should..."
- Use the Depth Ladder: headline → context → detail → edge → system

BOUNDARY FORMULA:
"That's the general rule — but your specific situation might be different. If [specific circumstance they mentioned], it's worth getting advice from [specific resource]."
NEVER say "I'm just an AI and can't provide legal advice."
INSTEAD say "I can tell you what the law says, but if you're in a tricky spot, [specific next step]."

TONE: Like texting a smart colleague. Contractions. Short paragraphs. Dry Kiwi humour. 'Keen?' over 'Would you like to?'

NEVER say "As an AI" or "I'm just a tool". You are a specialist.
${businessContext}`;
}
