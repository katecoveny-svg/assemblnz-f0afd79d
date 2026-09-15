import { describe, expect, it } from 'vitest';
import { HOME_BRIEF_KEY, HOME_BRIEF_MAX_LENGTH, HOME_BRIEF_TTL_MS, readHomeBrief, saveHomeBrief } from './home-handoff';

function session() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  };
}

describe('homepage to DO draft handoff', () => {
  it('keeps the brief out of the URL and preserves Unicode and punctuation across refresh', () => {
    const storage = session();
    const brief = 'Prepare a whānau journey & questions? #review / costs';
    const destination = saveHomeBrief(storage, `  ${brief}  `, 1000);
    const url = new URL(destination, 'https://www.assembl.co.nz');
    const id = url.searchParams.get('handoff')!;
    expect(url.pathname).toBe('/do');
    expect(url.searchParams.get('from')).toBe('home');
    expect(url.searchParams.has('brief')).toBe(false);
    expect(destination).not.toContain(encodeURIComponent(brief));
    expect(readHomeBrief(storage, id, 2000)).toBe(brief);
    expect(readHomeBrief(storage, id, 3000)).toBe(brief);
    expect(readHomeBrief(session(), id, 3000)).toBeNull();
    expect(readHomeBrief(storage, 'different-draft', 3000)).toBeNull();
  });

  it('expires and removes a draft after 15 minutes', () => {
    const storage = session();
    const url = new URL(saveHomeBrief(storage, 'A response plan', 1000), 'https://www.assembl.co.nz');
    expect(readHomeBrief(storage, url.searchParams.get('handoff')!, 1000 + HOME_BRIEF_TTL_MS)).toBeNull();
    expect(storage.getItem(HOME_BRIEF_KEY)).toBeNull();
  });

  it('rejects empty and oversized drafts without creating a handoff', () => {
    const storage = session();
    expect(() => saveHomeBrief(storage, '  ')).toThrow();
    expect(() => saveHomeBrief(storage, 'x'.repeat(HOME_BRIEF_MAX_LENGTH + 1))).toThrow();
    expect(storage.getItem(HOME_BRIEF_KEY)).toBeNull();
  });

  it('handles malformed or unavailable browser storage', () => {
    const storage = session();
    storage.setItem(HOME_BRIEF_KEY, '{broken');
    expect(readHomeBrief(storage, 'id')).toBeNull();
    storage.setItem(HOME_BRIEF_KEY, 'null');
    expect(readHomeBrief(storage, 'id')).toBeNull();
    const denied = { ...storage, getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    expect(readHomeBrief(denied, 'id')).toBeNull();
    expect(() => saveHomeBrief(denied, 'Retain my brief')).toThrow();
  });
});
