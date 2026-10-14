// Provider-free wake-up executor for a watched bill. When a responsibility asks DO to
// watch a service, each wake-up compares what the person pays against the dated public
// price book and writes a note with cheaper offers, their sources and verification dates.
// No model, no inbox, no action. The price book is refreshed separately; this reads it.
import { compareOffers, offerIsStale, OFFER_FRESH_DAYS, type OfferBook, type PublicOffer } from '@/apps/do/finance/offers';
import { COMPARABLE_CATEGORIES, SERVICE_LABEL, type HouseholdService, type ServiceCategory } from '@/apps/do/finance/services';
import { moneyText } from '@/apps/do/finance/model';

export type WatchRequest = { category: ServiceCategory; provider: string; monthlyCents: number; lastPaidOn: string | null };
const CATEGORY_WORDS = Object.entries(SERVICE_LABEL).map(([key, label]) => [key as ServiceCategory, label.toLocaleLowerCase('en-NZ')] as const);
/**
 * Reads the request "Ask DO to watch this" wrote: "Watch my electricity with Contact Energy.
 * I pay about NZD 224.50 a month, last paid 2026-09-05." Anything else is not a watch.
 */
export function readWatchRequest(text: string): WatchRequest | null {
  const match = text.match(/watch my ([a-z ]+?) with (.+?)\. i pay about (?:nzd|nz\$)\s?([\d,]+(?:\.\d{2})?) a month(?:, last paid (\d{4}-\d{2}-\d{2}))?/i);
  if (!match) return null;
  const category = CATEGORY_WORDS.find(([, label]) => label === match[1].trim().toLocaleLowerCase('en-NZ'))?.[0];
  if (!category || !COMPARABLE_CATEGORIES.includes(category)) return null;
  const amount = Number(match[3].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) return null;
  return { category, provider: match[2].trim().slice(0, 120), monthlyCents: Math.round(amount * 100), lastPaidOn: match[4] ?? null };
}

export type WatchBook = Pick<OfferBook, 'live' | 'offers' | 'lastVerified'>;
const dateLabel = (iso: string) => new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Pacific/Auckland' }).format(new Date(iso));
export function prepareBillsWatch(request: WatchRequest, book: WatchBook, now = new Date(), thresholdCents = 500): string {
  const service: HouseholdService = {
    id: 'watch', category: request.category, provider: request.provider, merchant: request.provider, confidence: 'named-provider', cadence: 'monthly',
    latest: { amount: request.monthlyCents, currency: 'NZD' }, monthlyEquivalent: { amount: request.monthlyCents, currency: 'NZD' }, lastPaidOn: request.lastPaidOn ?? now.toISOString().slice(0, 10),
    increase: null, payment: { id: 'watch', merchant: request.provider, accountId: 'watch', amount: { amount: request.monthlyCents, currency: 'NZD' }, cadence: 'monthly', lastPaidOn: request.lastPaidOn ?? now.toISOString().slice(0, 10), expectedOn: null, observations: [], increase: null },
  };
  const label = SERVICE_LABEL[request.category].toLocaleLowerCase('en-NZ');
  const head = `Watching your ${label} with ${request.provider} · ${dateLabel(now.toISOString())} · compared against assembl's public price book · no model called`;
  const paying = `You pay about ${moneyText(service.monthlyEquivalent!)} a month${request.lastPaidOn ? `, last paid ${request.lastPaidOn}` : ''}.`;
  if (!book.live || book.offers.length === 0) return [head, '', paying, '', `No current public ${label} offers are held in the price book today, so nothing was compared. Use "Research with sources" on /do/bills for a live search.`, '', 'Nothing was switched, cancelled or sent.'].join('\n');
  const rows = compareOffers(service, { category: request.category, live: book.live, offers: book.offers, lastVerified: book.lastVerified }, thresholdCents, now);
  const checked = `Checked ${book.offers.length} advertised ${book.offers.length === 1 ? 'offer' : 'offers'}${book.lastVerified ? `, last verified ${dateLabel(book.lastVerified)}` : ''}. Minimum difference worth noting: ${moneyText({ amount: thresholdCents, currency: 'NZD' })} a month.`;
  const line = (row: { offer: PublicOffer; possibleYearlySaving: number; stale: boolean }) =>
    `- ${row.offer.provider} · ${row.offer.planName} · ${moneyText({ amount: Math.round((row.offer.monthlyCost ?? 0) * 100), currency: 'NZD' })} a month · possible saving up to ${moneyText({ amount: row.possibleYearlySaving, currency: 'NZD' })} a year before fees · source ${row.offer.sourceHost}, verified ${dateLabel(row.offer.lastVerified)}${row.stale || offerIsStale(row.offer, now) ? ` (older than ${OFFER_FRESH_DAYS} days, check before acting)` : ''}${row.offer.eligibilityNotes ? ` · ${row.offer.eligibilityNotes}` : ''}`;
  const body = rows.length
    ? [`${rows.length} cheaper advertised ${rows.length === 1 ? 'offer' : 'offers'}:`, ...rows.slice(0, 5).map(line), ...(rows.length > 5 ? [`- ${rows.length - 5} more not shown.`] : [])]
    : ['No advertised offer is cheaper by that much. Your current plan holds for now.'];
  const next = rows.length
    ? `Suggested next step: open /do/bills, read the top offer's source, and if it still looks right, prepare an enquiry. ${request.category === 'electricity' ? 'Electricity needs a supply-address quote before any figure holds.' : 'Check joining and exit fees before deciding.'}`
    : 'Suggested next step: nothing to do. DO will look again next time.';
  return [head, '', paying, checked, '', ...body, '', next, '', 'Advertised prices are not quotes and a possible saving is not a promise. Nothing was switched, cancelled or sent.'].join('\n');
}
