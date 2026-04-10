/**
 * WAIHANGA — Pure pipeline logic
 * ==============================================================
 * The deterministic, testable pieces of the Iho pipeline that
 * don't need a Deno runtime, Supabase, or the Lovable AI gateway.
 *
 * The Supabase edge function `supabase/functions/iho-router/index.ts`
 * currently contains its own copies of these functions. The intent of
 * this file is:
 *   1. Make the logic importable by Node-based vitest tests.
 *   2. Become the single source of truth — `iho-router` will be
 *      refactored to import from this module so test and prod share
 *      identical code.
 *
 * Anything that touches Deno.env, fetch(), Supabase, or the live
 * Claude/Gemini API does NOT live in this file. That stays in the
 * edge function and is exercised by integration tests.
 * ==============================================================
 */

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type DataClassification =
  | "PUBLIC"
  | "INTERNAL"
  | "CONFIDENTIAL"
  | "RESTRICTED";

export interface AgentConfig {
  code: string;
  name: string;
  pack: string;
  primaryModel: "claude" | "gemini";
  skills: string[];
  keywords: string[];
}

export interface IntentResult {
  agent: AgentConfig;
  confidence: number;
  taskType: string;
  packMatch: string;
}

export interface ComplianceResult {
  passed: boolean;
  piiDetected: boolean;
  piiMasked: boolean;
  dataClassification: DataClassification;
  policies: string[];
  maskedMessage: string;
}

// ─────────────────────────────────────────────
// AGENT REGISTRY (mirrored from iho-router)
// ─────────────────────────────────────────────

export const AGENT_REGISTRY: AgentConfig[] = [
  // HANGA / WAIHANGA — Construction
  {
    code: "ASM-011",
    name: "ĀRAI",
    pack: "hanga",
    primaryModel: "claude",
    skills: ["health_safety", "risk_assessment"],
    keywords: [
      "h&s", "safety", "hazard", "risk", "ppe", "incident", "worksafe", "swms",
    ],
  },
  {
    code: "ASM-012",
    name: "KAUPAPA",
    pack: "hanga",
    primaryModel: "claude",
    skills: ["project_governance", "planning", "construction_contracts_act"],
    keywords: [
      "project plan", "gantt", "milestone", "governance", "scope", "charter",
      "payment claim", "cca", "form 1", "retention", "subcontractor",
    ],
  },
  // ECHO fallback
  {
    code: "ASM-000",
    name: "ECHO",
    pack: "cross-pack",
    primaryModel: "claude",
    skills: ["general"],
    keywords: [],
  },
];

// ─────────────────────────────────────────────
// INTENT CLASSIFIER (Iho)
// ─────────────────────────────────────────────

export function detectTaskType(message: string): string {
  const m = message.toLowerCase();
  if (/generat|creat|writ|draft|build|make|design/.test(m)) return "content_generation";
  if (/calculat|comput|how much|percentage|total/.test(m)) return "calculation";
  if (/compli|legal|act |regulation|privacy|law/.test(m)) return "compliance";
  if (/analys|review|assess|audit|evaluat/.test(m)) return "analysis";
  if (/explain|what is|how does|tell me about/.test(m)) return "knowledge";
  return "decision_support";
}

export function classifyIntent(
  message: string,
  requestedAgentCode?: string,
  requestedPack?: string
): IntentResult {
  const lc = message.toLowerCase();

  // Explicit agent request
  if (requestedAgentCode) {
    const agent = AGENT_REGISTRY.find(
      (a) =>
        a.code === requestedAgentCode ||
        a.name.toLowerCase() === requestedAgentCode.toLowerCase()
    );
    if (agent) {
      return {
        agent,
        confidence: 1.0,
        taskType: detectTaskType(lc),
        packMatch: agent.pack,
      };
    }
  }

  // Score agents by keyword matches
  const scores = AGENT_REGISTRY.map((agent) => {
    let score = 0;
    for (const kw of agent.keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    if (requestedPack && agent.pack === requestedPack) score += 3;
    return { agent, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const confidence = best.score > 0 ? Math.min(best.score / 10, 1.0) : 0.1;

  const selectedAgent =
    best.score > 0
      ? best.agent
      : AGENT_REGISTRY.find((a) => a.code === "ASM-000")!;

  return {
    agent: selectedAgent,
    confidence,
    taskType: detectTaskType(lc),
    packMatch: selectedAgent.pack,
  };
}

// ─────────────────────────────────────────────
// KAHU — PII / Compliance Engine
// ─────────────────────────────────────────────

const PII_PATTERNS: {
  name: string;
  regex: RegExp;
  classification: DataClassification;
}[] = [
  { name: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, classification: "CONFIDENTIAL" },
  { name: "nz_phone", regex: /(?:\+?64|0)[- ]?[2-9]\d[- ]?\d{3}[- ]?\d{4}/g, classification: "CONFIDENTIAL" },
  { name: "ird_number", regex: /\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/g, classification: "RESTRICTED" },
  { name: "bank_account", regex: /\b\d{2}[- ]?\d{4}[- ]?\d{7,8}[- ]?\d{2,3}\b/g, classification: "RESTRICTED" },
];

function classificationLevel(c: DataClassification): number {
  return { PUBLIC: 0, INTERNAL: 1, CONFIDENTIAL: 2, RESTRICTED: 3 }[c];
}

export function checkCompliance(message: string): ComplianceResult {
  let piiDetected = false;
  let maskedMessage = message;
  let highest: DataClassification = "PUBLIC";
  const policies: string[] = ["privacy_act_2020"];

  for (const p of PII_PATTERNS) {
    const re = new RegExp(p.regex.source, p.regex.flags);
    if (re.test(message)) {
      piiDetected = true;
      maskedMessage = maskedMessage.replace(
        new RegExp(p.regex.source, p.regex.flags),
        `[${p.name.toUpperCase()}_MASKED]`
      );
      if (classificationLevel(p.classification) > classificationLevel(highest)) {
        highest = p.classification;
      }
    }
  }

  if (/\b(safety|hazard|incident|injury|worksafe|ppe)\b/i.test(message)) {
    policies.push("health_safety_at_work_act_2015");
  }
  if (/\b(payment claim|cca|construction contract|retention|subcontractor)\b/i.test(message)) {
    policies.push("construction_contracts_act_2002");
  }

  return {
    passed: highest !== "RESTRICTED",
    piiDetected,
    piiMasked: piiDetected,
    dataClassification: highest,
    policies,
    maskedMessage: piiDetected ? maskedMessage : message,
  };
}

// ─────────────────────────────────────────────
// MANA — Final post-response compliance gate
// ─────────────────────────────────────────────
// Canonical pipeline stage 5 (Kahu → Iho → Tā → Mahara → Mana).
// Runs on the agent's RESPONSE before it leaves the system.
// The kete refuses to close a pack that fails this gate.
//
// Three mandatory compliance layers:
//   1. Tikanga — Te Reo Māori accuracy, macrons, cultural respect
//   2. Privacy Act 2020 — PII handling, IPP 3A disclosure
//   3. Sector Acts — CCA 2002, HSWA 2015, ERA 2000, etc.
//
// Capability order: Perceive · Memory · Reason · Simulate · Action · Explain · Govern

export interface ManaGateResult {
  passed: boolean;
  blockers: string[];
  warnings: string[];
  /** When false the kete MUST refuse to close the evidence pack. */
  packClosable: boolean;
}

/** Sector Acts the gate can detect and enforce citation for. */
const SECTOR_ACT_TRIGGERS: { pattern: RegExp; actName: string; citationPattern: RegExp }[] = [
  {
    pattern: /\b(payment claim|retention|cca|construction contract|form 1|nzs.?39[12]0)\b/i,
    actName: "Construction Contracts Act 2002",
    citationPattern: /\b(s\d+|section \d+|form 1|20.working.day|cca\s*200[2])\b/i,
  },
  {
    pattern: /\b(hazard|h&s|ppe|notifiable event|worksafe|hswa|pcbu|swms)\b/i,
    actName: "Health and Safety at Work Act 2015",
    citationPattern: /\b(s\d+|section \d+|hswa|pcbu|reg\s*\d+)\b/i,
  },
  {
    pattern: /\b(personal grievance|unjustified dismiss|employment agreement|trial period|90.?day)\b/i,
    actName: "Employment Relations Act 2000",
    citationPattern: /\b(s\s?\d+|section \d+|era\s*200[0]|part\s*\d+)\b/i,
  },
  {
    pattern: /\b(building consent|code compliance|producer statement|building act)\b/i,
    actName: "Building Act 2004",
    citationPattern: /\b(s\d+|section \d+|nzbc|clause [a-z]\d)\b/i,
  },
  {
    pattern: /\b(customs entry|tariff|biosecurity|mpi|border)\b/i,
    actName: "Customs and Excise Act 2018",
    citationPattern: /\b(s\d+|section \d+|tariff item|hs code)\b/i,
  },
  {
    pattern: /\b(fair trading|misleading|consumer guarantee)\b/i,
    actName: "Fair Trading Act 1986",
    citationPattern: /\b(s\s?\d+|section \d+|fta)\b/i,
  },
];

export function manaGate(
  response: string,
  context: {
    isInternalComms?: boolean;
    isFatalityIncident?: boolean;
    relevantActs?: string[];
  }
): ManaGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // ── Layer 1: Tikanga ────────────────────────────────────────
  // Rule T1 — 'Maori' without macron
  if (/\bMaori\b/.test(response) && !/\bMāori\b/.test(response)) {
    blockers.push("Tikanga-T1: 'Maori' used without macron — must be 'Māori'");
  }
  // Rule T2 — common Te Reo terms missing macrons
  const macronPairs: [RegExp, string][] = [
    [/\bwhanau\b/i, "whānau"], [/\btikanga\b(?!.*\btikanga\b)/i, "tikanga"],
    [/\bMaori\b/, "Māori"], [/\bkaupapa\b/i, "kaupapa"],
  ];
  for (const [re, correct] of macronPairs) {
    if (re.test(response) && !new RegExp(`\\b${correct}\\b`).test(response)) {
      warnings.push(`Tikanga: '${re.source}' should use correct form '${correct}'`);
    }
  }

  // ── Layer 2: Privacy Act 2020 ───────────────────────────────
  // Rule P1 — response must not leak raw PII patterns
  if (/\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/.test(response)) {
    blockers.push("Privacy Act 2020: response contains possible IRD number — must be masked");
  }
  if (/\b\d{2}[- ]?\d{4}[- ]?\d{7,8}[- ]?\d{2,3}\b/.test(response)) {
    blockers.push("Privacy Act 2020: response contains possible bank account — must be masked");
  }
  // Rule P2 — IPP 3A: indirect collection must name source
  if (/\b(from your records|we obtained|sourced from)\b/i.test(response)) {
    if (!/\b(source:|collected from|provided by)\b/i.test(response)) {
      warnings.push("Privacy Act 2020 IPP 3A: indirect collection without naming source");
    }
  }

  // ── Layer 3: Sector Acts ────────────────────────────────────
  for (const rule of SECTOR_ACT_TRIGGERS) {
    if (rule.pattern.test(response)) {
      if (!rule.citationPattern.test(response)) {
        warnings.push(`Mana: ${rule.actName} referenced without statutory citation`);
      }
    }
  }

  // ── Existing safety rules ──────────────────────────────────
  // Rule S1 — IC-U1: never auto-send for internal comms
  if (context.isInternalComms && /\b(sent|sending now|dispatched|published to)\b/i.test(response)) {
    blockers.push("IC-U1: response claims autonomous send — blocked");
  }

  // Rule S2 — IC-IN-05 canary: fatality scenarios MUST pause automation
  if (context.isFatalityIncident && !/(human takeover|pause|escalat|stop automation)/i.test(response)) {
    blockers.push("IC-IN-05: fatality scenario without human takeover — blocked");
  }

  // Rule S3 — Bare "APPROVED" rubber-stamp (prompt-injection footprint)
  if (/\bAPPROVED\b\s*$/.test(response.trim()) || /^APPROVED$/.test(response.trim())) {
    blockers.push("Mana: bare 'APPROVED' output not allowed — must include reasoning");
  }

  // Rule S4 — Prompt-injection echo detection
  if (/\bSYSTEM OVERRIDE\b/i.test(response) || /\bignore (?:all )?(?:previous )?instructions\b/i.test(response)) {
    blockers.push("Mana: response echoes prompt-injection payload — blocked");
  }

  const passed = blockers.length === 0;

  return {
    passed,
    blockers,
    warnings,
    packClosable: passed, // kete refuses to close if ANY blocker fires
  };
}
