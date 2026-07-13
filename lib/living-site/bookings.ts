export type LivingSiteBookingStatus = 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled';

export type LivingSiteBooking = {
  id: string;
  tenant: string;
  serviceId: string;
  serviceLabel: string;
  name: string;
  email: string;
  phone: string | null;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: LivingSiteBookingStatus;
  source: string;
  createdAt: string;
};

const ALLOWED_TRANSITIONS: Record<LivingSiteBookingStatus, LivingSiteBookingStatus[]> = {
  requested: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  declined: [],
  completed: [],
  cancelled: [],
};

export function canTransitionBooking(
  from: LivingSiteBookingStatus,
  to: LivingSiteBookingStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isLivingSiteBookingStatus(value: unknown): value is LivingSiteBookingStatus {
  return typeof value === 'string' && value in ALLOWED_TRANSITIONS;
}

export function localBookingStorageKey(tenant: string): string {
  return `assembl:living-site-bookings:${tenant}`;
}

export function isLocalBooking(booking: LivingSiteBooking): boolean {
  return booking.id.startsWith('local-') || booking.source === 'browser-only';
}
