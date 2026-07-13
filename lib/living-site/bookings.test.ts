import { describe, expect, it } from 'vitest';
import { canTransitionBooking, isLivingSiteBookingStatus, localBookingStorageKey } from './bookings';

describe('Living Site booking workflow', () => {
  it('allows only owner-safe booking transitions', () => {
    expect(canTransitionBooking('requested', 'confirmed')).toBe(true);
    expect(canTransitionBooking('requested', 'completed')).toBe(false);
    expect(canTransitionBooking('confirmed', 'completed')).toBe(true);
    expect(canTransitionBooking('cancelled', 'confirmed')).toBe(false);
  });

  it('recognises the supported statuses', () => {
    expect(isLivingSiteBookingStatus('declined')).toBe(true);
    expect(isLivingSiteBookingStatus('approved')).toBe(false);
  });

  it('scopes browser-only drafts by tenant', () => {
    expect(localBookingStorageKey('sample-customs')).toBe('assembl:living-site-bookings:sample-customs');
  });
});
