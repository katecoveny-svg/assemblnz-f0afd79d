import { candidateSchema, searchInputSchema, type AvailabilityReport } from './contracts';
import { AVAILABILITY_FRESHNESS_MS } from './search';

function validateCandidate(result: AvailabilityReport['results'][number]) {
  return candidateSchema.safeParse({ id: result.id, provider: result.provider, service: result.service, serviceId: result.serviceId, serviceLabel: result.serviceLabel, location: result.location, timezone: result.timezone, price: result.price, terms: result.terms, accessibility: result.accessibility, evidence: result.evidence, slot: result.slot, ...(result.bookingUrl ? { bookingUrl: result.bookingUrl } : {}) });
}

/** Exact review object only. Does not grant approval or execute an action.
 * Server callers must keep the report trusted/owner-scoped, never accept a
 * client-supplied report as provider proof, and recheck before any later action.
 */
export function prepareAvailabilityReview(report: AvailabilityReport, resultId: string, now = new Date()) {
  const matches = report.results.filter(result => `${result.adapterId}:${result.id}` === resultId);
  if (matches.length !== 1) return { ready: false as const, reason: 'Choose one unique result.' };
  const result = matches[0];
  if (!validateCandidate(result).success || !Number.isFinite(now.getTime())) return { ready: false as const, reason: 'Invalid review evidence.' };
  if (report.mode !== 'live' || result.synthetic) return { ready: false as const, reason: 'Synthetic fixtures cannot prepare a live booking review.' };
  if (result.status !== 'provider_confirmed_available' || !result.slot || !result.evidence.expiresAt || result.evidence.kind !== 'provider_slot' || Date.parse(result.evidence.observedAt) > now.getTime() || now.getTime() - Date.parse(result.evidence.observedAt) >= AVAILABILITY_FRESHNESS_MS || Date.parse(result.evidence.expiresAt) <= now.getTime() || Date.parse(result.slot.start) <= now.getTime()) return { ready: false as const, reason: 'Provider availability needs a fresh confirmation.' };
  if (result.checksNeeded.length || !result.price || result.price.basis !== 'total' || !result.price.includesGST || !result.terms) return { ready: false as const, reason: 'Confirm location, price, accessibility and terms first.' };
  return { ready: true as const, confirmation: structuredClone({
    provider: result.provider, service: { id: result.serviceId, category: result.service, label: result.serviceLabel },
    time: result.slot, timezone: result.timezone, location: result.location,
    price: result.price, terms: result.terms, observedAt: result.evidence.observedAt,
    expiry: result.evidence.expiresAt, evidence: result.evidence,
    bookingUrl: result.bookingUrl ?? null, requiresUserApproval: true as const,
    externalAction: 'none' as const, actionState: 'prepared_only' as const,
    held: false as const, booked: false as const,
  }) };
}

/** Local editable enquiry preparation. No name, diagnosis or contact details.
 * The user explicitly supplied the area for this requested search.
 * This does not send or imply that a provider has received an enquiry.
 */
export function prepareAvailabilityEnquiry(raw: unknown, report: AvailabilityReport, resultId: string) {
  const input = searchInputSchema.parse(raw);
  const matches = report.results.filter(result => `${result.adapterId}:${result.id}` === resultId && result.service === input.service);
  if (matches.length !== 1 || report.mode !== 'live' || matches[0].synthetic) return { ready: false as const, reason: 'Choose one real provider directory or slot result.' };
  const result = matches[0];
  if (!validateCandidate(result).success) return { ready: false as const, reason: 'Invalid provider evidence.' };
  return { ready: true as const, draft: {
    provider: result.provider, bookingUrl: result.bookingUrl ?? null,
    text: `Kia ora ${result.provider.name}, do you have a ${result.serviceLabel} appointment between ${input.timeWindow.start} and ${input.timeWindow.end} (${input.timeWindow.timezone})? I am looking in ${input.location.label}, within ${input.travelRadiusKm} km.${input.budgetNZD !== undefined ? ` My maximum total budget is NZD ${input.budgetNZD}.` : ''}${input.accessibilityPreferences.length ? ` Please confirm: ${input.accessibilityPreferences.join(', ')}.` : ''} Please confirm the exact time, location, total price including GST, and cancellation terms.`,
    status: 'prepared_draft' as const, externalAction: 'none' as const,
    sent: false as const, requiresUserApproval: true as const,
  } };
}
