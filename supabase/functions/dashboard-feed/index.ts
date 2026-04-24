// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Dashboard Feed — public read-only aggregator
 *
 * Exposes a STRICT WHITELIST of the same data sources the /chat agent tools
 * read from. No writes, no auth, no PII, no per-user data.
 *
 * Whitelisted sources (mirror of LIVE_DATA_TOOLS minus user-private + write tools):
 *   - weather             → iot-weather edge fn (mirrors get_nz_weather)
 *   - fuel_prices         → nz-fuel-prices edge fn (mirrors get_nz_fuel_prices)
 *   - compliance_updates  → public.compliance_updates (mirrors get_compliance_updates)
 *   - kb_sources          → public.kb_sources (regulatory source catalogue)
 *
 * Excluded by design:
 *   - recall_memory     → user-scoped private data
 *   - send_sms          → mutating action
 *   - get_nz_route      → requires user input + 3rd-party quota
 *   - get_iot_signal    → operational/tenant-specific telemetry
 *   - search_knowledge_base → query-driven, not a feed
 *
 * Usage:
 *   GET /functions/v1/dashboard-feed                  → bundle of all sources
 *   GET /functions/v1/dashboard-feed?source=weather&city=Auckland
 *   GET /functions/v1/dashboard-feed?source=compliance_updates&since_days=14&impact=medium
 *   GET /functions/v1/dashboard-feed?source=fuel_prices
 *   GET /functions/v1/dashboard-feed?source=kb_sources&kete=manaaki
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const ALLOWED_SOURCES = ["weather", "fuel_prices", "compliance_updates", "kb_sources"] as const;
type AllowedSource = typeof ALLOWED_SOURCES[number];

const ALLOWED_KETE = new Set([
  "manaaki", "waihanga", "auaha", "arataki", "pikau", "toro", "hoko", "ako", "whenua", "ora", "kainga",
]);
const ALLOWED_IMPACT = new Set(["low", "medium", "high"]);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      // Edge cache: 5 min, allow stale for 1 hour
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      ...extraHeaders,
    },
  });
}

function clampInt(raw: string | null, def: number, min: number, max: number): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

// ───────────────── Source fetchers ─────────────────

async function fetchWeather(city: string): Promise<unknown> {
  const url = `${SUPABASE_URL}/functions/v1/iot-weather?city=${encodeURIComponent(city)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  if (!res.ok) {
    return { error: `weather fetch failed (${res.status})`, city };
  }
  const data = await res.json();
  return { city, ...data };
}

async function fetchFuelPrices(): Promise<unknown> {
  const url = `${SUPABASE_URL}/functions/v1/nz-fuel-prices`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  if (!res.ok) {
    return { error: `fuel prices fetch failed (${res.status})` };
  }
  return await res.json();
}

async function fetchComplianceUpdates(opts: {
  sinceDays: number;
  impact: string | null;
  industry: string | null;
  limit: number;
}): Promise<unknown> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sinceIso = new Date(Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000).toISOString();

  let q = sb
    .from("compliance_updates")
    .select(
      "id, title, change_summary, impact_level, source_name, source_url, legislation_ref, effective_date, affected_industries, created_at",
    )
    .eq("verified", true)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(opts.limit);

  if (opts.impact && ALLOWED_IMPACT.has(opts.impact)) {
    q = q.eq("impact_level", opts.impact);
  }
  if (opts.industry) {
    q = q.contains("affected_industries", [opts.industry]);
  }

  const { data, error } = await q;
  if (error) return { error: error.message };
  return { updates: data ?? [], since_days: opts.sinceDays };
}

async function fetchKbSources(opts: { kete: string | null; limit: number }): Promise<unknown> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  let q = sb
    .from("kb_sources")
    .select("id, name, type, url, category, subcategory, agent_packs, reliability_score, last_successful_fetch")
    .eq("active", true)
    .order("reliability_score", { ascending: false, nullsFirst: false })
    .limit(opts.limit);

  if (opts.kete && ALLOWED_KETE.has(opts.kete)) {
    q = q.contains("agent_packs", [opts.kete]);
  }
  const { data, error } = await q;
  if (error) return { error: error.message };
  return { sources: data ?? [] };
}

// ───────────────── Handler ─────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") {
    return jsonResponse({ error: "method not allowed — GET only" }, 405);
  }

  try {
    const url = new URL(req.url);
    const source = url.searchParams.get("source");

    // Shared validated params
    const city = (url.searchParams.get("city") || "Auckland").slice(0, 64);
    const sinceDays = clampInt(url.searchParams.get("since_days"), 30, 1, 365);
    const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
    const impact = url.searchParams.get("impact");
    const industry = url.searchParams.get("industry")?.toLowerCase().slice(0, 32) ?? null;
    const kete = url.searchParams.get("kete")?.toLowerCase().slice(0, 32) ?? null;

    // Single-source mode
    if (source) {
      if (!ALLOWED_SOURCES.includes(source as AllowedSource)) {
        return jsonResponse(
          { error: "unknown source", allowed: ALLOWED_SOURCES },
          400,
        );
      }
      let payload: unknown;
      switch (source as AllowedSource) {
        case "weather":
          payload = await fetchWeather(city);
          break;
        case "fuel_prices":
          payload = await fetchFuelPrices();
          break;
        case "compliance_updates":
          payload = await fetchComplianceUpdates({ sinceDays, impact, industry, limit });
          break;
        case "kb_sources":
          payload = await fetchKbSources({ kete, limit });
          break;
      }
      return jsonResponse({
        source,
        generated_at: new Date().toISOString(),
        data: payload,
      });
    }

    // Bundle mode — fetch everything in parallel
    const [weather, fuel, compliance, kb] = await Promise.allSettled([
      fetchWeather(city),
      fetchFuelPrices(),
      fetchComplianceUpdates({ sinceDays, impact, industry, limit: Math.min(limit, 10) }),
      fetchKbSources({ kete, limit: Math.min(limit, 10) }),
    ]);

    const settled = (r: PromiseSettledResult<unknown>) =>
      r.status === "fulfilled" ? r.value : { error: String((r as PromiseRejectedResult).reason) };

    return jsonResponse({
      generated_at: new Date().toISOString(),
      sources_available: ALLOWED_SOURCES,
      params: { city, since_days: sinceDays, impact, industry, kete, limit },
      data: {
        weather: settled(weather),
        fuel_prices: settled(fuel),
        compliance_updates: settled(compliance),
        kb_sources: settled(kb),
      },
    });
  } catch (err) {
    console.error("[dashboard-feed] error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "internal error" },
      500,
    );
  }
});
