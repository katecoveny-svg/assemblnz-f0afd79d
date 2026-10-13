import { z } from 'zod';
import { windowSchema, digest, type Window } from '../coordination/protocol';
import { localDateSchema } from '../personal/life-admin/engine';
import { validateConnectorInput } from '../shared/connector-contracts';
import { aucklandInstant, safeSchoolLink, type SchoolBriefing, type SchoolCard } from './briefing';

const zoned = z.string().datetime({ offset: true });
const timing = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('timed'), range: windowSchema }).strict(),
  z.object({ kind: z.literal('all-day'), startDate: localDateSchema, endDateExclusive: localDateSchema }).strict().refine(x => x.endDateExclusive > x.startDate),
]);
const calendarEventSchema = z.object({ id: z.string().min(1).max(512), etag: z.string().min(1).max(512), title: z.string().min(1).max(240),
  sourceUrl: z.string().refine(x => Boolean(safeSchoolLink(x))), timing, status: z.enum(['confirmed', 'cancelled']) }).strict();
type CalendarEvent = z.infer<typeof calendarEventSchema>;
export const agendaCalendarSchema = z.object({
  ownerId: z.string().min(1), connectionId: z.string().min(1), connectionRevision: z.number().int().positive(),
  calendarId: z.string().min(1).max(512), timezone: z.literal('Pacific/Auckland'),
  observedAt: zoned, range: windowSchema, complete: z.boolean(),
  events: z.array(calendarEventSchema).max(50),
}).strict().superRefine((x, ctx) => { if (new Set(x.events.map(e => e.id)).size !== x.events.length) ctx.addIssue({ code: 'custom', message: 'Duplicate calendar event identity' });
  if (x.events.some(e => !overlaps(eventRange(e), x.range))) ctx.addIssue({ code: 'custom', message: 'Calendar event outside observed range' });
});
export type AgendaCalendar = z.infer<typeof agendaCalendarSchema>;
export type AgendaChoice = { startDate: string; days: 1 | 7 };
export function agendaWindow(choice: AgendaChoice): Window {
  const start = localDateSchema.parse(choice.startDate);
  if (![1, 7].includes(choice.days)) throw new Error('Choose a day or seven days');
  const endDate = new Date(Date.parse(`${start}T12:00:00Z`) + choice.days * 86400000).toISOString().slice(0, 10);
  const range = { start: aucklandInstant(start, '00:00')!, end: aucklandInstant(endDate, '00:00')! };
  return windowSchema.parse(range);
}
export function calendarReadInput(calendarId: string, range: Window) {
  const checked = validateConnectorInput('list_calendar_events', 'google_calendar', { calendarId, timeMin: range.start, timeMax: range.end, maxResults: 50 });
  if (!checked.ok) throw new Error('Calendar read scope invalid');
  return checked.data;
}
function eventRange(event: CalendarEvent): Window {
  return event.timing.kind === 'timed' ? event.timing.range : { start: aucklandInstant(event.timing.startDate, '00:00')!, end: aucklandInstant(event.timing.endDateExclusive, '00:00')! };
}
const overlaps = (a: Window, b: Window) => Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
const within = (instant: string | null | undefined, range: Window) => Boolean(instant && Date.parse(instant) >= Date.parse(range.start) && Date.parse(instant) < Date.parse(range.end));
export type AgendaAction = { cardId: string; kind: 'update' | 'cancel' | 'create'; calendarId: string; eventId: string | null; etag: string | null; start: string | null; end: null; status: 'proposed' | 'reviewed' | 'dismissed'; blockers: string[] };
export type SchoolAgenda = { ownerId: string; revision: string; checkedAt: string; range: Window; timezone: 'Pacific/Auckland'; cadence: 'daily' | 'weekly'; scheduled: false;
  entries: { card: SchoolCard; position: 'in_window' | 'moved_out' | 'needs_date'; clashes: string[]; action: AgendaAction }[];
  calendarEvents: AgendaCalendar['events']; notices: string[] };
/** Calendar/event linkage is an explicit adult decision; never title matching. */
export function prepareSchoolAgenda(brief: SchoolBriefing, rawCalendar: AgendaCalendar, choice: AgendaChoice, links: Record<string, string> = {}): SchoolAgenda {
  const calendar = agendaCalendarSchema.parse(rawCalendar), range = agendaWindow(choice);
  if (calendar.ownerId !== brief.ownerId) throw new Error('Agenda owner mismatch');
  calendarReadInput(calendar.calendarId, range);
  const observedAge = Date.parse(brief.checkedAt) - Date.parse(calendar.observedAt);
  const calendarReady = calendar.complete && observedAge >= 0 && observedAge <= 5 * 60000 && Date.parse(calendar.range.start) <= Date.parse(range.start) && Date.parse(calendar.range.end) >= Date.parse(range.end);
  const notices = calendarReady ? [] : ['Calendar evidence is incomplete, stale or outside this window; absence is not proof of free time.'];
  const entries = brief.cards.filter(c => within(c.after.instant, range) || c.priorEvidence.some(e => within(e.instant, range)) || !c.after.instant || c.change === 'conflict').map(card => {
    const linked = links[`${card.childId}:${card.after.key}`];
    const target = linked ? calendar.events.find(e => e.id === linked) : undefined;
    const clashes = calendar.events.filter(e => e.id !== linked && e.status !== 'cancelled' && within(card.after.instant, eventRange(e))).map(e => e.id);
    const blockers = [...card.blockers];
    if (card.status === 'dismissed') blockers.push('The school proposal was dismissed; its calendar draft is invalidated.');
    if (!calendarReady) blockers.push('Recheck the selected calendar before reviewing.');
    if (linked && !target) blockers.push('The explicitly selected calendar event is unavailable.');
    if (!linked && card.change !== 'new') blockers.push('Choose the exact existing calendar event; no title matching is assumed.');
    if (card.change === 'unchanged') blockers.push('No source change requires a calendar action.');
    if (clashes.length && card.change !== 'cancelled') blockers.push('Possible calendar clash at the start time. Resolve before review.');
    if (card.change !== 'cancelled') blockers.push('Confirm the end time or duration; it was not provided by the notice.');
    if (target?.status === 'cancelled' && card.change !== 'cancelled') blockers.push('The linked calendar event is cancelled. Confirm the intended action.');
    return { card, position: !card.after.instant ? 'needs_date' as const : within(card.after.instant, range) ? 'in_window' as const : 'moved_out' as const, clashes,
      action: { cardId: card.id, kind: card.change === 'cancelled' ? 'cancel' as const : target ? 'update' as const : 'create' as const, calendarId: calendar.calendarId, eventId: target?.id ?? null, etag: target?.etag ?? null, start: card.after.instant, end: null, status: card.status === 'dismissed' ? 'dismissed' as const : 'proposed' as const, blockers: [...new Set(blockers)] } };
  });
  return { ownerId: brief.ownerId, revision: brief.revision, checkedAt: brief.checkedAt, range, timezone: 'Pacific/Auckland', cadence: choice.days === 1 ? 'daily' : 'weekly', scheduled: false, entries, calendarEvents: calendar.events.filter(e => overlaps(eventRange(e), range)), notices };
}
/** Digest is the reviewed snapshot, not authority to execute a calendar write. */
export async function agendaDigest(agenda: SchoolAgenda) { return digest(agenda); }
export async function reviewAgendaAction(agenda: SchoolAgenda, command: { ownerId: string; revision: string; digest: string; cardId: string; decision: 'reviewed' | 'dismissed'; now: string }) {
  const age = Date.parse(command.now) - Date.parse(agenda.checkedAt);
  const entry = agenda.entries.find(e => e.card.id === command.cardId);
  if (command.ownerId !== agenda.ownerId || command.revision !== agenda.revision || command.digest !== await agendaDigest(agenda) || !Number.isFinite(age) || age < 0 || age > 15 * 60000 || !entry || entry.action.status !== 'proposed') throw new Error('Agenda review changed or expired');
  if (command.decision === 'reviewed' && (entry.card.status === 'dismissed' || entry.action.blockers.length)) throw new Error('Resolve agenda evidence first');
  return { ...agenda, entries: agenda.entries.map(e => e === entry ? { ...e, action: { ...e.action, status: command.decision } } : e) };
}
