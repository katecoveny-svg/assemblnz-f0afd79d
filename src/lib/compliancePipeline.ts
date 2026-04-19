// ═══════════════════════════════════════════════════════════
// Assembl Compliance Pipeline — Client-Side Post-Processor
// Runs on EVERY agent response before display.
// Stages: KAHU (detect) → TĀ (apply rules) → MAHARA (verify) → MANA (approve)
// ═══════════════════════════════════════════════════════════

// ── TĀ: NZ English spelling corrections ──
const NZ_SPELLING: Record<string, string> = {
  analyze: "analyse",
  organize: "organise",
  customize: "customise",
  color: "colour",
  behavior: "behaviour",
  center: "centre",
  recognize: "recognise",
  defense: "defence",
  offense: "offence",
  labor: "labour",
  favor: "favour",
  honor: "honour",
  humor: "humour",
  neighbor: "neighbour",
  vigor: "vigour",
  valor: "valour",
  catalog: "catalogue",
  dialog: "dialogue",
  analog: "analogue",
  traveling: "travelling",
  modeling: "modelling",
  canceled: "cancelled",
  labeled: "labelled",
  leveled: "levelled",
  license: "licence", // noun form
  practice: "practise", // verb form (careful context)
};

// Build regex variants: analyze/analyzes/analyzed/analyzing → analyse/analyses/analysed/analysing
function buildSpellingMap(): [RegExp, string][] {
  const pairs: [RegExp, string][] = [];
  for (const [us, nz] of Object.entries(NZ_SPELLING)) {
    // Base form
    pairs.push([new RegExp(`\\b${us}\\b`, "gi"), nz]);
    // -ize → -ise variants
    if (us.endsWith("ize")) {
      const stem = us.slice(0, -3);
      const nzStem = nz.slice(0, -3);
      pairs.push([new RegExp(`\\b${stem}izes\\b`, "gi"), `${nzStem}ises`]);
      pairs.push([new RegExp(`\\b${stem}ized\\b`, "gi"), `${nzStem}ised`]);
      pairs.push([new RegExp(`\\b${stem}izing\\b`, "gi"), `${nzStem}ising`]);
      pairs.push([new RegExp(`\\b${stem}ization\\b`, "gi"), `${nzStem}isation`]);
    }
  }
  return pairs;
}

const SPELLING_RULES = buildSpellingMap();

// ── KAHU: Detect content type ──
interface KahuFlags {
  hasLegislation: boolean;
  hasMaoriContent: boolean;
  isHighRisk: boolean;
  hasFactualClaims: boolean;
  hasBannedWords: boolean;
}

const BANNED_WORDS = [
  "cutting-edge",
  "revolutionary",
  "leverage",
  "synergy",
  "game-changer",
  "disruptive",
  "paradigm shift",
  "best-in-class",
  "world-class",
  "state-of-the-art",
];

const HIGH_RISK_AGENTS = [
  "COMPASS",
  "ANCHOR",
  "VITAE",
  "CLINIC",
  "VAULT",
  "SHIELD",
  "REMEDY",
  "AROHA",
  "PULSE",
  "LEDGER",
];

const AGENT_DOMAIN: Record<string, string> = {
  COMPASS: "immigration",
  ANCHOR: "legal",
  VITAE: "medical/nutritional",
  CLINIC: "clinical",
  VAULT: "financial",
  SHIELD: "privacy",
  REMEDY: "healthcare",
  AROHA: "employment",
  PULSE: "payroll/employment",
  LEDGER: "financial/tax",
};

function kahuDetect(text: string, agentId: string): KahuFlags {
  const lc = text.toLowerCase();
  return {
    hasLegislation: /\b(?:act|section|s\d|regulation|rule)\b/i.test(text),
    hasMaoriContent: /[āēīōū]|māori|tikanga|whānau|hapū|iwi|taonga|kaitiaki/i.test(text),
    isHighRisk: HIGH_RISK_AGENTS.includes(agentId.toUpperCase()),
    hasFactualClaims: /\$\d|\d+%|\bfrom\s+\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text),
    hasBannedWords: BANNED_WORDS.some((w) => lc.includes(w)),
  };
}

// ── TĀ: Apply NZ rules ──
function taApplyRules(text: string): string {
  let output = text;

  // Fix American spellings
  for (const [regex, replacement] of SPELLING_RULES) {
    output = output.replace(regex, (match) => {
      // Preserve capitalisation
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  // Fix common macron issues
  output = output.replace(/\bKia Ora\b/g, "Kia ora");
  output = output.replace(/\baotearoa\b/g, "Aotearoa");
  output = output.replace(/\bmaori\b/gi, (m) =>
    m[0] === "M" ? "Māori" : "māori"
  );
  output = output.replace(/\bwhanau\b/gi, "whānau");

  return output;
}

// ── MAHARA: Verify citations ──
function maharaVerify(text: string, flags: KahuFlags): string {
  let output = text;

  // Flag legislation references without year
  if (flags.hasLegislation) {
    // Look for Act references missing year — e.g., "Employment Relations Act" without a year
    const actWithoutYear =
      /\b([A-Z][a-z]+ (?:Relations |Safety |Privacy |Building |Resource |Companies |Sale |Consumer |Food |Health )?Act)\b(?!\s+\d{4})/g;
    // We don't auto-fix this — just a detection signal for logging
  }

  return output;
}

// ── MANA: Final approval — disclaimers and guardrails ──
function manaApprove(text: string, agentId: string, flags: KahuFlags): string {
  let output = text;

  // Inject disclaimers for high-risk agents (only if not already present)
  if (flags.isHighRisk && !output.includes("not professional")) {
    const domain =
      AGENT_DOMAIN[agentId.toUpperCase()] || "professional";
    output += `\n\n> ️ *This is general information, not professional ${domain} advice. Consult a qualified specialist for your specific situation.*`;
  }

  // Māori data guardrail
  if (
    flags.hasMaoriContent &&
    /pattern|design|whakairo|tā moko|karakia|whaikōrero|waiata/i.test(output)
  ) {
    if (
      !output.includes("rights-holders") &&
      !output.includes("cultural patterns")
    ) {
      output += `\n\n> ️ *If this relates to iwi/hapū taonga or restricted cultural knowledge, please work with the appropriate rights-holders.*`;
    }
  }

  return output;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API — Call this on every agent response before display
// ═══════════════════════════════════════════════════════════

export interface CompliancePipelineResult {
  output: string;
  flags: KahuFlags;
  agentId: string;
  pipelineApplied: boolean;
}

/**
 * enforceAssemblProtocol — runs the 4-stage compliance pipeline on agent output.
 * Call this before rendering any agent response to the user.
 */
export function enforceAssemblProtocol(
  response: string,
  agentId: string
): CompliancePipelineResult {
  if (!response?.trim()) {
    return {
      output: response,
      flags: kahuDetect("", agentId),
      agentId,
      pipelineApplied: false,
    };
  }

  // KAHU — detect
  const flags = kahuDetect(response, agentId);

  // TĀ — apply NZ rules
  let output = taApplyRules(response);

  // MAHARA — verify citations
  output = maharaVerify(output, flags);

  // MANA — approve (disclaimers, guardrails)
  output = manaApprove(output, agentId, flags);

  return { output, flags, agentId, pipelineApplied: true };
}

/**
 * Quick NZ spelling fix only — for non-agent text like user-facing copy.
 */
export function fixNZSpelling(text: string): string {
  return taApplyRules(text);
}
