/** A short-lived, same-tab draft. Only its opaque identifier enters the URL. */
export const HOME_BRIEF_KEY = 'assembl:do:home-brief';
export const HOME_BRIEF_MAX_LENGTH = 4000;
export const HOME_BRIEF_TTL_MS = 15 * 60 * 1000;

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Public destinations for homepage job handoff (Kate lock — working DOs only). */
export type PublicDoHandoffTarget = 'do' | 'meetings' | 'household';

export function resolvePublicDoHandoffTarget(brief: string): PublicDoHandoffTarget {
  const lower = brief.toLowerCase();
  if (/\b(meeting|transcript|notes|record|call|hui)\b/.test(lower)) return 'meetings';
  if (/\b(household|chore|chores|family board|evening board)\b/.test(lower)) return 'household';
  return 'do';
}

export function saveHomeBrief(
  storage: DraftStorage,
  value: string,
  now = Date.now(),
  target: PublicDoHandoffTarget = 'do',
): string {
  const brief = value.trim();
  if (!brief || brief.length > HOME_BRIEF_MAX_LENGTH) {
    throw new Error('Enter a brief of up to 4,000 characters.');
  }
  const id = crypto.randomUUID();
  storage.setItem(HOME_BRIEF_KEY, JSON.stringify({ id, brief, savedAt: now }));
  const handoff = encodeURIComponent(id);
  if (target === 'meetings') return `/do/meetings?from=home&handoff=${handoff}`;
  if (target === 'household') return `/do/household`;
  return `/do?from=home&handoff=${handoff}`;
}

export function readHomeBrief(storage: DraftStorage, id: string, now = Date.now()): string | null {
  try {
    const raw = storage.getItem(HOME_BRIEF_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (
      !draft || typeof draft.savedAt !== 'number' || !Number.isFinite(draft.savedAt) ||
      now < draft.savedAt || now - draft.savedAt >= HOME_BRIEF_TTL_MS ||
      typeof draft.brief !== 'string' || !draft.brief.trim() ||
      draft.brief.length > HOME_BRIEF_MAX_LENGTH
    ) {
      storage.removeItem(HOME_BRIEF_KEY);
      return null;
    }
    return draft.id === id ? draft.brief : null;
  } catch {
    return null;
  }
}
