/**
 * tikanga.after_draft — cultural-drift gate on the generated draft.
 *
 * Stub: scans the draft body for the small set of tokens we expect
 * to always appear with macrons in customer-facing copy (Tōro,
 * Pīkau, Waihanga, etc). If a macron-less form is present, flag
 * it. Real implementation reads the full
 * `assembl-core/tikanga-compliance` skill and applies the wider
 * banned-words / reserved-taonga / anglicised-reo rules.
 *
 * Non-blocking by design: pass=true always. The receipt records
 * either `tikanga_after: 'passed'` or `tikanga_after: 'flagged: <reason>'`
 * for a reviewer to act on in the inbox UI.
 */
import type { Filter, FilterContext, FilterResult } from './types';

interface MacronCheck {
  bare: string;       // anglicised, no macrons
  correct: string;    // canonical form with macrons
}

const MACRON_REQUIRED: MacronCheck[] = [
  { bare: 'Toro',       correct: 'Tōro' },
  { bare: 'Pikau',      correct: 'Pīkau' },
  { bare: 'Waihanga',   correct: 'Waihanga' }, // intentionally no macron — kept here for shape parity / future Māori words
  { bare: 'Maori',      correct: 'Māori' },
  { bare: 'Aotearoa',   correct: 'Aotearoa' }, // no macron required, but the bare/canonical pair shape stays uniform
  { bare: 'whanau',     correct: 'whānau' },
  { bare: 'Pakeha',     correct: 'Pākehā' },
];

export const tikangaAfterDraft: Filter = {
  name: 'tikanga_after_draft',
  phase: 'after_draft',
  async run(ctx: FilterContext): Promise<FilterResult> {
    const draft = (ctx.draftBody ?? '').toString();
    if (draft.length === 0) {
      return {
        pass: true,
        receiptAddition: { tikanga_after: 'passed' },
      };
    }

    const flags: string[] = [];

    for (const { bare, correct } of MACRON_REQUIRED) {
      if (bare === correct) continue; // no anglicised form to detect
      // word-boundary match, case-sensitive on first letter so "tor" (e.g.
      // a verb fragment) doesn't trip the check; we look for either
      // capitalised or lowercase bare form depending on how it's used.
      const patterns = [
        new RegExp(`\\b${escapeRegex(bare)}\\b`, 'g'),
        new RegExp(`\\b${escapeRegex(bare.toLowerCase())}\\b`, 'g'),
      ];
      for (const p of patterns) {
        if (p.test(draft)) {
          flags.push(`missing macrons in "${bare}" → expected "${correct}"`);
          break;
        }
      }
    }

    // Banned token: the bare two-letter automation word in customer-
    // facing copy. Allow common false-positives (the Māori word "ai", the
    // pronoun in mid-sentence) by requiring uppercase A and uppercase I
    // adjacent.
    if (/\bAI\b/.test(draft)) {
      flags.push('banned automation token "AI" present in customer-facing draft');
    }

    if (flags.length === 0) {
      return {
        pass: true,
        receiptAddition: { tikanga_after: 'passed' },
      };
    }

    return {
      pass: true,
      receiptAddition: {
        tikanga_after: `flagged: ${flags.join('; ')}`,
        flags,
      },
    };
  },
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
