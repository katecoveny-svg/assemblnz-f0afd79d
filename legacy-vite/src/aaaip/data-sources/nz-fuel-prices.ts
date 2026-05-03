/**
 * NZ Fuel Prices — standalone data source
 * Portability rule: lives here, NOT inline in simulation logic.
 * When simulations lift to managed agents, this file lifts with them.
 *
 * Provider: MBIE weekly retail fuel monitoring (via nz-fuel-prices edge fn)
 * Cache: 24h module-level
 * Fallback: last-known-good hardcoded Q1 2026 NZ averages
 * Degraded mode: source="fallback" — callers should surface this in UI
 */

import { supabase } from "@/integrations/supabase/client";

export interface NzFuelPrices {
  petrol91: number;
  petrol95: number;
  diesel: number;
  /** NZD per kWh at public DC charger */
  ev: number;
  /** When this data was fetched (epoch ms) */
  fetchedAt: number;
  /** "live" = fresh from MBIE/source, "cached" = within TTL, "fallback" = source unavailable */
  source: "live" | "cached" | "fallback";
  /** ISO date of MBIE publication, if available */
  publishedDate?: string;
}

// Q1 2026 NZ national averages — updated whenever MBIE publishes
// Source: MBIE Weekly Fuel Price Monitoring
const FALLBACK_PRICES = {
  petrol91: 2.85,
  petrol95: 3.05,
  diesel: 2.40,
  ev: 0.32, // residential overnight rate (NZD/kWh, Meridian/Contact average)
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let _cache: NzFuelPrices | null = null;

export async function getNzFuelPrices(): Promise<NzFuelPrices> {
  const now = Date.now();

  // Return in-memory cache if fresh
  if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return { ..._cache, source: "cached" };
  }

  try {
    const { data, error } = await supabase.functions.invoke("nz-fuel-prices");
    if (error) throw error;
    if (data?.petrol91 && data.petrol91 > 0) {
      const result: NzFuelPrices = {
        petrol91: data.petrol91,
        petrol95: data.petrol95 ?? data.petrol91 * 1.07,
        diesel: data.diesel,
        ev: data.ev ?? FALLBACK_PRICES.ev,
        fetchedAt: now,
        source: "live",
        publishedDate: data.publishedDate,
      };
      _cache = result;
      return result;
    }
  } catch (err) {
    console.warn("[nz-fuel-prices] fetch failed, using fallback:", err);
  }

  return {
    ...FALLBACK_PRICES,
    fetchedAt: now,
    source: "fallback",
  };
}

/** Force-refresh bypassing cache. Use for manual refresh actions. */
export function invalidateFuelPriceCache() {
  _cache = null;
}
