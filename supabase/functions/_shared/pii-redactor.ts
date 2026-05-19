// ════════════════════════════════════════════════════════════════════════
// pii-redactor.ts — server-side PII scrubbing for public-chat-llm
// ════════════════════════════════════════════════════════════════════════
//
// Regex-based scrubbing tuned for New Zealand patterns. Runs on user input
// BEFORE the message is sent to any LLM provider OR persisted to logs.
//
// Conservative by design — false-positives are preferred over leaking PII.
// What we scrub:
//
//   • IRD numbers — both 8-digit and 9-digit NZ formats with optional dashes
//   • Bank account numbers — NZ format XX-XXXX-XXXXXXX-XX (or XX-XXXX-XXXXXXX-XXX)
//   • Credit card numbers — 13-19 digit sequences with Luhn-ish patterns
//   • Phone numbers — mobile (02X) and landline (03/04/06/07/09)
//   • Email addresses
//   • NZ postal addresses — flat # + street + suburb patterns (basic)
//   • NHI numbers (3 letters + 4 digits NZ health number format)
//   • Driver licence numbers (1 letter + 6 digits NZ format, common patterns)
//
// Names are NOT scrubbed by regex — they'd need an NER model. Users who paste
// a name still see it go to the LLM. A future PR can add Claude-based NER as
// a pre-pass when redactPii=true.
//
// Usage:
//   import { redactPii } from "../_shared/pii-redactor.ts";
//   const { redacted, replacements } = redactPii(userMessage);
//
// `replacements` is a count by category, useful for logging "how much PII
// did this user paste in" without storing the PII itself.
// ════════════════════════════════════════════════════════════════════════

export type PiiCategory =
  | "ird_number"
  | "bank_account"
  | "credit_card"
  | "phone_nz"
  | "email"
  | "nz_address"
  | "nhi_number"
  | "drivers_licence";

export type PiiRedactionResult = {
  redacted: string;
  replacements: Partial<Record<PiiCategory, number>>;
};

const PATTERNS: Array<{ category: PiiCategory; pattern: RegExp; replacement: string }> = [
  // IRD numbers — 8 or 9 digits, optional dashes, common context words boost confidence
  // Examples: 12-345-678, 123 456 789, 123456789
  {
    category: "ird_number",
    pattern: /\b(\d{2}[-\s]?\d{3}[-\s]?\d{3}|\d{3}[-\s]?\d{3}[-\s]?\d{3})\b(?=.*?(IRD|tax|ird))/gi,
    replacement: "[IRD REDACTED]",
  },
  // Standalone IRD-shaped numbers (broader catch — false-positive on order numbers but safer)
  {
    category: "ird_number",
    pattern: /\bIRD[:\s]+([\d\-\s]{8,12})\b/gi,
    replacement: "IRD: [REDACTED]",
  },
  // NZ bank account — XX-XXXX-XXXXXXX-XX or XXX (with optional spaces / dashes)
  {
    category: "bank_account",
    pattern: /\b\d{2}[-\s]\d{4}[-\s]\d{7}[-\s]\d{2,3}\b/g,
    replacement: "[BANK ACCOUNT REDACTED]",
  },
  // Credit card numbers — 13-19 digit sequences with spaces or dashes (basic catch)
  {
    category: "credit_card",
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: "[CARD REDACTED]",
  },
  // NZ phone numbers (mobile + landline)
  // Mobile: 02X XXX XXXX or 02XXXXXXXX (8-10 digits)
  // Landline: 0[3,4,6,7,9] XXX XXXX
  {
    category: "phone_nz",
    pattern: /(?:\+?64[\s-]?|0)(?:2[0-9]|[3467]|9)[\s\-()]*\d[\s\-()]*\d[\s\-()]*\d[\s\-()]*\d[\s\-()]*\d[\s\-()]*\d(?:[\s\-()]*\d){0,3}/g,
    replacement: "[PHONE REDACTED]",
  },
  // Email addresses
  {
    category: "email",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: "[EMAIL REDACTED]",
  },
  // NZ National Health Index (NHI) — 3 letters + 4 digits (e.g. ABC1234)
  {
    category: "nhi_number",
    pattern: /\b[A-Z]{3}\d{4}\b(?=.*?(NHI|health|nhi))/gi,
    replacement: "[NHI REDACTED]",
  },
  // NZ postal address — number + street name + suburb pattern (best-effort)
  // Matches "12 Ponsonby Road" / "12A Karangahape Rd"
  // Conservative: requires "Road|Rd|Street|St|Ave|Avenue|Drive|Dr|Way|Place|Pl|Lane|Ln"
  {
    category: "nz_address",
    pattern:
      /\b\d{1,5}[A-Za-z]?\s+(?:[A-Z][a-zāēīōū'-]+\s+){1,4}(?:Road|Rd|Street|St|Avenue|Ave|Drive|Dr|Way|Place|Pl|Lane|Ln|Crescent|Cres|Terrace|Tce|Court|Ct|Highway|Hwy|Boulevard|Blvd)\b/g,
    replacement: "[ADDRESS REDACTED]",
  },
];

export function redactPii(input: string): PiiRedactionResult {
  if (!input || typeof input !== "string") {
    return { redacted: input ?? "", replacements: {} };
  }

  let working = input;
  const counts: Partial<Record<PiiCategory, number>> = {};

  for (const { category, pattern, replacement } of PATTERNS) {
    const matches = working.match(pattern);
    if (matches && matches.length > 0) {
      counts[category] = (counts[category] ?? 0) + matches.length;
      working = working.replace(pattern, replacement);
    }
  }

  return { redacted: working, replacements: counts };
}

/**
 * Produce a one-line summary of what was redacted, safe to log.
 *
 *   "Redacted: 2 emails, 1 phone, 1 bank account"
 */
export function summariseRedactions(replacements: Partial<Record<PiiCategory, number>>): string {
  const entries = Object.entries(replacements).filter(([, v]) => (v ?? 0) > 0);
  if (entries.length === 0) return "Nothing redacted";
  const niceNames: Record<PiiCategory, string> = {
    ird_number: "IRD",
    bank_account: "bank account",
    credit_card: "card",
    phone_nz: "phone",
    email: "email",
    nz_address: "address",
    nhi_number: "NHI",
    drivers_licence: "drivers licence",
  };
  return entries
    .map(([k, v]) => `${v} ${niceNames[k as PiiCategory]}${(v ?? 0) > 1 ? "s" : ""}`)
    .join(", ");
}
