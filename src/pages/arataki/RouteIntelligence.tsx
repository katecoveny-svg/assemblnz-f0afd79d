import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Cloud, AlertTriangle, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const ROUTES = [
  {
    name: "Auckland → Taupō → Napier",
    distance: "457 km", eta: "5h 40m",
    weather: [
      { location: "Auckland", condition: "Fine", temp: "22°C" },
      { location: "Hamilton", condition: "Cloudy", temp: "19°C" },
      { location: "Taupō", condition: "Rain from 2pm", temp: "14°C" },
      { location: "Napier", condition: "Showers", temp: "16°C" },
    ],
    alerts: [
      { type: "roadworks", location: "Huntly", detail: "SH1 reduced to single lane. 15min delay expected." },
      { type: "weather", location: "Taupō–Napier", detail: "Heavy rain forecast from 2pm. Reduce speed on SH5 Napier–Taupō road." },
    ],
    fuelStop: "Gull Taupō — $2.419/L diesel",
  },
  {
    name: "Wellington → Palmerston North",
    distance: "143 km", eta: "1h 55m",
    weather: [
      { location: "Wellington", condition: "Windy", temp: "15°C" },
      { location: "Levin", condition: "Fine", temp: "18°C" },
      { location: "Palmerston North", condition: "Fine", temp: "20°C" },
    ],
    alerts: [
      { type: "wind", location: "Remutaka Hill", detail: "Strong northerly gusts. High-sided vehicles take care." },
    ],
    fuelStop: "Z Levin — $2.439/L diesel",
  },
];

export default function RouteIntelligence() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#3D4250" }}>
      <SEO title="Route Intelligence | Arataki | assembl" description="Live NZ weather, roadworks, closures integrated into fleet trip planning." />
      <BrandNav />
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-32">
        <Link to="/arataki" className="text-xs text-white/40 hover:text-white/60 mb-6 inline-block">← Back to Arataki</Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Lato', sans-serif" }}>
          <MapPin className="inline mr-3 text-blue-400" size={28} />Route Intelligence
        </motion.h1>
        <p className="text-gray-500 mb-10 max-w-xl">Live NZ weather, roadworks, and closures integrated into trip planning.</p>

        <div className="space-y-8">
          {ROUTES.map((route, ri) => (
            <motion.div key={route.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.15 }}
              className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">{route.name}</h3>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>{route.distance}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{route.eta}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {route.weather.map(w => (
                  <div key={w.location} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Cloud size={12} className="text-blue-300" />
                    <span className="text-white/60">{w.location}:</span>
                    <span className="text-white/80">{w.condition} {w.temp}</span>
                  </div>
                ))}
              </div>

              {route.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-amber-300">{a.location}</span>
                    <p className="text-xs text-gray-500">{a.detail}</p>
                  </div>
                </div>
              ))}

              <div className="mt-3 text-xs text-emerald-400">⛽ Recommended fuel stop: {route.fuelStop}</div>
            </motion.div>
          ))}
        </div>
      </main>
      <BrandFooter />
    </div>
  );
}
