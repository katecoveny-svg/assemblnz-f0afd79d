/** UI-only transport DTOs. Keep structurally identical to the adapter via provider-contract-parity.test.ts.
 * No import from supabase/functions: UI releases must not trigger Edge deployment. */
export const TRAVEL_CONTRACT = 'do.travel.search.v2';
export type Person = { type: 'adult' } | { age: number };
export type Guest = { type: 'adult' } | { type: 'child'; age: number };
export type SearchInput =
  | { action: 'flights'; from: string; to: string; depart: string; return_date: string; passengers: Person[]; cabin_class: 'economy' | 'premium_economy' | 'business' | 'first' }
  | { action: 'hotels'; accommodation_id?: string; location?: { latitude: number; longitude: number; radius: number }; checkin: string; checkout: string; rooms: number; guests: Guest[] }
  | { action: 'suggestions'; query: string } | { action: 'places'; query: string };
export type SearchState = 'results' | 'empty' | 'stale' | 'auth_required' | 'unavailable' | 'error';
export type MoneyEvidence = { amount: string; currency: string } | null;
export type Terms = { allowed: boolean | null; penalty: MoneyEvidence };
export type RateEvidence = { roomIndex: number; roomId: string | null; roomName: string | null; id: string; total: MoneyEvidence; tax: MoneyEvidence; base: MoneyEvidence; dueAtAccommodation: MoneyEvidence; paymentType: string | null; cancellation: { before: string | null; refund: MoneyEvidence }[] | null; fee: MoneyEvidence; expiresAt: string | null; description: string | null; conditions: { title: string | null; description: string | null }[] };
export type SearchOffer = {
  id: string; kind: 'flight' | 'stay'; title: string; total: MoneyEvidence; base: MoneyEvidence; tax: MoneyEvidence;
  expiresAt: string; observedAt: string; createdAt: string | null; sourceRequestId: string | null; paymentRequirements: { requiresInstantPayment: boolean | null; paymentRequiredBy: string | null; priceGuaranteeExpiresAt: string | null }; liveMode: boolean | null;
  depart: string; return: string; dueAtAccommodation: MoneyEvidence;
  conditions: { refundBeforeDeparture: Terms | null; changeBeforeDeparture: Terms | null } | null;
  flightEvidence: { requestedPassengers: Person[]; returnedPassengers: { id: string | null; type: string | null; age: number | null }[] | null; passengerStatus: 'matched' | 'unknown' | 'mismatch'; requestedCabin: string; cabinStatus: 'matched' | 'unknown' | 'mismatch' } | null;
  occupancy: { requested: Guest[]; returned: Guest[] | null; status: 'matched' | 'unknown' } | null;
  rates: RateEvidence[]; rateCoverage: 'search_summary_only';
  segments: { cabins: { passengerId: string | null; cabinClass: string | null }[]; from: string; to: string; departure: string; arrival: string; marketingCarrier: string | null; marketingFlight: string | null; operatingCarrier: string | null; operatingFlight: string | null; originTimezone: string | null; destinationTimezone: string | null; baggage: { passengerId: string | null; passengerIndex: number | null; type: string | null; quantity: number | null }[] }[];
};
export type Suggestion = { id: string; name: string; region: string | null; country: string | null; iata?: string | null; timezone?: string | null; type?: string | null };
export type SearchResult = { contract: typeof TRAVEL_CONTRACT; provider: 'duffel'; state: SearchState; action: SearchInput['action']; observedAt: string; offers: SearchOffer[]; suggestions: Suggestion[]; message: string; totalReturned: number; truncated: boolean; ordering: 'provider_order_unranked'; requestId?: string };
