import { beforeEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ owner: vi.fn(), invoke: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mock.owner, privateDoHeaders: { 'Cache-Control': 'private, no-store' }, sameDoOrigin: (req: Request) => req.headers.get('origin') === new URL(req.url).origin }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ functions: { invoke: mock.invoke } }) }));
import { GET, POST } from './route';
beforeEach(() => { vi.clearAllMocks(); mock.owner.mockResolvedValue({ id: 'fixture-owner' }); });
it('anonymous readiness does not probe providers or claim missing configuration', async () => {
  mock.owner.mockResolvedValue(null); const response = await GET();
  expect(response.status).toBe(401); expect(await response.json()).toMatchObject({ state: 'auth_required', configured: null }); expect(mock.invoke).not.toHaveBeenCalled();
});
it('only makes an authenticated GET and rejects legacy readiness', async () => {
  mock.invoke.mockResolvedValue({ data: { ok: true }, error: null });
  expect(await (await GET()).json()).toMatchObject({ reason: 'compatible_adapter_unavailable', configured: null });
  expect(mock.invoke).toHaveBeenCalledWith('live-travel', { method: 'GET' });
});
it('configuration never grants spend even if an adapter claims readiness', async () => {
  mock.invoke.mockResolvedValue({ data: { contract: 'do.travel.search.v2', configured: true, canSearch: true, verified: true }, error: null });
  expect(await (await GET()).json()).toMatchObject({ configured: true, canSearch: false, verified: false, entitlement: 'unverified' });
});
it('search cannot bypass missing authority or same-origin checks', async () => {
  expect((await POST(new Request('https://local.test/api', { method: 'POST', headers: { origin: 'https://local.test' } }))).status).toBe(403);
  expect((await POST(new Request('https://local.test/api', { method: 'POST', headers: { origin: 'https://other.test' } }))).status).toBe(403);
  expect(mock.invoke).not.toHaveBeenCalled();
});
it('sanitizes readiness errors', async () => {
  mock.invoke.mockRejectedValue(new Error('private provider information'));
  const response = await GET(); expect(response.status).toBe(502); expect(await response.text()).not.toContain('private provider');
});
