/** A short-lived, same-tab draft. Only its opaque identifier enters the URL. */
export const HOME_BRIEF_KEY = 'assembl:do:home-brief';
export const HOME_BRIEF_MAX_LENGTH = 4000;
export const HOME_BRIEF_TTL_MS = 15 * 60 * 1000;

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function saveHomeBrief(storage: DraftStorage, value: string, now = Date.now()): string {
  const brief = value.trim();
  if (!brief || brief.length > HOME_BRIEF_MAX_LENGTH) {
    throw new Error('Enter a brief of up to 4,000 characters.');
  }
  const id = crypto.randomUUID();
  storage.setItem(HOME_BRIEF_KEY, JSON.stringify({ id, brief, savedAt: now }));
  return `/do?from=home&handoff=${encodeURIComponent(id)}`;
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
