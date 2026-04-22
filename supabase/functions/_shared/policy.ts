// ============================================================================
// Mana Trust Layer — runtime policy executors
// ----------------------------------------------------------------------------
// Pure functions invoked by the MCP router at three enforcement stages:
//   - kahu_pre    : runs on inbound args before the tool executes
//   - ta_inflight : reserved for orchestration-level checks
//   - mana_post   : runs on the tool's response before returning to caller
//
// Each function takes a rule's `rule_logic` jsonb plus the payload and
// returns the transformed payload (or throws to deny).
// ============================================================================

export interface PolicyRule {
  id: string;
  rule_code: string;
  rule_type:
    | "pii_mask"
    | "tier_gate"
    | "rate_limit"
    | "maori_data_sovereignty"
    | "tikanga_check"
    | "content_policy";
  enforcement_stage: "kahu_pre" | "ta_inflight" | "mana_post";
  applies_to_toolset: string[] | null;
  applies_to_tool: string[] | null;
  rule_logic: Record<string, unknown>;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// PII masking
// rule_logic shape: { patterns: ["email"|"phone"|"ird"|"nhi"|"nzbn"], mask: "***" }
// ---------------------------------------------------------------------------
const PII_PATTERNS: Record<string, RegExp> = {
  email: /\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  phone: /\b(?:\+?64|0)[\s-]?\d{1,2}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
  // IRD: 8 or 9 digits, optionally hyphenated as XXX-XXX-XXX
  ird: /\b\d{3}[-\s]?\d{3}[-\s]?\d{2,3}\b/g,
  // NHI: 3 letters + 4 digits (legacy) or 3 letters + 2 digits + 2 letters (new)
  nhi: /\b[A-HJ-NP-Z]{3}\d{4}\b|\b[A-HJ-NP-Z]{3}\d{2}[A-HJ-NP-Z]{2}\b/g,
  // NZBN: 13 digits
  nzbn: /\b\d{13}\b/g,
};

export function applyPiiMask<T>(payload: T, ruleLogic: Record<string, unknown>): T {
  const patterns = (ruleLogic.patterns as string[] | undefined) ?? Object.keys(PII_PATTERNS);
  const mask = (ruleLogic.mask as string | undefined) ?? "[REDACTED]";

  const maskString = (s: string): string => {
    let out = s;
    for (const p of patterns) {
      const re = PII_PATTERNS[p];
      if (re) out = out.replace(re, mask);
    }
    return out;
  };

  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return maskString(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      return out;
    }
    return v;
  };

  return walk(payload) as T;
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory token bucket — per org+rule)
// rule_logic shape: { window_seconds: 60, max_requests: 30 } or
//                   { per_tier: { starter: 10, pro: 60, business: 600 } }
// ---------------------------------------------------------------------------
const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  orgId: string | null,
  tierName: string | null,
  ruleLogic: Record<string, unknown>,
  ruleId: string,
): { ok: boolean; retryAfterSeconds?: number } {
  if (!orgId) return { ok: true }; // unauthenticated already denied upstream

  const windowSeconds = (ruleLogic.window_seconds as number | undefined) ?? 60;
  let max = ruleLogic.max_requests as number | undefined;
  const perTier = ruleLogic.per_tier as Record<string, number> | undefined;
  if (perTier && tierName && tierName in perTier) max = perTier[tierName];
  if (typeof max !== "number") return { ok: true };

  const key = `${ruleId}:${orgId}`;
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(key);

  if (!bucket || bucket.resetAt < now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Content policy (post-response transformation)
// rule_logic shape: {
//   normalise_macrons?: boolean,
//   require_legal_disclaimer?: string,
//   require_medical_disclaimer?: string,
//   strip_fields?: string[]
// }
// ---------------------------------------------------------------------------
const MACRON_MAP: Record<string, string> = {
  "Maori": "Māori",
  "maori": "māori",
  "MAORI": "MĀORI",
  "Aotearoa": "Aotearoa",
  "wahine": "wāhine",
  "Wahine": "Wāhine",
  "tangata": "tāngata",
  "Tangata": "Tāngata",
  "Pakeha": "Pākehā",
  "pakeha": "pākehā",
  "whanau": "whānau",
  "Whanau": "Whānau",
  "kainga": "kāinga",
  "Kainga": "Kāinga",
  "korero": "kōrero",
  "Korero": "Kōrero",
};

export function applyContentPolicy<T>(payload: T, ruleLogic: Record<string, unknown>): T {
  const normalise = ruleLogic.normalise_macrons === true;
  const legalDisclaimer = ruleLogic.require_legal_disclaimer as string | undefined;
  const medicalDisclaimer = ruleLogic.require_medical_disclaimer as string | undefined;
  const stripFields = (ruleLogic.strip_fields as string[] | undefined) ?? [];

  const transformString = (s: string): string => {
    let out = s;
    if (normalise) {
      for (const [bad, good] of Object.entries(MACRON_MAP)) {
        out = out.replace(new RegExp(`\\b${bad}\\b`, "g"), good);
      }
    }
    if (legalDisclaimer && /\b(legal|legislation|act|regulation|compliance)\b/i.test(out) &&
        !out.includes(legalDisclaimer)) {
      out = `${out}\n\n${legalDisclaimer}`;
    }
    if (medicalDisclaimer && /\b(medical|health|diagnosis|symptom|medication)\b/i.test(out) &&
        !out.includes(medicalDisclaimer)) {
      out = `${out}\n\n${medicalDisclaimer}`;
    }
    return out;
  };

  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return transformString(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        if (stripFields.includes(k)) continue;
        out[k] = walk(val);
      }
      return out;
    }
    return v;
  };

  return walk(payload) as T;
}

// ---------------------------------------------------------------------------
// Māori data sovereignty / tikanga checks
// rule_logic shape: {
//   forbid_topics?: string[],         // e.g. ["whakapapa","urupa","tapu"]
//   require_consent_keyword?: string  // require explicit consent token in args
// }
// Returns { ok: false, reason } to DENY the call.
// ---------------------------------------------------------------------------
export function checkMaoriSovereignty(
  args: unknown,
  ruleLogic: Record<string, unknown>,
): { ok: boolean; reason?: string } {
  const forbid = (ruleLogic.forbid_topics as string[] | undefined) ?? [];
  const requireConsent = ruleLogic.require_consent_keyword as string | undefined;

  const flat = JSON.stringify(args ?? {}).toLowerCase();

  for (const topic of forbid) {
    if (flat.includes(topic.toLowerCase())) {
      if (requireConsent && flat.includes(requireConsent.toLowerCase())) continue;
      return {
        ok: false,
        reason: `Topic "${topic}" requires explicit whānau/iwi consent under Māori data sovereignty principles`,
      };
    }
  }
  return { ok: true };
}
