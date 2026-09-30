import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ admit: vi.fn(), fetchTraffic: vi.fn() }));
vi.mock('@/apps/do/shared/http', () => ({ admitDoRequest: mocks.admit }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: () => '192.0.2.1' }));
vi.mock('@/lib/do/nz-public-data', () => ({ fetchNztaTraffic: mocks.fetchTraffic }));
import { GET } from './route';

beforeEach(() => {
  mocks.admit.mockReset().mockReturnValue(true);
  mocks.fetchTraffic.mockReset().mockResolvedValue({ status: 'available', fetchedAt: '2026-09-30T03:17:04.000Z', events: [] });
});
describe('public NZ source endpoint', () => {
  it('works without account/auth and prevents cache storage', async () => {
    const request = new Request('https://assembl.co.nz/api/do/nz-public-data?source=nzta-traffic');
    const result = await GET(request);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(mocks.fetchTraffic).toHaveBeenCalledWith({ signal: request.signal });
    expect(mocks.admit).toHaveBeenCalledWith('nz-public-data:192.0.2.1');
  });
  it.each(['?source=bank', '?source=nzta-traffic&source=nzta-traffic', '?notes=private', '?address=home', '?url=https://example.com'])('rejects unknown source/context before upstream fetch: %s', async query => {
    expect((await GET(new Request(`https://assembl.co.nz/api/do/nz-public-data${query}`))).status).toBe(400);
    expect(mocks.fetchTraffic).not.toHaveBeenCalled();
  });
  it('returns a 503 rather than an empty successful traffic result', async () => {
    mocks.fetchTraffic.mockResolvedValue({ status: 'unavailable', events: [] });
    expect((await GET(new Request('https://assembl.co.nz/api/do/nz-public-data'))).status).toBe(503);
  });
  it('bounds refreshes before contacting the source', async () => {
    mocks.admit.mockReturnValue(false);
    const result = await GET(new Request('https://assembl.co.nz/api/do/nz-public-data'));
    expect(result.status).toBe(429);
    expect(result.headers.get('retry-after')).toBe('60');
    expect(mocks.fetchTraffic).not.toHaveBeenCalled();
  });
});
