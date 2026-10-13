import { afterEach, describe, expect, it, vi } from 'vitest';
import { changeLocalDrafts, hasUnownedLocalDrafts, DO_DRAFTS_KEY, LocalDraftOwnerChangedError } from './local-drafts';
const owner = '11111111-1111-4111-8111-111111111111';
afterEach(() => { vi.unstubAllGlobals(); });
function locks() {
  let queue = Promise.resolve();
  vi.stubGlobal('navigator', { locks: { request: (_: string, callback: () => unknown) => {
    const result = queue.then(callback); queue = result.then(() => {}, () => {}); return result;
  } } });
}
describe('browser draft transaction boundary', () => {
  it('serializes concurrent read/modify/write transactions across the shared owner lock', async () => {
    locks(); const entries: string[] = [];
    await Promise.all(['one', 'two'].map(value => changeLocalDrafts(owner, async () => owner, () => true, () => { entries.push(value); return [...entries]; })));
    expect(entries).toEqual(['one', 'two']);
  });
  it('does not write when queued identity or editor lifetime changes', async () => {
    locks(); const change = vi.fn();
    await expect(changeLocalDrafts(owner, async () => 'guest', () => true, change)).rejects.toBeInstanceOf(LocalDraftOwnerChangedError);
    await expect(changeLocalDrafts(owner, async () => owner, () => false, change)).rejects.toThrow('account changed');
    expect(change).not.toHaveBeenCalled();
  });
  it('fails without writing when verification or cross-tab locking is unavailable', async () => {
    locks(); const change = vi.fn();
    const offline = new Error('offline');
    await expect(changeLocalDrafts(owner, async () => { throw offline; }, () => true, change)).rejects.toBe(offline);
    vi.stubGlobal('navigator', {});
    await expect(changeLocalDrafts(owner, async () => owner, () => true, change)).rejects.toThrow('unavailable');
    expect(change).not.toHaveBeenCalled();
  });
});

describe('legacy quarantine discovery', () => {
  it('finds legacy and guest keys without retrieving their content', () => {
    for (const legacy of [DO_DRAFTS_KEY, `${DO_DRAFTS_KEY}:guest`]) {
      const getItem = vi.fn(() => { throw new Error('Unowned content must not be read'); });
      const storage = { length: 2, key: (index: number) => [localStorageKey, legacy][index], getItem };
      expect(hasUnownedLocalDrafts(storage)).toBe(true);
      expect(getItem).not.toHaveBeenCalled();
    }
  });
  it('does not treat an account key as an unowned record', () => {
    expect(hasUnownedLocalDrafts({ length: 1, key: () => localStorageKey })).toBe(false);
  });
});
const localStorageKey = `${DO_DRAFTS_KEY}:${owner}`;
