import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', () => ({ doOwner: vi.fn(), sameDoOrigin: vi.fn(), privateDoHeaders: { 'Cache-Control': 'private, no-store' } }));
vi.mock('@/apps/do/personal/memory-service', () => ({ loadPersonalMemory: vi.fn(), mutatePersonalMemory: vi.fn(), MemoryConflict: class extends Error {} }));
import { doOwner, sameDoOrigin } from '@/apps/do/services/owner';
import { loadPersonalMemory, mutatePersonalMemory, MemoryConflict } from '@/apps/do/personal/memory-service';
import { GET, POST } from './route';
const input = { action: 'delete', id: '11111111-1111-4111-8111-111111111111', expectedRevision: 1 };
const request = (body = input) => new Request('https://example.test/api/do/personal/memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(doOwner).mockResolvedValue({ id: 'owner-a', externalId: 'do:user:owner-a' }); vi.mocked(sameDoOrigin).mockReturnValue(true); });
it('guest contract needs no linked account and stores nothing', async () => {
 vi.mocked(doOwner).mockResolvedValue(null);
 const response = await GET();
 expect(response.status).toBe(200);
 expect(await response.json()).toMatchObject({ records: [], storage: 'none', saved: false });
 expect(loadPersonalMemory).not.toHaveBeenCalled();
 expect((await POST(request())).status).toBe(401);
});
it('rejects foreign origin before mutation', async () => {
 vi.mocked(sameDoOrigin).mockReturnValue(false);
 expect((await POST(request())).status).toBe(403);
 expect(mutatePersonalMemory).not.toHaveBeenCalled();
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
