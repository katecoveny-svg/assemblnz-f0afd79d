import { expect, it } from 'vitest';
import { prepareBookingSearch, travelProviderRoles } from './booking-preparation';
import { searchHandoff, type HolidayBrief } from './planner';
const plan = { tripRevision: 'r2', destination: 'Wellington', checkin: '2027-02-01', checkout: '2027-02-04', currency: 'NZD', rooms: [{ adults: 2, childAges: [7] }] };
it('retains exact room/age/revision criteria but never enables network or purchases', () => {
  expect(prepareBookingSearch(plan)).toMatchObject({ plan, state: 'partner_access_unverified', canSearch: false, canBook: false });
  expect(travelProviderRoles).toMatchObject({ flights: 'duffel', accommodation: 'booking.com' });
});
it('rejects guessed occupancy, invalid dates and extra sensitive/account fields', () => {
  for (const change of [{ rooms: [] }, { rooms: [{ adults: 2, children: 1 }] }, { checkout: plan.checkin }, { checkin: '2027-02-30' }, { apiKey: 'fictional' }, { membership: 'fictional' }]) {
    expect(prepareBookingSearch({ ...plan, ...change })).toEqual({ provider: 'booking.com', state: 'needs_trip_details', canSearch: false, canBook: false });
  }
});
it('hands accommodation to Booking.com without affiliate claims or invented child ages/rooms', () => {
  const brief: HolidayBrief = { origin: 'Auckland', destination: 'Paris & Lyon', earliest: '2027-02-01', latest: '2027-02-01', nights: 3, adults: 2, children: 1, budget: 5000, flightAllowance: 2000, reserve: 500, preference: 'City' };
  const handoff = searchHandoff(brief, 'stay', undefined, undefined, Date.parse('2026-10-15'));
  const url = new URL(handoff.url);
  expect(handoff.provider).toBe('Booking.com');
  expect(url.origin).toBe('https://www.booking.com');
  expect(Object.fromEntries(url.searchParams)).toEqual({ ss: 'Paris & Lyon', checkin: '2027-02-01', checkout: '2027-02-04', group_adults: '2', group_children: '1', selected_currency: 'NZD' });
  expect(handoff.shared).toContain('Requested currency: NZD');
});
