import React from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * LiveDataRibbon — kete-aware live signal strip.
 * Each kete gets domain-relevant live data:
 *   • manaaki  → weather, bookings 7d, NZ time
 *   • waihanga → weather, subbie compliance reds, fuel diesel, NZ time
 *   • auaha    → content drafts 7d, NZD/USD, NZ time
 *   • arataki  → fuel petrol91+diesel, NZD/USD, NZ time
 *   • toro     → weather, NZ time, NZD/USD
 *   • pikau    → action queue today, NZ time, NZD/USD
 *   • default  → weather, evidence packs 24h, NZ time, NZD/USD
 * All sources keyless or already wired (Open-Meteo, Frankfurter, MBIE, Supabase).
 */

type KeteKey =
  | "manaaki" | "waihanga" | "auaha" | "arataki"
  | "toro" | "pikau" | "te-kahui-reo" | "auraki" | "default";

interface Tick {
  id: string;
  label: string;
  value: string;
  tone: "teal" | "ochre" | "lavender" | "info" | "neutral" | "warning";
  sigil: React.ReactNode;
}

const TONE: Record<Tick["tone"], { fg: string; rgb: string }> = {
  teal:     { fg: "#1F6F71", rgb: "74,165,168" },
  ochre:    { fg: "#7E5612", rgb: "232,169,72" },
  lavender: { fg: "#5A4E84", rgb: "155,143,191" },
  info:     { fg: "#2E4A6B", rgb: "90,122,156" },
  neutral:  { fg: "#3D4250", rgb: "31,35,48" },
  warning:  { fg: "#8C2A2A", rgb: "200,80,80" },
};

const sigil = {
  weather: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <circle cx="11" cy="6" r="2.4" fill="currentColor" opacity="0.85" />
      <path d="M3 11 Q3 8 6 8 Q7 6 9 7 Q12 7 12 10 Q12 13 9 13 L5 13 Q3 13 3 11 Z" fill="currentColor" />
    </svg>
  ),
  fx: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 12 L7 6 L10 9 L13 4" />
      <path d="M10 4 L13 4 L13 7" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 8 L5 8 L7 4 L9 12 L11 8 L14 8" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5 L8 8 L10.5 9.5" strokeLinecap="round" />
    </svg>
  ),
  fuel: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="6" height="11" rx="0.8" />
      <path d="M9 6 L11.5 6 L11.5 11 Q11.5 12.5 13 12.5" strokeLinecap="round" />
      <path d="M5 6 L7 6" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 2 L13 4 L13 9 Q13 12.5 8 14 Q3 12.5 3 9 L3 4 Z" />
      <path d="M6 8 L7.5 9.5 L10 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bed: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 12 L2 6 L8 6 Q11 6 11 9 L14 9 L14 12" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 2 L8 6 M8 10 L8 14 M2 8 L6 8 M10 8 L14 8 M4 4 L6 6 M10 10 L12 12 M12 4 L10 6 M6 10 L4 12" strokeLinecap="round" />
    </svg>
  ),
  task: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
      <path d="M5.5 8.5 L7.5 10.5 L11 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function wmoShort(code?: number): string {
  if (code == null) return "—";
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloud";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow";
  if (code <= 99) return "Storm";
  return "—";
}

// ─── Live data fetchers (cached per page load) ───────────────────────────
const _cache = new Map<string, { value: any; t: number }>();
const TTL = 5 * 60 * 1000;

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.value as T;
  try {
    const v = await fn();
    _cache.set(key, { value: v, t: Date.now() });
    return v;
  } catch { return null; }
}

async function fetchWeather() {
  return cached("wx", async () => {
    const { data } = await supabase.functions.invoke("nz-weather", {
      body: { latitude: -36.85, longitude: 174.76, days: 1 },
    });
    return {
      temp: data?.current?.temperature_2m as number | undefined,
      code: data?.current?.weather_code as number | undefined,
    };
  });
}

async function fetchFx() {
  return cached("fx", async () => {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=NZD&symbols=USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.rates?.USD as number | undefined;
  });
}

async function fetchFuel() {
  return cached("fuel", async () => {
    const { data } = await supabase.functions.invoke("nz-fuel-prices", { body: {} });
    return data as { petrol91?: number; diesel?: number } | null;
  });
}

async function countSince(table: string, hours: number) {
  return cached(`${table}:${hours}`, async () => {
    const { count } = await supabase
      .from(table as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - hours * 3600 * 1000).toISOString());
    return count ?? 0;
  });
}

async function countSubbieReds() {
  return cached("subbie_reds", async () => {
    const { count } = await supabase
      .from("subcontractor_compliance" as any)
      .select("id", { count: "exact", head: true })
      .in("status", ["red", "black"]);
    return count ?? 0;
  });
}

async function countTodayTasks() {
  return cached("tasks_today", async () => {
    const { count } = await supabase
      .from("action_queue" as any)
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return count ?? 0;
  });
}

// ─── Per-kete tick builders ──────────────────────────────────────────────
function nzTimeTick(): Tick {
  const now = new Date().toLocaleTimeString("en-NZ", {
    hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland",
  });
  return { id: "tz", label: "Pacific/Auckland", value: now, tone: "neutral", sigil: sigil.time };
}

async function buildTicks(kete: KeteKey): Promise<Tick[]> {
  const ticks: Tick[] = [];

  // Weather (most kete care)
  if (["manaaki", "waihanga", "toro", "default"].includes(kete)) {
    const wx = await fetchWeather();
    if (wx?.temp != null) {
      ticks.push({
        id: "wx", label: "Auckland",
        value: `${Math.round(wx.temp)}°C · ${wmoShort(wx.code)}`,
        tone: "info", sigil: sigil.weather,
      });
    }
  }

  // Kete-specific business pulse
  if (kete === "manaaki") {
    const n = await countSince("bookings", 24 * 7);
    if (n != null) ticks.push({
      id: "bk", label: "Bookings · 7d", value: `${n}`,
      tone: "teal", sigil: sigil.bed,
    });
  }
  if (kete === "waihanga") {
    const reds = await countSubbieReds();
    if (reds != null) ticks.push({
      id: "subbie", label: "Subbies · red/black", value: `${reds}`,
      tone: reds > 0 ? "warning" : "teal", sigil: sigil.shield,
    });
    const fuel = await fetchFuel();
    if (fuel?.diesel) ticks.push({
      id: "diesel", label: "Diesel · NZ avg", value: `$${fuel.diesel.toFixed(2)}/L`,
      tone: "ochre", sigil: sigil.fuel,
    });
  }
  if (kete === "auaha") {
    const n = await countSince("content_items", 24 * 7);
    if (n != null) ticks.push({
      id: "ct", label: "Content drafts · 7d", value: `${n}`,
      tone: "lavender", sigil: sigil.spark,
    });
  }
  if (kete === "arataki") {
    const fuel = await fetchFuel();
    if (fuel?.petrol91) ticks.push({
      id: "p91", label: "Petrol 91", value: `$${fuel.petrol91.toFixed(2)}/L`,
      tone: "ochre", sigil: sigil.fuel,
    });
    if (fuel?.diesel) ticks.push({
      id: "diesel", label: "Diesel", value: `$${fuel.diesel.toFixed(2)}/L`,
      tone: "ochre", sigil: sigil.fuel,
    });
  }
  if (kete === "pikau") {
    const n = await countTodayTasks();
    if (n != null) ticks.push({
      id: "tasks", label: "Open actions", value: `${n}`,
      tone: n > 0 ? "ochre" : "teal", sigil: sigil.task,
    });
  }
  if (kete === "default") {
    const n = await countSince("aaaip_audit_exports", 24);
    if (n != null) ticks.push({
      id: "ev", label: "Evidence packs · 24h", value: `${n}`,
      tone: "teal", sigil: sigil.pulse,
    });
  }

  // NZ time always
  ticks.push(nzTimeTick());

  // FX (most kete care, except waihanga which prefers diesel)
  if (kete !== "waihanga") {
    const usd = await fetchFx();
    if (usd != null) ticks.push({
      id: "fx", label: "NZD/USD", value: usd.toFixed(4),
      tone: "ochre", sigil: sigil.fx,
    });
  }

  return ticks;
}

// ─── Component ───────────────────────────────────────────────────────────
export default function LiveDataRibbon({
  accent = "#4AA5A8",
  kete = "default",
}: {
  accent?: string;
  kete?: KeteKey;
}) {
  const [ticks, setTicks] = React.useState<Tick[]>([
    { id: "boot", label: "Live signals", value: "syncing…", tone: "neutral", sigil: sigil.pulse },
  ]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await buildTicks(kete);
      if (!cancelled && next.length) setTicks(next);
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [kete]);

  const rgb = hexRgb(accent);
  return (
    <div
      className="relative overflow-hidden px-5 py-3 flex items-center gap-1"
      style={{
        // Kete silhouette: gently rounded base, softer crown — like a woven basket rim
        borderRadius: "28px 28px 22px 22px",
        background: `
          radial-gradient(120% 80% at 50% 0%, rgba(${rgb},0.08), transparent 65%),
          linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,251,0.78))
        `,
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.95),
          inset 0 -10px 22px rgba(${rgb},0.05),
          0 8px 22px rgba(31,35,48,0.07),
          0 0 30px rgba(${rgb},0.12)
        `,
      }}
    >
      {/* Feathered crown — evokes the soft feather rim of the kete */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[10px]"
        style={{
          background: `repeating-linear-gradient(90deg, rgba(${rgb},0.18) 0 2px, transparent 2px 6px)`,
          maskImage: "linear-gradient(180deg, black, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
          opacity: 0.55,
        }}
      />
      {/* Rim accent — the woven harakeke band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-[10px] h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb},0.45), transparent)` }}
      />
      {/* Woven weft — barely-there diagonal hatch evoking raranga */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `repeating-linear-gradient(45deg, rgba(${rgb},0.04) 0 1px, transparent 1px 7px)`,
          opacity: 0.5,
          borderRadius: "inherit",
        }}
      />
      {/* Soft basket-base shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-[6px]"
        style={{
          background: `radial-gradient(60% 100% at 50% 100%, rgba(${rgb},0.18), transparent 70%)`,
          filter: "blur(2px)",
        }}
      />
      <div className="relative flex items-center gap-5 whitespace-nowrap animate-[ribbon_42s_linear_infinite]">
        {[...ticks, ...ticks].map((t, i) => {
          const tone = TONE[t.tone];
          return (
            <span key={`${t.id}-${i}`} className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-[8px]"
                style={{
                  background: `rgba(${tone.rgb},0.12)`,
                  color: tone.fg,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 0 10px rgba(${tone.rgb},0.25)`,
                }}
              >
                {t.sigil}
              </span>
              <span className="text-[11px] tracking-[0.5px] uppercase" style={{ color: "#6B7280" }}>{t.label}</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "#1A1D29", fontFamily: "'JetBrains Mono', monospace" }}>
                {t.value}
              </span>
              <span className="opacity-30" style={{ color: "#6B7280" }}>·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function hexRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
