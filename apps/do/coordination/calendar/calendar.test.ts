import { describe, expect, it, vi } from 'vitest';
import { availabilityReview, freeWindows, validateRead } from './availability';
import { fixtureAdapter, fixtureConnection, fixtureRead, FIXTURE_NOW } from './fixtures';
import { GOOGLE_FREE_BUSY_SCOPE, googleCalendarAdapter, validateGoogleScopes, type GoogleCalendarAuthority } from './google';
import { prepareGoogleOAuth } from './oauth-preparation';

const connection = fixtureConnection('google');
const read = fixtureRead(connection);
function liveHarness(body: unknown, status = 200) {
  const live = { ...connection, mode: 'live' as const };
  const authority: GoogleCalendarAuthority = {
    primaryChoice: vi.fn(async () => ({ handle: read.calendarHandles[0], label: 'Private calendar', timezone: read.timezone })),
    consumeRead: vi.fn(async () => ({ ownerId: live.ownerId, connectionId: live.id, connectionRevision: 1, handle: read.calendarHandles[0], calendarId: 'primary' as const, accessToken: 'synthetic-token', grantedScopes: GOOGLE_FREE_BUSY_SCOPE, expiresAt: read.expiresAt })),
    invalidate: vi.fn(async () => {}),
  };
  const transport = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  return { live, authority, transport, adapter: googleCalendarAdapter(authority, transport, () => FIXTURE_NOW) };
}
const reply = { timeMin: read.range.start, timeMax: read.range.end, calendars: { primary: { busy: [{ start: '2026-10-06T10:00:00+13:00', end: '2026-10-06T11:00:00+13:00' }], privateDescription: 'must never be retained' } }, privateNote: 'not shared' };
describe('calendar preparation, no live transport', () => {
  it('computes owner-only free time without peer permission', async () => {
    const snapshot = await fixtureAdapter('google').readBusy(connection, read);
    const review = await availabilityReview(read, snapshot, connection, FIXTURE_NOW);
    expect(review.windows).toHaveLength(3);
    expect(review.peerDisclosureApproved).toBe(false);
    expect(JSON.stringify(review)).not.toContain(connection.accountLabel);
  });
  it('rejects revoked, switched, expired, overlapping and oversized reads', () => {
    for (const c of [{ ...connection, status: 'revoked' as const }, { ...connection, revision: 2 }, { ...connection, expiresAt: 'invalid' }]) expect(() => validateRead(read,c,FIXTURE_NOW)).toThrow();
    expect(() => validateRead(read,connection,Date.parse(read.expiresAt))).toThrow();
    expect(() => validateRead({ ...read, workingWindows: [read.range, read.range] },connection,FIXTURE_NOW)).toThrow('overlap');
    expect(() => validateRead({ ...read, range: { ...read.range, end: '2026-11-06T17:00:00+13:00' } },connection,FIXTURE_NOW)).toThrow();
    expect(() => validateRead({ ...read, timezone: 'invented/timezone' },connection,FIXTURE_NOW)).toThrow();
  });
  it('keeps DST instants correct through the Auckland spring transition', () => {
    const dst = { ...read, range: { start: '2026-09-27T01:00:00+12:00', end: '2026-09-27T04:00:00+13:00' }, workingWindows: [{ start: '2026-09-27T01:00:00+12:00', end: '2026-09-27T04:00:00+13:00' }] };
    const windows = freeWindows(dst,{ range: dst.range, busy: [{ start: '2026-09-27T01:30:00+12:00', end: '2026-09-27T03:30:00+13:00' }], complete: true, observedAt: new Date(FIXTURE_NOW).toISOString() });
    expect(windows).toEqual([{ start: '2026-09-26T13:00:00.000Z', end: '2026-09-26T13:30:00.000Z' },{ start: '2026-09-26T14:30:00.000Z', end: '2026-09-26T15:00:00.000Z' }]);
  });
  it('queries only primary and strips all unrelated provider fields', async () => {
    const h = liveHarness(reply); const snapshot = await h.adapter.readBusy(h.live,read);
    expect(snapshot.busy).toEqual(reply.calendars.primary.busy);
    expect(JSON.stringify(snapshot)).not.toMatch(/private|synthetic-token/);
    expect(h.authority.consumeRead).toHaveBeenCalledWith(h.live, read, expect.stringMatching(/^[a-f0-9]{64}$/));
    const [url, options] = h.transport.mock.calls[0]; expect(url).toBe('https://www.googleapis.com/calendar/v3/freeBusy');
    expect(JSON.parse(options!.body as string).items).toEqual([{ id: 'primary' }]);
    expect(options?.redirect).toBe('error');
  });
  it('fails closed on per-calendar errors, missing or unexpected calendars and mismatched range', async () => {
    for (const body of [{ ...reply, calendars: {} }, { ...reply, calendars: { primary: { busy: [], errors: [{ reason: 'forbidden' }] } } }, { ...reply, calendars: { ...reply.calendars, stranger: { busy: [] } } }, { ...reply, timeMax: '2026-10-06T18:00:00+13:00' }]) {
      const h = liveHarness(body); await expect(h.adapter.readBusy(h.live,read)).rejects.toThrow();
    }
    const h = liveHarness(reply,403); await expect(h.adapter.readBusy(h.live,read)).rejects.toThrow('unavailable');
  });
  it('never calls transport when authority rejects replay or a legacy broad grant', async () => {
    const h = liveHarness(reply); vi.mocked(h.authority.consumeRead).mockRejectedValueOnce(new Error('Replay rejected'));
    await expect(h.adapter.readBusy(h.live,read)).rejects.toThrow('Replay'); expect(h.transport).not.toHaveBeenCalled();
    expect(() => validateGoogleScopes(`${GOOGLE_FREE_BUSY_SCOPE} https://www.googleapis.com/auth/calendar`)).toThrow();
    expect(() => validateGoogleScopes('openid email')).toThrow();
  });
  it('rejects owner-switched leases and expiry after authority locks before transport', async () => {
    const h = liveHarness(reply);
    const original = await h.authority.consumeRead(h.live,read,'fixture');
    vi.mocked(h.authority.consumeRead).mockResolvedValue({ ...original, ownerId: 'another-owner' });
    await expect(h.adapter.readBusy(h.live,read)).rejects.toThrow('lease'); expect(h.transport).not.toHaveBeenCalled();
    let now = FIXTURE_NOW;
    vi.mocked(h.authority.consumeRead).mockImplementation(async () => { now = Date.parse(read.expiresAt); return original; });
    const adapter = googleCalendarAdapter(h.authority,h.transport,() => now);
    await expect(adapter.readBusy(h.live,read)).rejects.toThrow('expired'); expect(h.transport).not.toHaveBeenCalled();
  });
  it('rejects stale/incomplete snapshots and excessive disclosure fragmentation', async () => {
    const snapshot = await fixtureAdapter('google').readBusy(connection,read);
    await expect(availabilityReview(read,{ ...snapshot, observedAt: new Date(FIXTURE_NOW-300001).toISOString() },connection,FIXTURE_NOW)).rejects.toThrow('stale');
    expect(() => freeWindows(read,{ ...snapshot, complete: false } as never)).toThrow();
    const start = Date.parse(read.range.start);
    const busy = Array.from({ length: 9 },(_,i) => ({ start: new Date(start+(i*2+1)*60000).toISOString(), end: new Date(start+(i*2+2)*60000).toISOString() }));
    expect(() => freeWindows(read,{ ...snapshot,busy })).toThrow('Narrow');
  });
  it('prepares unique session-bound S256 records without exchanging tokens', () => {
    const a = prepareGoogleOAuth('owner', 'x'.repeat(32),FIXTURE_NOW), b = prepareGoogleOAuth('owner','x'.repeat(32),FIXTURE_NOW);
    expect(a.browser.state).not.toBe(b.browser.state); expect(a.browser.codeChallengeMethod).toBe('S256');
    expect(a.privateRecord.stateHash).not.toBe(a.browser.state);
    expect(a.browser.scopes).toEqual(['openid','email',GOOGLE_FREE_BUSY_SCOPE]);
    expect(JSON.stringify(a.browser)).not.toContain(a.privateRecord.verifier);
  });
});
