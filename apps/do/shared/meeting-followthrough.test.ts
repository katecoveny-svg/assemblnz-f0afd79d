import { describe, expect, it } from 'vitest';
import { meetingFollowthroughFromNotes, meetingFollowupSchema, meetingFollowupStatus, meetingReminderCalendar } from './meeting-followthrough';
const notes = '## Action items\n- Prepare brief · Owner: Jordan · Due: Friday\n\n**Open questions**\nBudget remains open.\n\nFollow-up email draft\nSubject: Review the brief\nKia ora, please review the draft.';
describe('reviewed meeting outputs', () => {
  it('accepts markdown headings and preserves dates without guessing recipients', () => {
    const result = meetingFollowthroughFromNotes(notes);
    expect(result.actions).toEqual(['Prepare brief · Owner: Jordan · Due: Friday']);
    expect(result).toMatchObject({ subject: 'Review the brief', body: 'Kia ora, please review the draft.' });
    expect(result).not.toHaveProperty('to'); expect(result.agenda).toContain('Budget remains open.');
  });
  it('does not turn absence statements into work', () => {
    const result = meetingFollowthroughFromNotes('Action items\nNone stated.\nOpen questions\nNo open questions.\nFollow-up email draft\nNot needed from this source.');
    expect(result.actions).toEqual([]); expect(result.body).toBe(''); expect(result.agenda).not.toContain('Questions to resolve');
  });
  it('requires review and recipient; rejects header injection and client authority', () => {
    const input = { requestId: '9e0fe4cd-ec85-4622-87dd-9de6a2931738', to: 'test@example.com', subject: 'Review', body: 'Draft', notes, approved: true };
    expect(meetingFollowupSchema.safeParse(input).success).toBe(true);
    for (const patch of [{ approved: false }, { to: 'Jordan' }, { subject: 'Review\r\nBcc: hidden@example.com' }, { owner: 'another-person' }, { status: 'approved' }]) expect(meetingFollowupSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
  it('does not label approval or provider acceptance as delivery', () => {
    expect(meetingFollowupStatus('approved')).toContain('not been confirmed');
    expect(meetingFollowupStatus('dispatched')).toContain('Inbox delivery is not verified');
  });
});
describe('calendar export', () => {
  const now = new Date('2026-09-19T00:00:00Z');
  const input = { title: 'Whānau follow-up', agenda: 'Budget, owners; dates\nCheck the brief.', startsAt: '2026-09-21T10:00:00+12:00', id: 'meeting-test' };
  it('uses the chosen instant, escapes data and creates a reminder without attendees', () => {
    const file = meetingReminderCalendar(input, now);
    expect(file).toContain('DTSTART:20260920T220000Z\r\n'); expect(file).toContain('Budget\\, owners\\; dates\\nCheck the brief.');
    expect(file).toContain('TRIGGER:-PT15M'); expect(file).not.toContain('ATTENDEE'); expect(file).not.toContain('METHOD:REQUEST');
  });
  it('rejects ambiguous times, past dates and calendar injection', () => {
    for (const patch of [{ startsAt: 'Friday' }, { startsAt: '2026-09-21T10:00' }, { startsAt: '2026-09-01T00:00:00Z' }, { id: 'x\r\nATTENDEE:evil' }]) expect(() => meetingReminderCalendar({ ...input, ...patch }, now)).toThrow();
    expect(meetingReminderCalendar({ ...input, title: 'Review\r\nATTENDEE:evil' }, now)).toContain('SUMMARY:Review\\nATTENDEE:evil');
  });
  it('folds Unicode text at 75 octets without corrupting macrons', () => {
    const title = 'Whānau 🥝 '.repeat(30); const file = meetingReminderCalendar({ ...input, title }, now);
    expect(file.split('\r\n').every(line => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(file.replace(/\r\n /g, '')).toContain(`SUMMARY:${title.trim()}`);
  });
});
