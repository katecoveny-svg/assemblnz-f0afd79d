import { z } from 'zod';

export const DO_SOURCE_LIMIT = 12_000;
export const DO_BRIEF_LIMIT = 2_000;
export const DO_RECEIPT_VERSION = 1 as const;
export const DO_TASKS = [
  { id: 'reply', title: 'Write a reply', description: 'A useful response to a message, in the tone you choose.', glyph: '↩' },
  { id: 'plan', title: 'Make a plan', description: 'Turn notes into actions, owners and open questions.', glyph: '✓' },
  { id: 'brief', title: 'Prepare a brief', description: 'A clear handoff, open questions and the next step.', glyph: '↗' },
  {
    id: 'meeting-notes',
    title: 'Smart meeting notes',
    description: 'Clean notes, decisions, actions and a follow-up draft from a transcript.',
    glyph: '◎',
  },
  { id: 'compare', title: 'Compare options', description: 'Differences, trade-offs and details to check.', glyph: '⇄' },
  { id: 'rewrite', title: 'Polish my writing', description: 'A plain-English draft that keeps the meaning.', glyph: '✦' },
  { id: 'extract', title: 'Find the details', description: 'Pull out dates, amounts, links and contact details.', glyph: '⌕' },
] as const;
export type DoTask = (typeof DO_TASKS)[number]['id'];

export function cleanSourceUrl(raw: string): string {
  if (!raw.trim()) return '';
  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    return `${url.origin}${url.pathname}`.slice(0, 1_000);
  } catch { return ''; }
}

export const preparationInputSchema = z.object({
  task: z.enum(['reply', 'plan', 'brief', 'meeting-notes', 'compare', 'rewrite', 'extract']),
  brief: z.string().trim().max(DO_BRIEF_LIMIT).default(''),
  source: z.string().trim().min(1, 'Add the text you want DO to use.').max(DO_SOURCE_LIMIT),
  sourceTitle: z.string().trim().max(160).default('Pasted text'),
  sourceUrl: z.string().max(2_000).default('').transform(cleanSourceUrl),
  consent: z.literal(true, { error: 'Confirm that DO may use this text for this task.' }),
}).strict();
export type DoPreparationInput = z.infer<typeof preparationInputSchema>;
export type DoPreparedDraft = {
  version: typeof DO_RECEIPT_VERSION;
  id: string; task: DoTask; title: string; text: string; createdAt: string;
  status: 'draft' | 'reviewed'; reviewedAt?: string; reviewedTextHash?: string; reviewer?: string;
  evidence: {
    method: 'model' | 'exact-extraction'; model: string | null;
    sourceTitle: string; sourceUrl: string; sourceHash: string; sourceCharacters: number;
    instructionHash: string; outputHash: string; consentAt: string; boundary: string;
  };
};
export type DoAvailability = {
  preparation: 'configured' | 'unavailable'; label: string; note: string;
  extraction: 'available'; storage: 'this-browser'; externalActions: false;
};

/** Exact text matches only. No guessed dates, currency conversions or entities. */
export function extractDetails(text: string): string {
  const patterns = [
    ['Dates', /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?)\b/gi],
    ['Amounts', /(?:\b(?:NZD|AUD|USD|GBP|EUR)\s*|(?:NZ|AU|US)?\$|£|€)\s*\d[\d,]*(?:\.\d{1,2})?(?:\s*(?:per\s+\w+|\/\s*\w+))?/gi],
    ['Email addresses', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
    ['Links', /https?:\/\/[^\s<>"')\]]+/gi],
  ] as const;
  const sections = patterns.map(([label, pattern]) => {
    const values = [...new Set(text.match(pattern) ?? [])].slice(0, 40);
    return `${label}\n${values.length ? values.map(value => `• ${value}`).join('\n') : 'No matching text found.'}`;
  });
  return `${sections.join('\n\n')}\n\nCheck before using\nThese are exact text matches. Confirm their meaning against the source; this check does not establish due dates, price validity or completeness.`;
}

export function draftAsMarkdown(draft: DoPreparedDraft): string {
  const e = draft.evidence;
  return `# ${draft.title}\n\n${draft.text}\n\n---\n\n## Evidence receipt\n\n- Status: ${draft.status === 'reviewed' ? 'Reviewed draft' : 'Draft awaiting review'}\n- Prepared: ${draft.createdAt}\n- Method: ${e.method === 'model' ? `assembl generation (${e.model})` : 'Exact text extraction'}\n- Source: ${e.sourceTitle}${e.sourceUrl ? ` — ${e.sourceUrl}` : ''}\n- Source characters: ${e.sourceCharacters}\n- Source SHA-256: ${e.sourceHash}\n- Instruction SHA-256: ${e.instructionHash}\n- Original output SHA-256: ${e.outputHash}\n${draft.reviewedAt ? `- Reviewed: ${draft.reviewedAt}\n- Reviewer: ${draft.reviewer || 'Not recorded'}\n- Reviewed output SHA-256: ${draft.reviewedTextHash || 'Not recorded'}\n` : ''}- Permission confirmed: ${e.consentAt}\n- Boundary: ${e.boundary}\n\nThis receipt records preparation and review. It is not proof of external delivery or execution.\n`;
}
