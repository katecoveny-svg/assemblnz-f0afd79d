import { beforeEach, describe, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ consume: vi.fn(), sources: vi.fn() }));
vi.mock('@/lib/creative/ratelimit', () => ({ consume: m.consume }));
vi.mock('@/lib/lead-capture', () => ({ clientIpFromHeaders: () => '127.0.0.1' }));
vi.mock('@/lib/specialists/live-sources', () => ({ retrieveSpecialistSources: m.sources }));
import { GET } from './route';
beforeEach(() => { vi.clearAllMocks(); m.consume.mockResolvedValue({ ok: true }); m.sources.mockResolvedValue([]); });
const request = new Request('https://www.assembl.co.nz/api/specialists/retirement/sources?topic=care');
describe('public official-source check budget', () => {
  it('rejects unknown specialists before fetching any external page', async () => { expect((await GET(request, { params: Promise.resolve({ slug: 'one-nz' }) })).status).toBe(404); expect(m.sources).not.toHaveBeenCalled(); });
  it('stops external fetches when the public check limit is reached', async () => { m.consume.mockResolvedValue({ ok: false }); const r = await GET(request, { params: Promise.resolve({ slug: 'retirement' }) }); expect(r.status).toBe(429); expect(r.headers.get('cache-control')).toBe('no-store'); expect(m.sources).not.toHaveBeenCalled(); expect(m.consume).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/), 'copy'); });
  it('returns bounded excerpts and actual retrieval metadata without caching', async () => { m.sources.mockResolvedValue([{ status: 'retrieved', id: 'care-subsidy', excerpt: 'x'.repeat(2000), hash: 'source-hash', retrievedAt: '2026-09-10' }]); const r = await GET(request, { params: Promise.resolve({ slug: 'retirement' }) }); const body = await r.json(); expect(body.checks[0].excerpt).toHaveLength(600); expect(body.checks[0].hash).toBe('source-hash'); expect(m.consume.mock.invocationCallOrder[0]).toBeLessThan(m.sources.mock.invocationCallOrder[0]); });
});
