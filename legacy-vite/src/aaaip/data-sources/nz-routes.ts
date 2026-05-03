/**
 * NZ Routes — standalone data source
 * Portability rule: lives here, NOT inline in simulation logic.
 *
 * Provider: MapBox Directions API (MAPBOX_ACCESS_TOKEN secret)
 * Secret: VITE_MAPBOX_TOKEN (already in repo for Helm bus tracker)
 * Cache: 6h per origin→destination pair
 * Fallback: estimated distance based on straight-line × 1.35 road factor
 */

import { supabase } from "@/integrations/supabase/client";

export interface LatLon {
  lat: number;
  lon: number;
}

export interface NzRouteResult {
  distanceKm: number;
  durationMins: number;
  /** Route polyline geometry (GeoJSON LineString coordinates) */
  geometry?: [number, number][];
  fetchedAt: number;
  source: "live" | "cached" | "fallback";
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const _cache = new Map<string, NzRouteResult>();

function routeKey(origin: LatLon, dest: LatLon) {
  return `${origin.lat.toFixed(3)},${origin.lon.toFixed(3)}→${dest.lat.toFixed(3)},${dest.lon.toFixed(3)}`;
}

/** Haversine distance in km */
function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinDLat * sinDLat +
          Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            sinDLon *
            sinDLon,
      ),
    );
  return R * c;
}

export async function getNzRoute(origin: LatLon, dest: LatLon): Promise<NzRouteResult> {
  const now = Date.now();
  const key = routeKey(origin, dest);
  const cached = _cache.get(key);

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, source: "cached" };
  }

  try {
    const { data, error } = await supabase.functions.invoke("nz-routes", {
      body: { origin, destination: dest },
    });
    if (error) throw error;
    if (data?.distanceKm && data.distanceKm > 0) {
      const result: NzRouteResult = {
        distanceKm: data.distanceKm,
        durationMins: data.durationMins,
        geometry: data.geometry,
        fetchedAt: now,
        source: "live",
      };
      _cache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn("[nz-routes] fetch failed, using fallback estimate:", err);
  }

  // Fallback: straight-line × 1.35 NZ road winding factor, ~80km/h average
  const straight = haversineKm(origin, dest);
  const distanceKm = Math.round(straight * 1.35 * 10) / 10;
  const durationMins = Math.round((distanceKm / 80) * 60);

  return {
    distanceKm,
    durationMins,
    fetchedAt: now,
    source: "fallback",
  };
}

/**
 * Estimate fuel litres for a route.
 * @param distanceKm - route distance
 * @param lPer100km - vehicle fuel economy
 */
export function routeFuelLitres(distanceKm: number, lPer100km: number): number {
  return Math.round(((distanceKm / 100) * lPer100km) * 10) / 10;
}

// Common NZ depot / distribution hub coordinates for Pikau routing
export const NZ_DEPOTS = {
  auckland_south: { lat: -37.02, lon: 174.86 },
  hamilton: { lat: -37.79, lon: 175.28 },
  tauranga_port: { lat: -37.65, lon: 176.19 },
  wellington_port: { lat: -41.28, lon: 174.78 },
  christchurch_port: { lat: -43.60, lon: 172.72 },
  palmerston_north: { lat: -40.36, lon: 175.61 },
} as const;
