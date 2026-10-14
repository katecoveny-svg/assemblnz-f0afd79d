import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
// Matches the explicit-instant convention in DO connector-contracts.ts.
export const instant = z.iso.datetime({ offset: true }).max(40)
  .refine(value => Number.isFinite(Date.parse(value)) && !value.endsWith('-00:00'));
const timezone = text(80).refine(value => {
  try { new Intl.DateTimeFormat('en-NZ', { timeZone: value }); return true; } catch { return false; }
});
const point = z.strictObject({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) });
const service = z.enum(['physio', 'plumber', 'electrician', 'builder', 'other_trade']);
const access = z.enum(['step_free', 'accessible_toilet', 'home_visit', 'remote']);
export const searchInputSchema = z.strictObject({
  service,
  location: z.strictObject({ label: text(160), point: point.optional() }),
  travelRadiusKm: z.number().min(0).max(200),
  timeWindow: z.strictObject({ start: instant, end: instant, timezone }),
  budgetNZD: z.number().min(0).max(100_000).optional(),
  accessibilityPreferences: z.array(access).max(4).default([]),
}).refine(value => {
  const duration = Date.parse(value.timeWindow.end) - Date.parse(value.timeWindow.start);
  return duration > 0 && duration <= 31 * 86400_000;
}, { path: ['timeWindow', 'end'], message: 'Choose a positive window of at most 31 days.' });
export type AvailabilitySearchInput = z.infer<typeof searchInputSchema>;

export const publicUrl = text(2048).refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && !url.search && !url.hash && !url.hostname.includes(':')
      && url.hostname.includes('.') && !/^\d+(?:\.\d+){3}$/.test(url.hostname)
      && !/\.(?:local|internal|localhost)$/.test(url.hostname);
  } catch { return false; }
});
export const candidateSchema = z.strictObject({
  id: text(160), provider: z.strictObject({ id: text(160), name: text(200) }),
  service, serviceId: text(160), serviceLabel: text(200),
  location: z.strictObject({ label: text(240), point: point.optional() }), timezone,
  price: z.strictObject({ amountNZD: z.number().min(0).max(100_000), basis: z.enum(['total', 'estimate', 'from', 'hourly']), includesGST: z.boolean() }).nullable(),
  terms: text(4000).nullable(), accessibility: z.array(access).max(4),
  bookingUrl: publicUrl.optional(),
  evidence: z.strictObject({
    kind: z.enum(['provider_slot', 'directory', 'enquiry']), sourceUrl: publicUrl,
    reference: text(240), observedAt: instant, expiresAt: instant.nullable(),
  }),
  slot: z.strictObject({ start: instant, end: instant }).nullable(),
}).refine(value => !value.slot || Date.parse(value.slot.end) > Date.parse(value.slot.start))
  .refine(value => value.evidence.kind !== 'provider_slot' || Boolean(value.slot && value.evidence.expiresAt));
export type AvailabilityCandidate = z.infer<typeof candidateSchema>;
export type AvailabilityStatus = 'provider_confirmed_available' | 'awaiting_confirmation' | 'enquiry_only';
export type ProviderCapability = {
  id: string; name: string; state: 'not_connected' | 'connected' | 'synthetic';
  capability: 'directory' | 'provider_slots' | 'enquiry'; reason: string; documentationUrl: string;
};
/** Registered read-only adapter. No booking, hold, message or patient operations.
 * Owner-authorised location is used only for this requested search. No memory,
 * family context or health information belongs in this provider input.
 */
export interface AvailabilityProviderAdapter {
  capability: ProviderCapability;
  search(input: AvailabilitySearchInput, signal: AbortSignal): Promise<unknown>;
}
export type AvailabilityResult = AvailabilityCandidate & {
  adapterId: string; status: AvailabilityStatus; synthetic: boolean;
  distanceKm: number | null; checksNeeded: string[];
};
export type AvailabilityReport = {
  mode: 'live' | 'synthetic'; checkedAt: string; results: AvailabilityResult[];
  providers: (ProviderCapability & { outcome: 'not_connected' | 'returned' | 'unavailable' | 'skipped' })[];
  notice: string; externalAction: 'none';
};
