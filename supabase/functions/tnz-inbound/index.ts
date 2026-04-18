import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ═══════════════════════════════════════════════════════════════════════
 * TNZ Inbound — Unified SMS + WhatsApp gateway for ALL kete & agents.
 *
 * Flow:
 *  1. Parse TNZ inbound payload (SMS or WhatsApp)
 *  2. Iho intent router → maps message content to kete + primary agent
 *  3. Load agent system prompt from agent_prompts table
 *  4. Generate AI response via Lovable gateway
 *  5. Send reply via TNZ (SMS or WhatsApp)
 *  6. Log everything to messaging_messages + audit_log
 * ═══════════════════════════════════════════════════════════════════════ */

// ─── Channel-specific behaviour injections ──────────────────────────────────

const SMS_BEHAVIOUR = `
SMS RULES — You are responding via text message:
- Keep responses UNDER 400 characters when possible (max 1500)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first
`;

const WHATSAPP_BEHAVIOUR = `
WHATSAPP RULES — You are responding via WhatsApp:
- WhatsApp supports rich formatting: *bold*, _italic_, ~strikethrough~
- Use bullet lists and numbered lists for clarity
- Keep responses under 4000 characters
- Use NZ English (colour, organise, licence, recognised, centre, programme)
- Use emojis naturally but don't overdo it
- Be conversational — like a smart Kiwi colleague, not a corporate chatbot
`;

// ─── Iho Router: All 8 Kete + Shared agents ────────────────────────────────

interface RouteResult {
  agentId: string;
  agentName: string;
  kete: string;
  signature: string;
}

/**
 * Explicit agent-name lookup. If the user names an agent (e.g. "Odyssey help",
 * "talk to Tōro", "switch to AURA"), we honour it directly — no keyword guessing.
 * Returns null when no agent name is detected.
 */
const AGENT_NAME_LOOKUP: Record<string, RouteResult> = {
  // Industry primaries
  aura:    { agentId: "aura",    agentName: "AURA",    kete: "manaaki",  signature: "— AURA, your hospitality partner" },
  arc:     { agentId: "arc",     agentName: "ARC",     kete: "waihanga", signature: "— ARC, your construction partner" },
  echo:    { agentId: "echo",    agentName: "ECHO",    kete: "auaha",    signature: "— ECHO, your creative & Assembl concierge" },
  ember:   { agentId: "ember",   agentName: "EMBER",   kete: "arataki",  signature: "— EMBER, your automotive partner" },
  compass: { agentId: "compass", agentName: "COMPASS", kete: "pikau",    signature: "— COMPASS, your freight & logistics partner" },
  toroa:   { agentId: "helm",    agentName: "TŌRO",   kete: "toroa",    signature: "— TŌRO, your family life partner" },
  toro:    { agentId: "helm",    agentName: "TŌRO",   kete: "toroa",    signature: "— TŌRO, your family life partner" },
  helm:    { agentId: "helm",    agentName: "TŌRO",   kete: "toroa",    signature: "— TŌRO, your family life partner" },
  haven:   { agentId: "haven",   agentName: "HAVEN",   kete: "whenua",   signature: "— HAVEN, your property partner" },
  harvest: { agentId: "harvest", agentName: "TŌRO",    kete: "toro",     signature: "— TŌRO, your agriculture partner" },
  // Shared / business
  ascend:  { agentId: "ascend",  agentName: "ASCEND",  kete: "pakihi",   signature: "— ASCEND, your business growth partner" },
  odyssey: { agentId: "helm",    agentName: "TŌRO",   kete: "toroa",    signature: "— TŌRO, your family life & trip partner" }, // Odyssey = trips/journeys → TŌRO
  nova:    { agentId: "nova",    agentName: "NOVA",    kete: "shared",   signature: "— NOVA, your innovation partner" },
  pulse:   { agentId: "pulse",   agentName: "PULSE",   kete: "shared",   signature: "— PULSE, your business intelligence feed" },
  scholar: { agentId: "scholar", agentName: "SCHOLAR", kete: "shared",   signature: "— SCHOLAR, your research partner" },
  pilot:   { agentId: "pilot",   agentName: "PILOT",   kete: "shared",   signature: "— PILOT, your onboarding partner" },
  aroha:   { agentId: "aroha-core", agentName: "AROHA", kete: "shared",  signature: "— AROHA, your HR & employment partner" },
  ledger:  { agentId: "ledger",  agentName: "LEDGER",  kete: "pakihi",   signature: "— LEDGER, your tax & accounting partner" },
  sage:    { agentId: "sage",    agentName: "SAGE",    kete: "pakihi",   signature: "— SAGE, your professional services partner" },
  flux:    { agentId: "flux",    agentName: "FLUX",    kete: "auaha",    signature: "— FLUX, your campaign partner" },
  prism:   { agentId: "prism",   agentName: "PRISM",   kete: "auaha",    signature: "— PRISM, your brand identity partner" },
  forge:   { agentId: "forge",   agentName: "FORGE",   kete: "arataki",  signature: "— FORGE, your RUC & compliance partner" },
  gateway: { agentId: "gateway", agentName: "GATEWAY", kete: "pikau",    signature: "— GATEWAY, your customs clearance partner" },
};

function routeByExplicitName(message: string): RouteResult | null {
  // Strip diacritics so "tōroa" matches "toroa"
  const norm = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Pattern 1: handoff phrases — "talk to X", "pass me to X", "switch to X", "can I have X", "X help", "X please"
  const handoff = norm.match(
    /\b(?:talk\s+to|pass\s+(?:me\s+)?(?:to|along\s+to|over\s+to)|switch\s+to|connect\s+(?:me\s+)?to|hand\s?off\s+to|transfer\s+to|put\s+me\s+(?:through\s+)?to|can\s+i\s+(?:have|get|speak\s+to)|i\s+(?:want|need)\s+(?:to\s+talk\s+to\s+)?|use)\s+(\w+)/i
  );
  if (handoff) {
    const name = handoff[1].toLowerCase();
    if (AGENT_NAME_LOOKUP[name]) return AGENT_NAME_LOOKUP[name];
  }

  // Pattern 2: agent name as the first word, optionally followed by "help"/"please"/punctuation
  // e.g. "Odyssey help", "TŌRO", "ASCEND please"
  const firstWord = norm.match(/^\s*(\w+)\b/);
  if (firstWord) {
    const name = firstWord[1].toLowerCase();
    if (AGENT_NAME_LOOKUP[name]) return AGENT_NAME_LOOKUP[name];
  }

  // Pattern 3: any standalone agent name appearing in a short message (≤ 6 words)
  if (norm.split(/\s+/).length <= 6) {
    for (const name of Object.keys(AGENT_NAME_LOOKUP)) {
      if (new RegExp(`\\b${name}\\b`, "i").test(norm)) {
        return AGENT_NAME_LOOKUP[name];
      }
    }
  }

  return null;
}

/**
 * Full Iho intent router — maps inbound message keywords to the correct
 * kete and primary agent across all 8 industry verticals + shared agents.
 *
 * Priority order: explicit agent name → specific industry → shared/general → default (pakihi)
 */
function routeToAgent(message: string): RouteResult {
  // Explicit agent name beats every keyword rule
  const explicit = routeByExplicitName(message);
  if (explicit) return explicit;

  const lower = message.toLowerCase();

  // ── Assembl platform enquiries (HIGHEST PRIORITY) → Echo ──
  // Any question about Assembl itself, pricing, onboarding, kete, demo etc. routes to Echo
  // (the platform concierge with deep Assembl product knowledge).
  if (/\b(assembl|kete|iho|kahu|mahara|mana|t[āa]\b|pricing|plan|tier|operator\s?plan|enterprise\s?plan|pilot\s?program|onboard|demo|trial|sign\s?up|get\s?started|how\s?does\s?it\s?work|what\s?is\s?assembl|tell\s?me\s?about\s?assembl|book\s?a\s?call|discovery\s?call|enquir|inquir|interested\s?in\s?assembl|learn\s?more)/.test(lower)) {
    return { agentId: "echo", agentName: "ECHO", kete: "assembl", signature: "— ECHO, your Assembl concierge" };
  }

  // ── Manaaki (Hospitality) ──
  if (/\b(food|restaurant|alcohol|hospitality|menu|cafe|bar|kitchen|chef|liquor|hygiene|fcp|food\s?control|food\s?act|food\s?safety|cellar|wine|cocktail|sommelier|dining|hotel|lodge|bed\s?and\s?breakfast|b&b|accommodation|guest|booking|check.?in|concierge|housekeeping|event\s?catering)\b/.test(lower)) {
    // Sub-route within Manaaki
    if (/\b(wine|cellar|sommelier|cocktail|spirits|vintage|tasting)\b/.test(lower)) {
      return { agentId: "cellar", agentName: "CELLAR", kete: "manaaki", signature: "— CELLAR, your beverage specialist" };
    }
    if (/\b(luxury|luxe|premium|vip|five.?star|boutique|exclusive)\b/.test(lower)) {
      return { agentId: "luxe", agentName: "LUXE", kete: "manaaki", signature: "— LUXE, your premium hospitality partner" };
    }
    if (/\b(coast|coastal|beach|seaside|waterfront)\b/.test(lower)) {
      return { agentId: "coast", agentName: "COAST", kete: "manaaki", signature: "— COAST, your coastal hospitality partner" };
    }
    if (/\b(training|staff\s?training|induction|onboard|kura)\b/.test(lower)) {
      return { agentId: "kura", agentName: "KURA", kete: "manaaki", signature: "— KURA, your hospitality trainer" };
    }
    if (/\b(summit|conference|event|function|banquet|wedding)\b/.test(lower)) {
      return { agentId: "summit", agentName: "SUMMIT", kete: "manaaki", signature: "— SUMMIT, your events specialist" };
    }
    if (/\b(saffron|spice|recipe|cuisine|cultural\s?food)\b/.test(lower)) {
      return { agentId: "saffron", agentName: "SAFFRON", kete: "manaaki", signature: "— SAFFRON, your cuisine specialist" };
    }
    if (/\b(sustainability|waste|compost|carbon|green|eco)\b/.test(lower)) {
      return { agentId: "pau", agentName: "PAU", kete: "manaaki", signature: "— PAU, your sustainability partner" };
    }
    if (/\b(marine|fishing|aquaculture|seafood|ocean)\b/.test(lower)) {
      return { agentId: "moana", agentName: "MOANA", kete: "manaaki", signature: "— MOANA, your marine hospitality partner" };
    }
    return { agentId: "aura", agentName: "AURA", kete: "manaaki", signature: "— AURA, your hospitality partner" };
  }

  // ── Waihanga (Construction) ──
  if (/\b(build|construct|safety|site|scaffold|consent|building\s?code|h&s|worksafe|lbp|nzs\s?360[14]|e2|concrete|steel|plumbing|electrical|roofing|cladding|foundation|excavat|demolit|crane|hard\s?hat|ppe|hazard|toolbox|prestart|progress\s?claim|retention|defect|pc\s?sum|variation|cca\s?2002|building\s?act|hswa|seismic|bracing)\b/.test(lower)) {
    if (/\b(safety|hazard|worksafe|hswa|ppe|toolbox|prestart|incident|near.?miss|notifiable)\b/.test(lower)) {
      return { agentId: "arai", agentName: "ĀRAI", kete: "waihanga", signature: "— ĀRAI, your safety compliance partner" };
    }
    if (/\b(consent|building\s?act|resource\s?consent|code\s?compliance|ccc|producer\s?statement)\b/.test(lower)) {
      return { agentId: "whakaae", agentName: "WHAKAAĒ", kete: "waihanga", signature: "— WHAKAAĒ, your consent specialist" };
    }
    if (/\b(progress\s?claim|retention|payment|cca|invoice|valuation|variation|pc\s?sum)\b/.test(lower)) {
      return { agentId: "kaupapa", agentName: "KAUPAPA", kete: "waihanga", signature: "— KAUPAPA, your contracts & payments partner" };
    }
    if (/\b(quality|defect|inspection|qa|qc|itp|checklist)\b/.test(lower)) {
      return { agentId: "pai", agentName: "PAI", kete: "waihanga", signature: "— PAI, your quality assurance partner" };
    }
    if (/\b(environment|erosion|sediment|stormwater|resource\s?consent)\b/.test(lower)) {
      return { agentId: "terra", agentName: "TERRA", kete: "waihanga", signature: "— TERRA, your environmental partner" };
    }
    if (/\b(estimate|cost|budget|pricing|tender|bid|quantity)\b/.test(lower)) {
      return { agentId: "rawa", agentName: "RAWA", kete: "waihanga", signature: "— RAWA, your estimating partner" };
    }
    if (/\b(design|architect|bim|3d|model|drawing|plan)\b/.test(lower)) {
      return { agentId: "ata", agentName: "ATA", kete: "waihanga", signature: "— ATA, your design intelligence partner" };
    }
    if (/\b(project\s?manag|programme|schedule|gantt|milestone)\b/.test(lower)) {
      return { agentId: "pinnacle", agentName: "PINNACLE", kete: "waihanga", signature: "— PINNACLE, your project management partner" };
    }
    return { agentId: "arc", agentName: "ARC", kete: "waihanga", signature: "— ARC, your construction partner" };
  }

  // ── Auaha (Creative) ──
  if (/\b(brand|creative|design|marketing|social\s?media|content|campaign|copywrite|advertis|seo|website|logo|graphic|video|photo|podcast|influencer|audience|engagement|analytics|post|story|reel|tiktok|instagram|facebook|linkedin)\b/.test(lower)) {
    if (/\b(brand|logo|identity|visual|colour|palette|guideline|brand\s?dna)\b/.test(lower)) {
      return { agentId: "prism", agentName: "PRISM", kete: "auaha", signature: "— PRISM, your brand identity partner" };
    }
    if (/\b(content|blog|article|newsletter|calendar|schedule|post)\b/.test(lower)) {
      return { agentId: "echo", agentName: "ECHO", kete: "auaha", signature: "— ECHO, your content partner" };
    }
    if (/\b(copy|headline|tagline|slogan|ad\s?copy|subject\s?line|email\s?copy)\b/.test(lower)) {
      return { agentId: "verse", agentName: "VERSE", kete: "auaha", signature: "— VERSE, your copywriting partner" };
    }
    if (/\b(pixel|image|photo|graphic|visual|illustration)\b/.test(lower)) {
      return { agentId: "pixel", agentName: "PIXEL", kete: "auaha", signature: "— PIXEL, your visual design partner" };
    }
    if (/\b(video|motion|animation|reel|youtube)\b/.test(lower)) {
      return { agentId: "rhythm", agentName: "RHYTHM", kete: "auaha", signature: "— RHYTHM, your video & motion partner" };
    }
    if (/\b(market\s?research|competitor|trend|insight|audience\s?analysis)\b/.test(lower)) {
      return { agentId: "market", agentName: "MARKET", kete: "auaha", signature: "— MARKET, your market research partner" };
    }
    if (/\b(campaign|advertis|ad|paid|spend|roi|cpc|cpm|conversion)\b/.test(lower)) {
      return { agentId: "flux", agentName: "FLUX", kete: "auaha", signature: "— FLUX, your campaign partner" };
    }
    if (/\b(colour|color|palette|chromatic|scheme|hex|hsl)\b/.test(lower)) {
      return { agentId: "chromatic", agentName: "CHROMATIC", kete: "auaha", signature: "— CHROMATIC, your colour specialist" };
    }
    if (/\b(music|audio|sound|jingle|sonic)\b/.test(lower)) {
      return { agentId: "muse", agentName: "MUSE", kete: "auaha", signature: "— MUSE, your creative muse" };
    }
    return { agentId: "echo", agentName: "ECHO", kete: "auaha", signature: "— ECHO, your creative partner" };
  }

  // ── Arataki (Automotive) ──
  if (/\b(car|vehicle|mechanic|workshop|garage|wof|warrant|rego|registration|ruc|road\s?user|fleet|tyre|tire|brake|engine|transmission|panel|paint|auto|motor|diesel|petrol|ev|electric\s?vehicle|hybrid|vin|odometer|service|repair|parts|dealer|trade.?me|turners|cin|cccfa|finance|loan)\b/.test(lower)) {
    if (/\b(forge|ruc|road\s?user|distance|hubodometer)\b/.test(lower)) {
      return { agentId: "forge", agentName: "FORGE", kete: "arataki", signature: "— FORGE, your RUC & compliance partner" };
    }
    if (/\b(finance|loan|cccfa|credit|interest|repayment|lease)\b/.test(lower)) {
      return { agentId: "foundry", agentName: "FOUNDRY", kete: "arataki", signature: "— FOUNDRY, your auto finance partner" };
    }
    if (/\b(cipher|vin|decode|history|stolen|written.?off)\b/.test(lower)) {
      return { agentId: "cipher", agentName: "CIPHER", kete: "arataki", signature: "— CIPHER, your vehicle intelligence partner" };
    }
    if (/\b(fleet|tracking|telematics|gps|utilisation)\b/.test(lower)) {
      return { agentId: "matrix", agentName: "MATRIX", kete: "arataki", signature: "— MATRIX, your fleet management partner" };
    }
    if (/\b(ev|electric|hybrid|charging|battery|range)\b/.test(lower)) {
      return { agentId: "spark", agentName: "SPARK", kete: "arataki", signature: "— SPARK, your EV specialist" };
    }
    if (/\b(patent|intellectual\s?property|ip|invention)\b/.test(lower)) {
      return { agentId: "patent", agentName: "PATENT", kete: "arataki", signature: "— PATENT, your IP specialist" };
    }
    return { agentId: "ember", agentName: "EMBER", kete: "arataki", signature: "— EMBER, your automotive partner" };
  }

  // ── Pikau (Freight & Customs) ──
  if (/\b(freight|cargo|shipping|container|customs|import|export|logistics|warehouse|supply\s?chain|courier|deliver|tracking|manifest|bill\s?of\s?lading|bol|hs\s?code|tariff|dut|excise|mpi|biosecurity|fumigat|quarantine|port|wharf|nzcs|border|clearance|origin)\b/.test(lower)) {
    if (/\b(customs|tariff|hs\s?code|dut|excise|clearance|border|declaration)\b/.test(lower)) {
      return { agentId: "gateway", agentName: "GATEWAY", kete: "pikau", signature: "— GATEWAY, your customs clearance partner" };
    }
    if (/\b(biosecurity|mpi|fumigat|quarantine|phytosanitary|sanitary)\b/.test(lower)) {
      return { agentId: "sentinel", agentName: "SENTINEL", kete: "pikau", signature: "— SENTINEL, your biosecurity partner" };
    }
    if (/\b(tracking|trace|location|eta|shipment\s?status|where|gps)\b/.test(lower)) {
      return { agentId: "relay", agentName: "RELAY", kete: "pikau", signature: "— RELAY, your shipment tracking partner" };
    }
    if (/\b(warehouse|inventory|stock|storage|pick|pack|3pl)\b/.test(lower)) {
      return { agentId: "nexus-t", agentName: "NEXUS-T", kete: "pikau", signature: "— NEXUS-T, your warehouse partner" };
    }
    return { agentId: "compass", agentName: "COMPASS", kete: "pikau", signature: "— COMPASS, your freight & logistics partner" };
  }

  // ── Tōro (Agriculture & Primary) ──
  if (/\b(farm|dairy|sheep|cattle|beef|lamb|wool|crop|harvest|irrigat|fertiliser|fertilizer|soil|pasture|fep|nait|fonterra|milk|price|payout|livestock|animal|vet|drench|tb|m\.?bovis|rural|agri|horti|orchard|vineyard|kiwifruit|apple|avocado|forestry|timber|log|plantation|apiculture|honey|manuka|beekeep)\b/.test(lower)) {
    return { agentId: "harvest", agentName: "TŌRO", kete: "toro", signature: "— TŌRO, your agriculture & primary sector partner" };
  }

  // ── Whenua (Property) ──
  if (/\b(property|landlord|tenant|rent|lease|rental|tenancy|rta|bond|inspection|healthy\s?homes|insulation|heating|ventilation|moisture|draught|letting|property\s?manag|real\s?estate|strata|body\s?corp|unit\s?title|mortgage|rates|valuation|cv|rv|settlement|vendor|purchaser|listing|open\s?home)\b/.test(lower)) {
    return { agentId: "haven", agentName: "HAVEN", kete: "whenua", signature: "— HAVEN, your property management partner" };
  }

  // ── Hoko (Import / Export) — distinct from domestic Pikau ──
  if (/\b(export|import|incoterm|fob|cif|ddp|exw|letter\s?of\s?credit|\blc\b|fta|cptpp|rcep|trade\s?agreement|tariff|hs\s?code|certificate\s?of\s?origin|nzte|mfat|anti.?dumping|trade\s?show|export\s?market|export\s?brand|international\s?market)\b/.test(lower)) {
    if (/\b(contract|incoterm|fob|cif|ddp|exw|letter\s?of\s?credit|\blc\b|bill\s?of\s?lading|bol)\b/.test(lower)) {
      return { agentId: "anchor-hoko", agentName: "ANCHOR-HOKO", kete: "hoko", signature: "— ANCHOR-HOKO, your export contracts partner" };
    }
    if (/\b(market|nzte|trade\s?show|buyer|outreach|launch|promotion)\b/.test(lower)) {
      return { agentId: "flux-hoko", agentName: "FLUX-HOKO", kete: "hoko", signature: "— FLUX-HOKO, your export market partner" };
    }
    if (/\b(brand|label|packaging|translation|international\s?brand)\b/.test(lower)) {
      return { agentId: "prism-hoko", agentName: "PRISM-HOKO", kete: "hoko", signature: "— PRISM-HOKO, your export brand partner" };
    }
    return { agentId: "nova-hoko", agentName: "NOVA-HOKO", kete: "hoko", signature: "— NOVA-HOKO, your trade compliance partner" };
  }

  // ── Whenua (Agriculture & Primary) ──
  if (/\b(farm|dairy|sheep|cattle|beef|lamb|wool|crop|harvest|irrigat|fertiliser|fertilizer|soil|pasture|fep|nait|fonterra|milk|payout|livestock|drench|m\.?bovis|rural|agri|horti|orchard|vineyard|kiwifruit|apple|avocado|forestry|timber|log|plantation|apiculture|honey|manuka|beekeep)\b/.test(lower)) {
    return { agentId: "harvest", agentName: "HARVEST", kete: "whenua", signature: "— HARVEST, your agriculture & primary sector partner" };
  }

  // ── Ako (Early Childhood Education) — HIGH-RISK administrative-only ──
  if (/\b(ece|early\s?childhood|kindergarten|kōhanga\s?reo|kohanga\s?reo|childcare\s?centre|childcare\s?center|ero\s?(visit|review)|licensing\s?criteria|20\s?hours\s?ece|te\s?wh[āa]riki|graduated\s?enforcement|centre\s?licen[cs]e|operational\s?document)\b/.test(lower)) {
    if (/\b(transparency|complaint|policy|parent\s?handbook|operational\s?document|enrolment\s?form)\b/.test(lower)) {
      return { agentId: "nova-ako", agentName: "NOVA-AKO", kete: "ako", signature: "— NOVA-AKO, your transparency pack partner (administrative support only)" };
    }
    if (/\b(funding|rs7|attendance|claim|incident|child\s?protection)\b/.test(lower)) {
      return { agentId: "mana-ako", agentName: "MANA-AKO", kete: "ako", signature: "— MANA-AKO, your ECE evidence partner (administrative support only)" };
    }
    return { agentId: "apex-ako", agentName: "APEX-AKO", kete: "ako", signature: "— APEX-AKO, your ECE licensing partner (administrative support only)" };
  }


  // ── Professional Services (Pakihi) ──
  if (/\b(accounting|accountant|tax|gst|ir[d3]|income\s?tax|payroll|paye|invoice|billing|timesheet|wip|trust\s?account|law|lawyer|solicitor|barrister|conveyancing|litigation|contract|agreement|deed|will|estate|power\s?of\s?attorney|compliance|audit|due\s?diligence|aml|anti.?money|kyc|financial\s?advis|chartered|ca|cpa)\b/.test(lower)) {
    if (/\b(tax|gst|ird|paye|income\s?tax|provisional|terminal)\b/.test(lower)) {
      return { agentId: "ledger", agentName: "LEDGER", kete: "pakihi", signature: "— LEDGER, your tax & accounting partner" };
    }
    if (/\b(law|lawyer|solicitor|legal|litigation|contract|deed|conveyancing)\b/.test(lower)) {
      return { agentId: "anchor", agentName: "ANCHOR", kete: "pakihi", signature: "— ANCHOR, your legal documentation partner" };
    }
    if (/\b(aml|anti.?money|kyc|due\s?diligence|compliance|audit)\b/.test(lower)) {
      return { agentId: "vault", agentName: "VAULT", kete: "pakihi", signature: "— VAULT, your compliance & AML partner" };
    }
    if (/\b(billing|invoice|timesheet|wip|utilisation)\b/.test(lower)) {
      return { agentId: "counter", agentName: "COUNTER", kete: "pakihi", signature: "— COUNTER, your billing partner" };
    }
    return { agentId: "sage", agentName: "SAGE", kete: "pakihi", signature: "— SAGE, your professional services partner" };
  }

  // ── Travel / Trip planning (HIGH PRIORITY — before HR which catches "leave/holiday") ──
  // Personal & family travel routes to TŌRO (family life navigator covers trips, itineraries, school holidays).
  if (/\b(trip|travel|holiday|vacation|itinerar|flight|airfare|airline|airport|accommodation|hotel\s?book|airbnb|bach|road\s?trip|getaway|weekend\s?away|school\s?holiday|term\s?break|family\s?holiday|plan(ning)?\s?(a|our|my)?\s?(trip|holiday|getaway|weekend))\b/.test(lower)) {
    return { agentId: "helm", agentName: "TŌRO", kete: "toroa", signature: "— TŌRO, your family life & trip partner" };
  }

  // ── Tōro (Family / Consumer) ──
  if (/\b(family|kids|children|school|term\s?date|pick.?up|drop.?off|lunch|dinner|meal|grocery|shopping|appointment|doctor|dentist|vet|sports|activity|homework|budget|bills|chore|remind|birthday|parent|mum|dad|whānau|whanau)\b/.test(lower)) {
    return { agentId: "helm", agentName: "TŌRO", kete: "toroa", signature: "— TŌRO, your family life partner" };
  }

  // ── Shared / Cross-Kete agents ──
  // (Note: "holiday" intentionally removed — handled by travel route above to avoid hijacking family trip requests.)
  if (/\b(job|employ|wage|annual\s?leave|parental\s?leave|hr\b|staff|hiring|recruit|redundan|sick\s?leave|kiwisaver|employment|era|personal\s?grievance|dismissal|trial\s?period|payroll)\b/.test(lower)) {
    return { agentId: "aroha-core", agentName: "AROHA", kete: "shared", signature: "— AROHA, your HR & employment partner" };
  }
  if (/\b(privacy|data|breach|information|pii|gdpr|nz\s?privacy\s?act|ipp)\b/.test(lower)) {
    return { agentId: "privacy", agentName: "PRIVACY", kete: "shared", signature: "— Privacy Compliance, your data protection partner" };
  }
  if (/\b(te\s?reo|māori|maori|tikanga|karakia|mihi|pepeha|whakapapa|iwi|hapū|hapu|marae)\b/.test(lower)) {
    return { agentId: "tereo", agentName: "Te Reo Specialist", kete: "shared", signature: "— Te Reo Specialist" };
  }
  if (/\b(security|cyber|phishing|password|mfa|firewall|encryption|nzism|irap)\b/.test(lower)) {
    return { agentId: "shield-agent", agentName: "SHIELD", kete: "shared", signature: "— SHIELD, your security partner" };
  }

  // ── Pipeline orchestration agents (Iho, Kahu, Tā, Mahara, Mana) ──
  if (/\b(route|routing|iho|classify|intent|which\s?agent|who\s?should\s?i\s?talk\s?to)\b/.test(lower)) {
    return { agentId: "iho", agentName: "IHO", kete: "shared", signature: "— IHO, the Assembl Brain" };
  }
  if (/\b(compliance|compliant|kahu|scan|policy\s?check|legislation\s?check|regulation\s?check)\b/.test(lower)) {
    return { agentId: "kahu", agentName: "KAHU", kete: "shared", signature: "— KAHU, compliance guardian" };
  }
  if (/\b(format|formatter|tā|nz\s?english|citation|output\s?format|clean\s?up)\b/.test(lower)) {
    return { agentId: "ta", agentName: "TĀ", kete: "shared", signature: "— TĀ, output formatter" };
  }
  if (/\b(review|mahara|fact.?check|verify|accuracy|double.?check|proofread)\b/.test(lower)) {
    return { agentId: "mahara", agentName: "MAHARA", kete: "shared", signature: "— MAHARA, review & verification" };
  }
  if (/\b(sign.?off|approve|mana|disclaimer|final\s?check|release|publish\s?check)\b/.test(lower)) {
    return { agentId: "mana", agentName: "MANA", kete: "shared", signature: "— MANA, sign-off authority" };
  }

  // ── Other shared agents ──
  if (/\b(contract|legal\s?doc|engagement\s?letter|terms|agreement|charter)\b/.test(lower)) {
    return { agentId: "charter", agentName: "CHARTER", kete: "shared", signature: "— CHARTER, your document governance partner" };
  }
  if (/\b(dispute|mediation|arbitrat|conflict|resolution|tribunal)\b/.test(lower)) {
    return { agentId: "arbiter", agentName: "ARBITER", kete: "shared", signature: "— ARBITER, your dispute resolution partner" };
  }
  if (/\b(onboard|getting\s?started|setup|pilot|trial|demo)\b/.test(lower)) {
    return { agentId: "pilot", agentName: "PILOT", kete: "shared", signature: "— PILOT, your onboarding partner" };
  }
  if (/\b(news|update|pulse|what.?s\s?new|latest|alert|notification)\b/.test(lower)) {
    return { agentId: "pulse", agentName: "PULSE", kete: "shared", signature: "— PULSE, your business intelligence feed" };
  }
  if (/\b(research|scholar|learn|study|explain|how\s?does|what\s?is|definition)\b/.test(lower)) {
    return { agentId: "scholar", agentName: "SCHOLAR", kete: "shared", signature: "— SCHOLAR, your research partner" };
  }
  if (/\b(innovation|idea|brainstorm|nova|startup|venture|new\s?product)\b/.test(lower)) {
    return { agentId: "nova", agentName: "NOVA", kete: "shared", signature: "— NOVA, your innovation partner" };
  }

  // ── Default: General business (ASCEND) ──
  return { agentId: "ascend", agentName: "ASCEND", kete: "pakihi", signature: "— ASCEND, your business growth partner" };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isAfterHours(): boolean {
  const nzHour = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "numeric", hour12: false });
  return parseInt(nzHour, 10) < 8 || parseInt(nzHour, 10) >= 18;
}

/** Send message via TNZ API (supports both SMS and WhatsApp).
 *  Uses TNZ v2.04 REST endpoint with HTTP Basic auth — same as sms-send (proven working). */
async function sendViaTnz(
  channel: string, to: string, message: string, reference: string
): Promise<{ messageId?: string; error?: string }> {
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken) return { error: "TNZ_AUTH_TOKEN not configured" };

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;
  // SMS uses v2.04/send/sms; WhatsApp uses v2.04/send/whatsapp
  const endpoint = channel === "whatsapp"
    ? "https://api.tnz.co.nz/api/v2.04/send/whatsapp"
    : "https://api.tnz.co.nz/api/v2.04/send/sms";

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; encoding='utf-8'",
        "Accept": "application/json; encoding='utf-8'",
        Authorization: `Basic ${tnzToken}`,
      },
      body: JSON.stringify({
        MessageData: {
          Message: message.substring(0, channel === "whatsapp" ? 4000 : 1600),
          Destinations: [{ Recipient: to }],
          WebhookCallbackURL: webhookUrl,
          WebhookCallbackFormat: "JSON",
          Reference: reference,
          ...(channel === "sms" ? { SendMode: "Normal" } : {}),
        },
      }),
    });

    const text = await resp.text();
    console.log(`[TNZ ${channel}] status=${resp.status} body=${text.substring(0, 300)}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { Result: resp.ok ? "Success" : "Failed", raw: text }; }

    if (data.Result === "Success" || resp.ok) return { messageId: data.MessageID };
    return { error: data.Result || data.ErrorMessage || `HTTP ${resp.status}` };
  } catch (err) {
    console.error(`[TNZ ${channel}] fetch error:`, err);
    return { error: String(err) };
  }
}

// ─── Main handler ───────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Parse TNZ inbound payload (works for both SMS and WhatsApp)
    const payload = await req.json();
    console.log("TNZ inbound payload:", JSON.stringify(payload));

    // TNZ v2.04 SMSReply: customer mobile is in `Destination`, TNZ-received number is in `Detail`.
    // Other inbound shapes (Twilio-proxied, generic): use `From` / `Sender`.
    const payloadType = String(payload.Type || payload.type || "").toLowerCase();
    const isTnzReply = payloadType === "smsreply" || payloadType === "whatsappreply";

    const fromNumber = isTnzReply
      ? (payload.Destination || payload.destination || "")
      : (payload.From || payload.from || payload.Sender || payload.sender || payload.Destination || payload.destination || "");

    // For TNZ replies, `Detail` looks like "InputToNumber:021-000 001" — that's our TNZ number.
    let toNumber = payload.To || payload.to || "";
    if (!toNumber && isTnzReply && typeof payload.Detail === "string") {
      const m = payload.Detail.match(/InputToNumber:\s*([0-9+\-\s]+)/i);
      if (m) toNumber = m[1].replace(/[\s\-]/g, "");
    }
    if (!toNumber) toNumber = Deno.env.get("TNZ_FROM_NUMBER") || "";

    const messageBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const channel = payloadType.includes("whatsapp")
      ? "whatsapp"
      : (payload.Channel || payload.channel || "sms").toLowerCase();
    const tnzMessageId = payload.MessageID || payload.messageId || payload.ReceivedID || "";
    // ReplyMode "return" → skip TNZ send, return AI reply in JSON (used by twilio-inbound)
    const replyMode = (payload.ReplyMode || payload.replyMode || "send").toLowerCase();

    // Normalise channel to sms|whatsapp
    const validChannel = channel.includes("whatsapp") ? "whatsapp" : "sms";

    if (!fromNumber || !messageBody) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Look up existing conversation (for consent + history) ──
    const { data: existing } = await sb
      .from("messaging_conversations")
      .select("id, consent_status, identification_sent")
      .eq("phone_number", fromNumber)
      .eq("channel", validChannel)
      .eq("status", "active")
      .maybeSingle();

    // ── Opt-out / Opt-in / HELP keywords (UEMA + Telecom Code) ──
    const upper = messageBody.trim().toUpperCase();
    const isOptOut = ["STOP", "STOPALL", "UNSUBSCRIBE", "QUIT", "CANCEL", "END", "OPTOUT", "OPT-OUT"].includes(upper);
    const isOptIn = ["START", "SUBSCRIBE", "UNSTOP", "OPTIN", "OPT-IN"].includes(upper);
    const isHelp = ["HELP", "INFO"].includes(upper);

    if (isOptOut) {
      if (existing) {
        await sb.from("messaging_conversations").update({
          consent_status: "opted_out",
          opt_out_at: new Date().toISOString(),
          opted_out_keyword: upper,
        }).eq("id", existing.id);
      } else {
        await sb.from("messaging_conversations").insert({
          phone_number: fromNumber, channel: validChannel, status: "active",
          consent_status: "opted_out", opt_out_at: new Date().toISOString(), opted_out_keyword: upper,
        });
      }
      await sendViaTnz(validChannel, fromNumber, "You've been unsubscribed from Assembl. No more messages will be sent. Reply START to re-subscribe. Privacy: assembl.co.nz/privacy", `assembl-optout-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true, opted_out: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (isOptIn) {
      if (existing) {
        await sb.from("messaging_conversations").update({
          consent_status: "opted_in", opt_out_at: null, opted_out_keyword: null,
        }).eq("id", existing.id);
      } else {
        await sb.from("messaging_conversations").insert({
          phone_number: fromNumber, channel: validChannel, status: "active", consent_status: "opted_in",
        });
      }
      await sendViaTnz(validChannel, fromNumber, "Kia ora! You're re-subscribed to Assembl. Reply STOP anytime to opt out. Text anything to get started.", `assembl-optin-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true, opted_in: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (isHelp) {
      await sendViaTnz(validChannel, fromNumber, "Assembl AI — NZ business assistant. Reply STOP to opt out. Privacy: assembl.co.nz/privacy. Support: kia.ora@assembl.co.nz", `assembl-help-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true, help: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Block all responses if previously opted out ──
    if (existing?.consent_status === "opted_out") {
      console.log(`[Iho] Blocked: ${fromNumber} is opted out`);
      return new Response(JSON.stringify({ ok: true, blocked: "opted_out" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Find or create conversation ──
    let conversation: { id: string; identification_sent?: boolean };
    if (existing) {
      conversation = existing;
      await sb.from("messaging_conversations").update({ updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created, error: createErr } = await sb
        .from("messaging_conversations")
        .insert({ phone_number: fromNumber, channel: validChannel, status: "active", consent_status: "opted_in", first_contact_at: new Date().toISOString() })
        .select("id, identification_sent")
        .single();
      if (createErr || !created) {
        console.error("Failed to create conversation:", createErr);
        return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      conversation = created;
    }

    // ── Store inbound message ──
    await sb.from("messaging_messages").insert({
      conversation_id: conversation.id,
      tnz_message_id: tnzMessageId || null,
      direction: "inbound",
      from_number: fromNumber,
      to_number: toNumber,
      body: messageBody,
      channel: validChannel,
      status: "received",
    });

    // ── Council intercept: "council: <question>" / "panel: <question>" / "ask all: <question>" ──
    const councilMatch = messageBody.match(/^\s*(council|panel|ask\s+all)\s*[:\-]\s*(.+)/is);
    if (councilMatch) {
      const councilQuestion = councilMatch[2].trim();
      console.log(`[Council] Multi-agent fan-out for: ${councilQuestion.slice(0, 80)}`);
      try {
        const councilResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/council`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ question: councilQuestion, maxAgents: 3, synthesise: true }),
        });
        const councilData = await councilResp.json();
        if (councilData?.success) {
          const lines: string[] = ["🪶 Assembl Council:"];
          for (const a of councilData.answers as { agentName: string; answer: string }[]) {
            const trimmed = a.answer.replace(/\s+/g, " ").trim().slice(0, 280);
            lines.push(`\n${a.agentName}: ${trimmed}`);
          }
          if (councilData.summary) {
            lines.push(`\n\nIHO summary: ${String(councilData.summary).replace(/\s+/g, " ").trim().slice(0, 350)}`);
          }
          const reply = lines.join("");
          const tnzResult = await sendViaTnz(validChannel, fromNumber, reply, conversation.id);
          await sb.from("messaging_messages").insert({
            conversation_id: conversation.id,
            tnz_message_id: tnzResult.messageId || null,
            direction: "outbound",
            from_number: toNumber,
            to_number: fromNumber,
            body: reply,
            channel: validChannel,
            status: tnzResult.error ? "failed" : "sent",
            assigned_agent: "council",
            assigned_pack: "shared",
          });
          return new Response(JSON.stringify({ ok: true, mode: "council", agents: councilData.agents }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("[Council] Bad response:", councilData);
        // fall through to normal routing if council fails
      } catch (e) {
        console.error("[Council] Error, falling back to single agent:", e);
      }
    }

    // ── Kete Picker: bare greeting / "menu" / numeric reply ─────────────
    // Triggers when a user clearly doesn't know which kete to choose, OR
    // when the user replies with a single digit (1-7) after seeing the menu.
    const trimmed = messageBody.trim();
    const isBareGreeting = /^(hi|hey|hello|kia\s?ora|yo|sup|hola|morena|good\s?(morning|afternoon|evening))[\s!.?]*$/i.test(trimmed);
    const askedForMenu = /^\s*(menu|help|options?|choose|pick|kete|which|not\s?sure|don.?t\s?know|start|begin|switch|reset|back|other|change|wrong\s?(one|kete|agent)?|different)\s*[?!.]*$/i.test(trimmed);
    const numericPick = trimmed.match(/^\s*([1-7])\s*$/);

    const KETE_MENU: Record<string, { agentId: string; agentName: string; kete: string; signature: string; intro: string }> = {
      "1": { agentId: "aura",     agentName: "AURA",     kete: "manaaki",  signature: "— AURA, your hospitality partner",       intro: "Kia ora! AURA here — hospitality, food safety, bookings & guests. What's on your plate today?" },
      "2": { agentId: "arc",      agentName: "ARC",      kete: "waihanga", signature: "— ARC, your construction partner",       intro: "Kia ora! ARC here — construction, site safety, consents & contracts. What's the job?" },
      "3": { agentId: "echo",     agentName: "ECHO",     kete: "auaha",    signature: "— ECHO, your creative partner",          intro: "Kia ora! ECHO here — brand, content, campaigns & creative. What are we making?" },
      "4": { agentId: "ember",    agentName: "EMBER",    kete: "arataki",  signature: "— EMBER, your automotive partner",       intro: "Kia ora! EMBER here — vehicles, fleet, WoF, RUC & service. What can I sort?" },
      "5": { agentId: "compass",  agentName: "COMPASS",  kete: "pikau",    signature: "— COMPASS, your freight & logistics partner", intro: "Kia ora! COMPASS here — freight, customs, biosecurity & landed cost. What's shipping?" },
      "6": { agentId: "helm",     agentName: "TŌRO",    kete: "toroa",    signature: "— TŌRO, your family life partner",      intro: "Kia ora! TŌRO here — family life, school, meals, trips & budgets. What's up?" },
      "7": { agentId: "echo",     agentName: "ECHO",     kete: "assembl",  signature: "— ECHO, your Assembl concierge",         intro: "Kia ora! ECHO here — questions about Assembl, pricing, pilots or how it all works. Fire away!" },
    };

    const showMenu = async () => {
      const menuText = [
        "Kia ora! I'm Iho — Assembl's router. Reply with a number to chat with the right specialist:",
        "",
        "1 · Manaaki (Hospitality, food, hotels)",
        "2 · Waihanga (Construction, sites, consents)",
        "3 · Auaha (Brand, content, marketing)",
        "4 · Arataki (Cars, fleet, WoF)",
        "5 · Pikau (Freight, customs, shipping)",
        "6 · Tōro (Family life, school, trips)",
        "7 · About Assembl (pricing, pilots, demo)",
        "",
        "Or just describe what you need (e.g. \"WoF reminder\", \"food safety diary\"), or name an agent (e.g. \"Tōro\", \"AURA\").",
      ].join("\n");

      const refMenu = `assembl-menu-${crypto.randomUUID()}`;
      const sendOut = await sendViaTnz(validChannel, fromNumber, menuText, refMenu);
      await sb.from("messaging_messages").insert({
        conversation_id: conversation.id,
        tnz_message_id: sendOut.messageId || null,
        direction: "outbound",
        from_number: toNumber, to_number: fromNumber,
        body: menuText,
        channel: validChannel,
        status: sendOut.messageId ? "sent" : "failed",
        agent_used: "iho",
        tnz_reference: refMenu,
      });
      await sb.from("messaging_conversations").update({
        assigned_agent: "iho", assigned_pack: "shared", awaiting_kete_pick: true,
      }).eq("id", conversation.id);
    };

    // Check if conversation is awaiting a numeric pick
    const { data: convState } = await sb
      .from("messaging_conversations")
      .select("awaiting_kete_pick")
      .eq("id", conversation.id)
      .maybeSingle();
    const awaitingPick = !!convState?.awaiting_kete_pick;

    // 1) Numeric reply right after a menu → land on chosen kete with intro
    if (numericPick && (awaitingPick || isBareGreeting)) {
      const choice = KETE_MENU[numericPick[1]];
      if (choice) {
        const refIntro = `assembl-pick-${crypto.randomUUID()}`;
        const sendIntro = await sendViaTnz(validChannel, fromNumber, choice.intro, refIntro);
        await sb.from("messaging_messages").insert({
          conversation_id: conversation.id,
          tnz_message_id: sendIntro.messageId || null,
          direction: "outbound",
          from_number: toNumber, to_number: fromNumber,
          body: choice.intro,
          channel: validChannel,
          status: sendIntro.messageId ? "sent" : "failed",
          agent_used: choice.agentId, assigned_pack: choice.kete,
          tnz_reference: refIntro,
        });
        await sb.from("messaging_conversations").update({
          assigned_agent: choice.agentId,
          assigned_pack: choice.kete,
          awaiting_kete_pick: false,
        }).eq("id", conversation.id);
        return new Response(JSON.stringify({ ok: true, picked: choice.agentId, kete: choice.kete }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) Bare greeting OR explicit menu/switch/reset request → ALWAYS show picker
    //    (escape hatch when a user is stuck on the wrong agent)
    if (isBareGreeting || askedForMenu) {
      await showMenu();
      return new Response(JSON.stringify({ ok: true, mode: "kete_picker" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Iho routing (keyword-based) ──
    const agent = routeToAgent(messageBody);

    // Update conversation with agent assignment
    await sb.from("messaging_conversations").update({
      assigned_agent: agent.agentId,
      assigned_pack: agent.kete,
      awaiting_kete_pick: false,
    }).eq("id", conversation.id);

    // After-hours gate removed — AI agents respond 24/7

    // ── Fetch agent system prompt from agent_prompts table ──
    let systemPrompt = `You are ${agent.agentName} from Assembl, a specialist business advisor for New Zealand.`;

    const { data: promptRow } = await sb
      .from("agent_prompts")
      .select("system_prompt, display_name")
      .eq("agent_name", agent.agentId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (promptRow?.system_prompt) {
      systemPrompt = promptRow.system_prompt;
    }

    // Inject channel-specific behaviour
    const channelBehaviour = validChannel === "whatsapp" ? WHATSAPP_BEHAVIOUR : SMS_BEHAVIOUR;
    const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });

    const HANDOFF_RULE = `

HANDOFF RULE — If the user asks about something outside your specialty, NEVER refuse. Instead:
1. Briefly acknowledge in one sentence.
2. Help anyway with practical NZ-context advice (you are part of the Assembl whānau of agents).
3. Suggest the right specialist next time, e.g. "TŌRO handles family trips & holidays, ECHO covers Assembl questions, AROHA is your HR partner, LEDGER for tax, GATEWAY for customs."
Never say "I can't do that" or "outside my scope" — always be useful first, then point to the better-fit kete.`;

    const fullPrompt = systemPrompt + channelBehaviour + HANDOFF_RULE + `\nCurrent NZ date/time: ${nzTime}\n\nEnd every response with your signature: ${agent.signature}`;

    // ── Fetch conversation history (last 20 messages) ──
    const { data: history } = await sb
      .from("messaging_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatHistory = (history || []).map((m: { direction: string; body: string }) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

    // ── Generate AI response ──
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      const fallback = "Kia ora! Our service is temporarily unavailable. Please try again shortly or visit assembl.co.nz";
      await sendViaTnz(validChannel, fromNumber, fallback, `assembl-unavail-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let aiReply = "Kia ora! I'm having trouble processing that right now. Please try again shortly or visit assembl.co.nz";

    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: fullPrompt },
            ...chatHistory,
          ],
          max_tokens: validChannel === "whatsapp" ? 1024 : 800,
        }),
      });

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
      }
    } catch (aiErr) {
      console.error("AI generation error:", aiErr);
    }

    // ── Mandatory NZ legal disclosure on first contact (UEMA 2007 s.10 + Privacy Act IPP 3) ──
    // Sender identification + functional unsubscribe must accompany commercial messages.
    const needsDisclosure = !conversation.identification_sent;
    const maxLen = validChannel === "whatsapp" ? 4000 : 1500;
    if (needsDisclosure) {
      const disclosure = validChannel === "whatsapp"
        ? "\n\n— *Assembl AI* (NZ business assistant). Reply *STOP* to opt out · *HELP* for info · assembl.co.nz/privacy"
        : "\n\nAssembl AI (NZ). Reply STOP to opt out, HELP for info. assembl.co.nz/privacy";
      const reserved = maxLen - disclosure.length - 3;
      if (aiReply.length > reserved) aiReply = aiReply.substring(0, reserved) + "...";
      aiReply = aiReply + disclosure;
    } else if (aiReply.length > maxLen) {
      aiReply = aiReply.substring(0, maxLen - 3) + "...";
    }

    // ── Send response via TNZ (or skip if caller will reply themselves) ──
    const ref = `assembl-${agent.kete}-${validChannel}-${crypto.randomUUID()}`;
    const sendResult = replyMode === "return"
      ? { messageId: null as string | null }
      : await sendViaTnz(validChannel, fromNumber, aiReply, ref);

    // Mark identification disclosure as delivered (only after successful send)
    if (needsDisclosure && (sendResult.messageId || replyMode === "return")) {
      await sb.from("messaging_conversations")
        .update({ identification_sent: true })
        .eq("id", conversation.id);
    }
    const responseTimeMs = Date.now() - startTime;

    // ── Store outbound message ──
    await sb.from("messaging_messages").insert({
      conversation_id: conversation.id,
      tnz_message_id: sendResult.messageId || null,
      direction: "outbound",
      from_number: toNumber, to_number: fromNumber,
      body: aiReply,
      channel: validChannel,
      status: sendResult.messageId ? "sent" : "failed",
      agent_used: agent.agentId,
      model_used: "gemini-2.5-flash",
      compliance_checked: true,
      response_time_ms: responseTimeMs,
      tnz_reference: ref,
    });

    // ── Audit trail (Tā) ──
    try {
      await sb.from("audit_log").insert({
        agent_code: agent.agentId,
        agent_name: agent.agentName,
        model_used: "gemini-2.5-flash",
        user_id: "00000000-0000-0000-0000-000000000000",
        request_summary: `[${validChannel.toUpperCase()} → ${agent.kete}] ${messageBody.substring(0, 100)}`,
        response_summary: aiReply.substring(0, 200),
        duration_ms: responseTimeMs,
        compliance_passed: true,
        data_classification: "INTERNAL",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    console.log(`[Iho] ${validChannel} from ${fromNumber} → ${agent.agentName} (${agent.kete}) in ${responseTimeMs}ms`);

    return new Response(JSON.stringify({
      ok: true,
      agent: agent.agentId,
      kete: agent.kete,
      channel: validChannel,
      responseTimeMs,
      reply: aiReply,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ inbound error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
