import { describe, expect, it } from 'vitest';
import { createMailHandoffReceiver, MailReviewSession } from './review';
import type { MailDraft } from './contract';
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const id = '33333333-3333-4333-8333-333333333333';
const result = { ownerId: owner, requestId: id } as MailDraft;
describe('mail review lifetime', () => {
  it('blocks duplicate in-flight clicks and duplicate results', () => {
    const session = new MailReviewSession(owner); expect(session.begin(id)).not.toBeNull(); expect(session.begin(id)).toBeNull();
    expect(session.accept(result)).toBe(true); expect(session.accept(result)).toBe(false);
  });
  it('rejects late cancelled, stale and wrong-owner results', () => {
    const session = new MailReviewSession(owner); const signal = session.begin(id)!;
    session.cancel(); expect(signal.aborted).toBe(true); expect(session.accept(result)).toBe(false);
    session.begin('next'); expect(session.accept(result)).toBe(false);
    const switched = new MailReviewSession(other); switched.begin(id); expect(switched.accept(result)).toBe(false);
  });
  it('accepts reviewed voice text once, with no consent or account authority', () => {
    const receive = createMailHandoffReceiver(owner, () => 1000);
    const handoff = { id, ownerId: owner, text: 'Find Example Clinic correspondence', expiresAt: 2000 };
    expect(receive({ ...handoff, consent: true }, false)).toBeNull();
    expect(receive(handoff, true)).toBeNull();
    expect(receive({ ...handoff, ownerId: other }, false)).toBeNull();
    expect(receive({ ...handoff, expiresAt: 999 }, false)).toBeNull();
    expect(receive(handoff, false)).toBe(handoff.text);
    expect(receive(handoff, false)).toBeNull();
  });
});
