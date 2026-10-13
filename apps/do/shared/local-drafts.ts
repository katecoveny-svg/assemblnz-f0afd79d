import { z } from 'zod';
import { cleanSourceUrl, DO_SOURCE_LIMIT, type DoPreparedDraft } from './preparation';

export const DO_DRAFTS_KEY = 'assembl:do:drafts:v1';
type LocalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type SavedDoDraft = { draft: DoPreparedDraft; source: string; brief: string };
const savedSchema = z.object({
  source: z.string().max(DO_SOURCE_LIMIT), brief: z.string().max(2_000),
  draft: z.object({
    version: z.literal(1), id: z.string().uuid(), task: z.enum(['reply', 'plan', 'brief', 'meeting-notes', 'compare', 'rewrite', 'extract']),
    title: z.string().max(300), text: z.string().max(20_000), createdAt: z.string().datetime(),
    status: z.enum(['draft', 'reviewed']), reviewer: z.string().max(100).optional(),
    reviewedAt: z.string().datetime().optional(), reviewedTextHash: z.string().max(64).optional(),
    evidence: z.object({
      method: z.enum(['model', 'exact-extraction']), model: z.string().max(100).nullable(),
      reasoning: z.object({ provider: z.literal('typesafe'), model: z.string().max(100), action: z.string().max(100) }).optional(),
      providerConsentVersion: z.literal('do-openai-typesafe-v1').optional(),
      sourceTitle: z.string().max(160), sourceUrl: z.string().max(1_000).transform(cleanSourceUrl),
      sourceHash: z.string().length(64), sourceCharacters: z.number().min(1).max(DO_SOURCE_LIMIT),
      instructionHash: z.string().length(64), outputHash: z.string().length(64),
      consentAt: z.string().datetime(), boundary: z.string().max(1_000),
    }),
  }),
});

/** The unowned v1 key is deliberately never read, moved or deleted by account operations. */
export function localDraftsKey(owner: string): string {
  return `${DO_DRAFTS_KEY}:${z.string().uuid().parse(owner)}`;
}

export function readLocalDrafts(storage: LocalStorage, owner: string): SavedDoDraft[] {
  const raw = storage.getItem(localDraftsKey(owner));
  if (raw === null) return [];
  if (raw.length > 1_000_000) throw new Error('Saved drafts need recovery; existing data was preserved.');
  // Reject the entire record rather than overwrite unreadable or partially corrupt data.
  return z.array(savedSchema).max(8).parse(JSON.parse(raw));
}

export function saveLocalDraft(storage: LocalStorage, entry: SavedDoDraft, owner: string, expected?: SavedDoDraft | null): SavedDoDraft[] {
  const parsed = savedSchema.parse(entry);
  const previous = readLocalDrafts(storage, owner);
  if (expected !== undefined && JSON.stringify(previous.find(item => item.draft.id === entry.draft.id) ?? null) !== JSON.stringify(expected === null ? null : savedSchema.parse(expected))) {
    throw new Error('This draft changed in another tab. Download your edit, then reopen the saved copy before replacing it.');
  }
  if (previous.length >= 8 && !previous.some(item => item.draft.id === entry.draft.id)) {
    throw new Error('Eight drafts are already saved. Download or remove one before saving another.');
  }
  const next = [parsed, ...previous.filter(item => item.draft.id !== entry.draft.id)];
  storage.setItem(localDraftsKey(owner), JSON.stringify(next)); return next;
}

export function removeLocalDraft(storage: LocalStorage, id: string, owner: string, expected?: SavedDoDraft): SavedDoDraft[] {
  const previous = readLocalDrafts(storage, owner);
  if (expected && JSON.stringify(previous.find(item => item.draft.id === id)) !== JSON.stringify(expected === null ? null : savedSchema.parse(expected))) throw new Error('This draft changed in another tab. Reopen it before removing it.');
  const next = previous.filter(item => item.draft.id !== id);
  if (next.length) storage.setItem(localDraftsKey(owner), JSON.stringify(next)); else storage.removeItem(localDraftsKey(owner));
  return next;
}

/** Serialize read/modify/write across same-origin tabs; unsupported browsers fail without a write. */
export async function changeLocalDrafts<T>(owner: string, verify: () => Promise<string>, current: () => boolean, change: () => T): Promise<T> {
  if (!navigator.locks) throw new Error('Safe browser saving is unavailable. Download a copy instead.');
  return navigator.locks.request(localDraftsKey(owner), async () => {
    if (await verify() !== owner || !current()) throw new Error('The account changed. Reopen your own workspace before saving.');
    return change();
  });
}

/** An edit invalidates the recorded review; it must be reviewed again. */
export function editDoDraft(draft: DoPreparedDraft, text: string): DoPreparedDraft {
  return { ...draft, text, status: 'draft', reviewedAt: undefined, reviewedTextHash: undefined, reviewer: undefined };
}
