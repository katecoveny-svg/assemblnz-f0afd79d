import { recurringPayments, type RecurringPayment } from './analysis';
import type { FinancialSnapshot, Money } from './model';

/**
 * What a household pays, by service. Deterministic: derived from recurring payment
 * candidates and a public directory of New Zealand provider names. A detected provider is
 * a suggestion to confirm against the actual bill, never a verified plan or contract.
 */
export const SERVICE_CATEGORIES = ['electricity', 'gas', 'broadband', 'mobile', 'insurance', 'streaming', 'subscription', 'council_rates'] as const;
export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
export const SERVICE_LABEL: Record<ServiceCategory, string> = {
  electricity: 'Electricity', gas: 'Gas', broadband: 'Broadband', mobile: 'Mobile', insurance: 'Insurance',
  streaming: 'Streaming', subscription: 'Subscription', council_rates: 'Council rates',
};
/** Categories the comparison tools understand. Others are shown but not hunted. */
export const COMPARABLE_CATEGORIES: readonly ServiceCategory[] = ['electricity', 'broadband', 'mobile', 'insurance', 'streaming', 'subscription'];
export const RESEARCHABLE_CATEGORIES: readonly ServiceCategory[] = ['electricity', 'broadband', 'mobile'];

type ProviderEntry = { name: string; category: ServiceCategory; match: RegExp };
const entry = (name: string, category: ServiceCategory, pattern: string): ProviderEntry => ({ name, category, match: new RegExp(pattern, 'i') });
/** Public NZ provider names and the words that usually appear on a bank statement line. */
export const NZ_PROVIDERS: readonly ProviderEntry[] = [
  entry('Contact Energy', 'electricity', '\\bcontact\\s*energy\\b|\\bcontact\\s*en\\b'),
  entry('Genesis Energy', 'electricity', '\\bgenesis\\b'),
  entry('Mercury', 'electricity', '\\bmercury\\b'),
  entry('Meridian Energy', 'electricity', '\\bmeridian\\b'),
  entry('Electric Kiwi', 'electricity', '\\belectric\\s*kiwi\\b'),
  entry('Flick Electric', 'electricity', '\\bflick\\b'),
  entry('Frank Energy', 'electricity', '\\bfrank\\s*energy\\b'),
  entry('Nova Energy', 'electricity', '\\bnova\\s*energy\\b|\\bnova\\b'),
  entry('Pulse Energy', 'electricity', '\\bpulse\\s*energy\\b'),
  entry('Powershop', 'electricity', '\\bpowershop\\b'),
  entry('Octopus Energy', 'electricity', '\\boctopus\\b'),
  entry('Ecotricity', 'electricity', '\\becotricity\\b'),
  entry('Rockgas', 'gas', '\\brockgas\\b'),
  entry('Spark', 'broadband', '\\bspark\\b'),
  entry('One NZ', 'broadband', '\\bone\\s*nz\\b|\\bvodafone\\b'),
  entry('2degrees', 'broadband', '\\b2\\s*degrees\\b|\\b2degrees\\b'),
  entry('Skinny', 'mobile', '\\bskinny\\b'),
  entry('Orcon', 'broadband', '\\borcon\\b'),
  entry('Slingshot', 'broadband', '\\bslingshot\\b'),
  entry('Quic', 'broadband', '\\bquic\\b'),
  entry('NOW', 'broadband', '\\bnow\\s*(?:nz|broadband|fibre)\\b'),
  entry('Voyager', 'broadband', '\\bvoyager\\b'),
  entry('Kogan', 'mobile', '\\bkogan\\b'),
  entry('AMI', 'insurance', '\\bami\\b'),
  entry('State', 'insurance', '\\bstate\\s*insurance\\b|\\bstate\\s*ins\\b'),
  entry('Tower', 'insurance', '\\btower\\s*(?:insurance|ins)?\\b'),
  entry('AA Insurance', 'insurance', '\\baa\\s*insurance\\b|\\baa\\s*ins\\b'),
  entry('Vero', 'insurance', '\\bvero\\b'),
  entry('FMG', 'insurance', '\\bfmg\\b'),
  entry('Southern Cross', 'insurance', '\\bsouthern\\s*cross\\b'),
  entry('nib', 'insurance', '\\bnib\\s*(?:nz|health|insurance)?\\b'),
  entry('Netflix', 'streaming', '\\bnetflix\\b'),
  entry('Disney+', 'streaming', '\\bdisney\\b'),
  entry('Neon', 'streaming', '\\bneon\\b'),
  entry('Sky', 'streaming', '\\bsky\\s*(?:nz|tv|network|sport)?\\b'),
  entry('Spotify', 'streaming', '\\bspotify\\b'),
  entry('Apple', 'subscription', '\\bapple\\.com\\b|\\bapple\\s*(?:services|bill)\\b'),
  entry('Google', 'subscription', '\\bgoogle\\b'),
  entry('Microsoft', 'subscription', '\\bmicrosoft\\b'),
  entry('Adobe', 'subscription', '\\badobe\\b'),
  entry('Auckland Council', 'council_rates', '\\bauckland\\s*council\\b'),
  entry('Wellington City Council', 'council_rates', '\\bwellington\\s*city\\s*council\\b'),
  entry('Christchurch City Council', 'council_rates', '\\bchristchurch\\s*city\\s*council\\b'),
];
/** Generic words that place a merchant in a category when no provider name matches. */
const CATEGORY_WORDS: readonly [ServiceCategory, RegExp][] = [
  ['electricity', /\b(?:power|energy|electric(?:ity)?)\b/i],
  ['gas', /\b(?:gas|lpg)\b/i],
  ['broadband', /\b(?:fibre|fiber|broadband|internet|wifi)\b/i],
  ['mobile', /\b(?:mobile|prepay|cellular)\b/i],
  ['insurance', /\b(?:insurance|cover|assurance)\b/i],
  ['council_rates', /\b(?:council|rates)\b/i],
  ['streaming', /\b(?:streaming|tv)\b/i],
  ['subscription', /\b(?:subscription|membership)\b/i],
];
export type ServiceIdentity = { provider: string | null; category: ServiceCategory; confidence: 'named-provider' | 'category-words' };
export function identifyService(merchant: string): ServiceIdentity | null {
  const text = merchant.normalize('NFKC').trim();
  if (!text) return null;
  const named = NZ_PROVIDERS.find(candidate => candidate.match.test(text));
  if (named) return { provider: named.name, category: named.category, confidence: 'named-provider' };
  const words = CATEGORY_WORDS.find(([, pattern]) => pattern.test(text));
  return words ? { provider: null, category: words[0], confidence: 'category-words' } : null;
}

export type HouseholdService = {
  id: string;
  category: ServiceCategory;
  /** Named provider from the public directory, else the merchant text as recorded. */
  provider: string;
  merchant: string;
  confidence: ServiceIdentity['confidence'];
  cadence: RecurringPayment['cadence'];
  latest: Money;
  /** Null when the cadence is uncertain; a monthly figure is not inferred from irregular timing. */
  monthlyEquivalent: Money | null;
  lastPaidOn: string;
  increase: RecurringPayment['increase'];
  payment: RecurringPayment;
};
export function monthlyEquivalentCents(amount: number, cadence: RecurringPayment['cadence']): number | null {
  if (cadence === 'monthly') return amount;
  if (cadence === 'fortnightly') return Math.round(amount * 26 / 12);
  if (cadence === 'weekly') return Math.round(amount * 52 / 12);
  return null;
}
/** Services a household appears to pay for, with monthly equivalents. Suggestions to confirm, not a contract register. */
export function householdServices(snapshot: FinancialSnapshot): HouseholdService[] {
  return recurringPayments(snapshot).flatMap<HouseholdService>(payment => {
    const identity = identifyService(payment.merchant);
    if (!identity) return [];
    const monthly = monthlyEquivalentCents(payment.amount.amount, payment.cadence);
    return [{
      id: 'service-' + payment.id, category: identity.category, provider: identity.provider || payment.merchant, merchant: payment.merchant,
      confidence: identity.confidence, cadence: payment.cadence, latest: payment.amount,
      monthlyEquivalent: monthly === null ? null : { amount: monthly, currency: payment.amount.currency },
      lastPaidOn: payment.lastPaidOn, increase: payment.increase, payment,
    }];
  }).sort((a, b) => SERVICE_CATEGORIES.indexOf(a.category) - SERVICE_CATEGORIES.indexOf(b.category) || a.provider.localeCompare(b.provider));
}
/** Yearly equivalent of the services with a known cadence, per currency. Uncertain services are counted separately. */
export function yearlyServiceTotals(services: HouseholdService[]) {
  const totals = new Map<Money['currency'], number>();
  let uncertain = 0;
  for (const service of services) {
    if (!service.monthlyEquivalent) { uncertain += 1; continue; }
    totals.set(service.monthlyEquivalent.currency, (totals.get(service.monthlyEquivalent.currency) || 0) + service.monthlyEquivalent.amount * 12);
  }
  return { totals: [...totals].map(([currency, amount]) => ({ currency, amount })), uncertain };
}
