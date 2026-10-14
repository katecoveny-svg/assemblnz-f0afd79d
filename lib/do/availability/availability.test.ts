import { describe, expect, it } from 'vitest';
import { candidateSchema, searchInputSchema, type AvailabilityCandidate, type AvailabilityProviderAdapter, type AvailabilitySearchInput } from './contracts';
import { createPublicDirectoryAdapter, directoryHandoffs, disconnectedAdapters } from './adapters';
import { createSyntheticAdapter } from './fixtures';
import { searchAvailability } from './search';
import { prepareAvailabilityEnquiry, prepareAvailabilityReview } from './preparation';
import { appointmentHelpBoundary } from './index';

const now = new Date('2026-10-01T00:00:00Z');
const input: AvailabilitySearchInput = {
  service: 'physio', location: { label: 'Requested Auckland area', point: { latitude: -36.85, longitude: 174.76 } }, travelRadiusKm: 10,
  timeWindow: { start: '2026-10-01T00:00:00Z', end: '2026-10-02T00:00:00Z', timezone: 'Pacific/Auckland' }, budgetNZD: 100, accessibilityPreferences: ['step_free'],
};
const candidate: AvailabilityCandidate = {
  id: 'slot-1', provider: { id: 'test-clinic', name: 'Test clinic' }, service: 'physio', serviceId: 'initial-assessment', serviceLabel: 'Initial physio assessment 30 minutes',
  location: { label: 'Test clinic address', point: { latitude: -36.85, longitude: 174.76 } }, timezone: 'Pacific/Auckland',
  price: { amountNZD: 90, basis: 'total', includesGST: true }, terms: 'Cancellation fee NZD 30 within 24 hours.', accessibility: ['step_free'], bookingUrl: 'https://example.com/book',
  evidence: { kind: 'provider_slot', sourceUrl: 'https://example.com/slots', reference: 'provider-response-1', observedAt: now.toISOString(), expiresAt: '2026-10-01T00:10:00Z' },
  slot: { start: '2026-10-01T01:00:00Z', end: '2026-10-01T01:30:00Z' },
};
function adapter(records: unknown[] = [candidate], kind: AvailabilityProviderAdapter['capability']['capability'] = 'provider_slots'): AvailabilityProviderAdapter {
  return { capability: { id: 'test', name: 'Test authorised feed', state: 'connected', capability: kind, reason: 'Test only', documentationUrl: 'https://example.com/docs' }, async search() { return records; } };
}
const search = (records: unknown[] = [candidate], query = input) => searchAvailability(query, [adapter(records)], { now });

describe('availability contracts and evidence', () => {
  it('defaults live to truthful disconnected providers and zero slots', async () => {
    const report = await searchAvailability(input, disconnectedAdapters, { now });
    expect(report.results).toEqual([]);
    expect(report.providers.every(provider => provider.outcome === 'not_connected')).toBe(true);
    expect(report.externalAction).toBe('none');
    expect(JSON.stringify(report)).not.toContain(input.location.label);
  });
  it('requires an explicit zoned, bounded future search window without private extras', async () => {
    for (const bad of [{ ...input, diagnosis: 'private' }, { ...input, travelRadiusKm: -1 }, { ...input, budgetNZD: -1 }, { ...input, location: { label: '' } }, { ...input, timeWindow: { ...input.timeWindow, timezone: 'Mars' } }, { ...input, timeWindow: { ...input.timeWindow, start: '2026-10-01T12:00:00' } }, { ...input, timeWindow: { ...input.timeWindow, end: '2026-12-01T00:00:00Z' } }]) expect(searchInputSchema.safeParse(bad).success).toBe(false);
    await expect(searchAvailability({ ...input, timeWindow: { ...input.timeWindow, start: '2026-09-01T00:00:00Z', end: '2026-09-02T00:00:00Z' } }, [], { now })).rejects.toThrow('ended');
  });
  it('requires slot evidence and caps freshness even when upstream expiry is long', async () => {
    const report = await search();
    expect(report.results[0].status).toBe('provider_confirmed_available');
    expect(report.results[0].evidence.expiresAt).toBe('2026-10-01T00:05:00.000Z');
    const review = prepareAvailabilityReview(report, 'test:slot-1', now);
    expect(review.ready).toBe(true);
    if (!review.ready) throw new Error('Expected review');
    expect(review.confirmation).toMatchObject({ provider: candidate.provider, service: { id: 'initial-assessment', category: 'physio', label: candidate.serviceLabel }, time: candidate.slot, timezone: 'Pacific/Auckland', location: candidate.location, price: candidate.price, terms: candidate.terms, expiry: '2026-10-01T00:05:00.000Z', externalAction: 'none', requiresUserApproval: true, held: false, booked: false });
    expect(prepareAvailabilityReview(report, 'test:slot-1', new Date('2026-10-01T00:05:00Z')).ready).toBe(false);
  });
  it('does not promote directory/business hours text to available slots', async () => {
    const report = await searchAvailability(input, [adapter([{ ...candidate, evidence: { ...candidate.evidence, kind: 'directory' } }], 'directory')], { now });
    expect(report.results[0].status).toBe('awaiting_confirmation');
    expect(prepareAvailabilityReview(report, 'test:slot-1', now).ready).toBe(false);
    expect(candidateSchema.safeParse({ ...candidate, businessHours: '9 to 5' }).success).toBe(false);
  });
  it.each(['2026-09-30T23:54:00Z', '2026-10-01T00:01:00Z'])('downgrades stale or future evidence %s', async observedAt => {
    const report = await search([{ ...candidate, evidence: { ...candidate.evidence, observedAt } }]);
    expect(report.results[0].status).toBe('awaiting_confirmation');
  });
  it('downgrades expired evidence and handles enquiry-only without inventing times', async () => {
    const report = await search([{ ...candidate, evidence: { ...candidate.evidence, expiresAt: now.toISOString() } }, { ...candidate, id: 'enquiry', slot: null, evidence: { ...candidate.evidence, kind: 'enquiry', expiresAt: null } }]);
    expect(report.results.map(result => result.status)).toEqual(['awaiting_confirmation', 'enquiry_only']);
    expect(report.results[1].slot).toBeNull();
  });
  it('filters wrong service, distance, budget and out-of-window times', async () => {
    for (const change of [{ service: 'plumber' }, { location: { label: 'Far away', point: { latitude: -41.29, longitude: 174.77 } } }, { price: { ...candidate.price!, amountNZD: 101 } }, { slot: { start: '2026-10-02T01:00:00Z', end: '2026-10-02T01:30:00Z' } }, { slot: { start: '2026-09-30T23:00:00Z', end: '2026-09-30T23:30:00Z' } }]) expect((await search([{ ...candidate, ...change }])).results).toEqual([]);
  });
  it('unknown distance, price, terms or access blocks a consequential review', async () => {
    for (const change of [{ location: { label: 'Unverified distance' } }, { price: null }, { price: { ...candidate.price!, basis: 'hourly' } }, { price: { ...candidate.price!, includesGST: false } }, { terms: null }, { accessibility: [] }]) {
      const report = await search([{ ...candidate, ...change }]);
      expect(report.results[0].checksNeeded.length).toBeGreaterThan(0);
      expect(prepareAvailabilityReview(report, 'test:slot-1', now).ready).toBe(false);
    }
  });
  it('requires no synthetic adapter to run in live and no live feed to run in synthetic', async () => {
    const synthetic = createSyntheticAdapter(now);
    expect((await searchAvailability(input, [synthetic], { now })).results).toEqual([]);
    const report = await searchAvailability(input, [synthetic, adapter()], { now, mode: 'synthetic' });
    expect(report.results.map(result => result.status)).toEqual(['provider_confirmed_available', 'awaiting_confirmation', 'enquiry_only']);
    expect(report.results.every(result => result.synthetic)).toBe(true);
    expect(report.providers[1].outcome).toBe('skipped');
    expect(report.notice).toContain('Synthetic');
    expect(prepareAvailabilityReview(report, 'synthetic-slots:synthetic-slot', now).ready).toBe(false);
    expect(prepareAvailabilityEnquiry(input, report, 'synthetic-slots:synthetic-slot').ready).toBe(false);
  });
  it('validates an entire provider batch and does not leak upstream failure text', async () => {
    const failed = adapter(); failed.search = async () => { throw new Error('private diagnosis or secret'); };
    for (const provider of [adapter([candidate, { ...candidate, id: 'bad', privateNotes: 'secret' }]), adapter([candidate, candidate]), adapter(Array(51).fill(candidate)), failed]) {
      const report = await searchAvailability(input, [provider], { now });
      expect(report.results).toEqual([]);
      expect(report.providers[0].outcome).toBe('unavailable');
      expect(JSON.stringify(report)).not.toContain('secret');
    }
  });
  it('bounds stalled providers and continues to the next feed', async () => {
    let signal: AbortSignal | undefined;
    const slow = adapter(); slow.capability = { ...slow.capability, id: 'slow' };
    slow.search = async (_, suppliedSignal) => { signal = suppliedSignal; return new Promise(() => {}); };
    const report = await searchAvailability(input, [slow, adapter()], { now, timeoutMs: 5 });
    expect(signal?.aborted).toBe(true);
    expect(report.providers.map(provider => provider.outcome)).toEqual(['unavailable', 'returned']);
    expect(report.results).toHaveLength(1);
  });
  it('limits providers and prevents ambiguous review IDs', async () => {
    await expect(searchAvailability(input, [adapter(), adapter()], { now })).rejects.toThrow('unique');
    const report = await search(); report.results.push(report.results[0]);
    expect(prepareAvailabilityReview(report, 'test:slot-1', now).ready).toBe(false);
  });
  it('curated directory removes slots and retains only approved public links', async () => {
    const directory = createPublicDirectoryAdapter([candidate], ['https://example.com/']);
    const report = await searchAvailability(input, [directory], { now });
    expect(report.results[0]).toMatchObject({ status: 'enquiry_only', slot: null, evidence: { kind: 'directory', expiresAt: null } });
    const enquiry = prepareAvailabilityEnquiry(input, report, 'curated-public-directory:slot-1');
    expect(enquiry.ready).toBe(true);
    if (enquiry.ready) expect(enquiry.draft).toMatchObject({ externalAction: 'none', sent: false, status: 'prepared_draft' });
    expect(() => createPublicDirectoryAdapter([candidate], ['https://other.example/'])).toThrow('Unapproved');
    for (const bookingUrl of ['javascript:alert(1)', 'https://user:password@example.com/', 'https://127.0.0.1/', 'https://example.com/book?location=private', 'https://clinic.local/']) expect(candidateSchema.safeParse({ ...candidate, bookingUrl }).success).toBe(false);
  });
  it('manual handoff links contain no private location and never claim slots', () => {
    for (const service of ['physio', 'plumber'] as const) {
      const handoffs = directoryHandoffs(service);
      expect(handoffs[0].status).toBe('enquiry_only');
      expect(new URL(handoffs[0].url).search).toBe('');
    }
  });
  it('makes emergency guidance reachable without a search and makes no clinical judgment', () => {
    expect(appointmentHelpBoundary.url).toBe('https://www.healthnz.govt.nz/hospitals-services/which-health-service-should-i-use');
    expect(appointmentHelpBoundary.message).toContain('does not assess symptoms');
    expect(appointmentHelpBoundary.externalAction).toBe('none');
  });
  it('prepares a detached snapshot and revalidates provider links before draft preparation', async () => {
    const report = await search();
    const review = prepareAvailabilityReview(report, 'test:slot-1', now);
    expect(review.ready).toBe(true);
    if (review.ready) { review.confirmation.provider.name = 'Changed after review'; expect(report.results[0].provider.name).toBe('Test clinic'); }
    report.results[0].bookingUrl = 'javascript:alert(1)';
    expect(prepareAvailabilityReview(report, 'test:slot-1', now).ready).toBe(false);
    expect(prepareAvailabilityEnquiry(input, report, 'test:slot-1').ready).toBe(false);
  });
});
