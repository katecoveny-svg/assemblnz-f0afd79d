import { describe, expect, it, vi } from 'vitest';
import { digest } from '../coordination/protocol';
import { stageSchoolPilot, type PilotPorts, type PilotLease, type PilotScope } from './staging';
import { schoolDemoChildren, schoolDemoSources, schoolDemoBaseline, SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER } from './fixtures';
import { schoolCalendarFixture, schoolCalendarLinks } from './agenda-fixtures';
/** Synthetic transactional adapter only. Not a claim about a hosted database. */
async function fixture() {
  const owner = SCHOOL_DEMO_OWNER;
  const scope: PilotScope = { senders: ['office@harbour.example', 'office@hill.example'], days: 14, calendarId: 'fictional-family-calendar', startDate: '2026-10-19', agendaDays: 7, retentionDays: 7, processing: 'school-deterministic-v1', termsDigest: '0'.repeat(64) };
  const children = schoolDemoChildren.map((c, i) => ({ ...c, confirmedAudiences: [i ? 'Year 7' : 'Year 9'] })), links = schoolCalendarLinks;
  const lease: PilotLease = { ownerId: owner, historyRevision: 1, approvalId: 'approval-a', approvalRevision: 1, scopeDigest: await digest({ scope, children, links }), gmailConnectionId: 'fictional-mail', gmailRevision: 1, calendarConnectionId: 'fictional-calendar-connection', calendarRevision: 1, gmailScopes: ['https://www.googleapis.com/auth/gmail.readonly'], calendarScopes: ['https://www.googleapis.com/auth/calendar.events.owned.readonly'], issuedAt: SCHOOL_DEMO_NOW, expiresAt: '2026-10-13T01:15:00Z' };
  const state = { owner: owner as string | null, now: SCHOOL_DEMO_NOW, active: true, revision: 1, approvalRevision: 1, gmailRevision: 1, calendarRevision: 1, sources: schoolDemoBaseline('revised'), pending: [] as ReturnType<typeof schoolDemoSources>, expiresAt: '' };
  function guard(l: PilotLease) { if (!state.active || state.owner !== owner || l.ownerId !== owner || l.approvalRevision !== state.approvalRevision || l.gmailRevision !== state.gmailRevision || l.calendarRevision !== state.calendarRevision || Date.parse(state.now) >= Date.parse(l.expiresAt)) throw new Error('revoked or changed'); }
  const ports: PilotPorts = {
    now: () => state.now, owner: vi.fn(async () => state.owner), authorize: vi.fn(async () => ({ lease, scope, children, links })),
    history: vi.fn(async l => { guard(l); if (state.expiresAt && Date.parse(state.now) >= Date.parse(state.expiresAt)) { state.sources = []; state.pending = []; state.revision++; } return { revision: state.revision, sources: structuredClone(state.sources) }; }),
    readMail: vi.fn(async () => schoolDemoSources('revised')), readCalendar: vi.fn(async () => schoolCalendarFixture()), assertActive: vi.fn(async l => guard(l)),
    commit: vi.fn(async (l, revision, sources, expiresAt) => { guard(l); if (revision !== state.revision) throw new Error('history changed'); state.pending = sources; state.expiresAt = expiresAt; return ++state.revision; }),
    publish: vi.fn(async (l, revision, agenda) => { guard(l); if (revision !== state.revision) throw new Error('history changed'); return agenda; }),
  };
  const remove = () => { state.sources = []; state.pending = []; state.revision++; state.active = false; };
  return { state, scope, lease, ports, remove, command: { workspace: owner, approvalId: lease.approvalId } };
}
describe('private pilot test port', () => {
  it('runs only bounded reads with exact consent and retained source history', async () => {
    const f = await fixture(), a = await stageSchoolPilot(f.command, f.ports);
    expect(a.entries).toHaveLength(2); expect(f.ports.readMail).toHaveBeenCalledWith(f.lease, { senders: f.scope.senders, days: 14, before: SCHOOL_DEMO_NOW });
    expect(f.ports.readCalendar).toHaveBeenCalledWith(f.lease, expect.objectContaining({ calendarId: f.scope.calendarId, maxResults: 50 }));
    expect(f.state.expiresAt).toBe('2026-10-20T01:00:00.000Z'); expect(f.ports.publish).toHaveBeenCalledOnce();
  });
  it('uses completion time for evidence freshness while keeping the initial mail cutoff', async () => {
    const f = await fixture();
    f.ports.readMail = vi.fn(async () => { f.state.now = '2026-10-13T01:01:00Z'; return schoolDemoSources('revised').map(s => ({ ...s, checkedAt: f.state.now })); });
    f.ports.readCalendar = vi.fn(async () => { f.state.now = '2026-10-13T01:02:00Z'; return { ...schoolCalendarFixture(), observedAt: f.state.now }; });
    const agenda = await stageSchoolPilot(f.command, f.ports);
    expect(agenda.checkedAt).toBe('2026-10-13T01:02:00Z'); expect(agenda.notices).toEqual([]);
    expect(f.ports.readMail).toHaveBeenCalledWith(f.lease, expect.objectContaining({ before: SCHOOL_DEMO_NOW }));
    expect(f.state.expiresAt).toBe('2026-10-20T01:02:00.000Z');
  });
  it('keeps a notice at the initially approved lookback boundary after the clock advances', async () => {
    const f = await fixture(); f.state.sources = [];
    f.ports.readMail = async () => { f.state.now = '2026-10-13T01:01:00Z'; return schoolDemoSources('revised').map(s => ({ ...s, receivedAt: '2026-09-29T01:00:00Z', checkedAt: f.state.now })); };
    f.ports.readCalendar = async () => { f.state.now = '2026-10-13T01:02:00Z'; return { ...schoolCalendarFixture(), observedAt: f.state.now }; };
    expect((await stageSchoolPilot(f.command, f.ports)).entries).toHaveLength(2);
  });
  it.each(['mail', 'calendar'])('still rejects genuinely future %s evidence after advancing reads', async kind => {
    const f = await fixture();
    f.ports.readMail = async () => { f.state.now = '2026-10-13T01:01:00Z'; return schoolDemoSources('revised').map(s => ({ ...s, checkedAt: kind === 'mail' ? '2026-10-13T01:03:00Z' : f.state.now })); };
    f.ports.readCalendar = async () => { f.state.now = '2026-10-13T01:02:00Z'; return { ...schoolCalendarFixture(), observedAt: kind === 'calendar' ? '2026-10-13T01:03:00Z' : f.state.now }; };
    await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('incomplete'); expect(f.ports.commit).not.toHaveBeenCalled();
  });
  it('does not admit mail arriving after the original cutoff during a read', async () => {
    const f = await fixture(); f.ports.readMail = async () => { f.state.now = '2026-10-13T01:02:00Z'; return schoolDemoSources('revised').map(s => ({ ...s, receivedAt: '2026-10-13T01:01:00Z', checkedAt: f.state.now })); };
    await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('scope mismatch'); expect(f.ports.commit).not.toHaveBeenCalled();
  });
  it.each(['owner', 'approval', 'retention', 'calendar', 'children'])('rejects changed %s before provider access', async kind => {
    const f = await fixture(); if (kind === 'owner') f.state.owner = 'adult-b'; if (kind === 'approval') f.lease.approvalRevision = 0; if (kind === 'retention') f.scope.retentionDays = 30; if (kind === 'calendar') f.scope.calendarId = 'another-calendar'; if (kind === 'children') (await f.ports.authorize('', '')).children[0].confirmedAudiences = ['different'];
    await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow(); expect(f.ports.readMail).not.toHaveBeenCalled();
  });
  it.each(['session', 'expiry', 'revocation', 'gmail', 'calendar', 'delete'])('suppresses in-flight %s changes before next read or commit', async kind => {
    const f = await fixture(); f.ports.readMail = vi.fn(async () => { if (kind === 'session') f.state.owner = null; if (kind === 'expiry') f.state.now = '2026-10-13T01:15:00Z'; if (kind === 'revocation') f.state.active = false; if (kind === 'gmail') f.state.gmailRevision++; if (kind === 'calendar') f.state.calendarRevision++; if (kind === 'delete') f.remove(); return schoolDemoSources('revised'); });
    await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow(); expect(f.ports.readCalendar).not.toHaveBeenCalled(); expect(f.ports.commit).not.toHaveBeenCalled(); if (kind === 'delete') expect(f.state.sources).toEqual([]);
  });
  it.each(['tenant', 'sender', 'future', 'calendar'])('rejects provider %s scope escape', async kind => {
    const f = await fixture(); if (kind === 'calendar') f.ports.readCalendar = async () => schoolCalendarFixture('adult-b'); else f.ports.readMail = async () => { const s = schoolDemoSources('revised'); if (kind === 'tenant') s[0].ownerId = 'adult-b'; if (kind === 'sender') s[0].sender = 'other@school.example'; if (kind === 'future') s[0].receivedAt = '2027-01-01T00:00:00Z'; return s; };
    await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('scope mismatch'); expect(f.ports.commit).not.toHaveBeenCalled();
  });
  it('does not resurrect deleted history at the atomic commit boundary', async () => { const f = await fixture(), commit = f.ports.commit; f.ports.commit = async (...args) => { f.remove(); return commit(...args); }; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow(); expect(f.state.sources).toEqual([]); expect(f.ports.publish).not.toHaveBeenCalled(); });
  it('suppresses publication when deletion occurs after commit', async () => { const f = await fixture(), publish = f.ports.publish; f.ports.publish = async (...args) => { f.remove(); return publish(...args); }; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow(); expect(f.state.sources).toEqual([]); });
  it('fails closed on storage errors without a local fallback', async () => { const f = await fixture(); f.ports.history = async () => { throw new Error('storage unavailable'); }; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('storage'); expect(f.ports.readMail).not.toHaveBeenCalled(); });
  it('rejects CAS conflicts', async () => { const f = await fixture(), commit = f.ports.commit; f.ports.commit = async (...args) => { f.state.revision++; return commit(...args); }; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('history changed'); expect(f.ports.publish).not.toHaveBeenCalled(); });
  it('does not replace history with failed or conflicting source evidence', async () => { const f = await fixture(); f.ports.readMail = async () => schoolDemoSources('conflict'); await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('incomplete'); expect(f.ports.commit).not.toHaveBeenCalled(); });
  it.each(['https://www.googleapis.com/auth/calendar.freebusy', 'https://www.googleapis.com/auth/calendar', ''])('rejects insufficient, broad or unknown calendar grant %s', async scope => { const f = await fixture(); f.lease.calendarScopes = [scope]; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('verified read scopes'); expect(f.ports.readMail).not.toHaveBeenCalled(); });
  it('does not replay a consumed history revision', async () => { const f = await fixture(); await stageSchoolPilot(f.command, f.ports); await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('renew approval'); expect(f.ports.commit).toHaveBeenCalledOnce(); });
  it('isolates two synthetic tenants at the history boundary', async () => { const f = await fixture(); await expect(f.ports.history({ ...f.lease, ownerId: 'adult-b' })).rejects.toThrow(); await expect(f.ports.commit({ ...f.lease, ownerId: 'adult-b' }, 1, [], SCHOOL_DEMO_NOW)).rejects.toThrow(); expect(f.state.sources).toHaveLength(2); });
  it('expires retained evidence before serving a newly approved read', async () => { const f = await fixture(); await stageSchoolPilot(f.command, f.ports); f.state.now = '2026-10-21T01:00:00Z'; f.lease.issuedAt = f.state.now; f.lease.expiresAt = '2026-10-21T01:15:00Z'; expect((await f.ports.history(f.lease)).sources).toEqual([]); expect(f.state.pending).toEqual([]); });
  it('rejects cross-tenant baseline history', async () => { const f = await fixture(); f.state.sources[0].ownerId = 'adult-b'; await expect(stageSchoolPilot(f.command, f.ports)).rejects.toThrow('scope mismatch'); expect(f.ports.commit).not.toHaveBeenCalled(); });
});
