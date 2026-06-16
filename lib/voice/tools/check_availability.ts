/**
 * check_availability — generate bookable slots for a date + party size.
 *
 * `computeSlots` is pure (business-hours + party rules + busy intervals) so the
 * unit tests can assert slot generation offline. `checkAvailability` wires it
 * to Google Calendar free/busy. ElevenLabs calls the HTTP wrapper at
 * app/api/voice/check-availability.
 */
import {
  BUSINESS_HOURS,
  SLOT_MINUTES,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
  LAST_SEATING_BEFORE_CLOSE,
  TIMEZONE,
} from '@/lib/voice/config';
import type { AvailabilityQuery, AvailabilityResult, Slot } from '@/lib/voice/types';
import {
  isoWeekday,
  nzDateTime,
  addMinutes,
  humanTime,
  overlaps,
} from '@/lib/voice/tools/time';
import {
  getAccessToken,
  freeBusy,
  parseServiceAccount,
  type BusyInterval,
} from '@/lib/voice/clients/google-calendar';

/** Pure slot computation. `busy` defaults to none (fully open). */
export function computeSlots(
  query: AvailabilityQuery,
  busy: BusyInterval[] = [],
): AvailabilityResult {
  const { date, party_size } = query;

  if (party_size < MIN_PARTY_SIZE) {
    return { date, party_size, slots: [], reason: 'party_too_small' };
  }
  if (party_size > MAX_PARTY_SIZE) {
    return { date, party_size, slots: [], reason: 'party_too_large_transfer' };
  }

  const hours = BUSINESS_HOURS[isoWeekday(date)];
  if (!hours) {
    return { date, party_size, slots: [], reason: 'closed_that_day' };
  }

  const lastSeating = addMinutes(hours.close, -LAST_SEATING_BEFORE_CLOSE);
  const slots: Slot[] = [];

  for (let t = hours.open; t <= lastSeating; t = addMinutes(t, SLOT_MINUTES)) {
    const start = nzDateTime(date, t);
    const end = nzDateTime(date, addMinutes(t, SLOT_MINUTES));
    const clash = busy.some((b) => overlaps(start, end, b.start, b.end));
    if (!clash) {
      slots.push({ start, end, label: humanTime(t) });
    }
  }

  return {
    date,
    party_size,
    slots,
    reason: slots.length === 0 ? 'fully_booked' : undefined,
  };
}

/** Live availability against Google Calendar. */
export async function checkAvailability(
  query: AvailabilityQuery,
  opts?: { calendarId?: string; serviceAccountB64?: string },
): Promise<AvailabilityResult> {
  const calendarId = opts?.calendarId ?? process.env.GOOGLE_CALENDAR_ID;
  const saB64 = opts?.serviceAccountB64 ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!calendarId || !saB64) {
    throw new Error('GOOGLE_CALENDAR_ID and GOOGLE_SERVICE_ACCOUNT_JSON must be set');
  }

  // Early-out on closed days / party limits before any network call.
  const dry = computeSlots(query, []);
  if (dry.slots.length === 0 && dry.reason !== 'fully_booked') return dry;

  const token = await getAccessToken(parseServiceAccount(saB64));
  const timeMin = nzDateTime(query.date, '00:00');
  const timeMax = nzDateTime(query.date, '23:59');
  const busy = await freeBusy(token, calendarId, timeMin, timeMax);

  // Tag which timezone the slots are expressed in, for the caller's clarity.
  void TIMEZONE;
  return computeSlots(query, busy);
}
