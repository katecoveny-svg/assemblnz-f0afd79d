// ════════════════════════════════════════════════════════════════════════
// nz-pii-redact — strip the most common NZ PII patterns from free text
// before persisting it in the cleartext incoming_body of a toro_drafts row.
//
// Scope (v1):
//   - NZ mobile numbers (021/022/027/028/029, with or without spacing,
//     including +64 international form)
//   - NZ landlines (03/04/06/07/09, 7-8 digit subscriber, with optional
//     area-code separation)
//   - Email addresses (rfc5322-ish; deliberately loose to catch obvious
//     forms, intentional false positives over false negatives)
//   - IRD numbers (8-9 digits, with or without hyphens — anchored by the
//     literal token "IRD" within 12 chars to avoid eating year ranges
//     and contact phone numbers)
//   - NZ bank account numbers (BB-bbbb-AAAAAAA-SS shape — anchored on the
//     full 4-section pattern so we don't eat dates or other dash strings)
//
// Names, addresses, and child-specific identifiers are NOT redacted by
// this helper. Kids' names are needed by the notice parser to produce
// per-kid action rows, and a generic name-redactor over English text
// produces too many false positives ("Mt Eden", "Roy" the lunch order
// reminder). Names sit in extracted_actions with explicit kid_name on
// each action — the application layer renders them and retains them
// under the kids_data retention class.
//
// Tested in __tests__/nz-pii-redact.test.ts.
// ════════════════════════════════════════════════════════════════════════

export type RedactionStats = {
  mobiles: number;
  landlines: number;
  emails: number;
  ird_numbers: number;
  bank_accounts: number;
};

export type RedactionResult = {
  redacted: string;
  stats: RedactionStats;
};

// NZ bank account: 2 digits / dash / 4 digits / dash / 7-8 digits / dash / 2-3 digits.
// e.g. 12-3045-0789012-00, 03-1234-5678901-000.
const BANK_ACCOUNT_RE = /\b\d{2}-\d{4}-\d{7,8}-\d{2,3}\b/g;

// NZ mobile numbers. Accept:
//   021 234 5678 · 0212345678 · +64 21 234 5678 · 022-345-6789
// Mobile prefixes per Comcom register: 021, 022, 027, 028, 029.
// Subscriber length is 6–8 digits after the prefix.
//
// Require an explicit leading `+64` or `0` to avoid eating naked digit
// runs that happen to start with 2 (years, ID numbers, addresses).
const NZ_MOBILE_RE =
  /(?:\+64[\s-]?|0)2[12789][\s-]?\d{3,4}[\s-]?\d{3,4}/g;

// NZ landlines. Area codes 03, 04, 06, 07, 09 (we deliberately exclude 02
// to avoid colliding with mobiles). Subscriber length is 7 digits — we
// require a leading `+64` or `0` for the same reason as mobile.
const NZ_LANDLINE_RE =
  /(?:\+64[\s-]?|0)[34679][\s-]?\d{3}[\s-]?\d{4}/g;

// Loose email regex — catches common forms. We accept dotted local parts,
// plus addressing, and the usual TLDs. Not RFC-perfect by design.
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// IRD: 8-9 digit run, optionally hyphenated (XX-XXX-XXX or XXX-XXX-XXX),
// anchored on the literal token "IRD" within 16 chars on either side. This
// keeps us from eating order numbers, NSNs, NHIs, or postcode-like runs.
const IRD_RE =
  /\bIRD\b[^.\n]{0,16}?\b(\d{2,3}[-\s]?\d{3}[-\s]?\d{3})\b/gi;

/**
 * Redact NZ-specific PII patterns from arbitrary free text. Returns the
 * redacted string plus a counter of how many of each pattern matched.
 *
 * Replacement markers preserve the pattern class so downstream readers
 * (parent reviewing the draft, audit log inspector) can see what was
 * stripped and decide if context still makes sense. Examples:
 *
 *   "ring 0274567890 if any issues"  →  "ring [REDACTED:mobile] if any issues"
 *   "IRD 123-456-789 for the trip"   →  "[REDACTED:ird]"
 */
export function redactNzPii(input: string): RedactionResult {
  const stats: RedactionStats = {
    mobiles: 0,
    landlines: 0,
    emails: 0,
    ird_numbers: 0,
    bank_accounts: 0,
  };

  let out = input;

  // Order matters: bank accounts first (most specific), then phones (mobile
  // before landline so the 02x prefix wins), then IRD, then emails.
  out = out.replace(BANK_ACCOUNT_RE, () => {
    stats.bank_accounts += 1;
    return "[REDACTED:bank_account]";
  });

  out = out.replace(NZ_MOBILE_RE, () => {
    stats.mobiles += 1;
    return "[REDACTED:mobile]";
  });

  out = out.replace(NZ_LANDLINE_RE, () => {
    stats.landlines += 1;
    return "[REDACTED:landline]";
  });

  // IRD regex captures "IRD ... <number>" as a whole; the replacement
  // collapses the entire match to a single marker.
  out = out.replace(IRD_RE, () => {
    stats.ird_numbers += 1;
    return "[REDACTED:ird]";
  });

  out = out.replace(EMAIL_RE, () => {
    stats.emails += 1;
    return "[REDACTED:email]";
  });

  return { redacted: out, stats };
}
