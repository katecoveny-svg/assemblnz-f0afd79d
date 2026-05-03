import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Cloud, Clock, Loader2, Wifi, Car } from "lucide-react";
import {
  useRouteIntelligence,
  formatDuration,
  type RoutePlanInput,
} from "@/hooks/useRouteIntelligence";

// Mārama palette — keeps Tōro on-brand
const ACCENT = "#9D8C7D";
const INK = "#6F6158";
const SPARKLE = "#D9BC7A";

// Whānau-friendly preset trips (school runs + holiday road-trips)
const FAMILY_ROUTES: Array<RoutePlanInput & { context: string }> = [
  {
    id: "school-run-ponsonby-greylynn",
    label: "Ponsonby → Grey Lynn (school run)",
    context: "Morning school drop-off — typical 12 minute trip; check for rain so the kids have raincoats.",
    waypoints: [
      { name: "Ponsonby", lat: -36.8553, lon: 174.7378 },
      { name: "Grey Lynn", lat: -36.8617, lon: 174.7387 },
    ],
  },
  {
    id: "akl-coromandel",
    label: "Auckland → Whitianga (long weekend)",
    context: "Holiday weekend drive to the Coromandel. Watch for SH25A reroute and afternoon showers.",
    waypoints: [
      { name: "Auckland", lat: -36.8485, lon: 174.7633 },
      { name: "Thames", lat: -37.1380, lon: 175.5391 },
      { name: "Whitianga", lat: -36.8331, lon: 175.7068 },
    ],
  },
  {
    id: "wlg-tauwharanui",
    label: "Hamilton → Tauranga (weekend with cousins)",
    context: "Two-family convoy — pick a fuel stop in Matamata if the kids need a break.",
    waypoints: [
      { name: "Hamilton", lat: -37.7870, lon: 175.2793 },
      { name: "Matamata", lat: -37.8093, lon: 175.7757 },
      { name: "Tauranga", lat: -37.6878, lon: 176.1651 },
    ],
  },
];

function FamilyRouteCard({ plan, context, index }: {
  plan: RoutePlanInput;
  context: string;
  index: number;
}) {
  const live = useRouteIntelligence(plan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      className="rounded-3xl p-6"
      style={{
        background: "white",
        border: `1px solid ${ACCENT}25`,
        boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-4">
        <div>
          <h3 className="font-display text-xl mb-1" style={{ fontWeight: 400, color: INK }}>{plan.label}</h3>
          <p className="text-xs leading-relaxed max-w-md" style={{ color: ACCENT }}>{context}</p>
        </div>
        <div className="text-right text-xs space-y-1 shrink-0" style={{ color: INK }}>
          {live.loading ? (
            <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Loading…</span>
          ) : (
            <>
              <div>{live.distanceKm !== null ? `${live.distanceKm} km` : "—"}</div>
              <div className="flex items-center gap-1 justify-end"><Clock size={10} />{formatDuration(live.durationMins)}</div>
              <div className="flex items-center gap-1 justify-end opacity-60"><Wifi size={10} />{live.routeSource === "mapbox" ? "live" : "fallback"}</div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {live.weather.map((w) => (
          <div
            key={w.location}
            className="px-3 py-1.5 rounded-2xl text-xs flex items-center gap-2"
            style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}
          >
            <Cloud size={12} style={{ color: SPARKLE }} />
            <span style={{ color: ACCENT }}>{w.location}:</span>
            <span style={{ color: INK }}>
              {w.condition}{w.tempC !== null ? ` ${w.tempC}°C` : ""}
              {w.windKmh !== null && w.windKmh > 25 ? ` · wind ${w.windKmh}km/h` : ""}
            </span>
          </div>
        ))}
      </div>

      {live.error && (
        <p className="mt-3 text-xs italic" style={{ color: ACCENT }}>
          Live feed partially unavailable — showing cached estimates.
        </p>
      )}
    </motion.div>
  );
}

export default function ToroaRoutePage() {
  return (
    <main className="min-h-screen" style={{ background: "transparent" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
        <Link to="/toro/dashboard" className="inline-flex items-center gap-2 text-sm hover:opacity-70 mb-8" style={{ color: ACCENT }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tōro
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}
            >
              <MapPin className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Tōro · Route Intelligence</p>
              <h1 className="font-display text-3xl sm:text-4xl" style={{ fontWeight: 300, color: INK }}>
                Whānau road-trip planner
              </h1>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: ACCENT }}>
            Live NZ weather and drive times for school runs, weekend escapes and family convoys. Same intelligence the ARATAKI fleet kete uses — surfaced for the household.
          </p>
        </header>

        <div className="space-y-5">
          {FAMILY_ROUTES.map((route, i) => (
            <FamilyRouteCard key={route.id} plan={route} context={route.context} index={i} />
          ))}
        </div>

        <div
          className="mt-10 rounded-2xl p-5 text-xs flex items-start gap-3"
          style={{ background: `${SPARKLE}12`, border: `1px solid ${SPARKLE}30`, color: INK }}
        >
          <Car size={14} style={{ color: SPARKLE }} className="mt-0.5 shrink-0" />
          <p>
            Tip: Tōro can text you a weather and traffic check 30 minutes before any saved trip. Reply <strong>ROUTE</strong> to your Tōro number to get one on demand.
          </p>
        </div>
      </div>
    </main>
  );
}
