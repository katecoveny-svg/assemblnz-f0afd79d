import { z } from 'zod';
import { safeTravelLink } from '@/apps/do/shared/travel';
import { fingerprint } from '@/lib/do/preparation/contracts';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Choose a valid date');
export const briefSchema = z.object({
  origin: z.string().trim().min(2).max(80), destination: z.string().trim().min(2).max(80),
  earliest: date, latest: date, nights: z.number().int().min(1).max(30),
  adults: z.number().int().min(1).max(9), children: z.number().int().min(0).max(6),
  budget: z.number().min(1).max(1000000), flightAllowance: z.number().min(0).max(1000000), reserve: z.number().min(0).max(1000000),
  preference: z.enum(['Unhurried', 'Coast', 'City', 'Outdoors']),
}).strict().refine(b => b.latest >= b.earliest, { message: 'Latest departure must follow earliest departure', path: ['latest'] })
  .refine(b => b.origin.toLowerCase() !== b.destination.toLowerCase(), { message: 'Choose a different destination', path: ['destination'] });
export type HolidayBrief = z.infer<typeof briefSchema>;
export function briefIsCurrent(b: HolidayBrief, now = Date.now()) {
  const d = new Date(now);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return briefSchema.safeParse(b).success && b.earliest >= today;
}
export const money = (n: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
export function addDays(day: string, days: number) { return new Date(Date.parse(day + 'T12:00:00Z') + days * 86400000).toISOString().slice(0, 10); }
export function initialBrief(): HolidayBrief {
  return { origin: '', destination: '', earliest: '', latest: '', nights: 5, adults: 2, children: 0, budget: 4000, flightAllowance: 1600, reserve: 600, preference: 'Unhurried' };
}
export function departureOptions(b: HolidayBrief) {
  const days = Math.round((Date.parse(b.latest) - Date.parse(b.earliest)) / 86400000);
  return [...new Set([b.earliest, addDays(b.earliest, Math.floor(days / 2)), b.latest])].map(depart => ({ depart, return: addDays(depart, b.nights) }));
}
export const destinations = [
  { name: 'Queenstown', kind: 'Outdoors', scene: 'mountain', detail: 'Build a trip around time outdoors.' },
  { name: 'Wellington', kind: 'City', scene: 'city', detail: 'Make space for a city break.' },
  { name: 'Rarotonga', kind: 'Coast', scene: 'coast', detail: 'Explore an island stay at your own pace.' },
] as const;
export type SearchHandoff = { provider: string; kind: 'flight' | 'stay'; url: string; query: string; shared: string[]; depart: string; return: string };
/** Public, user-opened searches only. No provider API, scraping or booking permission. */
export function searchHandoff(b: HolidayBrief, kind: 'flight' | 'stay', depart = b.earliest, end = addDays(depart, b.nights), now = Date.now()): SearchHandoff {
  if (!briefIsCurrent(b, now)) throw new Error('Choose a current departure window.');
  if (!departureOptions(b).some(d => d.depart === depart && d.return === end)) throw new Error('Choose dates from this brief.');
  const party = `${b.adults} adults${b.children ? ` and ${b.children} children` : ''}`;
  const query = kind === 'flight' ? `Round trip flights from ${b.origin} to ${b.destination}, departing ${depart}, returning ${end}, ${party}, economy, NZD` : `Accommodation in ${b.destination}, ${depart} to ${end}, ${party}, NZD`;
  // Human-readable Google travel query; provider may require re-entry. Never imply filters were applied.
  const url = new URL(kind === 'flight' ? 'https://www.google.com/travel/flights' : 'https://www.booking.com/searchresults.html');
  if (kind === 'flight') { url.searchParams.set('q', query); url.searchParams.set('curr', 'NZD'); }
  else {
    url.searchParams.set('ss', b.destination); url.searchParams.set('checkin', depart); url.searchParams.set('checkout', end);
    url.searchParams.set('group_adults', String(b.adults)); url.searchParams.set('group_children', String(b.children));
    url.searchParams.set('selected_currency', 'NZD');
    // No guessed child ages, room allocation, affiliate ID or availability claim.
  }
  return { provider: kind === 'flight' ? 'Google Flights' : 'Booking.com', kind, url: url.href, query, shared: [kind === 'flight' ? `${b.origin} → ${b.destination}` : b.destination, `${depart} → ${end}`, party, 'Requested currency: NZD'], depart, return: end };
}
export type FoundOption = { id: string; kind: 'flight' | 'stay'; title: string; url: string; total: number; observedAt: string; briefKey: string; depart: string; return: string; outcome: 'found' | 'empty' | 'failed' };
export function foundOption(input: Omit<FoundOption, 'id' | 'briefKey' | 'observedAt'>, b: HolidayBrief, now: string): FoundOption {
  briefSchema.parse(b);
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid observation time');
  if (!input.title.trim() || input.title.length > 120 || !safeTravelLink(input.url) || input.url.length > 1500) throw new Error('Add a short option name and a full https source link.');
  if (!Number.isFinite(input.total) || input.total < 0 || input.total > 1000000 || (input.outcome === 'found' && input.total <= 0)) throw new Error('Enter the total in NZD for everyone, or record no results.');
  if (!departureOptions(b).some(d => d.depart === input.depart && d.return === input.return)) throw new Error('Choose dates from the current brief.');
  return { ...input, title: input.title.trim(), url: safeTravelLink(input.url), id: crypto.randomUUID(), briefKey: fingerprint(b), observedAt: now };
}
export function observationStatus(o: FoundOption, b: HolidayBrief, now: number) {
  if (o.briefKey !== fingerprint(b)) return 'Brief changed';
  if (!Number.isFinite(Date.parse(o.observedAt)) || now < Date.parse(o.observedAt) || now - Date.parse(o.observedAt) >= 30 * 60000) return 'Recheck source';
  if (o.outcome === 'failed') return 'Search unavailable';
  if (o.outcome === 'empty') return 'No results recorded';
  return 'You recorded · not verified';
}
export function comparison(b: HolidayBrief, options: FoundOption[], ids: string[], now: number) {
  const selected = options.filter(o => ids.includes(o.id));
  const current = selected.filter(o => observationStatus(o, b, now) === 'You recorded · not verified');
  const sameDates = current.length === 2 && current[0].depart === current[1].depart && current[0].return === current[1].return;
  const complete = sameDates && current.some(o => o.kind === 'flight') && current.some(o => o.kind === 'stay');
  const subtotal = current.reduce((sum, o) => sum + o.total, 0);
  return { selected, complete, subtotal, remaining: b.budget - subtotal - b.reserve, stale: selected.length !== current.length, sameDates };
}
export function suggestions(b: HolidayBrief, options: FoundOption[], ids: string[], now: number) {
  const c = comparison(b, options, ids, now);
  const allowance = b.budget - b.flightAllowance - b.reserve;
  const result = [{ title: 'Give the stay a spending limit', detail: allowance > 0 ? `${money(allowance / b.nights)} per night for the whole party leaves your ${money(b.flightAllowance)} flight allowance and ${money(b.reserve)} for other costs. This is your budget split, not a room price.` : 'Your flight allowance and other costs use the whole budget. Adjust them before choosing a stay.' }];
  if (b.latest > b.earliest) result.push({ title: 'Compare the same trip on different dates', detail: `Your ${b.earliest}–${b.latest} departure window gives ${departureOptions(b).length} starting points below. Check the date grid on Google Flights; no cheaper fare has been found here.` });
  if (b.children > 0) result.push({ title: 'Check the whole party fits', detail: 'Confirm children’s ages, room occupancy and bedding on the provider site. DO does not collect names, ages or documents in this brief.' });
  if (c.complete) result.unshift({ title: c.remaining < 0 ? 'This pair exceeds your plan' : 'Keep room for the unquoted costs', detail: `${money(c.subtotal)} in recorded flight and stay totals, plus your ${money(b.reserve)} reserve, leaves ${money(c.remaining)}. Baggage, taxes, transfers and cancellation terms still need checking at source.` });
  if (c.stale) result.unshift({ title: 'Recheck before deciding', detail: 'A selected option is older than 30 minutes or belongs to an earlier brief. Open its source and record the current details again.' });
  if (selectedMixedDates(c.selected)) result.unshift({ title: 'Align your flight and stay dates', detail: 'Your selected options use different date pairs. Compare a matching flight and stay before treating them as one trip.' });
  return result;
}
function selectedMixedDates(selected: FoundOption[]) { return selected.length === 2 && (selected[0].depart !== selected[1].depart || selected[0].return !== selected[1].return); }
export function planText(b: HolidayBrief, options: FoundOption[], ids: string[], now: number) {
  if (!briefIsCurrent(b, now)) throw new Error('Choose a current departure window.');
  const c = comparison(b, options, ids, now);
  return [`DO Travel — reviewed planning brief`, `${b.origin} → ${b.destination}`, `Departure window: ${b.earliest} to ${b.latest}; ${b.nights} nights`, `${b.adults} adults; ${b.children} children; preference: ${b.preference}`, `Budget: ${money(b.budget)}; flight allowance: ${money(b.flightAllowance)}; other-cost reserve: ${money(b.reserve)}`, '', 'SHORTLIST — user-recorded, not provider-verified; all amounts in NZD', ...c.selected.map(o => `${o.kind}: ${o.title} | ${money(o.total)} total | ${o.depart} to ${o.return}\nSource: ${o.url}\nRecorded: ${o.observedAt} | ${observationStatus(o, b, now)}`), c.selected.length ? '' : 'No flight or stay selected. This is a research brief.', '', 'NEXT STEPS', ...suggestions(b, options, ids, now).map(s => `${s.title}: ${s.detail}`), '', 'Nothing booked or reserved. No payment, message or account action performed. Confirm exact dates, party, currency, availability and all terms directly with providers. No unattended monitoring or notifications.', `Exported: ${new Date(now).toISOString()}`].join('\n');
}
