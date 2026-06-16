import { describe, it, expect } from 'vitest';
import { findDuplicate, eventDescription, eventSummary } from '@/lib/voice/tools/book_reservation';
import { nzDateTime } from '@/lib/voice/tools/time';
import type { BookingRequest } from '@/lib/voice/types';
import type { CalendarEvent } from '@/lib/voice/clients/google-calendar';

const req: BookingRequest = {
  name: 'Mere',
  mobile: '+64 21 234 999',
  date: '2026-06-20',
  time: '19:00',
  party_size: 4,
};

function existingEvent(): CalendarEvent {
  // Mirror what book_reservation writes (mobile embedded in the description).
  const ev = {
    id: 'evt_existing',
    summary: eventSummary(req),
    description: eventDescription(req),
    start: { dateTime: nzDateTime(req.date, req.time) },
    end: { dateTime: nzDateTime(req.date, '19:30') },
  };
  return ev as CalendarEvent;
}

describe('book_reservation duplicate detection', () => {
  it('matches an existing booking by same caller + same slot', () => {
    const events = [existingEvent()];
    expect(findDuplicate(events, req)).toBe('evt_existing');
  });

  it('does NOT match a different time', () => {
    const events = [existingEvent()];
    expect(findDuplicate(events, { ...req, time: '20:00' })).toBeNull();
  });

  it('does NOT match a different caller at the same time', () => {
    const events = [existingEvent()];
    expect(findDuplicate(events, { ...req, mobile: '+64 27 000 1111' })).toBeNull();
  });

  it('embeds the mobile in the description, not the public summary', () => {
    expect(eventSummary(req)).not.toContain('234999');
    expect(eventDescription(req)).toContain('mobile:6421234999');
  });
});
