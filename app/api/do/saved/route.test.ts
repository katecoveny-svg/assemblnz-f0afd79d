import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), client: vi.fn(), rows: new Map<string, Record<string, unknown>>(), filters: [] as string[], fault: false }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner,
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  sameDoOrigin: (request: Request) => request.headers.get('origin') === new URL(request.url).origin }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.client }));
import { GET, POST } from './route';
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', id = '33333333-3333-4333-8333-333333333333';
const content = { version: 1, kind: 'note', title: 'Fictional test', text: 'Try a new shelf.', sourceUrl: '', tags: [] };
const save = { action: 'save', id, expectedRevision: 0, content, consent: true, consentVersion: 'do-saved-v1' };
function request(body?: unknown, owner = a, origin = 'https://assembl.test') {
  return new Request('https://assembl.test/api/do/saved', { method: body ? 'POST' : 'GET', headers: { Origin: origin, 'X-DO-Workspace': owner, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
// Fluent transport fixture: exercises the real route + repository + Postgres adapter.
// PostgreSQL grants/RLS/triggers are independently verified by the embedded SQL harness.
function fakeClient() {
  return { from(table: string) {
    expect(table).toBe('do_saved_items');
    let operation = 'read', payload: Record<string, unknown> = {}, filters: Record<string, unknown> = {}, single = false;
    const execute = () => {
      if (mocks.fault) return { data: null, error: { message: 'private database detail must not escape' } };
      let rows = [...mocks.rows.values()].filter(row => Object.entries(filters).every(([key, value]) => row[key] === value));
      if (operation === 'insert') {
        const key = `${payload.owner_id}:${payload.id}`;
        if (mocks.rows.has(key)) return { data: null, error: { code: '23505' } };
        const row = { ...payload, created_at: '2026-10-14T00:00:00Z', updated_at: '2026-10-14T00:00:00Z' };
        mocks.rows.set(key, row); rows = [row];
      } else if (operation === 'update') {
        rows = rows.map(row => { const next = { ...row, ...payload }; mocks.rows.set(`${row.owner_id}:${row.id}`, next); return next; });
      }
      return { data: single ? rows[0] ?? null : rows, error: null };
    };
    const chain = {
      select: (_fields: string) => chain,
      eq: (key: string, value: unknown) => { filters[key] = value; mocks.filters.push(`${key}:${value}`); return chain; },
      order: () => chain, limit: () => chain,
      insert: (value: Record<string, unknown>) => { operation = 'insert'; payload = value; return chain; },
      update: (value: Record<string, unknown>) => { operation = 'update'; payload = value; return chain; },
      maybeSingle: () => { single = true; return Promise.resolve(execute()); },
      then: (resolve: (value: unknown) => void) => Promise.resolve(execute()).then(resolve),
    }; return chain;
  } };
}
beforeEach(() => { vi.clearAllMocks(); mocks.rows.clear(); mocks.filters = []; mocks.fault = false; mocks.owner.mockResolvedValue({ id: a }); mocks.client.mockImplementation(async () => fakeClient()); vi.stubEnv('DO_SAVED_DURABLE_ENABLED', 'true'); });
afterEach(() => vi.unstubAllEnvs());
it('is disabled by default and never touches auth, data or client while closed', async () => {
  vi.stubEnv('DO_SAVED_DURABLE_ENABLED', '');
  for (const response of [await GET(request()), await POST(request(save))]) {
    expect(response.status).toBe(503); expect(await response.json()).toMatchObject({ durable: false });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  }
  expect(mocks.owner).not.toHaveBeenCalled(); expect(mocks.client).not.toHaveBeenCalled();
});
it('rejects origin, signed-out and changed workspace before any data access', async () => {
  expect((await POST(request(save, a, 'https://evil.test'))).status).toBe(403);
  expect((await GET(request(undefined, a, ''))).status).toBe(403);
  mocks.owner.mockResolvedValue(null); expect((await POST(request(save))).status).toBe(401);
  mocks.owner.mockResolvedValue({ id: b }); expect((await POST(request(save))).status).toBe(409);
  expect(mocks.client).not.toHaveBeenCalled();
});
it.each([{ consent: false }, { ownerId: b }, { content: { ...content, kind: 'image' } }, { consentVersion: 'old' }, { expectedRevision: -1 }, { html: '<script>' }])('rejects invalid or unreviewed writes %j', async extra => {
  expect((await POST(request({ ...save, ...extra }))).status).toBe(400); expect(mocks.client).not.toHaveBeenCalled();
});
it('enforces streamed byte limit without logging or echoing content', async () => {
  const response = await POST(request({ ...save, content: { ...content, text: 'x'.repeat(41000) } }));
  expect(response.status).toBe(400); expect(mocks.client).not.toHaveBeenCalled();
});
it('saves, lists, conflicts, edits and erases through the real adapter', async () => {
  const initial = await POST(request(save)); expect(initial.status).toBe(200);
  const first = (await initial.json()).item; expect(first.revision).toBe(1);
  const reloaded = await GET(request()); expect((await reloaded.json()).items).toHaveLength(1);
  expect((await POST(request(save))).status).toBe(409);
  const edit = await POST(request({ ...save, expectedRevision: 1, content: { ...content, text: 'Reviewed new note' } })); expect(edit.status).toBe(200);
  expect(mocks.filters).toContain(`owner_id:${a}`); expect(mocks.filters).toContain('revision:1');
  const removed = await POST(request({ action: 'remove', id, expectedRevision: 2 })); expect(removed.status).toBe(200);
  expect((await removed.json()).item).toMatchObject({ content: null, deleted: true, revision: 3 });
  expect((await (await GET(request())).json()).items).toEqual([]);
  expect((await POST(request({ ...save, expectedRevision: 3 }))).status).toBe(409);
});
it('keeps accounts isolated across fresh requests and returns no foreign data', async () => {
  await POST(request(save)); mocks.owner.mockResolvedValue({ id: b });
  expect((await (await GET(request(undefined, b))).json()).items).toEqual([]);
  expect((await POST(request({ action: 'remove', id, expectedRevision: 1 }, b))).status).toBe(404);
});
it('fails closed on backend outage with no success, fallback or private error text', async () => {
  mocks.fault = true;
  for (const response of [await GET(request()), await POST(request(save))]) {
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('private database detail');
  }
});
