/**
 * NZ Weather — standalone data source
 * Portability rule: lives here, NOT inline in simulation logic.
 *
 * Provider: Open-Meteo (free, no API key, high quality, NZ coverage)
 * API: https://api.open-meteo.com/v1/forecast
 * Cache: 1h per location (keyed by rounded lat/lon)
 * Fallback: null with degraded flag — callers must handle gracefully
 */

import { supabase } from "@/integrations/supabase/client";

export interface NzWeatherCurrent {
  temperatureC: number;
  windSpeedKph: number;
  precipitationMm: number;
  weatherCode: number;
  /** Human-readable description */
  description: string;
}

export interface NzWeatherForecastDay {
  date: string; // ISO YYYY-MM-DD
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  windSpeedMaxKph: number;
  uvIndex: number;
  weatherCode: number;
}

export interface NzWeatherResult {
  current: NzWeatherCurrent | null;
  forecast: NzWeatherForecastDay[];
  fetchedAt: number;
  source: "live" | "cached" | "fallback";
  /** For Waihanga construction alerts */
  constructionAlerts: Array<{ type: string; message: string; severity: "high" | "medium" | "info"; day: string }>;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const _cache = new Map<string, NzWeatherResult>();

function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(1)},${lon.toFixed(1)}`;
}

// WMO weather code → description
function wmoDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export async function getNzWeather(
  lat: number,
  lon: number,
  forecastDays = 3,
): Promise<NzWeatherResult> {
  const now = Date.now();
  const key = cacheKey(lat, lon);
  const cached = _cache.get(key);

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, source: "cached" };
  }

  try {
    const { data, error } = await supabase.functions.invoke("nz-weather", {
      body: { latitude: lat, longitude: lon, days: forecastDays },
    });
    if (error) throw error;

    const current: NzWeatherCurrent | null = data?.current
      ? {
          temperatureC: data.current.temperature_2m,
          windSpeedKph: data.current.wind_speed_10m,
          precipitationMm: data.current.precipitation,
          weatherCode: data.current.weather_code,
          description: wmoDescription(data.current.weather_code),
        }
      : null;

    const forecast: NzWeatherForecastDay[] = (data?.daily?.time ?? []).map(
      (date: string, i: number) => ({
        date,
        maxTempC: data.daily.temperature_2m_max[i],
        minTempC: data.daily.temperature_2m_min[i],
        precipitationMm: data.daily.precipitation_sum[i],
        windSpeedMaxKph: data.daily.wind_speed_10m_max[i],
        uvIndex: data.daily.uv_index_max[i],
        weatherCode: data.daily.weather_code[i],
      }),
    );

    const constructionAlerts = data?.alerts ?? [];

    const result: NzWeatherResult = {
      current,
      forecast,
      fetchedAt: now,
      source: "live",
      constructionAlerts,
    };
    _cache.set(key, result);
    return result;
  } catch (err) {
    console.warn("[nz-weather] fetch failed:", err);
    return {
      current: null,
      forecast: [],
      fetchedAt: now,
      source: "fallback",
      constructionAlerts: [],
    };
  }
}

// Common NZ location coordinates
export const NZ_LOCATIONS = {
  auckland: { lat: -36.85, lon: 174.76 },
  wellington: { lat: -41.29, lon: 174.78 },
  christchurch: { lat: -43.53, lon: 172.64 },
  hamilton: { lat: -37.79, lon: 175.28 },
  tauranga: { lat: -37.69, lon: 176.17 },
  dunedin: { lat: -45.87, lon: 170.50 },
  napier: { lat: -39.49, lon: 176.92 },
  palmerston_north: { lat: -40.36, lon: 175.61 },
} as const;

export type NzLocationKey = keyof typeof NZ_LOCATIONS;
