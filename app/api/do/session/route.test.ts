import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: mocks.user } }) }));
import { GET } from './route';
const owner = '11111111-1111-4111-8111-111111111111';
beforeEach(() => { mocks.user.mockReset(); });
describe('writing identity verification', () => {
  it('returns only verified identity with private no-store headers', async () => {
    mocks.user.mockResolvedValue({ data: { user: { id: owner, email: 'fixture@example.invalid' } }, error: null });
    const response = await GET();
    expect(await response.json()).toEqual({ workspaceKey: owner });
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Vary')).toBe('Cookie');
  });
  it.each([null, { name: 'AuthSessionMissingError' }, { status: 401 }, { status: 403 }])('does not grant account storage for absent or expired authentication: %j', async error => {
    mocks.user.mockResolvedValue({ data: { user: null }, error });
    expect(await (await GET()).json()).toEqual({ workspaceKey: 'guest' });
  });
  it('keeps anonymous identities transient', async () => {
    mocks.user.mockResolvedValue({ data: { user: { id: owner, is_anonymous: true } }, error: null });
    expect(await (await GET()).json()).toEqual({ workspaceKey: 'guest' });
  });
  it('never turns a failed identity lookup into a guest workspace', async () => {
    mocks.user.mockResolvedValue({ data: { user: null }, error: { status: 500 } });
    expect((await GET()).status).toBe(503);
    mocks.user.mockRejectedValue(new Error('offline'));
    expect((await GET()).status).toBe(503);
  });
});
