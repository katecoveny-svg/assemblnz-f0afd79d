/**
 * Uber Direct — Auckland-first same-hour delivery scaffold (Phase 1).
 *
 * Pure, dependency-free, secret-free logic shared by:
 *   - the Next quote route (app/api/hapai/uber-direct/route.ts), and
 *   - the Supabase edge function (supabase/functions/uber-direct-order), which
 *     re-implements the same constants in Deno.
 *
 * SCAFFOLD ONLY. Per the Woolworths Kai pack (03-uber-direct-spec) and Kate's
 * 2026-06-29 sign-off, this PR NEVER dispatches a real delivery. `quote` is a
 * local cost/coverage estimate (no Uber call); `create` is hard-disabled until
 * Kate signs off a live-fire test. See UBER_DIRECT_LIVE below.
 *
 * Privacy Act 2020 (IPP 1 / IPP 3A): this module handles only coarse coverage
 * (a region string or a metro-bounds check) and a package *description* string.
 * It never persists addresses, phone numbers, itemised carts, or family member
 * profiles — those stay with the caller and are minimised at dispatch time.
 */

/** Regions where Uber Direct is offered. Auckland-only for the launch pilot. */
export const UBER_DIRECT_REGIONS = ['auckland'] as const;
export type UberDirectRegion = (typeof UBER_DIRECT_REGIONS)[number];

/**
 * Metro-Auckland geofence — the SH1/SH20 ring plus the isthmus (spec §Coverage).
 * Deliberately excludes Waiheke Island (lng > 174.95), rural west Auckland
 * (lng < 174.60) and the northern beaches past Silverdale (lat > -36.72).
 */
export const AUCKLAND_METRO_BOUNDS = {
  minLat: -37.05, // ~Papakura / Drury (south)
  maxLat: -36.72, // ~Silverdale / Albany (north)
  minLng: 174.6, // ~Henderson / Titirangi (west)
  maxLng: 174.95, // ~Howick / Botany (east)
} as const;

/**
 * Live-fire master switch. Even when true, `create` requires an explicit
 * `confirmLiveDispatch` AND a configured UBER_DIRECT_API_KEY. Ships FALSE.
 * The Next route reads this from the env in the edge function; the shared lib
 * exposes the default so callers can reason about it.
 */
export const UBER_DIRECT_LIVE_DEFAULT = false;

export interface LatLng {
  lat: number;
  lng: number;
}

/** True if a coordinate sits inside the metro-Auckland delivery geofence. */
export function isWithinAuckland(point: LatLng): boolean {
  const b = AUCKLAND_METRO_BOUNDS;
  return point.lat >= b.minLat && point.lat <= b.maxLat && point.lng >= b.minLng && point.lng <= b.maxLng;
}

/** Great-circle distance in km (haversine), used when both ends have coords. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface CostBand {
  label: string;
  maxKm: number; // upper bound of the band
  baseFare: number; // NZD, before surge + handling
  etaMinLabel: string; // human ETA window
}

/** NZD cost model, sourced from Uber's public NZ enterprise page (spec §Cost). */
export const COST_BANDS: CostBand[] = [
  { label: '0–3 km', maxKm: 3, baseFare: 12.5, etaMinLabel: '25–45 min' },
  { label: '3–8 km', maxKm: 8, baseFare: 18.0, etaMinLabel: '35–60 min' },
  { label: '8–15 km', maxKm: 15, baseFare: 29.0, etaMinLabel: '45–75 min' },
];

/** assembl handling fee that funds the API bill (spec §Cost). Never a markup. */
export const ASSEMBL_HANDLING_FEE = 1.5;

export type FallbackTier = 'uber_direct' | 'alt_courier' | 'drive_yourself';

export interface UberQuote {
  eligible: boolean;
  /** The fallback tier that applies given coverage. */
  tier: FallbackTier;
  region: UberDirectRegion | 'out_of_area';
  distanceKm: number | null;
  band: string | null;
  /** Total shown to the user before they confirm: base × surge + handling. */
  estimatedTotalNzd: number | null;
  etaLabel: string | null;
  surgeMultiplier: number;
  /** Honest, user-facing explanation — never "sorry", never a silent failure. */
  message: string;
  /** Always true in this PR: no real delivery is ever dispatched here. */
  draftOnly: true;
}

export interface QuoteInput {
  /** Coarse coverage region; defaults to the only launch region. */
  region?: string;
  /** Optional coordinates — when supplied, geofence + distance are exact. */
  pickup?: LatLng;
  dropoff?: LatLng;
  /** Estimated trip distance (km) when coordinates aren't available. */
  distanceKm?: number;
  /** Surge factor (1.3–1.8 on Friday nights / Sunday arvo / public holidays). */
  surgeMultiplier?: number;
}

/**
 * Build a coverage-and-cost quote. Local only — no network, no Uber call.
 * Applies the 3-tier fallback (Uber Direct → alt courier → drive-yourself).
 */
export function buildQuote(input: QuoteInput): UberQuote {
  const region = (input.region ?? 'auckland').toLowerCase();
  const surge = clampSurge(input.surgeMultiplier);

  const regionOffered = (UBER_DIRECT_REGIONS as readonly string[]).includes(region);

  // Distance: exact from coords, else the caller's estimate.
  let distanceKm: number | null = null;
  let insideGeofence = regionOffered;
  if (input.pickup && input.dropoff) {
    insideGeofence = isWithinAuckland(input.pickup) && isWithinAuckland(input.dropoff);
    distanceKm = Math.round(haversineKm(input.pickup, input.dropoff) * 10) / 10;
  } else if (typeof input.distanceKm === 'number' && input.distanceKm >= 0) {
    distanceKm = Math.round(input.distanceKm * 10) / 10;
  }

  // Out of the offered region entirely → drive-yourself (tier 3).
  if (!regionOffered || !insideGeofence) {
    return {
      eligible: false,
      tier: 'drive_yourself',
      region: 'out_of_area',
      distanceKm,
      band: null,
      estimatedTotalNzd: null,
      etaLabel: null,
      surgeMultiplier: surge,
      message:
        'Uber Direct only runs in metro Auckland for now. Two options: an alternative courier where available, or drive it yourself — I can pull up the closest store and the list ready to swipe through.',
      draftOnly: true,
    };
  }

  // Beyond the courier bands (>15 km) → alt courier (tier 2), Uber often refuses.
  const band = distanceKm == null ? COST_BANDS[0] : COST_BANDS.find((b) => distanceKm! <= b.maxKm);
  if (!band) {
    return {
      eligible: false,
      tier: 'alt_courier',
      region: 'auckland',
      distanceKm,
      band: '>15 km',
      estimatedTotalNzd: null,
      etaLabel: '60–120 min',
      surgeMultiplier: surge,
      message:
        "That trip is beyond Uber Direct's usual range, so a driver often won't accept. I can try an alternative courier (~$28–$40, 60–120 min, not Sundays), or you can drive it yourself.",
      draftOnly: true,
    };
  }

  const total = Math.round((band.baseFare * surge + ASSEMBL_HANDLING_FEE) * 100) / 100;
  return {
    eligible: true,
    tier: 'uber_direct',
    region: 'auckland',
    distanceKm,
    band: band.label,
    estimatedTotalNzd: total,
    etaLabel: band.etaMinLabel,
    surgeMultiplier: surge,
    message:
      surge > 1
        ? `About $${total.toFixed(2)} (peak pricing is on right now), usually ${band.etaMinLabel} to the door. You confirm before anything is dispatched.`
        : `About $${total.toFixed(2)}, usually ${band.etaMinLabel} to the door. You confirm before anything is dispatched.`,
    draftOnly: true,
  };
}

function clampSurge(m: number | undefined): number {
  if (typeof m !== 'number' || !Number.isFinite(m)) return 1;
  return Math.min(1.8, Math.max(1, m));
}

/**
 * The response `create` returns in this PR — a hard stop. No Uber API call is
 * made; no courier is dispatched. Live-fire lands only after Kate signs off.
 */
export const CREATE_DISABLED_RESPONSE = {
  status: 'scaffold_disabled' as const,
  dispatched: false,
  note:
    'Live Uber Direct dispatch is not enabled. This PR ships the scaffold only — a real delivery is fired after Kate signs off a supervised live-fire test.',
};
