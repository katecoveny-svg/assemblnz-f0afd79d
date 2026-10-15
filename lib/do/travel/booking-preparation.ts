import { z } from 'zod';

/** Internal planning boundary, NOT Booking.com's wire schema or a working API adapter. */
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
export const accommodationPlanSchema = z.object({
  tripRevision: z.string().min(1).max(100),
  destination: z.string().trim().min(2).max(120),
  checkin: day, checkout: day,
  currency: z.string().regex(/^[A-Z]{3}$/),
  rooms: z.array(z.object({ adults: z.number().int().min(1).max(9), childAges: z.array(z.number().int().min(0).max(17)).max(6) }).strict()).min(1).max(8),
}).strict().refine(v => v.checkout > v.checkin, 'Checkout must follow check-in');

/** Preparation-only result; account metadata cannot accidentally enable transport. */
export function prepareBookingSearch(raw: unknown) {
  const parsed = accommodationPlanSchema.safeParse(raw);
  if (!parsed.success) return { provider: 'booking.com', state: 'needs_trip_details', canSearch: false, canBook: false } as const;
  return {
    provider: 'booking.com', state: 'partner_access_unverified', canSearch: false, canBook: false,
    plan: parsed.data,
    next: 'Confirm Managed Affiliate / Demand API access, then validate the versioned sandbox adapter.',
  } as const;
}

export const travelProviderRoles = {
  flights: 'duffel', accommodation: 'booking.com', places: 'google-places', routes: 'google-routes', activities: 'viator',
} as const;
