import { candidateSchema, publicUrl, type AvailabilityCandidate, type AvailabilityProviderAdapter, type AvailabilitySearchInput, type ProviderCapability } from './contracts';

export const PROVIDER_CAPABILITIES: readonly ProviderCapability[] = [
  { id: 'healthpoint', name: 'Healthpoint', state: 'not_connected', capability: 'directory', reason: 'Directory API access requires registration. Listings do not confirm appointment slots.', documentationUrl: 'https://healthpointltd.health/healthpoint-directory/healthpoint-api/' },
  { id: 'cliniko', name: 'Cliniko', state: 'not_connected', capability: 'provider_slots', reason: 'Requires provider-authorised account access and approved business, practitioner and appointment type. No keys connected.', documentationUrl: 'https://docs.api.cliniko.com/openapi/service' },
  { id: 'nookal', name: 'Nookal', state: 'not_connected', capability: 'provider_slots', reason: 'Requires a provider-authorised account integration. No keys connected; slot contract has not been verified.', documentationUrl: 'https://support.nookal.com/hc/en-us/articles/9191502612239-Generating-API-Keys' },
  { id: 'tradify', name: 'Tradify', state: 'not_connected', capability: 'enquiry', reason: 'No public API. A quote or enquiry is not a confirmed visit.', documentationUrl: 'https://www.tradifyhq.com/integrations/api' },
];
export const disconnectedAdapters: readonly AvailabilityProviderAdapter[] = PROVIDER_CAPABILITIES.map(capability => ({
  capability, async search() { return []; },
}));

/** Safe manual handoff destinations, no location/health/user data in URLs.
 * These are search/quote destinations, not a shortlist or confirmed slots.
 */
export function directoryHandoffs(service: AvailabilitySearchInput['service']) {
  return service === 'physio'
    ? [{ label: 'Find providers on Healthpoint', url: 'https://www.healthpoint.co.nz/', status: 'enquiry_only' as const, detail: 'Search your chosen area and open a provider’s public booking page. No slots checked.' }]
    : [{ label: 'Find tradies on Builderscrack', url: 'https://builderscrack.co.nz/', status: 'enquiry_only' as const, detail: 'Find providers or request quotes yourself. No visit time or price confirmed.' }];
}

/** Curated, public provider records can support the first usable shortlist.
 * A trusted caller supplies verified public records and allowed public origins.
 * No scraping/fetching or URL discovery happens here. All slots are removed:
 * a directory can never promote cached text to provider-confirmed availability.
 */
export function createPublicDirectoryAdapter(records: readonly AvailabilityCandidate[], allowedOrigins: readonly string[]): AvailabilityProviderAdapter {
  if (records.length > 50 || allowedOrigins.length > 50) throw new Error('Directory too large.');
  const origins = new Set(allowedOrigins.map(value => {
    const parsed = publicUrl.parse(value);
    if (new URL(parsed).pathname !== '/') throw new Error('Supply public origins only.');
    return new URL(parsed).origin;
  }));
  const candidates = records.map(record => {
    const parsed = candidateSchema.parse(record);
    if (![parsed.evidence.sourceUrl, parsed.bookingUrl].filter(Boolean).every(url => origins.has(new URL(url!).origin))) throw new Error('Unapproved provider link.');
    return { ...parsed, slot: null, evidence: { ...parsed.evidence, kind: 'directory' as const, expiresAt: null } };
  });
  return {
    capability: { id: 'curated-public-directory', name: 'Reviewed public provider links', state: 'connected', capability: 'directory', reason: 'Public directory records only; no live slot feed or bookings.', documentationUrl: 'https://www.healthpoint.co.nz/' },
    async search() { return structuredClone(candidates); },
  };
}
