// ═══════════════════════════════════════════════════════════════
// KAHU → IHO → TĀ → MAHARA → MANA  pipeline shim
// ───────────────────────────────────────────────────────────────
// A pure-TypeScript implementation of Assembl's compliance pipeline
// that can be run locally (node tsx) without Supabase / Deno bindings.
// Used by both the live iho-router edge function (via dynamic import)
// and by the per-kete sim runners.
// ═══════════════════════════════════════════════════════════════

export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export interface KeteRequest {
  tenantId: string;
  userId: string;
  workflow: string;        // e.g. "vehicle_listing_check"
  payload: Record<string, unknown>;
  rawText: string;         // free-text portion routed through Kahu PII
}

export interface KahuResult {
  ok: boolean;
  classification: DataClassification;
  piiDetected: boolean;
  maskedText: string;
  validationErrors: string[];
  policiesTouched: string[];
}

export interface TaResult {
  passed: boolean;
  hardBlocks: string[];   // CRITICAL — refusal reason(s)
  warnings: string[];     // WARNING — surfaced to human
  notes: string[];        // INFO   — audit trail only
  rulesEvaluated: string[];
}

export interface MaharaWrite {
  table: string;
  row: Record<string, unknown>;
}

export interface ManaResult {
  egressAllowed: boolean;
  redactedOutput: string;
  hardRulesTriggered: string[];
  tikangaIssues: string[];
}

export interface PipelineResult {
  ok: boolean;
  stage: "kahu" | "ta" | "mahara" | "mana" | "complete";
  kahu: KahuResult;
  ta?: TaResult;
  mahara?: MaharaWrite[];
  mana?: ManaResult;
  output?: string;
  blockedReason?: string;
}

// ─────────────── KAHU ───────────────
const PII = [
  { name: "email",     re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,                       cls: "CONFIDENTIAL" as const },
  { name: "nz_phone",  re: /(?:\+?64|0)[- ]?[2-9]\d[- ]?\d{3}[- ]?\d{4}/g,                  cls: "CONFIDENTIAL" as const },
  { name: "ird",       re: /\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/g,                              cls: "RESTRICTED"   as const },
  { name: "bank_acct", re: /\b\d{2}[- ]?\d{4}[- ]?\d{7,8}[- ]?\d{2,3}\b/g,                  cls: "RESTRICTED"   as const },
  { name: "card",      re: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,                                   cls: "RESTRICTED"   as const },
  { name: "passport",  re: /\b[A-Z]{1,2}\d{6,7}\b/g,                                        cls: "RESTRICTED"   as const },
  { name: "drv_lic",   re: /\b[A-Z]{2}\d{6}\b/g,                                            cls: "RESTRICTED"   as const },
  { name: "vin",       re: /\b[A-HJ-NPR-Z0-9]{17}\b/g,                                      cls: "CONFIDENTIAL" as const },
];

export function runKahu(
  req: KeteRequest,
  validator: (req: KeteRequest) => string[]
): KahuResult {
  const errors = validator(req);
  let masked = req.rawText;
  let pii = false;
  let cls: DataClassification = "PUBLIC";
  const touched: string[] = ["privacy_act_2020"];
  for (const p of PII) {
    p.re.lastIndex = 0;
    if (p.re.test(req.rawText)) {
      pii = true;
      masked = masked.replace(p.re, `[${p.name.toUpperCase()}]`);
      if (level(p.cls) > level(cls)) cls = p.cls;
    }
  }
  if (pii) touched.push("ipp_3a_automated_decision");
  // RESTRICTED data is never sent to external models — but we still
  // allow the workflow to proceed at lower trust level. Hard-block
  // is a Mana decision, not a Kahu decision.
  return {
    ok: errors.length === 0,
    classification: cls,
    piiDetected: pii,
    maskedText: masked,
    validationErrors: errors,
    policiesTouched: touched,
  };
}

function level(c: DataClassification): number {
  return { PUBLIC: 0, INTERNAL: 1, CONFIDENTIAL: 2, RESTRICTED: 3 }[c];
}

// ─────────────── TĀ ───────────────
export type TaRule = (req: KeteRequest, kahu: KahuResult) => {
  id: string;
  level: "BLOCK" | "WARN" | "INFO" | "PASS";
  reason?: string;
};

export function runTa(req: KeteRequest, kahu: KahuResult, rules: TaRule[]): TaResult {
  const hardBlocks: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];
  const ruleIds: string[] = [];
  for (const rule of rules) {
    const r = rule(req, kahu);
    ruleIds.push(r.id);
    if (r.level === "BLOCK" && r.reason) hardBlocks.push(`${r.id}: ${r.reason}`);
    if (r.level === "WARN"  && r.reason) warnings.push(`${r.id}: ${r.reason}`);
    if (r.level === "INFO"  && r.reason) notes.push(`${r.id}: ${r.reason}`);
  }
  return { passed: hardBlocks.length === 0, hardBlocks, warnings, notes, rulesEvaluated: ruleIds };
}

// ─────────────── MAHARA (in-memory shim for sims) ───────────────
const MAHARA_STORE: MaharaWrite[] = [];

export function runMahara(writes: MaharaWrite[]): MaharaWrite[] {
  // In production these flow through Supabase RLS-enforced inserts.
  // Here we record them for sim assertions.
  MAHARA_STORE.push(...writes);
  return writes;
}
export function maharaStoreSnapshot() { return [...MAHARA_STORE]; }
export function maharaReset() { MAHARA_STORE.length = 0; }

// ─────────────── MANA ───────────────
const TIKANGA_FORBIDDEN = [
  /\btaonga.*for sale\b/i,                  // taonga commodification
  /\btapu\b.*\bgift\b/i,                    // confused tapu/koha framing
  /\bmaori\b/,                              // missing macron
];

const HARD_RULE_PATTERNS = [
  { id: "no_external_send",    re: /\b(send|post|publish|email)\b.*\b(to customer|to broker|to nzcs)\b/i },
  { id: "no_money_movement",   re: /\b(transfer|pay|charge|refund)\b.*\$\d/i },
  { id: "no_autonomous_price", re: /\bset price (to|at)\b/i },
  { id: "no_contract_accept",  re: /\b(accept|sign).*\b(contract|agreement)\b/i },
];

export function runMana(
  output: string,
  cls: DataClassification,
  extraHardRules: { id: string; re: RegExp }[] = []
): ManaResult {
  let egressAllowed = true;
  let redacted = output;
  const hardRulesTriggered: string[] = [];
  const tikangaIssues: string[] = [];

  // Tikanga
  for (const re of TIKANGA_FORBIDDEN) {
    if (re.test(output)) tikangaIssues.push(re.source);
  }

  // Hard rules
  const allHard = [...HARD_RULE_PATTERNS, ...extraHardRules];
  for (const r of allHard) {
    if (r.re.test(output)) {
      hardRulesTriggered.push(r.id);
      egressAllowed = false;
    }
  }

  // Egress redaction — never let RESTRICTED out, even if Kahu missed it.
  for (const p of PII) {
    p.re.lastIndex = 0;
    redacted = redacted.replace(p.re, `[${p.name.toUpperCase()}]`);
  }

  if (cls === "RESTRICTED") egressAllowed = false;

  return { egressAllowed, redactedOutput: redacted, hardRulesTriggered, tikangaIssues };
}

// ─────────────── End-to-end runner ───────────────
export interface KeteDefinition {
  name: string;
  validator: (req: KeteRequest) => string[];
  taRules: TaRule[];
  workflows: Record<string, (req: KeteRequest, kahu: KahuResult, ta: TaResult) => {
    output: string;
    maharaWrites: MaharaWrite[];
    extraHardRules?: { id: string; re: RegExp }[];
  }>;
}

export function runPipeline(kete: KeteDefinition, req: KeteRequest): PipelineResult {
  // KAHU
  const kahu = runKahu(req, kete.validator);
  if (!kahu.ok) {
    return { ok: false, stage: "kahu", kahu, blockedReason: `Kahu validation failed: ${kahu.validationErrors.join("; ")}` };
  }

  // TĀ
  const ta = runTa(req, kahu, kete.taRules);
  if (!ta.passed) {
    return { ok: false, stage: "ta", kahu, ta, blockedReason: `Tā policy block: ${ta.hardBlocks.join("; ")}` };
  }

  // WORKFLOW
  const wf = kete.workflows[req.workflow];
  if (!wf) {
    return { ok: false, stage: "ta", kahu, ta, blockedReason: `Unknown workflow: ${req.workflow}` };
  }
  const wfResult = wf(req, kahu, ta);

  // MAHARA
  const mahara = runMahara(wfResult.maharaWrites);

  // MANA
  const mana = runMana(wfResult.output, kahu.classification, wfResult.extraHardRules ?? []);
  if (!mana.egressAllowed) {
    const reasons: string[] = [];
    if (kahu.classification === "RESTRICTED") reasons.push("RESTRICTED data classification");
    if (mana.hardRulesTriggered.length) reasons.push(`hard rules: ${mana.hardRulesTriggered.join(", ")}`);
    if (mana.tikangaIssues.length) reasons.push(`tikanga issues: ${mana.tikangaIssues.join(", ")}`);
    return { ok: false, stage: "mana", kahu, ta, mahara, mana, blockedReason: `Mana egress block — ${reasons.join("; ")}` };
  }

  return { ok: true, stage: "complete", kahu, ta, mahara, mana, output: mana.redactedOutput };
}
