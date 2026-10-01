import { describe, it, expect } from 'vitest';
import { acceptContact, approveProposal, changePlan, close, disclose, displayWindow, digest, fixture, overlap, syntheticTransport } from './protocol';
const now = Date.parse('2026-10-04T19:00:00Z');
async function prepare(noOverlap = false) {
  const f = fixture(noOverlap);
  let s = acceptContact(acceptContact(f.session, 'alex', now), 'sam', now);
  const a = await disclose(s, 'alex', f.privateWindows.alex, now); s = (await syntheticTransport.deliver(a.session, 'sam', a.envelope, now)).session;
  const b = await disclose(s, 'sam', f.privateWindows.sam, now); s = (await syntheticTransport.deliver(b.session, 'alex', b.envelope, now)).session;
  return { s, envelope: b.envelope };
}
describe('synthetic EA coordination', () => {
  it('requires mutual contact and exact local disclosure', async () => {
    const f = fixture();
    await expect(disclose(f.session, 'alex', f.privateWindows.alex, now)).rejects.toThrow('Disclosure unavailable');
    const accepted = acceptContact(acceptContact(f.session, 'alex', now), 'sam', now);
    const a = await disclose(accepted, 'alex', f.privateWindows.alex, now);
    await expect(syntheticTransport.deliver(accepted, 'sam', a.envelope, now)).rejects.toThrow('No exact local');
  });
  it('agrees on one revision with no calendar booking', async () => {
    const { s } = await prepare();
    expect(s.proposal?.start).toBe('2026-10-04T21:00:00.000Z');
    const one = approveProposal(s, 'alex', s.revision, s.digest!, now); expect(one.receipt).toBeUndefined();
    const both = approveProposal(one, 'sam', s.revision, s.digest!, now);
    expect(both.receipt?.calendarBookingCreated).toBe(false);
    expect(approveProposal(both, 'sam', s.revision, s.digest!, now)).toEqual(both);
  });
  it('ignores exact duplicate delivery, rejects scope/tamper/injected authority', async () => {
    const { s, envelope } = await prepare();
    expect((await syntheticTransport.deliver(s, 'alex', envelope, now)).duplicate).toBe(true);
    await expect(syntheticTransport.deliver(s, 'sam', envelope, now)).rejects.toThrow('Scope');
    await expect(syntheticTransport.deliver(s, 'alex', { ...envelope, digest: '0'.repeat(64) }, now)).rejects.toThrow('Digest');
    await expect(syntheticTransport.deliver(s, 'alex', { ...envelope, memory: 'private' }, now)).rejects.toThrow();
    await expect(syntheticTransport.deliver(s, 'alex', { ...envelope, payload: { ...envelope.payload, approve: true } }, now)).rejects.toThrow();
  });
  it('preserves contact review when duration changes before mutual acceptance', () => {
    const initial = changePlan(fixture().session, 45, now);
    expect(initial.status).toBe('contact');
    const one = changePlan(acceptContact(fixture().session, 'alex', now), 45, now);
    expect(one.status).toBe('contact');
    expect(one.contacts).toEqual({ alex: true, sam: false });
    expect(acceptContact(one, 'sam', now).status).toBe('disclosure');
  });
  it('invalidates all approvals on changed plan and bounds rounds', async () => {
    const { s, envelope } = await prepare();
    const approved = approveProposal(s, 'alex', s.revision, s.digest!, now);
    const changed = changePlan(approved, 45, now);
    expect(changed.approvals).toEqual({}); expect(changed.disclosed).toEqual({}); expect(changed.receipt).toBeUndefined();
    expect(() => approveProposal(changed, 'sam', s.revision, s.digest!, now)).toThrow();
    await expect(syntheticTransport.deliver(changed, 'alex', envelope, now)).rejects.toThrow('Scope');
    expect(() => changePlan(changePlan(changed, 30, now), 45, now)).toThrow('Maximum');
  });
  it('closes on decline, revocation and expiry with no shared windows', async () => {
    const { s, envelope } = await prepare();
    for (const reason of ['declined', 'revoked', 'expired'] as const) {
      const ended = close(s, reason, Date.parse(s.expiresAt));
      expect(ended.received).toEqual({}); expect(ended.receipt).toBeUndefined();
      expect(() => approveProposal(ended, 'alex', s.revision, s.digest!, now)).toThrow();
      await expect(syntheticTransport.deliver(ended, 'alex', envelope, now)).rejects.toThrow();
    }
    expect(() => approveProposal(s, 'alex', s.revision, s.digest!, Date.parse(s.expiresAt))).toThrow('expired');
  });
  it('returns honest no-overlap and omits private fields', async () => {
    const { s } = await prepare(true); expect(s.status).toBe('no_overlap'); expect(s.proposal).toBeUndefined();
    const f = fixture(); const accepted = acceptContact(acceptContact(f.session, 'alex', now), 'sam', now);
    const privateWindow = { ...f.privateWindows.alex[0], notes: 'private' };
    await expect(disclose(accepted, 'alex', [privateWindow], now)).rejects.toThrow();
  });
  it('canonical digest ignores property order and new approvals reject started slots', async () => {
    expect(await digest({ sam: { end: 'b', start: 'a' }, alex: ['x'] })).toBe(await digest({ alex: ['x'], sam: { start: 'a', end: 'b' } }));
    const { s } = await prepare();
    expect(() => approveProposal(s, 'alex', s.revision, s.digest!, Date.parse(s.proposal!.start))).toThrow('started');
  });
  it('uses instants through Auckland DST and timezone offsets', () => {
    const before = { start: '2026-09-27T01:30:00+12:00', end: '2026-09-27T03:30:00+13:00' };
    const utc = { start: '2026-09-26T13:30:00Z', end: '2026-09-26T14:30:00Z' };
    expect(overlap([before], [utc], 60)).toEqual({ start: '2026-09-26T13:30:00.000Z', end: '2026-09-26T14:30:00.000Z' });
    expect(displayWindow(before)).toContain('NZ');
    const fall = { start: '2026-04-05T02:30:00+13:00', end: '2026-04-05T02:30:00+12:00' };
    expect(Date.parse(overlap([fall], [fall], 60)!.end) - Date.parse(fall.start)).toBe(3600000);
  });
});
