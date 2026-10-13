import type { AgendaCalendar } from './agenda';
import { SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER } from './fixtures';
export function schoolCalendarFixture(ownerId = SCHOOL_DEMO_OWNER): AgendaCalendar {
  return { ownerId, connectionId: 'fictional-calendar-connection', connectionRevision: 1, calendarId: 'fictional-family-calendar', timezone: 'Pacific/Auckland', observedAt: SCHOOL_DEMO_NOW,
    range: { start: '2026-10-18T11:00:00Z', end: '2026-10-26T11:00:00Z' }, complete: true,
    events: [
      { id: 'fictional-exam', etag: 'fixture-exam-v1', title: 'Fictional exam already in calendar', sourceUrl: 'https://calendar.example/event/exam', timing: { kind: 'timed', range: { start: '2026-10-19T20:00:00Z', end: '2026-10-19T22:00:00Z' } }, status: 'confirmed' },
      { id: 'fictional-visit', etag: 'fixture-visit-v1', title: 'Fictional science visit already in calendar', sourceUrl: 'https://calendar.example/event/visit', timing: { kind: 'timed', range: { start: '2026-10-20T21:00:00Z', end: '2026-10-20T23:00:00Z' } }, status: 'confirmed' },
      { id: 'fictional-appointment', etag: 'fixture-appointment-v1', title: 'Fictional appointment', sourceUrl: 'https://calendar.example/event/appointment', timing: { kind: 'timed', range: { start: '2026-10-21T23:30:00Z', end: '2026-10-22T00:30:00Z' } }, status: 'confirmed' },
      { id: 'fictional-all-day', etag: 'fixture-day-v1', title: 'Fictional all-day reminder', sourceUrl: 'https://calendar.example/event/day', timing: { kind: 'all-day', startDate: '2026-10-23', endDateExclusive: '2026-10-24' }, status: 'confirmed' },
    ] };
}
export const schoolCalendarLinks = {
  'child-a:["harbour","mathematics exam","year 9"]': 'fictional-exam',
  'child-b:["hill","science visit","year 7"]': 'fictional-visit',
};
