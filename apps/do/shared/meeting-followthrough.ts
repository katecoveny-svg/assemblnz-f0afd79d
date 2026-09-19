import { z } from 'zod';
import { parseMeetingSmartNotes } from './meeting-smart-notes';

export const MEETING_EMAIL_SENDER = 'assembl@assembl.co.nz';
/** Reviewed preparation only. The existing operator queue owns sending. */
export const meetingFollowupSchema = z.object({
  requestId: z.string().uuid(),
  to: z.string().trim().email().max(254).regex(/^[^\r\n]+$/),
  subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/),
  body: z.string().trim().min(1).max(8_000),
  notes: z.string().trim().min(1).max(24_000),
  approved: z.literal(true),
}).strict();
export type MeetingFollowupInput = z.infer<typeof meetingFollowupSchema>;
export type MeetingFollowupReceipt = {
  id: string; status: 'pending' | 'approved' | 'dispatched' | 'rejected' | 'failed';
  createdAt: string; sourceHash: string; sender: typeof MEETING_EMAIL_SENDER;
};
const emptySection = /^(?:none\b|not (?:stated|specified|needed|applicable|identified)\b|no (?:actions?|action items|open questions|follow.up|questions)\b)/i;
/** Keep reviewed wording; never infer recipients, owners or dates. */
export function meetingFollowthroughFromNotes(notes: string) {
  const sections = parseMeetingSmartNotes(notes);
  const section = (heading: string) => sections.filter(s => s.heading === heading).map(s => s.body).join('\n').trim();
  const actions = [...new Set(section('Action items').split('\n').map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(line => line && !emptySection.test(line)))];
  const email = section('Follow-up email draft');
  const subject = email.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const body = emptySection.test(email) ? '' : email.replace(/^Subject:\s*.+\n?/im, '').trim();
  const questions = section('Open questions');
  const agenda = ['Next meeting agenda', actions.length ? `Review agreed work\n${actions.map(a => `• ${a}`).join('\n')}` : '', questions && !emptySection.test(questions) ? `Questions to resolve\n${questions}` : '', 'Confirm decisions, owners and dates before closing.'].filter(Boolean).join('\n\n');
  return { actions, subject, body, agenda };
}
const STATUS_COPY: Record<MeetingFollowupReceipt['status'], string> = {
  pending: 'Waiting for operator approval. Nothing has been sent.',
  approved: 'Operator approval recorded. Sending has not been confirmed.',
  dispatched: 'The email provider accepted the send request. Inbox delivery is not verified.',
  rejected: 'The operator declined this request. Nothing was sent by this request.',
  failed: 'Sending could not be confirmed. Check with the operator before retrying.',
};
export function meetingFollowupStatus(status: MeetingFollowupReceipt['status']) { return STATUS_COPY[status]; }
function escapeCalendar(value: string) { return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
/** RFC 5545 folding counts UTF-8 octets, preserving macrons and emoji. */
function foldCalendar(line: string) {
  const encoder = new TextEncoder(); let width = 0; let result = '';
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (width + size > 75) { result += '\r\n '; width = 1; }
    result += char; width += size;
  }
  return result;
}
/** File export only. The user chooses the date and imports it into their calendar. */
export function meetingReminderCalendar(input: { title: string; agenda: string; startsAt: string; id: string }, now = new Date()) {
  const start = new Date(input.startsAt);
  if (!input.title.trim() || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(input.startsAt) || !Number.isFinite(start.getTime())) throw new Error('Choose a valid date and time for your reminder.');
  if (start.getTime() <= now.getTime()) throw new Error('Choose a future date and time.');
  if (!/^[a-z0-9-]{1,80}$/i.test(input.id)) throw new Error('Invalid reminder identifier.');
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//assembl//Meeting DO//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${input.id}@assembl.co.nz`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 30 * 60_000))}`, `SUMMARY:${escapeCalendar(input.title.trim())}`, `DESCRIPTION:${escapeCalendar(input.agenda)}`, 'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Meeting follow-up', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].map(foldCalendar).join('\r\n');
}
