import { beforeEach, expect, it, vi } from 'vitest';
import { POST } from './route';
const mocks = vi.hoisted(() => ({ owner: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner, privateDoHeaders: { 'Cache-Control': 'private, no-store' }, sameDoOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin }));
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue({ id: 'adult-a' }); });
function req(origin = 'https://example.com', workspace = 'adult-a') { return new Request('https://example.com/api/do/family/school-pilot', { method: 'POST', headers: { origin, 'x-do-workspace': workspace }, body: 'Private payload must not be read' }); }
it('keeps even authenticated requests closed without parsing private data', async () => { const r = req(); const read = vi.spyOn(r, 'json'); const response = await POST(r); expect(response.status).toBe(423); expect(read).not.toHaveBeenCalled(); expect(response.headers.get('Cache-Control')).toBe('private, no-store'); expect(await response.json()).toMatchObject({ enabled: false, stored: false, externalActions: false }); });
it('rejects cross-origin before auth', async () => { expect((await POST(req('https://other.example'))).status).toBe(403); expect(mocks.owner).not.toHaveBeenCalled(); });
it('requires a current adult session', async () => { mocks.owner.mockResolvedValue(null); expect((await POST(req())).status).toBe(401); });
it('rejects stale workspace identity', async () => { expect((await POST(req(undefined, 'adult-b'))).status).toBe(409); });
