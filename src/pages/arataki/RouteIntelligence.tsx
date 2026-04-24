import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Cloud, AlertTriangle, Clock, Loader2, Wifi } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import {
  useRouteIntelligence,
  formatDuration,
  type RoutePlanInput,
} from "@/hooks/useRouteIntelligence";

// ─── Fleet routes wired to live nz-routes + iot-weather ────────
const FLEET_ROUTES: Array<RoutePlanInput & { fuelStop: string; staticAlerts: { type: string; location: string; detail: string }[] }> = [
  {
    id: "akl-taupo-napier",
    label: "Auckland → Taupō → Napier",
    waypoints: [
      { name: "Auckland", lat: -36.8485, lon: 174.7633 },
      { name: "Hamilton", lat: -37.7870, lon: 175.2793 },
      { name: "Taupō", lat: -38.6857, lon: 176.0702 },
      { name: "Napier", lat: -39.4928, lon: 176.9120 },
    ],
    staticAlerts: [
      { type: "roadworks", location: "Huntly", detail: "SH1 reduced to single lane. 15min delay expected." },
      { type: "weather", location: "Taupō–Napier", detail: "Reduce speed on SH5 if rain forecast." },
    ],
    fuelStop: "Gull Taupō — $2.419/L diesel",
  },
  {
    id: "wlg-pmr",
    label: "Wellington → Palmerston North",
    waypoints: [
      { name: "Wellington", lat: -41.2865, lon: 174.7762 },
      { name: "Levin", lat: -40.6217, lon: 175.2832 },
      { name: "Palmerston North", lat: -40.3523, lon: 175.6082 },
    ],
    staticAlerts: [
      { type: "wind", location: "Remutaka Hill", detail: "Strong northerly gusts. High-sided vehicles take care." },
    ],
    fuelStop: "Z Levin — $2.439/L diesel",
  },
];

function RouteCard({ plan, fuelStop, staticAlerts, index }: {
  plan: RoutePlanInput;
  fuelStop: string;
  staticAlerts: { type: string; location: string; detail: string }[];
  index: number;
}) {
  const live = useRouteIntelligence(plan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(142,129,119,0.14)", backdropFilter: "blur(24px)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "#3D4250" }}>{plan.label}</h3>
        <div className="flex gap-4 text-xs" style={{ color: "#6F6158" }}>
          {live.loading ? (
            <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Loading live data…</span>
          ) : (
            <>
              <span>{live.distanceKm !== null ? `${live.distanceKm} km` : "—"}</span>
              <span className="flex items-center gap-1"><Clock size={10} />{formatDuration(live.durationMins)}</span>
              <span className="flex items-center gap-1 opacity-60"><Wifi size={10} />{live.routeSource === "mapbox" ? "live" : "fallback"}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {live.weather.map((w) => (
          <div key={w.location} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" style={{ background: "rgba(216,200,180,0.18)" }}>
            <Cloud size={12} style={{ color: "#4AA5A8" }} />
            <span style={{ color: "#6F6158" }}>{w.location}:</span>
            <span style={{ color: "#3D4250" }}>
              {w.condition}{w.tempC !== null ? ` ${w.tempC}°C` : ""}
              {w.windKmh !== null && w.windKmh > 25 ? ` · wind ${w.windKmh}km/h` : ""}
            </span>
          </div>
        ))}
      </div>

      {staticAlerts.map((a, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(217,188,122,0.10)", border: "1px solid rgba(217,188,122,0.25)" }}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#D9BC7A" }} />
          <div>
            <span className="text-xs font-semibold" style={{ color: "#9D8C7D" }}>{a.location}</span>
            <p className="text-xs" style={{ color: "#6F6158" }}>{a.detail}</p>
          </div>
        </div>
      ))}

      <div className="mt-3 text-xs" style={{ color: "#3A7D6E" }}>⛽ Recommended fuel stop: {fuelStop}</div>

      {live.error && (
        <div className="mt-3 text-xs italic" style={{ color: "#9D8C7D" }}>
          Live data partially unavailable — {live.error}. Showing cached estimates.
        </div>
      )}
    </motion.div>
  );
}

export default function RouteIntelligence() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#3D4250" }}>
      <SEO title="Route Intelligence | Arataki | assembl" description="Live NZ weather, roadworks, closures integrated into fleet trip planning." />
      <BrandNav />
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-32">
        <Link to="/arataki" className="text-xs mb-6 inline-block" style={{ color: "#9D8C7D" }}>← Back to Arataki</Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-light mb-3 font-display"
          style={{ color: "#6F6158" }}
        >
          <MapPin className="inline mr-3" size={28} style={{ color: "#4AA5A8" }} />Route Intelligence
        </motion.h1>
        <p className="mb-10 max-w-xl" style={{ color: "#6F6158" }}>
          Live NZ weather, roadworks, and closures integrated into fleet trip planning. Distances and ETAs from MapBox; weather from OpenWeatherMap.
        </p>

        <div className="space-y-8">
          {FLEET_ROUTES.map((route, ri) => (
            <RouteCard
              key={route.id}
              plan={route}
              fuelStop={route.fuelStop}
              staticAlerts={route.staticAlerts}
              index={ri}
            />
          ))}
        </div>
      </main>
      <BrandFooter />
    </div>
  );
}
