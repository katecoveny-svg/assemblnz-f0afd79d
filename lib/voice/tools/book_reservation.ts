/**
 * book_reservation — create a Google Calendar event for a reservation, with
 * idempotent duplicate detection so a caller who repeats themselves (or a
 * retried tool call) never double-books.
 *
 * `findDuplicate` is pure (matches an existing event by start instant + the
 * caller's mobile embedded in the event description). `bookReservation` wires
 * it to the Calendar API. The mobile is embedded in the description, never the
 * summary, so it isn't shown on a shared calendar title.
 */
import type { BookingRequest, BookingResult } from '@/lib/voice/types';
import { SLOT_MINUTES, CUSTOMER_ID } from '@/lib/voice/config';
import { nzDateTime, addMinutes } from '@/lib/voice/tools/time';
import {
  getAccessToken,
  listEvents,
  createEvent,
  parseServiceAccount,
  type CalendarEvent,
} from '@/lib/voice/clients/google-calendar';

const MOBILE_TAG = 'mobile:';

function normaliseMobile(m: string): string {
  return m.replace(/\D/g, '');
}

export function eventSummary(req: BookingRequest): string {
  return `Reservation — ${req.name} (${req.party_size})`;
}

export function eventDescription(req: BookingRequest): string {
  const parts = [
    `${MOBILE_TAG}${normaliseMobile(req.mobile)}`,
    `party:${req.party_size}`,
    `customer:${CUSTOMER_ID}`,
  ];
  if (req.notes) parts.push(`notes:${req.notes}`);
  return parts.join(' | ');
}

/**
 * Find an existing event that matches this booking (same start instant + same
 * caller mobile). Returns the event id or null.
 */
export function findDuplicate(events: CalendarEvent[], req: BookingRequest): string | null {
  const wantStart = new Date(nzDateTime(req.date, req.time)).getTime();
  const wantMobile = normaliseMobile(req.mobile);
  for (const ev of events) {
    const evStart = new Date(ev.start.dateTime).getTime();
    const description = (ev as { description?: string }).description ?? '';
    const haystack = `${ev.summary} ${description}`;
    const mobileMatch =
      description.includes(`${MOBILE_TAG}${wantMobile}`) || haystack.includes(wantMobile);
    if (evStart === wantStart && mobileMatch) {
      return ev.id;
    }
  }
  return null;
}

export async function bookReservation(
  req: BookingRequest,
  opts?: { calendarId?: string; serviceAccountB64?: string },
): Promise<BookingResult> {
  const calendarId = opts?.calendarId ?? process.env.GOOGLE_CALENDAR_ID;
  const saB64 = opts?.serviceAccountB64 ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!calendarId || !saB64) {
    throw new Error('GOOGLE_CALENDAR_ID and GOOGLE_SERVICE_ACCOUNT_JSON must be set');
  }

  const start = nzDateTime(req.date, req.time);
  const end = nzDateTime(req.date, addMinutes(req.time, SLOT_MINUTES));

  const token = await getAccessToken(parseServiceAccount(saB64));

  // Look at events in a tight window around the requested slot for duplicates.
  const existing = await listEvents(token, calendarId, start, end);
  const dupe = findDuplicate(existing, req);
  if (dupe) {
    return { booking_id: dupe, duplicate: true, start, end };
  }

  const created = await createEvent(token, calendarId, {
    summary: eventSummary(req),
    description: eventDescription(req),
    start,
    end,
  });
  return { booking_id: created.id, duplicate: false, start, end };
}
