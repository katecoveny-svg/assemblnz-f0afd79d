// ═══════════════════════════════════════════════════════════
// Privacy Shield — PII Detection & Redaction Engine
// Scrubs names, phone numbers, NZ addresses, IRD numbers,
// email addresses, and bank accounts before AI calls.
// ═══════════════════════════════════════════════════════════

export interface RedactionResult {
  scrubbed: string;
  redactions: RedactionItem[];
  riskLevel: "none" | "low" | "medium" | "high";
}

export interface RedactionItem {
  type: string;
  original: string;
  position: number;
}

// NZ phone patterns: +64, 0X, 02X mobiles, landlines
const NZ_PHONE = /(?:\+64[\s-]?|0)(?:2[0-9][\s-]?\d{3,4}[\s-]?\d{3,4}|[3-9][\s-]?\d{3}[\s-]?\d{3,4})/g;

// IRD numbers (8 or 9 digits, often with dashes)
const IRD_NUMBER = /\b\d{2,3}[-\s]?\d{3}[-\s]?\d{3}\b/g;

// Email addresses
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// NZ bank account (BB-bbbb-AAAAAAA-SSS)
const NZ_BANK = /\b\d{2}[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d{2,3}\b/g;

// NZ addresses — street number + name + type + optional city
const NZ_ADDRESS = /\b\d{1,5}[A-Za-z]?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Place|Pl|Terrace|Tce|Way|Lane|Ln|Crescent|Cres|Close|Cl|Boulevard|Blvd|Court|Ct|Parade|Pde|Circuit|Cct)\b(?:,?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?(?:,?\s*\d{4})?/gi;

// Common NZ names (first names) — broad detection
const NZ_NAMES_PATTERN = /\b(?:James|John|Robert|Michael|David|Richard|Thomas|William|Sarah|Jessica|Jennifer|Emily|Emma|Hannah|Grace|Sophie|Charlotte|Olivia|Aroha|Hine|Mere|Ngaire|Wiremu|Tama|Rawiri|Rangi|Manu|Marama|Hemi|Rua|Kahu|Mihi|Tui|Moana|Nikau|Ataahua|Kapua|Kahurangi)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;

// Full names (Capitalised Word + Capitalised Word pattern, 2-3 words)
const FULL_NAMES = /\b[A-Z][a-z]{1,15}\s+(?:[A-Z][a-z]{1,15}\s+)?[A-Z][a-z]{1,20}\b/g;

// Common NZ city/suburb exclusions for full name detection
const PLACE_NAMES = new Set([
  "New Zealand", "North Island", "South Island", "Bay of Plenty",
  "East Cape", "West Coast", "Central Otago", "Far North",
  "Mount Eden", "Mount Albert", "Mount Roskill", "Mount Wellington",
  "North Shore", "South Auckland", "East Auckland", "West Auckland",
  "Queen Street", "High Street", "Victoria Street", "Albert Street",
]);

function isLikelyName(match: string): boolean {
  if (PLACE_NAMES.has(match)) return false;
  // Filter out common non-name patterns
  const words = match.split(/\s+/);
  if (words.length < 2) return false;
  // All words must start with uppercase
  return words.every(w => /^[A-Z]/.test(w));
}

/**
 * Scrub PII from text before sending to AI.
 */
export function scrubPII(text: string): RedactionResult {
  const redactions: RedactionItem[] = [];
  let scrubbed = text;

  const patterns: [RegExp, string, string][] = [
    [NZ_BANK, "[NZ-BANK-REDACTED]", "Bank Account"],
    [IRD_NUMBER, "[IRD-REDACTED]", "IRD Number"],
    [EMAIL, "[EMAIL-REDACTED]", "Email"],
    [NZ_PHONE, "[PHONE-REDACTED]", "Phone Number"],
    [NZ_ADDRESS, "[ADDRESS-REDACTED]", "NZ Address"],
    [NZ_NAMES_PATTERN, "[NAME-REDACTED]", "Name (Known)"],
  ];

  for (const [regex, replacement, type] of patterns) {
    scrubbed = scrubbed.replace(regex, (match, offset) => {
      redactions.push({ type, original: match, position: offset });
      return replacement;
    });
  }

  // Full name detection (more conservative — only if looks like a person name)
  scrubbed = scrubbed.replace(FULL_NAMES, (match, offset) => {
    if (!isLikelyName(match)) return match;
    // Don't double-redact
    if (match.includes("REDACTED")) return match;
    redactions.push({ type: "Name (Pattern)", original: match, position: offset });
    return "[NAME-REDACTED]";
  });

  const riskLevel: RedactionResult["riskLevel"] =
    redactions.length === 0 ? "none" :
    redactions.length <= 2 ? "low" :
    redactions.length <= 5 ? "medium" : "high";

  return { scrubbed, redactions, riskLevel };
}

/**
 * Quick check if text contains PII (without full redaction).
 */
export function containsPII(text: string): boolean {
  return (
    NZ_PHONE.test(text) ||
    IRD_NUMBER.test(text) ||
    EMAIL.test(text) ||
    NZ_BANK.test(text) ||
    NZ_ADDRESS.test(text)
  );
}
