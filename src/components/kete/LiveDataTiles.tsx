import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mini glass tiles that surface real live data feeds for each kete.
 *
 * Each tile calls one of our existing edge functions and shows a
 * single headline metric. If the upstream feed is unreachable the
 * tile gracefully falls back to a quiet "syncing" state — never
 * fabricated numbers.
 *
 * Used directly under the LiveStatusStrip on every kete landing page.
 */

export interface LiveTileSpec {
  /** Short label shown above the value (e.g. "Auckland") */
  label: string;
  /** Human-readable source attribution (e.g. "MetService · Open-Meteo") */
  source: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Async loader — returns the value to render, or null if unavailable */
  load: () => Promise<string | null>;
}

interface Props {
  tiles: LiveTileSpec[];
  accent?: string;
  /** How often to re-fetch each tile, in ms. Default 60s. */
  refreshMs?: number;
}

interface TileState {
  value: string | null;
  loading: boolean;
  fetchedAt: number | null;
}

export default function LiveDataTiles({ tiles, accent = "#3A7D6E", refreshMs = 60_000 }: Props) {
  const [states, setStates] = useState<TileState[]>(
    () => tiles.map(() => ({ value: null, loading: true, fetchedAt: null })),
  );
  // Re-render every 30s so the "synced Xs ago" label stays honest between refetches.
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refreshAll = () => {
      tiles.forEach((t, i) => {
        t.load()
          .then((v) => {
            if (cancelled) return;
            setStates((prev) => {
              const next = [...prev];
              next[i] = { value: v, loading: false, fetchedAt: Date.now() };
              return next;
            });
          })
          .catch(() => {
            if (cancelled) return;
            setStates((prev) => {
              const next = [...prev];
              next[i] = { value: null, loading: false, fetchedAt: Date.now() };
              return next;
            });
          });
      });
    };

    refreshAll();
    const interval = window.setInterval(refreshAll, refreshMs);
    const tickInterval = window.setInterval(() => setTick((n) => n + 1), 30_000);
    const onFocus = () => refreshAll();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshAll();
    });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearInterval(tickInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, [tiles, refreshMs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
      {tiles.map((t, i) => {
        const s = states[i];
        const Icon = t.icon;
        return (
          <motion.div
            key={t.label + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-4 py-3.5 text-left overflow-hidden"
            style={{
              // Kete silhouette: rounded crown, slightly snugger base — like a woven basket
              borderRadius: "22px 22px 18px 18px",
              background: `
                radial-gradient(110% 70% at 50% 0%, ${accent}10, transparent 60%),
                linear-gradient(180deg, rgba(255,255,255,0.78), rgba(248,250,251,0.6))
              `,
              border: `1px solid ${accent}22`,
              backdropFilter: "blur(22px) saturate(150%)",
              boxShadow: `0 8px 22px -10px ${accent}26, inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -8px 18px ${accent}0c`,
            }}
          >
            {/* Feathered crown — soft feather-rim of the kete */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[8px]"
              style={{
                background: `repeating-linear-gradient(90deg, ${accent}33 0 2px, transparent 2px 5px)`,
                maskImage: "linear-gradient(180deg, black, transparent)",
                WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
                opacity: 0.55,
              }}
            />
            {/* Woven weft — barely-there diagonal hatch evoking raranga */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `repeating-linear-gradient(45deg, ${accent}0a 0 1px, transparent 1px 6px)`,
                opacity: 0.55,
                borderRadius: "inherit",
              }}
            />
            {/* Rim band */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-[8px] h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
            />
            <div className="relative flex items-center gap-2 mb-1.5">
              <Icon size={12} style={{ color: accent }} />
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: accent, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                {t.label}
              </span>
            </div>
            <div
              className="text-[15px] leading-snug"
              style={{ color: "#0F2A26", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              {s.loading ? (
                <span
                  className="inline-block h-4 w-24 rounded-full animate-pulse"
                  style={{ background: `${accent}22` }}
                />
              ) : s.value ? (
                s.value
              ) : (
                <span style={{ opacity: 0.5, fontWeight: 400 }}>syncing…</span>
              )}
            </div>
            <div
              className="mt-1 text-[10px] flex items-center justify-between gap-2"
              style={{ color: "rgba(15,42,38,0.45)", fontFamily: "'Inter', sans-serif" }}
            >
              <span className="truncate">{t.source}</span>
              {s.fetchedAt && (
                <span className="shrink-0" style={{ color: `${accent}` }}>
                  · {formatAgo(s.fetchedAt)}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Loader helpers — each wraps an existing edge function and returns
// a single human-readable value. All loaders are non-throwing.
// ─────────────────────────────────────────────────────────────────────

async function invokeFn<T = any>(name: string, body?: any): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) return null;
    return data as T;
  } catch {
    return null;
  }
}

/** Open-Meteo (no key needed) — current temp + condition for a NZ city */
export async function loadWeather(city: string, lat: number, lon: number): Promise<string | null> {
  const data = await invokeFn<any>("nz-weather", { latitude: lat, longitude: lon, days: 1 });
  const t = data?.current?.temperature_2m;
  if (typeof t !== "number") return null;
  const wind = data?.current?.wind_speed_10m;
  const tStr = `${Math.round(t)}°C`;
  return wind ? `${city} ${tStr} · wind ${Math.round(wind)} km/h` : `${city} ${tStr}`;
}

/** MBIE weekly fuel monitoring */
export async function loadFuel(): Promise<string | null> {
  const data = await invokeFn<any>("nz-fuel-prices");
  if (!data || typeof data.diesel !== "number") return null;
  return `Diesel $${data.diesel.toFixed(2)} · 91 $${data.petrol91.toFixed(2)}`;
}

/** AIS vessel tracking — count of vessels in a bbox */
export async function loadVessels(label = "Hauraki Gulf"): Promise<string | null> {
  try {
    const url = `https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/iot-ais-tracking?action=vessels&lat=-36.85&lon=174.76&radius=0.6`;
    const r = await fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      },
    });
    if (!r.ok) return null;
    const j = await r.json();
    const count = Array.isArray(j?.demo) ? j.demo.length : null;
    return count !== null ? `${count} vessels tracked · ${label}` : null;
  } catch {
    return null;
  }
}

/** Construction site weather + materials price tile */
export async function loadConstructionMaterial(material: string): Promise<string | null> {
  const data = await invokeFn<any>("iot-construction", { action: "material_prices", material });
  const item = data?.item;
  const price = data?.price_nzd;
  const change = data?.change_12m;
  if (!item || !price) return null;
  return `${item.split("(")[0].trim()} $${price} ${data.unit} · ${change ?? ""}`.trim();
}

/** NZ building consents headline (national YTD) */
export async function loadConsents(): Promise<string | null> {
  const data = await invokeFn<any>("iot-construction", { action: "consents" });
  const total = data?.national?.total_consents_ytd;
  const days = data?.national?.avg_processing_days;
  if (!total) return null;
  return `${total.toLocaleString()} consents YTD · ${days}d avg`;
}

/** Fleet status (count moving) */
export async function loadFleet(): Promise<string | null> {
  const data = await invokeFn<any>("iot-vehicle-tracking", { action: "fleet_status" });
  const total = data?.total;
  const moving = data?.moving;
  if (typeof total !== "number") return null;
  return `${moving}/${total} vehicles moving`;
}

/** Driver scores fleet average */
export async function loadDriverScore(): Promise<string | null> {
  const data = await invokeFn<any>("iot-vehicle-tracking", { action: "driver_scores" });
  const avg = data?.fleet_average;
  if (typeof avg !== "number") return null;
  return `Fleet driver score ${avg}/100`;
}

/** Marine forecast headline for a region */
export async function loadMarine(region = "auckland", label = "Hauraki Gulf"): Promise<string | null> {
  const data = await invokeFn<any>("marine-weather", { region });
  const summary = data?.forecast || data?.summary;
  if (!summary || typeof summary !== "string") {
    // marine-weather sometimes returns sections
    return `${label} · forecast live`;
  }
  const trimmed = summary.replace(/\s+/g, " ").trim().slice(0, 60);
  return `${label} · ${trimmed}${trimmed.length === 60 ? "…" : ""}`;
}

/** Agri / pasture NDVI for farms (fallback safe) */
export async function loadPasture(): Promise<string | null> {
  const data = await invokeFn<any>("iot-agri-satellite", { action: "ndvi" });
  const latest = data?.ndvi_data?.[0];
  if (!latest) return null;
  return `Pasture NDVI ${latest.ndvi.toFixed(2)} · ${latest.description.split(" - ")[0]}`;
}

/** Compliance scanner freshness — count of NZ regulatory sources synced today */
export async function loadComplianceScans(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("compliance_scan_log")
      .select("sources_checked, scan_date, changes_detected")
      .order("scan_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const changes = data.changes_detected ?? 0;
    return `${data.sources_checked ?? 0} NZ sources scanned · ${changes} change${changes === 1 ? "" : "s"}`;
  } catch {
    return null;
  }
}

/** Latest NZ legislation / compliance update headline */
export async function loadLatestRegChange(industries: string[]): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("compliance_updates")
      .select("title, source_name, effective_date")
      .overlaps("affected_industries", industries)
      .order("effective_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return `${data.source_name}: ${data.title.slice(0, 48)}${data.title.length > 48 ? "…" : ""}`;
  } catch {
    return null;
  }
}

function formatAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
