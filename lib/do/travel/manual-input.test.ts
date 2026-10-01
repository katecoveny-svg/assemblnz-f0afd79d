import { describe, expect, it } from 'vitest';
import { createManualTravelSession, emptyManualFlight, manualIssues, travelDiagnostic } from './manual-input';
import { acknowledgeTravel, applyTravelToTrip, travelTimeline } from './preparation';
import { newDoTrip } from '../../../apps/do/shared/travel';

const completion = { responsibilityId: 'responsibility-test', runId: 'run-test', revision: 3, completedAt: '2026-10-01T00:00:00Z' };
const flight = () => ({ marketingFlight: 'nz6', operatingFlight: 'nz6', origin: 'akl', destination: 'lax',
  'departure.local': '2026-10-10T20:00', 'departure.offset': '+13:00', 'departure.zone': 'Pacific/Auckland',
  'arrival.local': '2026-10-10T12:00', 'arrival.offset': '-07:00', 'arrival.zone': 'America/Los_Angeles' });

describe('real manual itinerary input, tested with invented data', () => {
  it('requires correction and exact-input review before preparation', () => {
    const s = createManualTravelSession('guest/workspace');
    expect(s.review(s.snapshot().revision).accepted).toBe(false);
    expect(() => s.prepare(completion, s.snapshot().revision)).toThrow('review');
    s.setFlights([flight()]); const r = s.snapshot().revision;
    expect(s.review(r).accepted).toBe(true);
    const draft = s.prepare(completion, r);
    expect(draft.source.kind).toBe('user_manual'); expect(draft.review).toBe('required');
    expect(travelTimeline(draft, completion.completedAt)[0].evidence).toBe('user_entered');
    const trip = applyTravelToTrip(newDoTrip(), acknowledgeTravel(draft, 3), 3);
    expect(trip.summary).toContain('User-entered'); expect(trip.summary).not.toContain('Synthetic');
    expect(draft.booking).toBe('disabled');
  });
  it('retains originals only in memory for explicit reference, never receipts or diagnostics', () => {
    const s = createManualTravelSession('guest/workspace');
    s.setOriginalForReference('PNR SECRET123; ticket SECRET456; passenger PRIVATE');
    s.setFlights([Object.assign(flight(), { pnr: 'SECRET123' })]);
    const r = s.snapshot().revision; s.review(r); const draft = s.prepare(completion, r);
    expect(s.originalForLocalReview()).toContain('SECRET123');
    for (const output of [draft, s.snapshot(), travelDiagnostic(draft)]) {
      expect(JSON.stringify(output)).not.toContain('SECRET'); expect(JSON.stringify(output)).not.toContain('PRIVATE');
    }
    s.clear(); expect(s.originalForLocalReview()).toBe('');
    expect(s.snapshot().reviewed).toBe(false);
  });
  it('clears originals, fields and review on identity/workspace switch', () => {
    const s = createManualTravelSession('guest/a'); s.setOriginalForReference('SECRET'); s.setFlights([flight()]);
    s.review(s.snapshot().revision); s.switchContext('owner/b');
    expect(s.originalForLocalReview()).toBe(''); expect(s.snapshot().flights).toEqual([emptyManualFlight()]);
    expect(() => s.prepare(completion, s.snapshot().revision)).toThrow();
  });
  it('invalidates review on edits, even when original reference alone changes', () => {
    const s = createManualTravelSession('guest/a'); s.setFlights([flight()]); const old = s.snapshot().revision;
    s.review(old); s.setOriginalForReference('Updated reference');
    expect(() => s.prepare(completion, old)).toThrow();
    expect(() => s.prepare(completion, s.snapshot().revision)).toThrow();
  });
  it('returns safe correction issues without echoing uncertain dates or sensitive fields', () => {
    const f = flight(); f['departure.local'] = 'SECRET 10/11/26';
    const issues = manualIssues(f);
    expect(issues.length).toBeGreaterThan(0); expect(JSON.stringify(issues)).not.toContain('SECRET');
    expect(manualIssues({ ...f, 'departure.local': '2026-10-10T20:00', operatingFlight: '' })[0].field).toBe('operatingFlight');
  });
  it('rejects overlapping/codeshare segments before producing any receipt', () => {
    const s = createManualTravelSession('guest/a'); s.setFlights([flight(), flight()]); const r = s.snapshot().revision;
    s.review(r); expect(() => s.prepare(completion, r)).toThrow('validation failed');
  });
  it('does not claim plain-text, PDF or boarding-pass image extraction', () => {
    const s = createManualTravelSession('guest/a'); expect(s.inputTypes).toEqual(['manual_fields']);
    s.setOriginalForReference('NZ6 AKL to LAX');
    expect(s.snapshot().flights).toEqual([emptyManualFlight()]);
    expect(() => s.setOriginalForReference('x'.repeat(64001))).toThrow();
  });
});
