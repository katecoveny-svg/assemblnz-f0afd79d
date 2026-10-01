import { describe, expect, it } from 'vitest';
import { acknowledgeTravel, applyTravelToTrip, importSyntheticTravel, prepareTravel, travelInstant, travelTimeline, uberHandoff, upsertTravel, type TravelDocument } from './preparation';
import { newDoTrip } from '../../../apps/do/shared/travel';

const completion = { responsibilityId: 'responsibility-test', runId: 'run-test', revision: 1, completedAt: '2026-10-01T00:00:00Z' };
function fixture(): TravelDocument {
  return { synthetic: true, source: { id: 'synthetic-test', kind: 'synthetic_itinerary', observedAt: '2026-09-30T00:00:00Z', verifiedAt: '2026-09-30T01:00:00Z', expiresAt: '2026-10-02T00:00:00Z' }, flights: [{
    marketingFlight: 'NZ6', operatingFlight: 'NZ6', origin: 'AKL', destination: 'LAX',
    departure: { local: '2026-10-10T20:00', offset: '+13:00', zone: 'Pacific/Auckland' },
    arrival: { local: '2026-10-10T12:00', offset: '-07:00', zone: 'America/Los_Angeles' },
  }] };
}
describe('bounded synthetic travel preparation', () => {
  it('imports bounded JSON and extends the existing trip only after review', () => {
    const draft = importSyntheticTravel(JSON.stringify(fixture()), completion);
    const trip = newDoTrip();
    expect(() => applyTravelToTrip(trip, draft, 1)).toThrow();
    expect(applyTravelToTrip(trip, acknowledgeTravel(draft, 1), 1).summary).toContain('Nothing booked');
    expect(() => importSyntheticTravel(' '.repeat(64001), completion)).toThrow();
    expect(() => importSyntheticTravel('{bad}', completion)).toThrow();
  });
  it('orders date-line travel by instant, preserving both local dates', () => {
    const timeline = travelTimeline(prepareTravel(fixture(), completion), completion.completedAt);
    expect(timeline[1].instant - timeline[0].instant).toBe(12 * 3600000);
    expect(timeline[1].time.local).toBe('2026-10-10T12:00');
  });
  it('accepts an overnight arrival on the following local date', () => {
    const f = fixture(); f.flights[0].arrival = { local: '2026-10-11T02:00', offset: '+13:00', zone: 'Pacific/Auckland' };
    expect(prepareTravel(f, completion).flights).toHaveLength(1);
  });
  it('requires explicit offsets for both sides of a DST fold', () => {
    const t = { local: '2026-11-01T01:30', offset: '-04:00', zone: 'America/New_York' };
    expect(travelInstant({ ...t, offset: '-05:00' }) - travelInstant(t)).toBe(3600000);
    expect(() => travelInstant({ ...t, offset: '' })).toThrow();
  });
  it('rejects DST gaps, wrong offsets and calendar overflow', () => {
    for (const local of ['2026-03-08T02:30', '2026-02-30T12:00']) expect(() => travelInstant({ local, offset: '-05:00', zone: 'America/New_York' })).toThrow();
  });
  it('rejects ambiguous dates and missing years', () => {
    for (const local of ['10/11/26 12:00', '10-11T12:00']) expect(() => travelInstant({ local, offset: '+13:00', zone: 'Pacific/Auckland' })).toThrow();
  });
  it('retains marketing and operating codes without duplicating codeshares', () => {
    const f = fixture(); f.flights[0].marketingFlight = 'UA6750';
    expect(prepareTravel(f, completion).flights[0].operatingFlight).toBe('NZ6');
    f.flights.push({ ...f.flights[0], marketingFlight: 'NZ6' });
    expect(() => prepareTravel(f, completion)).toThrow('Duplicate');
  });
  it('drops identifiers and raw fields recursively by allowlist', () => {
    const f = fixture(); Object.assign(f, { passengerName: 'PRIVATE', pnr: 'SECRET', barcode: 'SECRET' });
    Object.assign(f.source, { url: 'https://example.test/?pnr=SECRET' });
    Object.assign(f.flights[0].departure, { ticketNumber: 'SECRET' });
    const result = JSON.stringify(prepareTravel(f, completion));
    expect(result).not.toContain('SECRET'); expect(result).not.toContain('PRIVATE');
  });
  it('replaces repeated imports and resets review with no booking permission', () => {
    const draft = prepareTravel(fixture(), completion);
    const reviewed = acknowledgeTravel(draft, 1);
    expect(reviewed.booking).toBe('disabled');
    expect(upsertTravel([reviewed], draft)[0].review).toBe('acknowledged');
    expect(() => acknowledgeTravel(draft, 2)).toThrow();
    const updated = upsertTravel([reviewed], prepareTravel(fixture(), { ...completion, revision: 2 }));
    expect(updated).toHaveLength(1); expect(updated[0].review).toBe('required');
    expect(() => upsertTravel(updated, draft)).toThrow('Stale');
  });
  it('shows stale evidence while flight status always remains unknown', () => {
    const timeline = travelTimeline(prepareTravel(fixture(), completion), '2026-10-03T00:00:00Z');
    expect(timeline.every(e => e.evidence === 'stale' && e.flightStatus === 'unknown')).toBe(true);
  });
  it('rejects real documents, future verification and reversed travel', () => {
    const f = fixture(); expect(() => prepareTravel({ ...f, synthetic: false } as unknown as TravelDocument, completion)).toThrow();
    expect(() => prepareTravel(f, { ...completion, completedAt: '2026-09-29T00:00:00Z' })).toThrow();
    f.flights[0].arrival = f.flights[0].departure;
    expect(() => prepareTravel(f, completion)).toThrow();
  });
  it('creates only a documented Uber handoff without location or payment data', () => {
    const handoff = uberHandoff(); expect(handoff.label).toBe('opens Uber');
    expect(new URL(handoff.url).hostname).toBe('m.uber.com');
    expect(new URL(handoff.url).search).toBe(''); expect(handoff.externalAction).toBe('none');
  });
});
