import React from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * LiveDataRibbon — thin, always-on cinematic strip across the top of every
 * kete dashboard. Pulls real signals: NZ marine/city weather, NZD/USD FX,
 * platform compliance pulse. Falls back gracefully when offline.
 *
 * No emojis. No lucide. Each pulse has a hand-built SVG sigil.
 */

interface Tick {
  id: string;
  label: string;
  value: string;
  tone: "teal" | "ochre" | "lavender" | "info" | "neutral";
  sigil: React.ReactNode;
}

const TONE: Record<Tick["tone"], { fg: string; rgb: string }> = {
  teal:     { fg: "#1F6F71", rgb: "74,165,168" },
  ochre:    { fg: "#7E5612", rgb: "232,169,72" },
  lavender: { fg: "#5A4E84", rgb: "155,143,191" },
  info:     { fg: "#2E4A6B", rgb: "90,122,156" },
  neutral:  { fg: "#3D4250", rgb: "31,35,48" },
};

// Custom SVG sigils — never lucide
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

export default function LiveDataRibbon({ accent = "#4AA5A8" }: { accent?: string }) {
  const [ticks, setTicks] = React.useState<Tick[]>([
    { id: "boot", label: "Live signals", value: "syncing…", tone: "neutral", sigil: sigil.pulse },
  ]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next: Tick[] = [];

      // 1. Weather (Auckland) — keyless Open-Meteo via nz-weather edge fn
      try {
        const { data } = await supabase.functions.invoke("nz-weather", {
          body: { latitude: -36.85, longitude: 174.76, days: 1 },
        });
        const t = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (typeof t === "number") {
          next.push({
            id: "wx",
            label: "Auckland",
            value: `${Math.round(t)}°C · ${wmoShort(code)}`,
            tone: "info",
            sigil: sigil.weather,
          });
        }
      } catch { /* swallow */ }

      // 2. Compliance pulse — real Supabase query
      try {
        const { count } = await supabase
          .from("exported_outputs")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
        next.push({
          id: "pulse",
          label: "Evidence packs · 24h",
          value: `${count ?? 0}`,
          tone: "teal",
          sigil: sigil.pulse,
        });
      } catch { /* swallow */ }

      // 3. NZ local time
      const now = new Date().toLocaleTimeString("en-NZ", {
        hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland",
      });
      next.push({ id: "tz", label: "Pacific/Auckland", value: now, tone: "neutral", sigil: sigil.time });

      // 4. NZD/USD — live keyless FX (Frankfurter, ECB-sourced)
      try {
        const res = await fetch("https://api.frankfurter.dev/v1/latest?base=NZD&symbols=USD", {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const j = await res.json();
          const rate = j?.rates?.USD;
          if (typeof rate === "number") {
            next.push({
              id: "fx",
              label: "NZD/USD",
              value: rate.toFixed(4),
              tone: "ochre",
              sigil: sigil.fx,
            });
          }
        }
      } catch { /* swallow */ }

      if (!cancelled && next.length) setTicks(next);
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const rgb = hexRgb(accent);
  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-4 py-2.5 flex items-center gap-1"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 18px rgba(31,35,48,0.06), 0 0 28px rgba(${rgb},0.12)`,
      }}
    >
      {/* Marquee track */}
      <div className="flex items-center gap-5 whitespace-nowrap animate-[ribbon_42s_linear_infinite]">
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
