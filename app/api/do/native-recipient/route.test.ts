import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), user: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner, privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' } }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: mocks.user } }) }));
import { GET } from './route';
const owner = { id: '10000000-0000-4000-8000-000000000001', externalId: 'do:user:10000000-0000-4000-8000-000000000001' };
beforeEach(() => { mocks.owner.mockReset(); mocks.user.mockReset(); mocks.user.mockResolvedValue({data:{user:{id:owner.id,email:'alex@example.invalid',is_anonymous:false}},error:null}); });
describe('native recipient metadata route', () => {
  it('returns only server-verified owner metadata, private and uncached', async () => {
    mocks.owner.mockResolvedValue(owner);
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/native-recipient'));
    expect(await response.json()).toEqual({ version: 1, owner: owner.id, scope: 'Personal', label: 'alex@example.invalid' });
    expect(response.headers.get('Cache-Control')).toBe('private, no-store'); expect(response.headers.get('Vary')).toBe('Cookie');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull(); expect(mocks.owner).toHaveBeenCalledOnce();
  });
  it('fails closed for missing/anonymous owner resolved by doOwner', async () => {
    mocks.owner.mockResolvedValue(null);mocks.user.mockResolvedValue({data:{user:null},error:null});
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/native-recipient'));
    expect(response.status).toBe(401); expect(await response.json()).toEqual({ error: 'sign_in_required' });
  });
  it('rejects query payloads and cross-site requests without resolving identity', async () => {
    for (const request of [new Request('https://www.assembl.co.nz/api/do/native-recipient?text=fictional'), new Request('https://www.assembl.co.nz/api/do/native-recipient', { headers: { 'sec-fetch-site': 'cross-site' } })]) {
      expect((await GET(request)).status).toBe(400);
    }
    expect(mocks.owner).not.toHaveBeenCalled();
  });
  it('rejects a changed owner while resolving the human-readable account label', async () => {
    mocks.owner.mockResolvedValue(owner);mocks.user.mockResolvedValue({data:{user:{id:'other',email:'other@example.invalid'}},error:null});
    expect((await GET(new Request('https://www.assembl.co.nz/api/do/native-recipient'))).status).toBe(503);
  });
  it('falls back to owner ID for an unsafe display label', async () => {
    mocks.owner.mockResolvedValue(owner);mocks.user.mockResolvedValue({data:{user:{id:owner.id,email:'unsafe\nlabel'}},error:null});
    expect((await (await GET(new Request('https://www.assembl.co.nz/api/do/native-recipient'))).json()).label).toBe(`Account ${owner.id}`);
  });

  it('keeps transport/config failure distinct from sign-in', async () => {
    mocks.user.mockRejectedValue(Error('fictional offline'));
    const response=await GET(new Request('https://www.assembl.co.nz/api/do/native-recipient'));
    expect(response.status).toBe(503);expect(await response.json()).toEqual({error:'recipient_unavailable'});expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

});
