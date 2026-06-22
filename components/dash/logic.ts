/**
 * dash by assembl — Dash Loader pure logic.
 *
 * Framework-free, DOM-free helpers shared by the React component AND the stub
 * API routes, so the same revenue/rotation/settings rules are unit-tested once
 * (see logic.test.ts) and behave identically on client and server.
 *
 * Nothing here reads page content, prompts, files or code.
 */

import {
  type ConsumerSettings,
  type DashLoaderMode,
  type PayoutDestination,
  type SponsorPayload,
  CHARITIES,
  DEFAULT_CONSUMER_SETTINGS,
  DEFAULT_DESTINATION,
} from './types';

/** Phase 0 mocked micro-revenue per completed wait, in NZD. */
export const REVENUE_PER_WAIT = 0.0045;

/** Mocked NZ-brand ad fill rotated by the sponsor endpoint. */
export const MOCK_SPONSORS: readonly SponsorPayload[] = [
  { text: 'Westpac Small Biz', advertiserId: 'westpac-small-biz', cpm: 12.5 },
  { text: 'Air NZ', advertiserId: 'air-nz', cpm: 18.0 },
  { text: 'Comvita', advertiserId: 'comvita', cpm: 9.75 },
] as const;

/**
 * Deterministic sponsor rotation. Deterministic (vs random) so the stub is
 * testable and so successive calls visibly rotate the fill.
 * TODO(assembl-fill): replace with a real auction against the NZ ad network.
 */
export function pickSponsor(rotation: number): SponsorPayload {
  const i = ((rotation % MOCK_SPONSORS.length) + MOCK_SPONSORS.length) % MOCK_SPONSORS.length;
  return MOCK_SPONSORS[i];
}

/** Crossfade message index, wrapping the cycle. Guards empty lists. */
export function nextMessageIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

/** Publisher rev-share: 55% standard, 60% for the first three anchor publishers. */
export function publisherShare(tier: 'standard' | 'anchor'): number {
  return tier === 'anchor' ? 0.6 : 0.55;
}

/**
 * Settle-stub split. Consumer/publisher revenue settles via Stripe Connect;
 * whitelabel bills on the SaaS subscription so produces no per-impression split.
 * TODO(stripe-connect): wire the real ledger + payout schedule.
 */
export function settleSplit(
  mode: 'consumer' | 'publisher' | 'whitelabel',
  totalRevenue: number,
  tier: 'standard' | 'anchor' = 'standard',
): { totalRevenue: number; splitByDestination: Record<string, number> } {
  if (mode === 'publisher') {
    const share = publisherShare(tier);
    return {
      totalRevenue,
      splitByDestination: {
        publisher: round4(totalRevenue * share),
        assembl: round4(totalRevenue * (1 - share)),
      },
    };
  }
  if (mode === 'consumer') {
    // Consumer keeps/donates the user share; assembl takes a platform cut.
    const userShare = 0.7;
    return {
      totalRevenue,
      splitByDestination: {
        payee: round4(totalRevenue * userShare),
        assembl: round4(totalRevenue * (1 - userShare)),
      },
    };
  }
  // whitelabel: no per-impression revenue split — billed on subscription.
  return { totalRevenue: 0, splitByDestination: {} };
}

function round4(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

// ─── Consumer settings (de)serialization ─────────────────────────

const SELF_METHODS = new Set<string>(['airpoints', 'kiwisaver', 'prezzy']);
const CHARITY_IDS = new Set<string>(CHARITIES.map((c) => c.id));

function isPayoutDestination(value: unknown): value is PayoutDestination {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.kind === 'self') return typeof v.method === 'string' && SELF_METHODS.has(v.method);
  if (v.kind === 'charity') return typeof v.charityId === 'string' && CHARITY_IDS.has(v.charityId);
  return false;
}

/**
 * Parse persisted settings defensively — never trust localStorage shape.
 * Returns null when nothing valid is stored so callers re-show the opt-in.
 */
export function parseSettings(raw: string | null | undefined): ConsumerSettings | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const p = parsed as Record<string, unknown>;
  if (typeof p.optedIn !== 'boolean') return null;
  if (!isPayoutDestination(p.destination)) return null;
  return {
    optedIn: p.optedIn,
    destination: p.destination,
    hasConsentedToDisclosure: p.hasConsentedToDisclosure === true,
  };
}

export function serializeSettings(settings: ConsumerSettings): string {
  return JSON.stringify(settings);
}

export function defaultSettings(): ConsumerSettings {
  return { ...DEFAULT_CONSUMER_SETTINGS, destination: DEFAULT_DESTINATION };
}

/** True only when opt-in is real: toggled on AND IPP 3A disclosure ack'd. */
export function canSaveOptIn(settings: ConsumerSettings): boolean {
  if (!settings.optedIn) return true; // opting out is always allowed
  return settings.hasConsentedToDisclosure === true;
}

// ─── Mode helpers ────────────────────────────────────────────────

/** Modes that show external advertising — and therefore the ASA label. */
export function showsSponsoredLabel(mode: DashLoaderMode): boolean {
  return mode.kind === 'consumer' || mode.kind === 'publisher';
}

/** Telemetry endpoint for a mode's impressions. */
export function impressionEndpoint(mode: DashLoaderMode): string {
  return mode.kind === 'whitelabel' ? '/api/dash/whitelabel/impression' : '/api/dash/impression';
}
