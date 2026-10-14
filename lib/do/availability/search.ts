import { candidateSchema, searchInputSchema, type AvailabilitySearchInput, type AvailabilityProviderAdapter, type AvailabilityReport, type AvailabilityResult } from './contracts';

export const AVAILABILITY_FRESHNESS_MS = 5 * 60_000;
function distance(a: NonNullable<AvailabilitySearchInput['location']['point']>, b: typeof a): number {
  const radians = (n: number) => n * Math.PI / 180;
  const h = Math.sin(radians(b.latitude - a.latitude) / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(radians(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** No network/storage/credentials in this orchestrator. Default adapters are
 * disconnected. At most 8 providers, 50 candidates each, 50 returned results.
 * No geocoder: missing coordinates produce a travel-radius verification gap.
 */
export async function searchAvailability(raw: unknown, adapters: readonly AvailabilityProviderAdapter[], options: { now?: Date; mode?: 'live' | 'synthetic'; timeoutMs?: number } = {}): Promise<AvailabilityReport> {
  const input = searchInputSchema.parse(raw);
  const now = options.now ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid clock.');
  if (Date.parse(input.timeWindow.end) <= now.getTime()) throw new Error('Search window has ended.');
  if (adapters.length > 8 || new Set(adapters.map(a => a.capability.id)).size !== adapters.length) throw new Error('Supply at most eight unique adapters.');
  const mode = options.mode ?? 'live';
  const timeoutMs = options.timeoutMs ?? 3000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) throw new Error('Invalid timeout.');
  const results: AvailabilityResult[] = [];
  const providers: AvailabilityReport['providers'] = [];
  for (const adapter of adapters) {
    const capability = adapter.capability;
    if (capability.state === 'not_connected') { providers.push({ ...capability, outcome: 'not_connected' }); continue; }
    if ((capability.state === 'synthetic') !== (mode === 'synthetic')) { providers.push({ ...capability, outcome: 'skipped' }); continue; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const rawResults = await Promise.race([
        adapter.search(structuredClone(input), controller.signal),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Timed out')); }, timeoutMs); }),
      ]);
      if (!Array.isArray(rawResults) || rawResults.length > 50) throw new Error('Invalid provider response.');
      const candidates = rawResults.map(value => candidateSchema.parse(value));
      if (new Set(candidates.map(c => c.id)).size !== candidates.length) throw new Error('Duplicate result IDs.');
      for (const candidate of candidates) {
        if (candidate.service !== input.service) continue;
        const slot = candidate.slot;
        if (slot && (Date.parse(slot.start) < Math.max(now.getTime(), Date.parse(input.timeWindow.start)) || Date.parse(slot.end) > Date.parse(input.timeWindow.end))) continue;
        const distanceKm = input.location.point && candidate.location.point ? distance(input.location.point, candidate.location.point) : null;
        if (distanceKm !== null && distanceKm > input.travelRadiusKm) continue;
        if (input.budgetNZD !== undefined && candidate.price?.basis === 'total' && candidate.price.includesGST && candidate.price.amountNZD > input.budgetNZD) continue;
        const checksNeeded: string[] = [];
        if (distanceKm === null) checksNeeded.push('Location and travel radius need verification.');
        if (!candidate.price || candidate.price.basis !== 'total' || !candidate.price.includesGST) checksNeeded.push('Exact total price including GST needs confirmation.');
        if (!candidate.terms) checksNeeded.push('Terms need confirmation.');
        for (const preference of input.accessibilityPreferences) if (!candidate.accessibility.includes(preference)) checksNeeded.push(`Confirm accessibility: ${preference}.`);
        const observed = Date.parse(candidate.evidence.observedAt);
        const expires = candidate.evidence.expiresAt ? Date.parse(candidate.evidence.expiresAt) : 0;
        const fresh = observed <= now.getTime() && now.getTime() - observed < AVAILABILITY_FRESHNESS_MS && expires > now.getTime() && expires > observed;
        const permittedSlot = capability.capability === 'provider_slots' && candidate.evidence.kind === 'provider_slot';
        let status: AvailabilityResult['status'] = candidate.evidence.kind === 'enquiry' || !slot ? 'enquiry_only' : 'awaiting_confirmation';
        if (permittedSlot && fresh) status = 'provider_confirmed_available';
        else if (slot) checksNeeded.push('Provider must confirm this time; it is not current availability.');
        results.push({ ...candidate, evidence: { ...candidate.evidence, expiresAt: permittedSlot && fresh ? new Date(Math.min(expires, observed + AVAILABILITY_FRESHNESS_MS)).toISOString() : candidate.evidence.expiresAt }, adapterId: capability.id, status, synthetic: mode === 'synthetic', distanceKm, checksNeeded });
      }
      providers.push({ ...capability, outcome: 'returned' });
    } catch {
      // Do not reflect upstream errors, health data, user location or keys.
      providers.push({ ...capability, outcome: 'unavailable' });
    } finally { if (timer) clearTimeout(timer); controller.abort(); }
  }
  const order = { provider_confirmed_available: 0, awaiting_confirmation: 1, enquiry_only: 2 };
  results.sort((a, b) => order[a.status] - order[b.status] || (a.slot ? Date.parse(a.slot.start) : Infinity) - (b.slot ? Date.parse(b.slot.start) : Infinity) || a.provider.name.localeCompare(b.provider.name));
  return { mode, checkedAt: now.toISOString(), results: results.slice(0, 50), providers, externalAction: 'none', notice: mode === 'synthetic' ? 'Synthetic demonstration only. No real appointments, bookings or holds.' : 'Availability is a dated observation, not a booking or hold. Recheck with the provider before approval.' };
}
