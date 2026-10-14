import { afterEach, describe, expect, it, vi } from 'vitest';
import { fuelObservationFrom, readFuelPrices } from '@/lib/do/fuel/server';
import { GET } from './route';

const ok = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('weekly fuel prices', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('reads the edge function and labels live versus fallback', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co/');
    const live = await readFuelPrices(ok({ petrol91: 2.85, petrol95: 3.05, diesel: 2.4, ev: 0.32, source: 'mbie_live', publishedDate: '2026-10-10' }) as typeof fetch);
    expect(live).toMatchObject({ source: 'mbie_weekly', publishedDate: '2026-10-10', prices: { '91': 2.85, '95': 3.05, diesel: 2.4 } });
    expect(fuelObservationFrom(live!, 'diesel')).toMatchObject({ date: '2026-10-10', price: 2.4, source: 'mbie_weekly' });
    const fallback = await readFuelPrices(ok({ petrol91: 2.85, petrol95: 3.05, diesel: 2.4, source: 'fallback', publishedDate: '2026-04-01' }) as typeof fetch);
    expect(fallback?.source).toBe('mbie_fallback');
    expect(fuelObservationFrom(fallback!, '91').label).toContain('not this week');
  });
  it('returns null on bad data, errors or missing configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    expect(await readFuelPrices(ok({ petrol91: 'cheap' }) as typeof fetch)).toBeNull();
    expect(await readFuelPrices((async () => new Response('down', { status: 500 })) as typeof fetch)).toBeNull();
    expect(await readFuelPrices((async () => { throw new Error('offline'); }) as typeof fetch)).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(await readFuelPrices(ok({}) as typeof fetch)).toBeNull();
  });
  it('answers 503 honestly when nothing is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).message).toContain('record a pump price');
  });
});
