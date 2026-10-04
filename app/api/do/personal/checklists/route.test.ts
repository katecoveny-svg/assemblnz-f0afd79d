import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', async original => ({ ...(await original<typeof import('@/apps/do/services/owner')>()), doOwner: vi.fn() }));
vi.mock('@/apps/do/personal/life-admin/cloud-service', () => ({ loadCloudChecklists: vi.fn(), saveCloudChecklists: vi.fn(), ChecklistConflict: class extends Error {} }));
import { doOwner } from '@/apps/do/services/owner';
import { loadCloudChecklists, saveCloudChecklists, ChecklistConflict } from '@/apps/do/personal/life-admin/cloud-service';
import { GET, POST } from './route';
const owner = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', externalId: 'do:user:a' };
const payload = { plans: [], expectedRevision: 3, consent: true };
const request = (body: unknown = payload, origin: string | null = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/personal/checklists', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': owner.id, ...(origin ? { origin } : {}) }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(doOwner).mockResolvedValue(owner); });
describe('checklist owner boundary', () => {
  it('rejects guests and cross-origin mutations without storage access', async () => {
    for (const origin of [null, 'https://other.example']) expect((await POST(request(payload, origin))).status).toBe(403);
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401); expect((await POST(request())).status).toBe(401);
    expect(loadCloudChecklists).not.toHaveBeenCalled(); expect(saveCloudChecklists).not.toHaveBeenCalled();
  });
  it('binds reads and writes to the verified session, not a client owner', async () => {
    const result = { plans: [], revision: 4, savedAt: '2026-09-30T00:00:00.000Z' };
    vi.mocked(loadCloudChecklists).mockResolvedValue(result); vi.mocked(saveCloudChecklists).mockResolvedValue(result);
    const read = await GET(request()); const write = await POST(request());
    expect(await read.json()).toEqual(result); expect(await write.json()).toEqual(result);
    expect(loadCloudChecklists).toHaveBeenCalledWith(owner.id); expect(saveCloudChecklists).toHaveBeenCalledWith(owner.id, payload);
    expect(read.headers.get('cache-control')).toBe('private, no-store');
    expect((await POST(request({ ...payload, ownerId: 'another' }))).status).toBe(400);
  });
  it('rejects missing consent and invalid JSON without a write', async () => {
    expect((await POST(request({ ...payload, consent: false }))).status).toBe(400);
    const malformed = new Request('https://www.assembl.co.nz/api/do/personal/checklists', { method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'Content-Type': 'application/json', 'X-DO-Workspace': owner.id }, body: '{' });
    expect((await POST(malformed)).status).toBe(400); expect(saveCloudChecklists).not.toHaveBeenCalled();
  });
  it('rejects a session change before reading or writing the old workspace', async () => {
    vi.mocked(doOwner).mockResolvedValue({ ...owner, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' });
    expect((await GET(request())).status).toBe(409); expect((await POST(request())).status).toBe(409);
    expect(loadCloudChecklists).not.toHaveBeenCalled(); expect(saveCloudChecklists).not.toHaveBeenCalled();
  });
  it('reports stale saves as conflicts and sanitises database errors', async () => {
    vi.mocked(saveCloudChecklists).mockRejectedValue(new ChecklistConflict());
    expect((await POST(request())).status).toBe(409);
    vi.mocked(saveCloudChecklists).mockRejectedValue(new Error('credential: private-internal-value'));
    vi.mocked(loadCloudChecklists).mockRejectedValue(new Error('internal query'));
    for (const r of [await GET(request()), await POST(request())]) { expect(r.status).toBe(503); expect(JSON.stringify(await r.json())).not.toContain('internal'); }
  });
});
