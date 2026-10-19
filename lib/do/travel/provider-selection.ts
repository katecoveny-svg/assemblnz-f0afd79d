import type { SearchInput, SearchOffer, SearchResult } from '@/lib/do/travel/provider-contract';
export type InventoryInput = Extract<SearchInput, { action: 'flights' | 'hotels' }>;
export type ResultBatch = { result: SearchResult; input: InventoryInput; briefKey: string };
export function offerIssue(batch: ResultBatch, offer: SearchOffer, briefKey: string, now: number): string | null {
  if (batch.briefKey !== briefKey) return 'Trip changed — search again';
  if (batch.result.state !== 'results') return 'No usable search result';
  if (!Number.isFinite(Date.parse(offer.expiresAt)) || Date.parse(offer.expiresAt) <= now) return 'Expired — search again';
  if (!Number.isFinite(Date.parse(offer.observedAt)) || Date.parse(offer.observedAt) > now) return 'Invalid observation time';
  if (offer.kind === 'flight' && (offer.flightEvidence?.passengerStatus !== 'matched' || offer.flightEvidence?.cabinStatus !== 'matched')) return 'Returned passenger or cabin evidence unknown or mismatched';
  if (offer.kind === 'stay' && offer.occupancy?.status !== 'matched') return 'Returned occupancy unknown';
  if (offer.liveMode === null) return 'Provider mode unverified';
  if (!offer.total) return 'Total unavailable';
  const input = batch.input;
  if (offer.kind !== (input.action === 'flights' ? 'flight' : 'stay') || offer.depart !== (input.action === 'flights' ? input.depart : input.checkin) || offer.return !== (input.action === 'flights' ? input.return_date : input.checkout)) return 'Search criteria differ';
  const matches = batch.result.offers.filter(candidate => candidate.id === offer.id);
  if (matches.length !== 1 || JSON.stringify(matches[0]) !== JSON.stringify(offer)) return 'Offer changed or is not in this result — review again';
  return null;
}
export function comparisonKey(batch: ResultBatch, offer: SearchOffer) {
  // Entire explicit search criteria includes route, child ages, cabin, rooms, location/property and dates.
  return JSON.stringify([batch.input, offer.total?.currency, offer.liveMode]);
}
export function comparable(batch: ResultBatch, offers: SearchOffer[], briefKey: string, now: number) {
  return offers.length > 0 && offers.every(o => !offerIssue(batch, o, briefKey, now) && comparisonKey(batch, o) === comparisonKey(batch, offers[0]));
}
export function formatEvidenceMoney(value: SearchOffer['total']) { return value ? `${value.currency} ${value.amount}` : 'Not supplied'; }
export function partyLabel(input: InventoryInput) {
  const party = input.action === 'flights' ? input.passengers : input.guests;
  const adults = party.filter(p => 'type' in p && p.type === 'adult').length;
  return `${adults} adult${adults === 1 ? '' : 's'}${party.length > adults ? ` · ${party.length - adults} ${party.length - adults === 1 ? 'child' : 'children'}` : ''}${input.action === 'hotels' ? ` · ${input.rooms} room${input.rooms === 1 ? '' : 's'}` : ''}`;
}
export function selectionReceipt(batch: ResultBatch, offer: SearchOffer, briefKey: string, now: number) {
  if (offerIssue(batch, offer, briefKey, now)) throw new Error('Selection is no longer current');
  return { provider: batch.result.provider, requestId: batch.result.requestId ?? null, sourceRequestId: offer.sourceRequestId, offer: structuredClone(offer), input: structuredClone(batch.input), briefKey, reviewedAt: new Date(now).toISOString(), stage: 'search_selection' as const };
}

/** A detached receipt remains current only while all reviewed evidence still matches. */
export function selectionIsCurrent(batch: ResultBatch, offer: SearchOffer | undefined, receipt: ReturnType<typeof selectionReceipt> | null, briefKey: string, now: number): boolean {
  return Boolean(receipt && offer && !offerIssue(batch, offer, briefKey, now) &&
    receipt.briefKey === briefKey && receipt.provider === batch.result.provider &&
    receipt.requestId === (batch.result.requestId ?? null) && receipt.sourceRequestId === offer.sourceRequestId &&
    JSON.stringify(receipt.input) === JSON.stringify(batch.input) && JSON.stringify(receipt.offer) === JSON.stringify(offer));
}
