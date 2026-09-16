import { beforeEach, describe, expect, it } from 'vitest';

import {
  DO_TASK_SEED_BOARDS,
  addIssue,
  createSeedStore,
  doTasksStorageKey,
  mergeSeedBoards,
  nextOpenTodos,
  openIssues,
  parseDoTaskStore,
  readDoTaskStore,
  resetDoTaskStore,
  updateIssue,
  writeDoTaskStore,
} from './do-tasks';

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

describe('Per-DO task store', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('seeds a board per major DO workstream', () => {
    const store = createSeedStore();
    expect(store.boards.map((board) => board.id)).toEqual([
      'portable-widget',
      'builder',
      'household-floor',
      'meeting-do',
      'writing',
      'personal',
      'connections-mcp',
      'downloads',
      'office',
    ]);
    expect(store.boards.every((board) => board.issues.length > 0)).toBe(true);
  });

  it('persists per owner key and migrates legacy storage', () => {
    const seed = createSeedStore('2026-09-16T09:00:00.000Z');
    storage.setItem('assembl:do:linda:v1:user-1', JSON.stringify(seed));
    const read = readDoTaskStore(storage, 'user-1');
    expect(storage.getItem(doTasksStorageKey('user-1'))).toContain('portable-widget');
    expect(read.boards.some((board) => board.id === 'office' || board.id === 'builder')).toBe(true);
    expect(storage.getItem('assembl:do:linda:v1:user-1')).toBeNull();
  });

  it('updates issue status and adds tasks', () => {
    let store = createSeedStore();
    store = updateIssue(store, 'meeting-do', 'mt-signin', { status: 'done' });
    expect(store.boards.find((board) => board.id === 'meeting-do')?.issues.find((item) => item.id === 'mt-signin')?.status).toBe('done');
    store = addIssue(store, 'meeting-do', { title: '  Prep smoke checklist  ', priority: 'p1' });
    expect(
      nextOpenTodos(store.boards.find((b) => b.id === 'meeting-do')!, 5).some(
        (i) => i.title === 'Prep smoke checklist',
      ),
    ).toBe(true);
  });

  it('returns next open todos sorted by priority', () => {
    const portable = DO_TASK_SEED_BOARDS.find((board) => board.id === 'portable-widget')!;
    const next = nextOpenTodos(portable, 3);
    expect(next).toHaveLength(2);
    expect(next.every((item) => item.status !== 'done')).toBe(true);
    expect(next[0]?.priority).toBe('p0');
    expect(next.map((item) => item.id)).toEqual(
      expect.arrayContaining(['pw-ux', 'pw-meeting-auth']),
    );
    expect(portable.issues.filter((item) => item.status === 'done').map((item) => item.id)).toEqual(
      expect.arrayContaining(['pw-chrome-cta', 'pw-mac-cta']),
    );
  });

  it('merges newly seeded boards without wiping saved edits', () => {
    const store = createSeedStore();
    const trimmed = {
      ...store,
      boards: store.boards.filter((board) => board.id !== 'office'),
    };
    const merged = mergeSeedBoards(trimmed);
    expect(merged.boards.some((board) => board.id === 'office')).toBe(true);
    expect(parseDoTaskStore({ version: 1, updatedAt: 'x', boards: [] })).toBeNull();
  });

  it('resets to seed', () => {
    let store = createSeedStore();
    store = addIssue(store, 'downloads', { title: 'Temp note' });
    writeDoTaskStore(storage, 'device', store);
    const reset = resetDoTaskStore(storage, 'device');
    expect(reset.boards.find((b) => b.id === 'downloads')?.issues.some((i) => i.title === 'Temp note')).toBe(false);
  });
});
