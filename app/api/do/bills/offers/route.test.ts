import { beforeEach, describe, expect, it, vi } from 'vitest';

const book = vi.hoisted(() => ({ live: true, lastVerified: '2026-10-11T16:00:02.229+00:00', plans: [] as Record<string, unknown>[] }));
vi.mock('@/lib/bills/provider-prices', () => ({ getPriceBook: async () => book }));
import { GET } from './route';

const plan = (patch: Record<string, unknown> = {}) => ({
  id: 'plan-1', category: 'electricity', provider: 'Example Retailer', planName: 'Flat', monthlyCost: 180, features: ['No fixed term'],
  eligibilityNotes: null, sourceUrl: 'https://example.org/plans', sourceHost: 'example.org', lastVerified: '2026-10-11T16:00:02.229+00:00', trustTier: 'A', status: 'active', ...patch,
});
const get = (query: string) => GET(new Request('https://www.assembl.co.nz/api/do/bills/offers' + query));

describe('public offers for one category', () => {
  beforeEach(() => { book.plans = [plan(), plan({ id: 'plan-2', category: 'broadband', monthlyCost: 79 }), plan({ id: 'bad', sourceUrl: 'http://insecure.example' })]; book.live = true; });
  it('returns only the asked category with dated sources and drops rows that fail the public contract', async () => {
    const response = await get('?category=electricity');
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=900');
    expect(body.category).toBe('electricity');
    expect(body.live).toBe(true);
    expect(body.offers.map((offer: { id: string }) => offer.id)).toEqual(['plan-1']);
    expect(body.offers[0]).toMatchObject({ sourceHost: 'example.org', lastVerified: '2026-10-11T16:00:02.229+00:00' });
    expect(body.lastVerified).toBe('2026-10-11T16:00:02.229+00:00');
    expect(JSON.stringify(body)).not.toContain('insecure');
  });
  it('rejects categories the comparison does not understand', async () => {
    for (const query of ['', '?category=gas', '?category=council_rates', '?category=<script>']) expect((await get(query)).status).toBe(400);
  });
  it('is honest when the book is empty or unavailable', async () => {
    book.plans = []; book.live = false;
    const body = await (await get('?category=broadband')).json();
    expect(body).toEqual({ category: 'broadband', live: false, offers: [], lastVerified: null });
  });
});
