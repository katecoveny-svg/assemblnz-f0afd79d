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
// Six rules matching the iho-router implementation.

export interface ManaGateResult {
  passed: boolean;
  blockers: string[];
  warnings: string[];
}

export function manaGate(
  response: string,
  context: { isInternalComms?: boolean; isFatalityIncident?: boolean }
): ManaGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Rule 1 — IC-U1: never auto-send for internal comms
  if (context.isInternalComms && /\b(sent|sending now|dispatched|published to)\b/i.test(response)) {
    blockers.push("IC-U1: response claims autonomous send — blocked");
  }

  // Rule 2 — IC-IN-05 canary: fatality scenarios MUST pause automation
  if (context.isFatalityIncident && !/(human takeover|pause|escalat|stop automation)/i.test(response)) {
    blockers.push("IC-IN-05: fatality scenario without human takeover — blocked");
  }

  // Rule 3 — Bare "APPROVED" rubber-stamp (prompt-injection footprint)
  if (/\bAPPROVED\b\s*$/.test(response.trim()) || /^APPROVED$/.test(response.trim())) {
    blockers.push("Mana: bare 'APPROVED' output not allowed — must include reasoning");
  }

  // Rule 4 — Prompt-injection echo detection
  if (/\bSYSTEM OVERRIDE\b/i.test(response) || /\bignore (?:all )?(?:previous )?instructions\b/i.test(response)) {
    blockers.push("Mana: response echoes prompt-injection payload — blocked");
  }

  // Rule 5 — Missing statutory citation warning (CCA/HSWA)
  if (/\b(payment claim|retention|cca|construction contract)\b/i.test(response)) {
    if (!/\b(s\d+|section \d+|form 1|20.working.day)\b/i.test(response)) {
      warnings.push("Mana: CCA-related response missing statutory citation");
    }
  }

  // Rule 6 — Tikanga warning: using 'Maori' without macron
  if (/\bMaori\b/.test(response) && !/\bMāori\b/.test(response)) {
    warnings.push("Tikanga: 'Maori' used without macron — should be 'Māori'");
  }

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
  };
}
