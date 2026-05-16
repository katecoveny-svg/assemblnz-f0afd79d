'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MapPin, Fuel, Clock, TrendingDown } from 'lucide-react';

interface LatLon { lat: number; lon: number; label: string; }

interface RouteResponse {
  distanceKm: number;
  durationMins: number;
  source: string;
  fuel: {
    kind: string;
    pricePerUnit: number;
    unit: 'L' | 'kWh';
    unitsRequired: number;
    costNzd: number;
    pricedAt: string;
    priceSource: string;
  };
  stations: Array<{
    name: string;
    brand: string;
    pricePerL: number;
    source: 'live' | 'estimated';
    detourKm?: number;
  }>;
  potentialSavingNzd: number;
  summary: string;
}

// Curated demo presets — common NZ routes families actually run. Real product
// pre-geocodes the user's saved addresses via Mapbox or the browser geocoder.
const PRESETS: Array<{ label: string; origin: LatLon; destination: LatLon }> = [
  {
    label: 'School run · Sandringham → Auckland Grammar',
    origin:      { lat: -36.886, lon: 174.738, label: 'Sandringham' },
    destination: { lat: -36.872, lon: 174.776, label: 'Auckland Grammar' },
  },
  {
    label: 'Weekly groceries · Pt Chev → Lynfield PaknSave',
    origin:      { lat: -36.864, lon: 174.704, label: 'Point Chevalier' },
    destination: { lat: -36.913, lon: 174.706, label: 'PaknSave Lynfield' },
  },
  {
    label: 'Weekend whānau trip · Auckland → Hamilton',
    origin:      { lat: -36.848, lon: 174.763, label: 'Auckland CBD' },
    destination: { lat: -37.787, lon: 175.279, label: 'Hamilton CBD' },
  },
  {
    label: 'Long weekend · Wellington → Taupō',
    origin:      { lat: -41.286, lon: 174.776, label: 'Wellington' },
    destination: { lat: -38.687, lon: 176.071, label: 'Taupō' },
  },
];

const VEHICLES = [
  { value: 'petrol_91',  label: '91 · 7.5 L/100km',  kind: 'petrol_91', consumption: 7.5 },
  { value: 'petrol_95',  label: '95 · 7.5 L/100km',  kind: 'petrol_95', consumption: 7.5 },
  { value: 'diesel',     label: 'Diesel · 6.0 L/100km', kind: 'diesel',  consumption: 6.0 },
  { value: 'ev',         label: 'EV · 18 kWh/100km',   kind: 'ev',      consumption: 18 },
] as const;

export function RoutePlanner() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [oneWay, setOneWay] = useState(false); // default = round-trip; family use-case
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function plan() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const preset = PRESETS[presetIdx];
      const vehicle = VEHICLES[vehicleIdx];
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) {
        setError('Supabase URL not configured. The route + fuel agent runs through an edge function — set NEXT_PUBLIC_SUPABASE_URL.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${url}/functions/v1/agent-toro-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: preset.origin,
          destination: preset.destination,
          vehicle: {
            kind: vehicle.kind,
            consumptionPer100: vehicle.consumption,
            label: vehicle.label,
          },
          oneWay,
        }),
      });
      if (!res.ok) {
        const readText = res.text?.bind(res);
        const txt = readText ? await readText() : '';
        setError(`Agent returned ${res.status}: ${txt.slice(0, 200)}`);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as RouteResponse;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-white/50 p-6 md:p-8"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Tōro · Plan the next trip
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Where to" hint="School run, supermarket, weekend trip — pick a preset">
            <select
              className="route-input"
              value={presetIdx}
              onChange={(e) => setPresetIdx(parseInt(e.target.value, 10))}
            >
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Vehicle" hint="The car the trip is in">
            <select
              className="route-input"
              value={vehicleIdx}
              onChange={(e) => setVehicleIdx(parseInt(e.target.value, 10))}
            >
              {VEHICLES.map((v, i) => (
                <option key={i} value={i}>{v.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-[color:var(--text-body)]">
            <input
              type="checkbox"
              checked={!oneWay}
              onChange={(e) => setOneWay(!e.target.checked)}
              className="h-4 w-4 accent-[color:var(--assembl-pounamu)]"
            />
            Return trip
          </label>
          <button
            type="button"
            onClick={plan}
            disabled={loading}
            className="cta-primary inline-flex h-11 items-center px-6 text-sm"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Asking the agent…' : 'Plan the trip'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-[6px] border border-[rgba(163,59,44,0.30)] bg-[rgba(163,59,44,0.04)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--draft-red,#A33B2C)]">
              Agent unavailable
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{error}</p>
            <p className="mt-2 text-xs text-[color:var(--text-tertiary,#8E8A82)]">
              Deploy <code>supabase/functions/agent-toro-route</code> and ensure{' '}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> is set in the environment.
            </p>
          </motion.div>
        )}

        {result && (
          <motion.section
            key={result.summary}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 rounded-[10px] border border-[rgba(43,107,87,0.30)] bg-[rgba(43,107,87,0.04)] p-7 md:p-10"
          >
            {/* Plain-language summary — the line the parent reads first */}
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Tōro · Trip plan
            </p>
            <p
              className="mt-4 font-display leading-snug"
              style={{ fontWeight: 300, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
            >
              {result.summary}
            </p>

            {/* The receipts */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Stat
                icon={<MapPin className="h-4 w-4" />}
                label="Distance"
                value={`${result.distanceKm.toFixed(1)} km`}
                sub={`routed via ${result.source.replace('_', ' ')}`}
              />
              <Stat
                icon={<Clock className="h-4 w-4" />}
                label="Time"
                value={formatTime(result.durationMins)}
                sub={oneWay ? 'one-way drive' : 'one way · return doubles'}
              />
              <Stat
                icon={<Fuel className="h-4 w-4" />}
                label="Fuel cost"
                value={`$${result.fuel.costNzd.toFixed(2)}`}
                sub={`${result.fuel.unitsRequired.toFixed(1)} ${result.fuel.unit} @ $${result.fuel.pricePerUnit.toFixed(2)}/${result.fuel.unit}`}
              />
            </div>

            {/* Stations */}
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Cheaper nearby
                </p>
              </div>
              <ul className="mt-3 divide-y divide-[rgba(35,33,31,0.08)]">
                {result.stations.slice(0, 4).map((s) => (
                  <li key={s.name} className="flex items-baseline justify-between py-3">
                    <div>
                      <p className="text-sm text-[color:var(--text-primary)]">{s.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-tertiary,#8E8A82)]">
                        {s.brand} · {s.source === 'estimated' ? 'estimated' : 'live'}
                        {typeof s.detourKm === 'number' && ` · +${s.detourKm.toFixed(1)} km`}
                      </p>
                    </div>
                    <p
                      className="font-mono text-sm tabular-nums"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      ${s.pricePerL.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              {result.potentialSavingNzd >= 1 && (
                <p className="mt-4 text-sm text-[color:var(--assembl-pounamu)]">
                  Potential saving on this fill: <strong>${result.potentialSavingNzd.toFixed(2)}</strong>
                </p>
              )}
            </div>

            {/* Honest source line */}
            <p className="mt-8 border-t border-[rgba(35,33,31,0.08)] pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-tertiary,#8E8A82)]">
              Fuel · {result.fuel.priceSource.replace('_', ' ')} ({result.fuel.pricedAt}) · Routing · {result.source.replace('_', ' ')} · Stations · estimated until partnerships land
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <style jsx>{`
        .route-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(35, 33, 31, 0.15);
          background: #FAF7F2;
          border-radius: 6px;
          font-size: 0.92rem;
          font-family: 'Inter', sans-serif;
          color: #23211F;
        }
        .route-input:focus {
          outline: 2px solid rgba(43, 107, 87, 0.45);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
      <span className="mt-2 block text-[11px] leading-relaxed text-[color:var(--text-tertiary,#8E8A82)]">
        {hint}
      </span>
    </label>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[color:var(--assembl-pounamu)]">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">{label}</span>
      </div>
      <p
        className="mt-3 font-display tabular-nums tracking-tight"
        style={{ fontWeight: 300, fontSize: '2rem', lineHeight: 1.05, color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[color:var(--text-tertiary,#8E8A82)]">{sub}</p>
    </div>
  );
}

function formatTime(mins: number): string {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  if (hh === 0) return `${mm} min`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}m`;
}
