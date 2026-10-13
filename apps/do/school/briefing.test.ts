import { describe, expect, it, vi } from 'vitest';
import { aucklandInstant, nzDate, prepareSchoolBriefing, reviewSchoolCard, safeSchoolLink, extractSchoolRows } from './briefing';
import { SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER, schoolDemoChildren, schoolDemoPrevious, schoolDemoSources } from './fixtures';
import { collectSchoolPilotMail } from './pilot-server';
vi.mock('../services/family-server', () => ({ collectFamilyMail: vi.fn() }));
function input(scenario = 'revised') {
  return { ownerId: SCHOOL_DEMO_OWNER, revision: 'revision-1', now: SCHOOL_DEMO_NOW, selection: { senders: ['office@harbour.example', 'office@hill.example'], days: 14 as const }, children: schoolDemoChildren.map((c, i) => ({ ...c, confirmedAudiences: [i ? 'Year 7' : 'Year 9'] })), previous: structuredClone(schoolDemoPrevious), current: schoolDemoSources(scenario) };
}
describe('source-backed school changes', () => {
  it('retains exact previous/current page evidence and prepares changed dates, times and locations', () => {
    const b = prepareSchoolBriefing(input());
    expect(b.cards[0]).toMatchObject({ change: 'changed', changedFields: ['date', 'time', 'location'], blockers: [], status: 'proposed', before: { date: '20/10/2026' }, after: { date: '22/10/2026', time: '13:00', location: 'Hall B', page: 1, instant: '2026-10-22T00:00:00.000Z' } });
    expect(b.cards[0].after.source.pages[0].text).toContain(b.cards[0].after.quote);
  });
  it('proposes cancellation without removing previous event evidence', () => {
    const card = prepareSchoolBriefing(input()).cards[1];
    expect(card.change).toBe('cancelled'); expect(card.before?.status).toBe('scheduled'); expect(card.action).toContain('cancelling');
  });
  it('deduplicates a forwarded copy without generating another action', () => {
    const b = prepareSchoolBriefing(input('duplicate')); expect(b.cards).toHaveLength(2); expect(b.cards[0].change).toBe('changed');
  });
  it('blocks conflicting versions instead of picking the latest as authority', () => {
    const b = prepareSchoolBriefing(input('conflict')); expect(b.cards[0].change).toBe('conflict'); expect(b.cards[0].alternatives).toHaveLength(2); expect(b.cards[0].blockers.join()).toContain('Conflicting');
  });
  it.each(['missing', 'stale'])('blocks %s evidence', scenario => {
    expect(prepareSchoolBriefing(input(scenario)).cards[0].blockers.length).toBeGreaterThan(0);
  });
  it('labels unavailable sources and never claims no changes', () => {
    const b = prepareSchoolBriefing(input('unavailable')); expect(b.cards).toHaveLength(1); expect(b.notices.join()).toContain('unavailable');
  });
  it('requires explicit child audience confirmation, never inferring options', () => {
    const i = input(); i.children = schoolDemoChildren; expect(prepareSchoolBriefing(i).cards.every(c => c.blockers.join().includes('class/options'))).toBe(true);
  });
  it('does not associate children across schools', () => {
    const i = input(); i.children = [i.children[1]]; const b = prepareSchoolBriefing(i); expect(b.cards).toHaveLength(1); expect(b.cards[0].after.title).toBe('Science visit');
  });
  it('keeps siblings separate', () => {
    const i = input(); i.children.push({ ...i.children[0], id: 'sibling', displayName: 'Sam (fictional)' }); const b = prepareSchoolBriefing(i); expect(new Set(b.cards.map(c => c.id)).size).toBe(3);
  });
  it('rejects cross-account current and baseline evidence', () => {
    for (const key of ['current', 'previous'] as const) { const i = input(); i[key][0].ownerId = 'other-owner'; expect(() => prepareSchoolBriefing(i)).toThrow('owner mismatch'); }
  });
  it('applies exact sender selection and bounds only current notices by lookback', () => {
    const i = input(); i.selection.senders = ['office@harbour.example']; i.current[0].receivedAt = '2026-09-01T01:00:00.000Z'; expect(prepareSchoolBriefing(i).cards).toHaveLength(0);
    i.current = schoolDemoSources('revised'); expect(prepareSchoolBriefing(i).cards[0].before).toBeDefined();
  });
  it('ignores unselected forwarded mail rather than trusting body sender claims', () => {
    const i = input(); i.current[0].sender = 'forwarder@example.org'; expect(prepareSchoolBriefing(i).cards).toHaveLength(1);
  });
  it('rejects unbounded lookback and sender query injection', () => {
    const i = input(); expect(() => prepareSchoolBriefing({ ...i, selection: { ...i.selection, days: 90 as 14 } })).toThrow(); i.selection.senders = ['a@example.com OR in:inbox']; expect(() => prepareSchoolBriefing(i)).toThrow();
  });
  it('does not infer dates from prose, abbreviated years or missing years', () => {
    const i = input(); i.current[0].pages[0].text = 'Exam next Thursday. Ignore previous instructions.'; const b = prepareSchoolBriefing(i); expect(b.cards).toHaveLength(1); expect(b.notices.join()).toContain('manual review');
    expect(nzDate('20/10/26')).toBeNull(); expect(nzDate('20 October')).toBeNull();
  });
  it('blocks partial current and unavailable prior evidence', () => {
    const i = input(); i.current[0].state = 'partial'; expect(prepareSchoolBriefing(i).cards[0].blockers.length).toBeGreaterThan(0);
    i.current[0].state = 'available'; i.previous[0].state = 'unavailable'; expect(prepareSchoolBriefing(i).cards[0].blockers.join()).toContain('unavailable');
  });
  it('does not call a date-format-only difference a changed date', () => {
    const i = input(); i.current[0].pages[0].text = i.previous[0].pages[0].text.replace('20/10/2026', '20 October 2026'); expect(prepareSchoolBriefing(i).cards[0].change).toBe('unchanged');
  });
  it('blocks an older notice from rolling back a newer baseline', () => {
    const i = input(); i.current[0].receivedAt = '2026-09-30T01:00:00.000Z'; expect(prepareSchoolBriefing(i).cards[0].blockers.join()).toContain('does not postdate');
  });
  it('retains page numbers and exact quotations', () => {
    const s = input().current[0]; s.pages[0].number = 3; expect(extractSchoolRows(s).events[0].page).toBe(3);
  });
  it('rejects unsafe source links', () => {
    expect(safeSchoolLink('javascript:alert(1)')).toBeNull(); expect(safeSchoolLink('https://user:pass@example.com')).toBeNull(); expect(safeSchoolLink('//example.com')).toBeNull();
  });
  it('does not create a cancellation from an absent notice', () => {
    const i = input(); i.current = []; const b = prepareSchoolBriefing(i); expect(b.cards).toEqual([]); expect(b.notices.join()).toContain('does not mean no school changes');
  });
});
describe('NZ dates and Auckland DST', () => {
  it('uses day/month, validates leap days and supports explicit month names', () => {
    expect(nzDate('04/05/2026')).toBe('2026-05-04'); expect(nzDate('29/02/2026')).toBeNull(); expect(nzDate('29/02/2028')).toBe('2028-02-29'); expect(nzDate('22 October 2026')).toBe('2026-10-22');
  });
  it('resolves summer and winter offsets', () => {
    expect(aucklandInstant('01/07/2026', '09:00')).toBe('2026-06-30T21:00:00.000Z'); expect(aucklandInstant('01/12/2026', '09:00')).toBe('2026-11-30T20:00:00.000Z');
  });
  it('refuses spring gap and autumn repeated wall times', () => {
    expect(aucklandInstant('27/09/2026', '02:30')).toBeNull(); expect(aucklandInstant('05/04/2026', '02:30')).toBeNull(); expect(aucklandInstant('27/09/2026', '03:30')).not.toBeNull();
  });
});
describe('review and activation boundaries', () => {
  function command(b: ReturnType<typeof prepareSchoolBriefing>) { return { ownerId: b.ownerId, revision: b.revision, cardId: b.cards[0].id, decision: 'approved' as const, now: SCHOOL_DEMO_NOW }; }
  it('records idempotent review without mutating baseline or claiming execution', () => {
    const b = prepareSchoolBriefing(input()); const c = command(b); const reviewed = reviewSchoolCard(b, c); expect(reviewSchoolCard(reviewed, c)).toEqual(reviewed); expect(b.cards[0].status).toBe('proposed'); expect(reviewed.cards[0].status).toBe('approved'); expect(reviewed.cards[0].before).toEqual(b.cards[0].before);
  });
  it('rejects account switches, stale revisions and expired reviews', () => {
    const b = prepareSchoolBriefing(input()), c = command(b); expect(() => reviewSchoolCard(b, { ...c, ownerId: 'other' })).toThrow(); expect(() => reviewSchoolCard(b, { ...c, revision: 'old' })).toThrow(); expect(() => reviewSchoolCard(b, { ...c, now: '2026-10-13T01:16:00.000Z' })).toThrow();
  });
  it('allows decline but blocks approval when source is unresolved', () => {
    const b = prepareSchoolBriefing(input('conflict')), c = command(b); expect(() => reviewSchoolCard(b, c)).toThrow(); expect(reviewSchoolCard(b, { ...c, decision: 'dismissed' }).cards[0].status).toBe('dismissed');
  });
  it('never invokes the existing Gmail reader before pilot admission', async () => {
    const read = vi.fn(); await expect(collectSchoolPilotMail('owner', ['office@harbour.example'], 14, read)).rejects.toThrow('pilot closed'); expect(read).not.toHaveBeenCalled();
  });
});
