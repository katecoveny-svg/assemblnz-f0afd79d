import { expect, it } from 'vitest';
import { comparable, offerIssue, partyLabel, selectionReceipt, selectionIsCurrent, type ResultBatch } from './provider-selection';
import type { SearchOffer } from '@/lib/do/travel/provider-contract';
const now = Date.parse('2026-10-14T12:00:00Z');
const offer: SearchOffer = { id: 'off_test', kind: 'flight', title: 'Fixture', total: { amount: '240.00', currency: 'NZD' }, base: null, tax: null, expiresAt: '2026-10-14T12:01:00Z', observedAt: '2026-10-14T12:00:00Z', createdAt: null, sourceRequestId: 'orq_test', paymentRequirements: { requiresInstantPayment: null, paymentRequiredBy: null, priceGuaranteeExpiresAt: null }, liveMode: false, depart: '2027-02-03', return: '2027-02-07', dueAtAccommodation: null, conditions: null, flightEvidence: { requestedPassengers: [{ type: 'adult' }, { age: 8 }], returnedPassengers: [{ id: 'p1', type: 'adult', age: null }, { id: 'p2', type: 'child', age: 8 }], passengerStatus: 'matched', requestedCabin: 'economy', cabinStatus: 'matched' }, occupancy: null, rates: [], rateCoverage: 'search_summary_only', segments: [] };
const batch: ResultBatch = { briefKey: 'original', input: { action: 'flights', from: 'AKL', to: 'WLG', depart: offer.depart, return_date: offer.return, passengers: [{ type: 'adult' }, { age: 8 }], cabin_class: 'economy' }, result: { contract: 'do.travel.search.v2', provider: 'duffel', state: 'results', action: 'flights', observedAt: offer.observedAt, offers: [offer], suggestions: [], message: '', totalReturned: 1, truncated: false, ordering: 'provider_order_unranked' } };
it('compares only current same-currency and same-mode evidence', () => {
 const second = { ...offer, id: 'second' };
 expect(comparable({ ...batch, result: { ...batch.result, offers: [offer, second] } }, [offer, second], 'original', now)).toBe(true);
 for (const other of [{ ...offer, liveMode: true }, { ...offer, total: { amount: '200.00', currency: 'USD' } }, { ...offer, depart: '2027-02-04' }]) expect(comparable(batch, [offer, other], 'original', now)).toBe(false);
});
it('invalidates on expiry, brief edit, unknown mode or unavailable results', () => {
 expect(offerIssue(batch, offer, 'edited', now)).toContain('Trip changed');
 expect(offerIssue(batch, offer, 'original', now + 60000)).toContain('Expired');
 expect(offerIssue(batch, { ...offer, liveMode: null }, 'original', now)).toContain('mode unverified');
 for (const state of ['empty','stale','auth_required','unavailable','error'] as const) expect(offerIssue({ ...batch, result: { ...batch.result, state } }, offer, 'original', now)).toBeTruthy();
});
it('receipt records provenance and search stage and rejects stale action-time confirmation', () => {
 expect(selectionReceipt(batch, offer, 'original', now)).toMatchObject({ sourceRequestId: 'orq_test', stage: 'search_selection', offer: { liveMode: false } });
 expect(() => selectionReceipt(batch, offer, 'original', now + 60000)).toThrow();
 expect(partyLabel(batch.input)).toBe('1 adult · 1 child');
});
it('does not promote unknown stay occupancy into a selectable whole-party total', () => {
 const stay: SearchOffer = { ...offer, kind: 'stay', occupancy: { requested: [{ type: 'adult' }], returned: null, status: 'unknown' } };
 const stayBatch: ResultBatch = { ...batch, input: { action: 'hotels', accommodation_id: 'acc_test', checkin: offer.depart, checkout: offer.return, rooms: 1, guests: [{ type: 'adult' }] } };
 expect(offerIssue(stayBatch, stay, 'original', now)).toBe('Returned occupancy unknown');
});
it('blocks comparison and confirmation when returned party/cabin is incomplete or differs', () => {
 for (const passengerStatus of ['unknown', 'mismatch'] as const) {
  const unsafe = { ...offer, flightEvidence: { ...offer.flightEvidence!, passengerStatus } };
  expect(comparable(batch, [unsafe], 'original', now)).toBe(false);
  expect(() => selectionReceipt(batch, unsafe, 'original', now)).toThrow();
 }
 for (const cabinStatus of ['unknown', 'mismatch'] as const) {
  const unsafe = { ...offer, flightEvidence: { ...offer.flightEvidence!, cabinStatus } };
  expect(comparable(batch, [unsafe], 'original', now)).toBe(false);
  expect(() => selectionReceipt(batch, unsafe, 'original', now)).toThrow();
 }
});

it('rejects changed prices, foreign and ambiguous offer identities before selection', () => {
 const changed = { ...offer, total: { amount: '999.00', currency: 'NZD' } };
 expect(() => selectionReceipt(batch, changed, 'original', now)).toThrow();
 expect(() => selectionReceipt(batch, { ...offer, id: 'not_returned' }, 'original', now)).toThrow();
 expect(() => selectionReceipt({ ...batch, result: { ...batch.result, offers: [offer, changed] } }, offer, 'original', now)).toThrow();
});
it('retains a detached search receipt when source prices or party inputs change', () => {
 const current = structuredClone(batch);
 const receipt = selectionReceipt(current, current.result.offers[0], 'original', now);
 current.result.offers[0].total!.amount = '999.00';
 if (current.input.action === 'flights') current.input.passengers.push({ type: 'adult' });
 expect(receipt.offer.total!.amount).toBe('240.00');
 expect(receipt.input.action === 'flights' && receipt.input.passengers.length).toBe(2);
 expect(receipt.stage).toBe('search_selection');
});

it('recognises detached review evidence and invalidates changed price, input, request or expiry', () => {
 const receipt = selectionReceipt(batch, offer, 'original', now);
 expect(receipt.offer).not.toBe(offer);
 expect(selectionIsCurrent(batch, offer, receipt, 'original', now)).toBe(true);
 expect(selectionIsCurrent(batch, offer, receipt, 'original', now + 60000)).toBe(false);
 expect(selectionIsCurrent(batch, offer, receipt, 'edited', now)).toBe(false);
 expect(selectionIsCurrent({ ...batch, result: { ...batch.result, requestId: 'new-request' } }, offer, receipt, 'original', now)).toBe(false);
 const changed = structuredClone(batch); changed.result.offers[0].total!.amount = '999.00';
 expect(selectionIsCurrent(changed, changed.result.offers[0], receipt, 'original', now)).toBe(false);
 const changedInput = structuredClone(batch);
 if (changedInput.input.action === 'flights') changedInput.input.passengers.push({ type: 'adult' });
 expect(selectionIsCurrent(changedInput, offer, receipt, 'original', now)).toBe(false);
});
