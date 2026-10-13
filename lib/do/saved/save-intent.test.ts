import { describe, expect, it } from 'vitest';
import { cleanSourceUrl, saveIntentSchema, searchSaved, taskFromSaved } from './save-intent';
import { savedExamples } from './fixtures';
import { SavedRepository, type SavedRecord, type SavedStore } from './durable';
const note = { version: 1 as const, kind: 'note' as const, title: 'A fictional idea', text: 'Make a quiet reading corner.', sourceUrl: '', tags: ['space'] };
const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const id = '33333333-3333-4333-8333-333333333333';
const now = '2026-10-13T12:00:00.000Z';
class TestStore implements SavedStore {
  rows = new Map<string, SavedRecord>();
  async list(owner: string) { return [...this.rows.values()].filter(row => row.ownerId === owner && !row.deleted); }
  async read(owner: string, key: string) { return this.rows.get(`${owner}:${key}`) ?? null; }
  async compareAndSwap(owner: string, key: string, revision: number, next: SavedRecord) {
    if ((this.rows.get(`${owner}:${key}`)?.revision ?? 0) !== revision) return null;
    this.rows.set(`${owner}:${key}`, structuredClone(next)); return structuredClone(next);
  }
}
describe('reviewed Save intent', () => {
  it('strips queries and fragments before review', () => expect(cleanSourceUrl('https://example.com/story?token=private#selection')).toBe('https://example.com/story'));
  it.each(['http://example.com', 'https://name:pass@example.com', 'javascript:alert(1)', 'file:///a', 'https://127.1', 'https://0x7f000001', 'https://2130706433', 'https://[::1]', 'https://[::ffff:127.0.0.1]', 'https://169.254.169.254/', 'https://localhost', 'https://app.local', 'https://intranet.internal', 'https://example.com:8443'])('rejects unsafe source %s', url => expect(() => cleanSourceUrl(url)).toThrow());
  it('rejects hidden capture/owner/remote image fields', () => {
    for (const extra of [{ ownerId: a }, { imageUrl: 'https://example.com/a.jpg' }, { html: '<script>' }, { consent: true }]) expect(saveIntentSchema.safeParse({ ...note, ...extra }).success).toBe(false);
  });
  it('requires bounded useful content and de-duplicates optional tags', () => {
    expect(saveIntentSchema.safeParse({ ...note, text: 'x'.repeat(6001) }).success).toBe(false);
    expect(saveIntentSchema.safeParse({ ...note, kind: 'link' }).success).toBe(false);
    expect(saveIntentSchema.parse({ ...note, tags: ['', 'space', 'space'] }).tags).toEqual(['space']);
  });
  it('searches multiple literal terms across metadata with type filters', () => {
    expect(searchSaved(savedExamples, 'timber home', 'image')).toHaveLength(1);
    expect(searchSaved(savedExamples, '[.*]', 'all')).toEqual([]);
    expect(searchSaved(savedExamples, 'timber', 'note')).toEqual([]);
  });
  it('prepares an inert source-linked task without image payload or authority', () => {
    const draft = taskFromSaved(savedExamples[0], 'List three ideas to try.');
    expect(draft).toContain('example-home · revision 1'); expect(draft).toContain('Preparation only');
    expect(draft).not.toContain('.webp'); expect(draft).not.toContain('consent');
    expect(() => taskFromSaved(savedExamples[0], '')).toThrow();
  });
});
describe('inactive durable owner/CAS model', () => {
  it('isolates owners even when IDs coincide and rejects switched-owner expectations', async () => {
    const store = new TestStore(), repoA = new SavedRepository(store, a), repoB = new SavedRepository(store, b);
    await repoA.save(a, id, 0, note, now);
    expect(await repoB.get(b, id)).toBeNull();
    await expect(repoA.get(b, id)).rejects.toMatchObject({ code: 'owner_changed' });
    await expect(repoB.remove(b, id, 1, now)).rejects.toMatchObject({ code: 'not_found' });
  });
  it('has exactly one winner for concurrent edits', async () => {
    const repo = new SavedRepository(new TestStore(), a); await repo.save(a, id, 0, note, now);
    const results = await Promise.allSettled([repo.save(a, id, 1, { ...note, title: 'first' }, now), repo.save(a, id, 1, { ...note, title: 'second' }, now)]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  });
  it('erases content and keeps tombstones to prevent stale resurrection', async () => {
    const store = new TestStore(), repo = new SavedRepository(store, a); await repo.save(a, id, 0, note, now);
    const removed = await repo.remove(a, id, 1, now); expect(removed.content).toBeNull(); expect(removed.revision).toBe(2);
    const restarted = new SavedRepository(store, a);
    await expect(restarted.save(a, id, 2, note, now)).rejects.toMatchObject({ code: 'deleted' });
    expect((await restarted.remove(a, id, 2, now)).revision).toBe(2);
  });
  it('fails closed on storage errors or foreign rows with no fallback', async () => {
    const store = new TestStore(), repo = new SavedRepository(store, a); await repo.save(a, id, 0, note, now);
    const bad = { ...await repo.get(a, id), ownerId: b };
    await expect(new SavedRepository({ list: async () => [], read: async () => bad, compareAndSwap: async () => null }, a).get(a, id)).rejects.toMatchObject({ code: 'unavailable' });
    await expect(new SavedRepository({ list: async () => [], read: async () => { throw new Error('offline'); }, compareAndSwap: async () => null }, a).get(a, id)).rejects.toThrow('offline');
  });
  it('refuses durable image save until owner-only blob storage is proven', async () => {
    await expect(new SavedRepository(new TestStore(), a).save(a, id, 0, { ...note, kind: 'image' }, now)).rejects.toMatchObject({ code: 'unavailable' });
  });
});
