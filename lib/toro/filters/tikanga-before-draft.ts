/**
 * tikanga.before_draft — pre-LLM tikanga gate.
 *
 * Stub for Phase 1: scans the incoming message for a small list of
 * banned terms (reserved taonga / tapu words misused as casual
 * vocabulary). Real implementation reads the
 * `assembl-core/tikanga-compliance` skill content and applies the
 * full reserved-taonga + mana-whenua + kaitiakitanga rules.
 */
import type { Filter, FilterContext, FilterResult } from './types';

const BANNED_TERMS = ['mana whenua', 'taonga', 'tapu', 'whakapapa'];

export const tikangaBeforeDraft: Filter = {
  name: 'tikanga_before_draft',
  phase: 'before_draft',
  async run(ctx: FilterContext): Promise<FilterResult> {
    const lower = ctx.incomingMessage.toLowerCase();
    for (const term of BANNED_TERMS) {
      const t = term.toLowerCase();
      if (
        lower.includes(`${t} as a `) ||
        lower.includes(`my ${t}`) ||
        lower.includes(`name our ${t}`) ||
        lower.includes(`brand ${t}`) ||
        lower.includes(`${t} branding`)
      ) {
        return {
          pass: false,
          reason: `tikanga_before_draft: incoming message uses reserved term "${term}" in a way that needs human review`,
          receiptAddition: { tikanga_before: `flagged: reserved term "${term}"` },
        };
      }
    }
    return {
      pass: true,
      receiptAddition: { tikanga_before: 'passed' },
    };
  },
};
