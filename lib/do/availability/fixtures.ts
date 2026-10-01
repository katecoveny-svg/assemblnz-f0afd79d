import { FIXTURES } from '@/apps/do/shared/fixtures';
import type { AvailabilityCandidate, AvailabilityProviderAdapter, AvailabilitySearchInput } from './contracts';

/** Reuses the DO tradie fixture names. Everything is explicitly synthetic;
 * it cannot be enabled by the live default registry or prepare a live review.
 */
export function createSyntheticAdapter(now: Date): AvailabilityProviderAdapter {
  return {
    capability: { id: 'synthetic-slots', name: 'DO synthetic availability', state: 'synthetic', capability: 'provider_slots', reason: 'Test fixtures only. No real providers or appointments.', documentationUrl: 'https://example.com/synthetic-availability' },
    async search(input: AvailabilitySearchInput) {
      const start = new Date(Math.max(Date.parse(input.timeWindow.start), now.getTime() + 3600_000));
      const providerName = input.service === 'physio' ? 'DEMO Physio'
        : `DEMO ${FIXTURES['tradie-availability'].items[input.service === 'electrician' ? 1 : 0].name}`;
      const candidate: AvailabilityCandidate = {
        id: 'synthetic-slot', provider: { id: 'demo-provider', name: providerName },
        service: input.service, serviceId: 'demo-service', serviceLabel: `DEMO ${input.service} appointment`,
        location: { label: 'DEMO Auckland central', point: { latitude: -36.85, longitude: 174.76 } },
        timezone: 'Pacific/Auckland', price: { amountNZD: 90, basis: 'total', includesGST: true },
        terms: 'DEMO terms only; no real appointment can be booked.', accessibility: ['step_free'],
        evidence: { kind: 'provider_slot', sourceUrl: 'https://example.com/synthetic-availability', reference: 'synthetic-provider-response', observedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 300_000).toISOString() },
        slot: { start: start.toISOString(), end: new Date(start.getTime() + 1800_000).toISOString() },
      };
      return [candidate,
        { ...candidate, id: 'synthetic-stale-slot', evidence: { ...candidate.evidence, observedAt: new Date(now.getTime() - 3600_000).toISOString(), expiresAt: new Date(now.getTime() - 1800_000).toISOString() } },
        { ...candidate, id: 'synthetic-enquiry', slot: null, price: null, terms: null, evidence: { ...candidate.evidence, kind: 'enquiry', expiresAt: null } },
      ];
    },
  };
}
