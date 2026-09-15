import { z } from 'zod';
import { cleanSourceUrl, DO_SOURCE_LIMIT, type DoPreparedDraft } from './preparation';

export const DO_DRAFTS_KEY = 'assembl:do:drafts:v1';
type LocalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type SavedDoDraft = { draft: DoPreparedDraft; source: string; brief: string };
const savedSchema = z.object({
  source: z.string().max(DO_SOURCE_LIMIT), brief: z.string().max(2_000),
  draft: z.object({
    version: z.literal(1), id: z.string().uuid(), task: z.enum(['reply', 'plan', 'brief', 'compare', 'rewrite', 'extract']),
    title: z.string().max(300), text: z.string().max(20_000), createdAt: z.string().datetime(),
    status: z.enum(['draft', 'reviewed']), reviewer: z.string().max(100).optional(),
    reviewedAt: z.string().datetime().optional(), reviewedTextHash: z.string().max(64).optional(),
    evidence: z.object({
      method: z.enum(['model', 'exact-extraction']), model: z.string().max(100).nullable(),
      sourceTitle: z.string().max(160), sourceUrl: z.string().max(1_000).transform(cleanSourceUrl),
      sourceHash: z.string().length(64), sourceCharacters: z.number().min(1).max(DO_SOURCE_LIMIT),
      instructionHash: z.string().length(64), outputHash: z.string().length(64),
      consentAt: z.string().datetime(), boundary: z.string().max(1_000),
    }),
  }),
});

export function readLocalDrafts(storage: LocalStorage): SavedDoDraft[] {
  try {
    const raw = storage.getItem(DO_DRAFTS_KEY);
    if (!raw || raw.length > 1_000_000) return [];
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.slice(0, 8).flatMap(item => {
      const parsed = savedSchema.safeParse(item); return parsed.success ? [parsed.data] : [];
    });
  } catch { return []; }
}

export function saveLocalDraft(storage: LocalStorage, entry: SavedDoDraft): SavedDoDraft[] {
  const parsed = savedSchema.parse(entry);
  const next = [parsed, ...readLocalDrafts(storage).filter(item => item.draft.id !== entry.draft.id)].slice(0, 8);
  storage.setItem(DO_DRAFTS_KEY, JSON.stringify(next)); return next;
}

export function removeLocalDraft(storage: LocalStorage, id: string): SavedDoDraft[] {
  const next = readLocalDrafts(storage).filter(item => item.draft.id !== id);
  if (next.length) storage.setItem(DO_DRAFTS_KEY, JSON.stringify(next)); else storage.removeItem(DO_DRAFTS_KEY);
  return next;
}

/** An edit invalidates the recorded review; it must be reviewed again. */
export function editDoDraft(draft: DoPreparedDraft, text: string): DoPreparedDraft {
  return { ...draft, text, status: 'draft', reviewedAt: undefined, reviewedTextHash: undefined, reviewer: undefined };
}
