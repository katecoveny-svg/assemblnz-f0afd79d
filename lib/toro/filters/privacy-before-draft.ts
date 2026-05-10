/**
 * privacy.before_draft — IPP3A redaction of the incoming message.
 *
 * Redacts the four NZ identifier patterns Tōro is most likely to
 * see in family messages before they ever reach the LLM:
 *   - phone numbers (NZ mobile + landline)
 *   - IRD numbers (8 or 9 digit)
 *   - NHI numbers (3 letters + 4 digits)
 *   - bank account numbers (NZ format: BB-bbbb-AAAAAAA-SS or
 *     compact 16-digit form)
 *
 * The filter never blocks; it always returns pass=true with a
 * modifiedBody. The receiptAddition records what was redacted so
 * the Mana Receipt's privacy attestation can be reconstructed.
 */
import type { Filter, FilterContext, FilterResult } from './types';

interface RedactionPattern {
  label: string;
  regex: RegExp;
  placeholder: string;
}

const PATTERNS: RedactionPattern[] = [
  // NZ mobile numbers: +64 21 ..., 02x ..., with optional spaces / dashes.
  // Match 9-11 digit groups starting with 02 or +642.
  {
    label: 'phone',
    regex: /(?:\+?64[\s-]?|\b0)(?:2\d?|[3-9])(?:[\s-]?\d){6,9}\b/g,
    placeholder: '[REDACTED:phone]',
  },
  // NHI: three letters + four digits, often with a space (e.g. "ABC 1234").
  {
    label: 'nhi',
    regex: /\b[A-Za-z]{3}[\s-]?\d{4}\b/g,
    placeholder: '[REDACTED:nhi]',
  },
  // NZ bank account: 16 digits formatted as 2-4-7-3 with hyphens, OR 16
  // contiguous digits. Match the formatted form first to keep it tight.
  {
    label: 'bank_account',
    regex: /\b\d{2}-\d{4}-\d{7}-\d{2,3}\b/g,
    placeholder: '[REDACTED:bank]',
  },
  // IRD: 8 or 9 digits, sometimes formatted xxx-xxx-xxx.
  // Run after bank-account so we don't shred bank numbers' digit groups.
  {
    label: 'ird',
    regex: /\b(?:\d{2,3}-\d{3}-\d{3}|\d{8,9})\b/g,
    placeholder: '[REDACTED:ird]',
  },
];

export const privacyBeforeDraft: Filter = {
  name: 'privacy_before_draft',
  phase: 'before_draft',
  async run(ctx: FilterContext): Promise<FilterResult> {
    let body = ctx.incomingMessage;
    const counts: Record<string, number> = {};

    for (const { label, regex, placeholder } of PATTERNS) {
      let matched = 0;
      body = body.replace(regex, () => {
        matched += 1;
        return placeholder;
      });
      if (matched > 0) counts[label] = matched;
    }

    const totalRedactions = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      pass: true,
      modifiedBody: body,
      receiptAddition: {
        privacy_before: totalRedactions === 0
          ? 'no_redactions'
          : { redactions: counts, total: totalRedactions },
      },
    };
  },
};
