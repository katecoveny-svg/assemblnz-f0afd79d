import { describe, expect, it } from 'vitest';
import { prepareSchoolBriefing } from './briefing';
import { schoolDemoChildren, schoolDemoSources, schoolDemoBaseline, SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER } from './fixtures';
import { schoolCalendarFixture, schoolCalendarLinks } from './agenda-fixtures';
import { prepareSchoolAgenda, agendaWindow, agendaDigest, reviewAgendaAction } from './agenda';
export function sampleBrief(scenario = 'revised') { return prepareSchoolBriefing({ ownerId: SCHOOL_DEMO_OWNER, revision: 'fixture-revision', now: SCHOOL_DEMO_NOW, selection: { senders: ['office@harbour.example', 'office@hill.example'], days: 14 }, children: schoolDemoChildren.map((c, i) => ({ ...c, confirmedAudiences: [i ? 'Year 7' : 'Year 9'] })), previous: schoolDemoBaseline(scenario), current: schoolDemoSources(scenario) }); }
const week = { startDate: '2026-10-19', days: 7 as const };
describe('school agenda projection', () => {
  it.each([['2026-09-27', 23], ['2026-04-05', 25]])('uses Auckland civil day at DST %s', (startDate, hours) => { const w = agendaWindow({ startDate, days: 1 }); expect((Date.parse(w.end) - Date.parse(w.start)) / 3600000).toBe(hours); });
  it('keeps date moves, exact selected event etags and conflicts, without inventing duration', () => {
    const a = prepareSchoolAgenda(sampleBrief(), schoolCalendarFixture(), week, schoolCalendarLinks);
    expect(a.entries[0].action).toMatchObject({ kind: 'update', eventId: 'fictional-exam', etag: 'fixture-exam-v1', end: null });
    expect(a.entries[0].clashes).toContain('fictional-appointment'); expect(a.entries[0].action.blockers.join()).toContain('duration'); expect(a.scheduled).toBe(false);
    expect(prepareSchoolAgenda(sampleBrief(), schoolCalendarFixture(), { startDate: '2026-10-20', days: 1 }, schoolCalendarLinks).entries[0].position).toBe('moved_out');
  });
  it('uses half-open all-day boundaries', () => {
    const calendar = schoolCalendarFixture();
    expect(prepareSchoolAgenda(sampleBrief(), calendar, { startDate: '2026-10-23', days: 1 }).calendarEvents.map(e => e.id)).toContain('fictional-all-day');
    expect(prepareSchoolAgenda(sampleBrief(), calendar, { startDate: '2026-10-24', days: 1 }).calendarEvents).toHaveLength(0);
  });
  it('rejects another owner and duplicate identities', () => {
    expect(() => prepareSchoolAgenda(sampleBrief(), schoolCalendarFixture('other'), week)).toThrow('owner');
    const c = schoolCalendarFixture(); c.events.push(c.events[0]); expect(() => prepareSchoolAgenda(sampleBrief(), c, week)).toThrow();
  });
  it.each(['stale', 'partial', 'window'])('blocks %s calendar evidence', reason => {
    const c = schoolCalendarFixture(); if (reason === 'stale') c.observedAt = '2026-10-12T01:00:00Z'; if (reason === 'partial') c.complete = false; if (reason === 'window') c.range.end = '2026-10-24T11:00:00Z';
    expect(prepareSchoolAgenda(sampleBrief(), c, week, schoolCalendarLinks).entries.every(e => e.action.blockers.join().includes('Recheck'))).toBe(true);
  });
  it('requires explicit linkage and never matches by title', () => { expect(prepareSchoolAgenda(sampleBrief(), schoolCalendarFixture(), week).entries[1].action.blockers.join()).toContain('exact existing'); });
  it('reviews a cancellation only for the exact current owner/snapshot and cannot execute', async () => {
    const a = prepareSchoolAgenda(sampleBrief(), schoolCalendarFixture(), week, schoolCalendarLinks);
    const command = { ownerId: a.ownerId, revision: a.revision, digest: await agendaDigest(a), cardId: a.entries[1].card.id, decision: 'reviewed' as const, now: SCHOOL_DEMO_NOW };
    expect((await reviewAgendaAction(a, command)).entries[1].action.status).toBe('reviewed');
    for (const patch of [{ ownerId: 'other' }, { digest: 'stale' }, { now: '2026-10-13T01:16:00Z' }, { cardId: a.entries[0].card.id }]) await expect(reviewAgendaAction(a, { ...command, ...patch })).rejects.toThrow();
  });
  it.each(['conflict', 'baseline-conflict', 'missing', 'stale'])('retains blockers for %s notices', scenario => { expect(prepareSchoolAgenda(sampleBrief(scenario), schoolCalendarFixture(), week, schoolCalendarLinks).entries[0].action.blockers.length).toBeGreaterThan(0); });
});
