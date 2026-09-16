import { beforeEach, describe, expect, it } from 'vitest';

import {
  LINDA_SEED_BOARDS,
  addIssue,
  createSeedStore,
  lindaStorageKey,
  mergeSeedBoards,
  nextOpenTodos,
  openIssues,
  parseLindaStore,
  readLindaStore,
  resetLindaStore,
  updateIssue,
  writeLindaStore,
} from './linda';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe('Linda store', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('seeds boards for each DO workstream', () => {
    const store = createSeedStore();
    expect(store.boards.map((board) => board.id)).toEqual([
      'portable-widget',
      'white-label-maker',
      'household-floor',
      'meeting-do',
      'connections-mcp',
      'downloads',
      'linda-meta',
    ]);
    expect(store.boards.every((board) => board.issues.length > 0)).toBe(true);
  });

  it('persists per owner key and round-trips', () => {
    const seed = createSeedStore('2026-09-16T09:00:00.000Z');
    const written = writeLindaStore(storage, 'user-1', seed);
    expect(storage.getItem(lindaStorageKey('user-1'))).toContain('portable-widget');
    const read = readLindaStore(storage, 'user-1');
    expect(read.boards).toHaveLength(written.boards.length);
    expect(readLindaStore(storage, 'device').boards[0]?.id).toBe(LINDA_SEED_BOARDS[0]?.id);
  });

  it('updates issue status and adds tasks', () => {
    let store = createSeedStore();
    store = updateIssue(store, 'meeting-do', 'mt-signin', { status: 'done' });
    const meeting = store.boards.find((board) => board.id === 'meeting-do');
    expect(meeting?.issues.find((item) => item.id === 'mt-signin')?.status).toBe('done');
    store = addIssue(store, 'meeting-do', { title: '  Prep smoke checklist  ', priority: 'p1' });
    expect(
      nextOpenTodos(store.boards.find((b) => b.id === 'meeting-do')!, 5).some(
        (i) => i.title === 'Prep smoke checklist',
      ),
    ).toBe(true);
  });

  it('returns next open todos sorted by priority', () => {
    const portable = LINDA_SEED_BOARDS.find((board) => board.id === 'portable-widget')!;
    const next = nextOpenTodos(portable, 3);
    expect(next).toHaveLength(3);
    expect(next.every((item) => item.status !== 'done')).toBe(true);
    expect(next[0]?.priority).toBe('p0');
    expect(openIssues(portable.issues).some((item) => item.status === 'blocked')).toBe(true);
  });

  it('merges newly seeded boards without wiping saved edits', () => {
    const store = createSeedStore();
    const trimmed = {
      ...store,
      boards: store.boards.filter((board) => board.id !== 'linda-meta'),
    };
    const merged = mergeSeedBoards(trimmed);
    expect(merged.boards.some((board) => board.id === 'linda-meta')).toBe(true);
    expect(parseLindaStore({ version: 1, updatedAt: 'x', boards: [] })).toBeNull();
  });

  it('resets to seed', () => {
    let store = createSeedStore();
    store = addIssue(store, 'downloads', { title: 'Temp note' });
    writeLindaStore(storage, 'device', store);
    const reset = resetLindaStore(storage, 'device');
    expect(reset.boards.find((b) => b.id === 'downloads')?.issues.some((i) => i.title === 'Temp note')).toBe(false);
  });
});
