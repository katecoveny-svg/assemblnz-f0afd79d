import { expect, it } from 'vitest';
import { handoffReviewedMail } from './voice-handoff';
it('ends a call and clears consent before handoff, even when the destination rejects replacement', () => {
  const events: string[] = [];
  expect(handoffReviewedMail('  Find Example Clinic mail  ', {
    endVoice: () => events.push('end'), clearConsent: () => events.push('revoke'),
    accept: text => { events.push(text); return false; },
  })).toBe(false);
  expect(events).toEqual(['end', 'revoke', 'Find Example Clinic mail']);
});
it('invalid drafts cannot call the destination', () => {
  for (const text of ['', 'x'.repeat(1201)]) expect(handoffReviewedMail(text, { endVoice: () => { throw new Error('unexpected'); }, clearConsent: () => {}, accept: () => { throw new Error('unexpected'); } })).toBe(false);
});
