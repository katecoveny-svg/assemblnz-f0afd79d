import { describe, expect, it, vi } from 'vitest';
import { createNzLocalUpdates, GEONET_NEWS_URL, MET_FORECAST_URL, parseGeonetNews, parseMetForecast, selectForecast } from './nz-local-updates';
import { isSnapshotStale, NZ_WEATHER_PLACES, updatesSnapshotSchema, weatherSnapshotSchema } from '@/apps/do/personal/local-updates';

const start = new Date('2026-09-30T03:17:00.000Z');
function model() {
  return { properties: { meta: { updated_at: '2026-09-30T01:18:00Z', units: { air_temperature: 'celsius', wind_speed: 'm/s', precipitation_amount: 'mm' } },
    timeseries: [3, 4, 5, 6, 7, 8, 9].map(hour => ({ time: `2026-09-30T${String(hour).padStart(2, '0')}:00:00Z`, data: {
      instant: { details: { air_temperature: 15.8, wind_speed: 4 } },
      next_1_hours: { details: { precipitation_amount: 0.2 } },
    } })),
  } };
}
const article = { title: 'Example official headline', published: '2026-09-29T01:00:00Z', link: 'https://www.geonet.org.nz/news/example', tag: 'News' };
const metReply = (raw: unknown = model(), headers: Record<string, string> = {}) => Response.json(raw, { headers: {
  Expires: 'Wed, 30 Sep 2026 03:30:00 GMT', 'Last-Modified': 'Wed, 30 Sep 2026 03:00:00 GMT', ...headers,
} });

describe('NZ forecast contracts', () => {
  it('uses fixed approximate city centres only, all within NZ', () => {
    expect(new Set(NZ_WEATHER_PLACES.map(place => place.id)).size).toBe(NZ_WEATHER_PLACES.length);
    for (const place of NZ_WEATHER_PLACES) {
      expect(place.latitude).toBeGreaterThan(-47); expect(place.latitude).toBeLessThan(-34);
      expect(place.longitude).toBeGreaterThan(168); expect(place.longitude).toBeLessThan(179);
    }
  });
  it('keeps model times, converts wind units and bounds the display', () => {
    const forecast = selectForecast(parseMetForecast(model()), start);
    expect(forecast).toHaveLength(6);
    expect(forecast[0]).toEqual({ time: '2026-09-30T03:00:00Z', temperatureC: 15.8, windKmh: 14.4, precipitationMm: .2, precipitationHours: 1 });
  });
  it('rejects wrong units and malformed model values', () => {
    const raw = model(); raw.properties.meta.units.air_temperature = 'fahrenheit';
    expect(() => parseMetForecast(raw)).toThrow();
    expect(() => parseMetForecast({ properties: {} })).toThrow();
  });
  it('does not mistake a six-hour precipitation total for hourly rainfall or infer absent rainfall', () => {
    const raw = model();
    const parsed = parseMetForecast(raw);
    parsed.properties.timeseries[0].data.next_6_hours = { details: { precipitation_amount: 3 } };
    delete parsed.properties.timeseries[0].data.next_1_hours;
    expect(selectForecast(parsed, start)[0]).toMatchObject({ precipitationMm: 3, precipitationHours: 6 });
    delete parsed.properties.timeseries[0].data.next_6_hours;
    expect(selectForecast(parsed, start)[0]).toMatchObject({ precipitationMm: null, precipitationHours: null });
  });
  it('rejects old/future model runs and forecasts without a near-current point', () => {
    const data = parseMetForecast(model());
    data.properties.meta.updated_at = '2026-09-28T01:00:00Z';
    expect(() => selectForecast(data, start)).toThrow('old_model');
    data.properties.meta.updated_at = '2026-10-01T01:00:00Z';
    expect(() => selectForecast(data, start)).toThrow('old_model');
    data.properties.meta.updated_at = '2026-09-30T01:00:00Z';
    data.properties.timeseries = data.properties.timeseries.slice(3);
    expect(() => selectForecast(data, start)).toThrow('no_current_forecast');
  });
  it('ages a browser snapshot at its exact validity boundary', () => {
    expect(isSnapshotStale({ validUntil: start.toISOString() }, start.getTime())).toBe(true);
    expect(isSnapshotStale({ validUntil: start.toISOString() }, start.getTime() - 1)).toBe(false);
    expect(isSnapshotStale({ validUntil: null }, start.getTime())).toBe(true);
    expect(isSnapshotStale({ validUntil: 'bad' }, start.getTime())).toBe(true);
  });
});

describe('keyless weather provider with compliant cache', () => {
  it('fetches only fixed coordinates with an identifying UA and no credentials, notes or forwarded headers', async () => {
    const fetcher = vi.fn().mockResolvedValue(metReply());
    const client = createNzLocalUpdates({ fetcher, now: () => start });
    const snapshot = await client.weather('auckland');
    expect(fetcher).toHaveBeenCalledWith(`${MET_FORECAST_URL}?lat=-36.85&lon=174.76`, {
      method: 'GET', headers: { Accept: 'application/json', 'User-Agent': 'assembl-personal-do/1.0 (+https://assembl.co.nz)' },
      cache: 'no-store', credentials: 'omit', redirect: 'error', signal: expect.any(AbortSignal),
    });
    expect(snapshot).toMatchObject({ status: 'available', freshness: 'fetched', fetchedAt: start.toISOString(), modelUpdatedAt: '2026-09-30T01:18:00Z' });
    expect(weatherSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.message).toContain('not an observation');
  });
  it('does not fetch for unknown places, arbitrary URLs or exact coordinates', async () => {
    const fetcher = vi.fn(); const client = createNzLocalUpdates({ fetcher });
    for (const input of ['home', 'https://example.com', '-36.850009,174.76001', '__proto__']) await expect(client.weather(input)).rejects.toThrow('invalid_place');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('deduplicates concurrent calls and does not repeat before provider Expires', async () => {
    const fetcher = vi.fn().mockResolvedValue(metReply());
    const client = createNzLocalUpdates({ fetcher, now: () => start });
    const [a, b] = await Promise.all([client.weather('auckland'), client.weather('auckland')]);
    expect(a).toEqual(b); expect(fetcher).toHaveBeenCalledOnce();
    const cached = await client.weather('auckland');
    expect(cached.freshness).toBe('cached'); expect(cached.checkedAt).toBe(start.toISOString());
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it('uses exact Last-Modified for a conditional request and distinguishes 304 from new data', async () => {
    let current = start;
    const fetcher = vi.fn().mockResolvedValueOnce(metReply()).mockResolvedValueOnce(new Response(null, { status: 304, headers: { Expires: 'Wed, 30 Sep 2026 03:45:00 GMT' } }));
    const client = createNzLocalUpdates({ fetcher, now: () => current });
    await client.weather('auckland'); current = new Date('2026-09-30T03:30:00.000Z');
    const result = await client.weather('auckland');
    expect(fetcher.mock.calls[1][1].headers['If-Modified-Since']).toBe('Wed, 30 Sep 2026 03:00:00 GMT');
    expect(result).toMatchObject({ freshness: 'revalidated', fetchedAt: start.toISOString(), checkedAt: current.toISOString(), validUntil: '2026-09-30T03:45:00.000Z' });
  });
  it('uses a conservative 15-minute cache when Expires is absent', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(model()));
    const client = createNzLocalUpdates({ fetcher, now: () => start });
    expect((await client.weather('wellington')).validUntil).toBe('2026-09-30T03:32:00.000Z');
    await client.weather('wellington'); expect(fetcher).toHaveBeenCalledOnce();
  });
  it('never returns old values as a successful refresh after network failure; backs off', async () => {
    let current = start;
    const fetcher = vi.fn().mockResolvedValueOnce(metReply()).mockRejectedValue(new Error('offline'));
    const client = createNzLocalUpdates({ fetcher, now: () => current });
    await client.weather('auckland'); current = new Date('2026-09-30T03:31:00.000Z');
    const result = await client.weather('auckland');
    expect(result).toMatchObject({ status: 'unavailable', freshness: 'unavailable', forecast: [], fetchedAt: null });
    await client.weather('auckland'); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('honours provider Retry-After across city changes after throttling', async () => {
    let current = start;
    const fetcher = vi.fn().mockResolvedValue(new Response('slow down', { status: 429, headers: { 'Retry-After': '3600' } }));
    const client = createNzLocalUpdates({ fetcher, now: () => current });
    await client.weather('auckland');
    current = new Date(start.getTime() + 20 * 60_000);
    expect((await client.weather('wellington')).status).toBe('unavailable');
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it.each([
    ['403', () => new Response('denied', { status: 403 })],
    ['429', () => new Response('slow down', { status: 429 })],
    ['challenge', () => new Response('<html>challenge</html>', { headers: { 'Content-Type': 'text/html' } })],
    ['invalid json', () => new Response('{', { headers: { 'Content-Type': 'application/json' } })],
    ['schema drift', () => Response.json({ weather: 'nice' })],
    ['oversized header', () => metReply(model(), { 'Content-Length': '1000001' })],
    ['oversized body', () => new Response(' '.repeat(1_000_001), { headers: { 'Content-Type': 'application/json' } })],
    ['unmatched 304', () => new Response(null, { status: 304 })],
  ])('returns a validated unavailable snapshot on %s', async (_name, reply) => {
    const client = createNzLocalUpdates({ fetcher: vi.fn().mockResolvedValue(reply()), now: () => start });
    const result = await client.weather('wellington');
    expect(result.status).toBe('unavailable'); expect(result.forecast).toEqual([]);
    expect(weatherSnapshotSchema.safeParse(result).success).toBe(true);
  });
  it('makes a provider deprecation visible', async () => {
    const response = new Response(JSON.stringify(model()), { status: 203, headers: { 'Content-Type': 'application/json' } });
    const result = await createNzLocalUpdates({ fetcher: vi.fn().mockResolvedValue(response), now: () => start }).weather('auckland');
    expect(result.message).toContain('being retired');
  });
});

describe('dated official updates', () => {
  it('preserves titles and publication dates, sorts newest first, strips unrelated upstream content', () => {
    const older = { ...article, link: 'https://www.geonet.org.nz/vabs/older', published: '2026-09-02T01:00:00Z' };
    const result = parseGeonetNews({ feed: [older, { ...article, html: '<script>bad</script>' }] }, start);
    expect(result).toEqual([article, older]);
  });
  it.each(['http://www.geonet.org.nz/news/a', 'https://evil.example/news/a', 'https://www.geonet.org.nz.evil.example/news/a', 'javascript:alert(1)', 'https://me@www.geonet.org.nz/news/a', 'https://www.geonet.org.nz:444/news/a', 'https://www.geonet.org.nz/news/a?redirect=evil'])('rejects unsafe or non-official links: %s', link => {
    expect(() => parseGeonetNews({ feed: [{ ...article, link }] }, start)).toThrow();
  });
  it('fails the whole feed on malformed/future articles instead of quietly hiding hazards', () => {
    expect(() => parseGeonetNews({ feed: [article, { title: 'broken' }] }, start)).toThrow();
    expect(() => parseGeonetNews({ feed: [{ ...article, published: '2026-10-01T00:00:00Z' }] }, start)).toThrow('future_article');
    expect(() => parseGeonetNews({}, start)).toThrow();
  });
  it('allows an explicitly empty feed without claiming the area is safe', async () => {
    const result = await createNzLocalUpdates({ fetcher: vi.fn().mockResolvedValue(Response.json({ feed: [] })), now: () => start }).news();
    expect(result).toMatchObject({ status: 'available', articles: [] });
    expect(result.message).toContain('not a comprehensive');
  });
  it('calls a fixed versioned national endpoint and caches for one minute without changing publication dates', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ feed: [article] }));
    const client = createNzLocalUpdates({ fetcher, now: () => start });
    const result = await client.news();
    expect(fetcher.mock.calls[0][0]).toBe(GEONET_NEWS_URL);
    expect(fetcher.mock.calls[0][1].headers.Accept).toBe('application/json;version=2');
    expect(result).toMatchObject({ freshness: 'fetched', validUntil: '2026-09-30T03:18:00.000Z', articles: [article] });
    expect(updatesSnapshotSchema.safeParse(result).success).toBe(true);
    expect((await client.news()).freshness).toBe('cached'); expect(fetcher).toHaveBeenCalledOnce();
  });
  it('deduplicates concurrent news checks and backs off after failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'));
    const client = createNzLocalUpdates({ fetcher, now: () => start });
    const results = await Promise.all([client.news(), client.news()]);
    expect(results[0]).toMatchObject({ status: 'unavailable', articles: [] });
    await client.news(); expect(fetcher).toHaveBeenCalledOnce();
  });
});
