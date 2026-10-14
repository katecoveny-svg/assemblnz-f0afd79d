import { describe, expect, it, vi } from 'vitest';
import { fetchNztaTraffic, NZTA_EVENTS_URL, parseNztaEvents } from './nz-public-data';

const event = {
  id: 561526, eventDescription: 'Pavement Repairs', locationArea: 'SH 1 Invercargill to Awarua',
  impact: 'Caution', eventType: 'Area Warning', status: 'Active', planned: true,
  region: { id: 14, name: 'Southland' }, eventModified: '2026-09-24T10:54:22.233+12:00',
  startDate: '2026-09-21T07:00:00+12:00', endDate: '2026-10-02T17:30:00+13:00',
  eventComments: 'Plan your journey accordingly.', alternativeRoute: 'Not Applicable',
};
const now = () => new Date('2026-09-30T03:17:04.000Z');
const reply = (body: unknown) => Response.json(body);

describe('NZTA public traffic contract', () => {
  it('preserves official text and timezone offsets, strips unused fields', () => {
    expect(parseNztaEvents({ response: { roadevent: [{ ...event, geometry: 'POINT (…)'}] } })).toEqual([event]);
    expect(parseNztaEvents({ response: { roadevent: event } })).toEqual([event]);
  });
  it('supports an explicit empty feed without interpreting it as clear roads', async () => {
    expect(parseNztaEvents({ response: '' })).toEqual([]);
    expect(parseNztaEvents({ response: { roadevent: [] } })).toEqual([]);
    const snapshot = await fetchNztaTraffic({ now, fetcher: vi.fn().mockResolvedValue(reply({ response: '' })) });
    expect(snapshot.status).toBe('available');
    expect(snapshot.message).toContain('does not mean a road is clear');
  });
  it('fails the whole feed on drift instead of hiding an unparseable hazard', () => {
    expect(() => parseNztaEvents({ response: { roadevent: [event, { id: 2 }] } })).toThrow();
    expect(() => parseNztaEvents({ response: {} })).toThrow();
    expect(() => parseNztaEvents({ error: 'blocked' })).toThrow();
  });
  it('uses a fixed public URL with no user context, credentials or cache', async () => {
    const fetcher = vi.fn().mockResolvedValue(reply({ response: { roadevent: [event] } }));
    const result = await fetchNztaTraffic({ fetcher, now });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(NZTA_EVENTS_URL, {
      method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store',
      credentials: 'omit', redirect: 'error', signal: expect.any(AbortSignal),
    });
    expect(result).toMatchObject({
      status: 'available', freshness: 'fresh', events: [event],
      fetchedAt: '2026-09-30T03:17:04.000Z', checkedAt: '2026-09-30T03:17:04.000Z',
      cachedAt: null, cachePolicy: 'no-store', suggestedRefreshAfter: '2026-09-30T03:18:04.000Z',
    });
    expect(result.source.termsUrl).toContain('nzta.govt.nz');
    expect(result.source.chargingNote).toContain('free');
  });
  it.each([
    ['http error', () => new Response('down', { status: 503 })],
    ['html challenge', () => new Response('<html>challenge</html>', { headers: { 'Content-Type': 'text/html' } })],
    ['invalid JSON', () => new Response('{', { headers: { 'Content-Type': 'application/json' } })],
    ['schema drift', () => reply({ response: { wrong: [] } })],
    ['oversized header', () => new Response('{}', { headers: { 'Content-Type': 'application/json', 'Content-Length': '2000001' } })],
    ['oversized stream', () => new Response(' '.repeat(2_000_001), { headers: { 'Content-Type': 'application/json' } })],
  ])('reports unavailable for %s and never serves stale results', async (_label, response) => {
    const result = await fetchNztaTraffic({ now, fetcher: vi.fn().mockResolvedValue(response()) });
    expect(result).toMatchObject({ status: 'unavailable', freshness: 'unavailable', fetchedAt: null, cachedAt: null, events: [] });
  });
  it('handles timeout/network failure and passes caller cancellation', async () => {
    const controller = new AbortController(); controller.abort();
    const fetcher = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const result = await fetchNztaTraffic({ fetcher, now, signal: controller.signal });
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    expect(result.status).toBe('unavailable');
  });
});
