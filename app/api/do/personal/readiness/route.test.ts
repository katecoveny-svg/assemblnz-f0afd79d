import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), readiness: vi.fn(), admit: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner, privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } }));
vi.mock('@/apps/do/shared/http', () => ({ admitDoRequest: mocks.admit }));
vi.mock('@/apps/do/personal/readiness', () => ({ persistenceReadiness: mocks.readiness }));
import { GET } from './route';
const a = { id: '11111111-1111-4111-8111-111111111111', externalId: 'do:user:11111111-1111-4111-8111-111111111111' };
const b = { id: '22222222-2222-4222-8222-222222222222', externalId: 'do:user:22222222-2222-4222-8222-222222222222' };
const request = (suffix = '', signal?: AbortSignal) => new Request(`https://do.example.invalid/api/do/personal/readiness${suffix}`, { signal });
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue(a); mocks.admit.mockReturnValue(true); mocks.readiness.mockImplementation(async owner => ({ ownerId: owner.id, metadataOnly: true })); });
describe('owner-only persistence readiness HTTP', () => {
  it.each([a, b])('uses only the authenticated owner $id and private headers', async owner => {
    mocks.owner.mockResolvedValue(owner);
    const response = await GET(request());
    expect(await response.json()).toEqual({ ownerId: owner.id, metadataOnly: true });
    expect(mocks.readiness).toHaveBeenCalledWith(owner, expect.any(AbortSignal));
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie');
  });
  it('rejects anonymous, cross-owner/query requests before diagnostics', async () => {
    mocks.owner.mockResolvedValueOnce(null); expect((await GET(request())).status).toBe(401);
    for (const query of ['?ownerId=' + b.id, '?purge=true', '?table=auth.users']) expect((await GET(request(query))).status).toBe(400);
    expect(mocks.readiness).not.toHaveBeenCalled();
  });
  it.each([b, null, { ...a, externalId: b.externalId }])('rejects stale responses after an owner change', async changed => {
    mocks.owner.mockResolvedValueOnce(a).mockResolvedValueOnce(changed);
    const response = await GET(request()); expect(response.status).toBe(409);
    expect(await response.text()).not.toContain(a.id);
  });
  it('discards cancelled late diagnostics and sanitises errors', async () => {
    const controller = new AbortController();
    mocks.readiness.mockImplementationOnce(async () => { controller.abort(); return { ownerId: a.id }; });
    expect((await GET(request('', controller.signal))).status).toBe(503);
    mocks.readiness.mockRejectedValueOnce(new Error('private notes'));
    expect(await (await GET(request())).text()).not.toContain('private notes');
  });
  it('rate limits by verified owner before diagnostics', async () => {
    mocks.admit.mockReturnValue(false); expect((await GET(request())).status).toBe(429);
    expect(mocks.admit).toHaveBeenCalledWith(`persistence-readiness:${a.id}`);
    expect(mocks.readiness).not.toHaveBeenCalled();
  });
});
