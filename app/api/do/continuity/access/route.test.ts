import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), client: vi.fn(), rpc: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner,
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  sameDoOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.client }));
import { POST } from './route';
import { GET } from '../route';
const post = (body: unknown, workspace = 'owner') => new Request('https://assembl.nz/api/do/continuity/access', {
  method: 'POST', headers: { Origin: 'https://assembl.nz', 'Content-Type': 'application/json', 'X-DO-Workspace': workspace }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('DO_CONTINUITY_DURABLE_ENABLED', 'true');
  mocks.owner.mockResolvedValue({ id: 'owner' }); mocks.client.mockResolvedValue({ rpc: mocks.rpc });
});
afterEach(() => vi.unstubAllEnvs());
it('enabling needs a fresh literal consent and reaches the owner RPC with no owner argument', async () => {
  expect((await POST(post({ scope: 'personal', enable: true }))).status).toBe(400);
  expect((await POST(post({ scope: 'personal', enable: true, consent: false }))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
  mocks.rpc.mockResolvedValue({ data: { scope: 'personal', enabled: true, expiresAt: '2027-01-11T00:00:00.000Z' }, error: null });
  const response = await POST(post({ scope: 'personal', enable: true, consent: true }));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ access: { enabled: true }, durable: true, workspaceKey: 'owner' });
  expect(mocks.rpc).toHaveBeenCalledWith('do_continuity_access', { p_scope: 'personal', p_enable: true });
});
it('turning sync off needs no consent and stops a stale workspace from switching another owner', async () => {
  mocks.rpc.mockResolvedValue({ data: { scope: 'work', enabled: false, expiresAt: null }, error: null });
  expect((await POST(post({ scope: 'work', enable: false }))).status).toBe(200);
  expect(mocks.rpc).toHaveBeenCalledWith('do_continuity_access', { p_scope: 'work', p_enable: false });
  expect((await POST(post({ scope: 'work', enable: false }, 'old-owner'))).status).toBe(409);
});
it('a deployment with sync switched off says so and never touches the database', async () => {
  vi.stubEnv('DO_CONTINUITY_DURABLE_ENABLED', 'false');
  const response = await POST(post({ scope: 'personal', enable: true, consent: true }));
  expect(response.status).toBe(503);
  expect(mocks.client).not.toHaveBeenCalled();
});
it('listing with sync off for the owner returns no task content and the switch state', async () => {
  mocks.rpc.mockResolvedValueOnce({ data: { scope: 'personal', enabled: false, expiresAt: null }, error: null });
  const response = await GET(new Request('https://assembl.nz/api/do/continuity?scope=personal'));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ tasks: [], access: { enabled: false }, durable: true });
  expect(mocks.rpc).toHaveBeenCalledTimes(1);
});
it('listing with sync on reads tasks after the access check', async () => {
  mocks.rpc.mockResolvedValueOnce({ data: { scope: 'personal', enabled: true, expiresAt: '2027-01-11T00:00:00.000Z' }, error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  const response = await GET(new Request('https://assembl.nz/api/do/continuity?scope=personal'));
  expect(await response.json()).toMatchObject({ tasks: [], access: { enabled: true }, durable: true, storage: 'database' });
  expect(mocks.rpc).toHaveBeenNthCalledWith(2, 'do_continuity_read', { p_scope: 'personal', p_id: null });
});
