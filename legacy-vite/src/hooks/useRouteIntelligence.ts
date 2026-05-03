// ═══════════════════════════════════════════════════════════════
// useRouteIntelligence — shared hook for ARATAKI + TŌRO
//
// Wraps the `nz-routes` (MapBox-backed) and `iot-weather`
// (OpenWeatherMap) edge functions into a single, cached call
// returning the live distance, duration, and per-leg weather
// summary for a NZ road trip.
//
// Used by:
//   - src/pages/arataki/RouteIntelligence.tsx (fleet trips)
//   - src/pages/ToroaRoutePage.tsx (whānau road trips)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RouteWaypoint {
  name: string;
  lat: number;
  lon: number;
}

export interface RoutePlanInput {
  /** Stable id used for cache keying / re-fetch suppression. */
  id: string;
  /** Display label (e.g. "Auckland → Taupō → Napier"). */
  label: string;
  /** Ordered waypoints — origin first, destination last, intermediate stops in between. */
  waypoints: RouteWaypoint[];
}

export interface LegWeather {
  location: string;
  condition: string;
  tempC: number | null;
  windKmh: number | null;
  fallback: boolean;
}

export interface RouteIntelligenceResult {
  id: string;
  label: string;
  distanceKm: number | null;
  durationMins: number | null;
  routeSource: "mapbox" | "fallback_after_error" | "fallback_no_key" | "unknown";
  weather: LegWeather[];
  loading: boolean;
  error: string | null;
}

const EMPTY_WEATHER = (name: string): LegWeather => ({
  location: name,
  condition: "—",
  tempC: null,
  windKmh: null,
  fallback: true,
});

async function fetchRouteSegment(
  origin: RouteWaypoint,
  destination: RouteWaypoint,
): Promise<{ distanceKm: number; durationMins: number; source: RouteIntelligenceResult["routeSource"] }> {
  const { data, error } = await supabase.functions.invoke("nz-routes", {
    body: {
      origin: { lat: origin.lat, lon: origin.lon },
      destination: { lat: destination.lat, lon: destination.lon },
    },
  });
  if (error) throw error;
  return {
    distanceKm: typeof data?.distanceKm === "number" ? data.distanceKm : 0,
    durationMins: typeof data?.durationMins === "number" ? data.durationMins : 0,
    source: (data?.source as RouteIntelligenceResult["routeSource"]) ?? "unknown",
  };
}

async function fetchWeatherFor(point: RouteWaypoint): Promise<LegWeather> {
  try {
    const { data, error } = await supabase.functions.invoke("iot-weather", {
      body: { lat: point.lat, lon: point.lon, mode: "current" },
    });
    if (error) throw error;
    const current = data?.current ?? data?.data?.current ?? null;
    const description = current?.weather?.[0]?.description ?? "Weather unavailable";
    const tempC = typeof current?.main?.temp === "number" ? Math.round(current.main.temp) : null;
    const windMs = typeof current?.wind?.speed === "number" ? current.wind.speed : null;
    return {
      location: point.name,
      condition: description.charAt(0).toUpperCase() + description.slice(1),
      tempC,
      windKmh: windMs !== null ? Math.round(windMs * 3.6) : null,
      fallback: Boolean(data?.fallback),
    };
  } catch {
    return EMPTY_WEATHER(point.name);
  }
}

export function useRouteIntelligence(plan: RoutePlanInput): RouteIntelligenceResult {
  const [state, setState] = useState<RouteIntelligenceResult>({
    id: plan.id,
    label: plan.label,
    distanceKm: null,
    durationMins: null,
    routeSource: "unknown",
    weather: plan.waypoints.map((w) => EMPTY_WEATHER(w.name)),
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
        // Sum all consecutive segments so the total reflects the full
        // ordered itinerary (e.g. AKL → Taupō → Napier), not just A→Z.
        let totalDistance = 0;
        let totalDuration = 0;
        let lastSource: RouteIntelligenceResult["routeSource"] = "unknown";

        for (let i = 0; i < plan.waypoints.length - 1; i++) {
          const segment = await fetchRouteSegment(plan.waypoints[i], plan.waypoints[i + 1]);
          totalDistance += segment.distanceKm;
          totalDuration += segment.durationMins;
          lastSource = segment.source;
        }

        const weather = await Promise.all(plan.waypoints.map(fetchWeatherFor));
        if (cancelled) return;

        setState({
          id: plan.id,
          label: plan.label,
          distanceKm: Math.round(totalDistance * 10) / 10,
          durationMins: totalDuration,
          routeSource: lastSource,
          weather,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Route intelligence unavailable",
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plan.id]);

  return state;
}

/** Format minutes into a human "Xh Ym" string. */
export function formatDuration(mins: number | null): string {
  if (mins === null || mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
