import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ admit: vi.fn(), weather: vi.fn(), news: vi.fn() }));
vi.mock('@/apps/do/shared/http', () => ({ admitDoRequest: mocks.admit }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: () => '192.0.2.1' }));
vi.mock('@/lib/do/nz-local-updates', () => ({ nzLocalUpdates: { weather: mocks.weather, news: mocks.news } }));
import { GET } from './route';
const request = (query: string) => new Request(`https://assembl.co.nz/api/do/nz-local-updates${query}`);
beforeEach(() => {
  mocks.admit.mockReset().mockReturnValue(true);
  mocks.weather.mockReset().mockResolvedValue({ status: 'available' });
  mocks.news.mockReset().mockResolvedValue({ status: 'available' });
});

describe('public local-information endpoint', () => {
  it('accepts only a public city ID without an account and keeps browser/CDN caching disabled', async () => {
    const response = await GET(request('?source=weather&place=auckland'));
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.weather).toHaveBeenCalledWith('auckland'); expect(mocks.news).not.toHaveBeenCalled();
    expect(mocks.admit).toHaveBeenCalledWith('nz-local-updates:192.0.2.1');
  });
  it('fetches national news without any location input', async () => {
    expect((await GET(request('?source=geonet-news'))).status).toBe(200);
    expect(mocks.news).toHaveBeenCalledWith(); expect(mocks.weather).not.toHaveBeenCalled();
  });
  it.each(['', '?source=weather', '?source=weather&place=home', '?source=weather&place=auckland&place=wellington',
    '?source=weather&place=auckland&lat=-36.85', '?source=weather&place=auckland&notes=private', '?source=weather&place=auckland&address=home',
    '?source=geonet-news&place=auckland', '?source=geonet-news&place=', '?source=geonet-news&source=weather',
    '?source=https://example.com', '?source=geonet-news&url=https://example.com'])('rejects unknown/private/duplicate input before provider access: %s', async query => {
    expect((await GET(request(query))).status).toBe(400);
    expect(mocks.weather).not.toHaveBeenCalled(); expect(mocks.news).not.toHaveBeenCalled(); expect(mocks.admit).not.toHaveBeenCalled();
  });
  it('responds 503 for unavailable providers rather than pretending an empty success', async () => {
    mocks.weather.mockResolvedValue({ status: 'unavailable' });
    expect((await GET(request('?source=weather&place=wellington'))).status).toBe(503);
    mocks.news.mockResolvedValue({ status: 'unavailable' });
    expect((await GET(request('?source=geonet-news'))).status).toBe(503);
  });
  it('bounds excessive refresh requests before contacting a provider', async () => {
    mocks.admit.mockReturnValue(false);
    const response = await GET(request('?source=weather&place=auckland'));
    expect(response.status).toBe(429); expect(response.headers.get('retry-after')).toBe('60');
    expect(mocks.weather).not.toHaveBeenCalled();
  });
});
