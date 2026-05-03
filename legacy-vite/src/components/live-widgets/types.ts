/**
 * Renderer types for LiveWidget data shapes
 *
 * Mirrors the response shape of the public dashboard-feed edge function.
 * Each variant is keyed off the widget's data source so the dispatcher
 * can pick the right renderer at compile time.
 */

export interface FeedEnvelope<T> {
  source: string;
  generated_at: string;
  data: T;
}

// ── weather (mirrors get_nz_weather)
export interface WeatherPayload {
  city: string;
  temperature?: number;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
  description?: string;
  error?: string;
}

// ── fuel_prices (mirrors get_nz_fuel_prices)
export interface FuelPricesPayload {
  prices?: {
    petrol_91?: number;
    petrol_95?: number;
    diesel?: number;
  };
  region?: string;
  updated?: string;
  error?: string;
}

// ── compliance_updates
export interface ComplianceUpdate {
  id: string;
  title: string;
  change_summary: string;
  impact_level: "low" | "medium" | "high";
  source_name: string;
  source_url: string;
  legislation_ref: string | null;
  effective_date: string | null;
  affected_industries: string[] | null;
  created_at: string;
}
export interface CompliancePayload {
  updates?: ComplianceUpdate[];
  since_days?: number;
  error?: string;
}

// ── kb_sources
export interface KbSource {
  id: string;
  name: string;
  type: string;
  url: string;
  category: string | null;
  subcategory: string | null;
  agent_packs: string[] | null;
  reliability_score: number | null;
  last_successful_fetch: string | null;
}
export interface KbSourcesPayload {
  sources?: KbSource[];
  error?: string;
}
