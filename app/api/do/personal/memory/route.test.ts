import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', () => ({ doOwner: vi.fn(), sameDoOrigin: vi.fn(), privateDoHeaders: { 'Cache-Control': 'private, no-store' } }));
vi.mock('@/apps/do/personal/memory-service', () => ({ loadPersonalMemory: vi.fn(), mutatePersonalMemory: vi.fn(), MemoryConflict: class extends Error {} }));
import { doOwner, sameDoOrigin } from '@/apps/do/services/owner';
import { loadPersonalMemory, mutatePersonalMemory, MemoryConflict } from '@/apps/do/personal/memory-service';
import { GET, POST } from './route';
const input = { action: 'delete', id: '11111111-1111-4111-8111-111111111111', expectedRevision: 1 };
const request = (body = input, workspace: string | null = 'owner-a') => new Request('https://example.test/api/do/personal/memory', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(workspace ? { 'X-DO-Workspace': workspace } : {}) }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(doOwner).mockResolvedValue({ id: 'owner-a', externalId: 'do:user:owner-a' }); vi.mocked(sameDoOrigin).mockReturnValue(true); });
it('guest contract needs no linked account and stores nothing', async () => {
 vi.mocked(doOwner).mockResolvedValue(null);
 const response = await GET();
 expect(response.status).toBe(200);
 expect(await response.json()).toMatchObject({ records: [], storage: 'none', saved: false });
 expect(loadPersonalMemory).not.toHaveBeenCalled();
 expect((await POST(request())).status).toBe(401);
});
it('rejects foreign origin and a stale signed-in owner before mutation', async () => {
 vi.mocked(sameDoOrigin).mockReturnValue(false);
 expect((await POST(request())).status).toBe(403);
 vi.mocked(sameDoOrigin).mockReturnValue(true);
 const stale = await POST(request(input, 'owner-b'));
 expect(stale.status).toBe(409);
 expect(await stale.json()).toMatchObject({ workspaceChanged: true });
 expect(mutatePersonalMemory).not.toHaveBeenCalled();
});
it('tells the page which owner the notes belong to', async () => {
 vi.mocked(loadPersonalMemory).mockResolvedValue([]);
 expect(await (await GET()).json()).toMatchObject({ storage: 'account', workspaceKey: 'owner-a' });
});
it('ignores no client owner override; strict schema rejects it', async () => {
 expect((await POST(request({ ...input, ownerId: 'owner-b' } as typeof input))).status).toBe(400);
 expect(mutatePersonalMemory).not.toHaveBeenCalled();
});
it('uses verified owner and reports CAS conflicts', async () => {
 vi.mocked(mutatePersonalMemory).mockRejectedValue(new MemoryConflict());
 expect((await POST(request())).status).toBe(409);
 expect(mutatePersonalMemory).toHaveBeenCalledWith('owner-a', input);
});
it('storage absence fails closed with private uncached response', async () => {
 vi.mocked(loadPersonalMemory).mockRejectedValue(new Error('missing table'));
 const response = await GET();
 expect(response.status).toBe(503);
 expect(response.headers.get('Cache-Control')).toBe('private, no-store');
 expect(await response.json()).toMatchObject({ storage: 'unavailable', saved: false });
});

it('binds reads and writes to two independently verified owners', async () => {
 for (const owner of ['owner-a', 'owner-b']) {
  vi.mocked(doOwner).mockResolvedValue({ id: owner, externalId: `do:user:${owner}` });
  vi.mocked(loadPersonalMemory).mockResolvedValue([]);
  expect(await (await GET()).json()).toMatchObject({ workspaceKey: owner, records: [] });
  vi.mocked(mutatePersonalMemory).mockResolvedValue(null);
  expect(await (await POST(request(input, owner))).json()).toMatchObject({ workspaceKey: owner, saved: true });
  expect(mutatePersonalMemory).toHaveBeenLastCalledWith(owner, input);
 }
});
it('rejects an A draft after another tab switches to B, including missing expectation', async () => {
 vi.mocked(doOwner).mockResolvedValue({ id: 'owner-b', externalId: 'do:user:owner-b' });
 for (const expected of ['owner-a', null]) {
  const response = await POST(request(input, expected));
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ workspaceChanged: true });
 }
 expect(mutatePersonalMemory).not.toHaveBeenCalled();
});
