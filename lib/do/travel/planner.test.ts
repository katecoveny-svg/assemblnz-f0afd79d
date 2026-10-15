import { describe, expect, it } from 'vitest';
import { addDays, briefIsCurrent, briefSchema, comparison, departureOptions, foundOption, observationStatus, planText, searchHandoff, suggestions, type HolidayBrief } from './planner';

const brief: HolidayBrief = { origin: 'Auckland', destination: 'Wellington', earliest: '2027-02-01', latest: '2027-02-05', nights: 4, adults: 2, children: 0, budget: 2000, flightAllowance: 800, reserve: 400, preference: 'City' };
const now = '2026-10-14T10:00:00.000Z';
const time = Date.parse(now);
const flight = () => foundOption({ kind: 'flight', title: 'Recorded fare', url: 'https://example.com/fare', total: 800, depart: brief.earliest, return: '2027-02-05', outcome: 'found' }, brief, now);
const stay = () => foundOption({ kind: 'stay', title: 'Recorded stay', url: 'https://example.com/stay', total: 900, depart: brief.earliest, return: '2027-02-05', outcome: 'found' }, brief, now);
describe('holiday brief and discovery handoffs', () => {
  it('rejects impossible dates, reversed window and same origin/destination', () => {
    expect(briefSchema.safeParse({ ...brief, earliest: '2027-02-30' }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, latest: '2027-01-30' }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, destination: 'AUCKLAND' }).success).toBe(false);
  });
  it('keeps a short, bounded party and excludes documents and private context', () => {
    expect(briefSchema.safeParse({ ...brief, adults: 0 }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, children: 7 }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, passport: 'private' }).success).toBe(false);
  });
  it('uses calendar dates across month/year boundaries without timezone drift', () => {
    expect(addDays('2026-12-30', 4)).toBe('2027-01-03');
    expect(departureOptions(brief)).toEqual([{ depart: '2027-02-01', return: '2027-02-05' }, { depart: '2027-02-03', return: '2027-02-07' }, { depart: '2027-02-05', return: '2027-02-09' }]);
    expect(departureOptions({ ...brief, latest: brief.earliest })).toHaveLength(1);
  });
  it('encodes a public search, shares only trip/party fields, not budget/preferences', () => {
    const h = searchHandoff({ ...brief, children: 2, destination: 'Paris & Lyon' }, 'flight');
    const url = new URL(h.url);
    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/travel/flights');
    expect(url.searchParams.get('q')).toContain('Paris & Lyon');
    expect(h.query).toContain('2 adults and 2 children');
    expect(h.query).not.toContain('2000');
    expect(h.query).not.toContain('City');
    expect(searchHandoff(brief, 'stay').query).not.toContain('Auckland');
  });
});
describe('honest option evidence', () => {
  it('rejects unsafe links and absent/invalid total prices', () => {
    for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com']) expect(() => foundOption({ ...flight(), url }, brief, now)).toThrow();
    for (const total of [0, -5, NaN, Infinity]) expect(() => foundOption({ ...flight(), total }, brief, now)).toThrow();
  });
  it('distinguishes observed, failed, empty and stale results without fake live status', () => {
    const f = flight();
    expect(observationStatus(f, brief, time)).toBe('You recorded · not verified');
    expect(observationStatus({ ...f, outcome: 'failed' }, brief, time)).toBe('Search unavailable');
    expect(observationStatus({ ...f, outcome: 'empty' }, brief, time)).toBe('No results recorded');
    expect(observationStatus(f, brief, time + 30 * 60000)).toBe('Recheck source');
    expect(observationStatus(f, { ...brief, adults: 3 }, time)).toBe('Brief changed');
    expect(observationStatus(f, brief, time - 1)).toBe('Recheck source');
  });
  it('does not treat empty/failed/stale observations as a viable shortlist', () => {
    const f = flight(), s = stay();
    for (const outcome of ['empty', 'failed'] as const) expect(comparison(brief, [{ ...f, outcome }, s], [f.id, s.id], time).complete).toBe(false);
    expect(comparison(brief, [f, s], [f.id, s.id], time + 31 * 60000).subtotal).toBe(0);
    expect(comparison(brief, [f, s], [f.id, s.id], time + 31 * 60000).stale).toBe(true);
  });
  it('compares whole-party totals plus reserve and flags budget excess', () => {
    const f = flight(), s = stay();
    const c = comparison(brief, [f, s], [f.id, s.id], time);
    expect(c).toMatchObject({ complete: true, subtotal: 1700, remaining: -100 });
    expect(suggestions(brief, [f, s], [f.id, s.id], time)[0].title).toBe('This pair exceeds your plan');
  });
  it('rejects mixed date pairs and keeps incomplete comparisons incomplete', () => {
    const f = flight(), s = { ...stay(), depart: '2027-02-03', return: '2027-02-07' };
    expect(comparison(brief, [f, s], [f.id, s.id], time).complete).toBe(false);
    expect(suggestions(brief, [f, s], [f.id, s.id], time)[0].title).toContain('Align');
    expect(comparison(brief, [f], [f.id], time).complete).toBe(false);
  });
  it('invalidates comparisons on edits and preserves their original evidence', () => {
    const f = flight();
    expect(comparison({ ...brief, nights: 6 }, [f], [f.id], time)).toMatchObject({ stale: true, subtotal: 0 });
    expect(f.return).toBe('2027-02-05');
  });
  it('exports sources, status and unknowns without claiming a booking or verified availability', () => {
    const f = flight(); const text = planText(brief, [f], [f.id], time);
    expect(text).toContain('https://example.com/fare');
    expect(text).toContain('user-recorded, not provider-verified');
    expect(text).toContain('Nothing booked or reserved');
    expect(planText(brief, [], [], time)).toContain('No flight or stay selected');
  });
});

it('gates stale briefs at navigation, handoff and export boundaries', () => {
  const expired = Date.parse('2027-02-02T12:00:00Z');
  expect(briefIsCurrent(brief, expired)).toBe(false);
  expect(() => searchHandoff(brief, 'flight', undefined, undefined, expired)).toThrow();
  expect(() => planText(brief, [], [], expired)).toThrow();
});
it('retains selected option dates in review handoffs', () => {
  for (const kind of ['flight', 'stay'] as const) {
    const h = searchHandoff(brief, kind, '2027-02-03', '2027-02-07', time);
    expect(h.query).toContain('2027-02-03');
    expect(h.query).toContain('2027-02-07');
  }
});
