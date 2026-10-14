import { z } from 'zod';
import { COMPARABLE_CATEGORIES, RESEARCHABLE_CATEGORIES, SERVICE_LABEL, type HouseholdService, type ServiceCategory } from './services';
import { moneyText } from './model';

/**
 * Deal hunting against assembl's dated public price book. Every offer carries its source and
 * the date it was last verified. An advertised price is not a quote, and a possible saving is
 * never a promised household saving. Nothing here switches, cancels or signs anything.
 */
export const publicOffer = z.object({
  id: z.string().min(1).max(120),
  category: z.enum(COMPARABLE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
  provider: z.string().min(1).max(120),
  planName: z.string().min(1).max(200),
  monthlyCost: z.number().min(0).max(100000).nullable(),
  features: z.array(z.string().max(200)).max(12),
  eligibilityNotes: z.string().max(600).nullable(),
  sourceUrl: z.string().url().refine(value => value.startsWith('https://')),
  sourceHost: z.string().min(1).max(120),
  lastVerified: z.string().datetime({ offset: true }),
  trustTier: z.enum(['A', 'B', 'C']),
});
export type PublicOffer = z.infer<typeof publicOffer>;
export const offerBook = z.object({
  category: z.enum(COMPARABLE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
  live: z.boolean(),
  offers: z.array(publicOffer).max(200),
  lastVerified: z.string().datetime({ offset: true }).nullable(),
});
export type OfferBook = z.infer<typeof offerBook>;

/** An offer older than this is shown as needing a fresh check before anyone acts on it. */
export const OFFER_FRESH_DAYS = 45;
export function offerIsStale(offer: Pick<PublicOffer, 'lastVerified'>, now = new Date()) {
  return now.getTime() - Date.parse(offer.lastVerified) > OFFER_FRESH_DAYS * 86_400_000;
}
const sameProvider = (a: string, b: string) => a.normalize('NFKC').toLocaleLowerCase('en-NZ').replace(/[^a-z0-9]/g, '') === b.normalize('NFKC').toLocaleLowerCase('en-NZ').replace(/[^a-z0-9]/g, '');

export type OfferComparison = {
  offer: PublicOffer;
  /** Cents per month below what the household appears to pay. */
  monthlyDifference: number;
  possibleYearlySaving: number;
  stale: boolean;
};
/**
 * Cheaper advertised offers for a service, by possible yearly saving. Only services with a
 * known monthly equivalent in NZD can be compared; the household's own provider is excluded
 * because the same plan name may already be theirs. `thresholdCents` is the person's own
 * minimum monthly difference worth their time.
 */
export function compareOffers(service: HouseholdService, book: OfferBook, thresholdCents = 500, now = new Date()): OfferComparison[] {
  if (!service.monthlyEquivalent || service.monthlyEquivalent.currency !== 'NZD' || book.category !== service.category) return [];
  const paying = service.monthlyEquivalent.amount;
  return book.offers.flatMap<OfferComparison>(offer => {
    if (offer.monthlyCost === null || sameProvider(offer.provider, service.provider)) return [];
    const monthlyDifference = paying - Math.round(offer.monthlyCost * 100);
    if (monthlyDifference < thresholdCents) return [];
    return [{ offer, monthlyDifference, possibleYearlySaving: monthlyDifference * 12, stale: offerIsStale(offer, now) }];
  }).sort((a, b) => b.possibleYearlySaving - a.possibleYearlySaving || a.offer.provider.localeCompare(b.offer.provider));
}
export function canHunt(service: HouseholdService) {
  return COMPARABLE_CATEGORIES.includes(service.category) && service.monthlyEquivalent?.currency === 'NZD';
}
export function canResearch(service: HouseholdService) {
  return RESEARCHABLE_CATEGORIES.includes(service.category) && service.monthlyEquivalent?.currency === 'NZD';
}
/** Pre-fills the sourced research page. Only the category and a rounded monthly figure travel; no merchant text. */
export function researchHref(service: HouseholdService) {
  if (!canResearch(service) || !service.monthlyEquivalent) return null;
  const params = new URLSearchParams({ category: service.category, monthly: (service.monthlyEquivalent.amount / 100).toFixed(2) });
  return '/do/bills/compare?' + params.toString();
}
/**
 * The words handed to Personal DO through the reviewed Ask DO entry. The person sees them
 * before anything is kept, and sets the actual wake-up schedule themselves in Personal DO.
 */
export function watchAsk(service: HouseholdService) {
  const paying = service.monthlyEquivalent ? 'about ' + moneyText(service.monthlyEquivalent) + ' a month' : moneyText(service.latest) + ' at irregular intervals';
  return `Watch my ${SERVICE_LABEL[service.category].toLocaleLowerCase('en-NZ')} with ${service.provider}. I pay ${paying}, last paid ${service.lastPaidOn}. ` +
    'Each month, check whether a current public offer would cost less over a year including joining and exit fees, and prepare a short note with sources for me to review. ' +
    'Do not switch, cancel or contact anyone.';
}
export function watchHref(service: HouseholdService) {
  return '/do/ask?' + new URLSearchParams({ q: watchAsk(service), title: 'Watch my ' + SERVICE_LABEL[service.category].toLocaleLowerCase('en-NZ') }).toString();
}
