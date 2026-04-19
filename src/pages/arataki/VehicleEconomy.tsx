import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, DollarSign } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

export default function VehicleEconomy() {
  const [km, setKm] = useState(25000);
  const [fuelPrice, setFuelPrice] = useState(2.45);
  const [consumption, setConsumption] = useState(8.5);

  const fuelCost = (km / 100) * consumption * fuelPrice;
  const ruc = (km / 1000) * 76;
  const depreciation = km * 0.12;
  const maintenance = km * 0.08;
  const insurance = 1800;
  const total = fuelCost + ruc + depreciation + maintenance + insurance;
  const perKm = total / km;

  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#3D4250" }}>
      <SEO title="Vehicle Economy Calculator | Arataki | assembl" description="Real-world per-km cost including RUC, depreciation, maintenance, insurance for NZ fleets." />
      <BrandNav />
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        <Link to="/arataki" className="text-xs text-white/40 hover:text-white/60 mb-6 inline-block">← Back to Arataki</Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Lato', sans-serif" }}>
          <Calculator className="inline mr-3 text-amber-400" size={28} />Vehicle Economy Calculator
        </motion.h1>
        <p className="text-gray-500 mb-10 max-w-xl">Real-world per-km cost including fuel, RUC, depreciation, maintenance, and insurance.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {[
              { label: "Annual km", value: km, set: setKm, min: 5000, max: 100000, step: 1000, fmt: (v: number) => v.toLocaleString() + " km" },
              { label: "Diesel price ($/L)", value: fuelPrice, set: setFuelPrice, min: 1.5, max: 4, step: 0.01, fmt: (v: number) => "$" + v.toFixed(2) },
              { label: "Consumption (L/100km)", value: consumption, set: setConsumption, min: 4, max: 20, step: 0.5, fmt: (v: number) => v.toFixed(1) },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-2"><span className="text-white/60">{s.label}</span><span className="text-white/80 font-mono">{s.fmt(s.value)}</span></div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.set(Number(e.target.value))} className="w-full accent-emerald-500" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Annual cost breakdown</h3>
            {[
              { label: "Fuel", val: fuelCost },
              { label: "RUC", val: ruc },
              { label: "Depreciation", val: depreciation },
              { label: "Maintenance", val: maintenance },
              { label: "Insurance", val: insurance },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-white/[0.04] text-sm">
                <span className="text-white/60">{r.label}</span>
                <span className="text-white/80 font-mono">${r.val.toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-base font-semibold mt-2">
              <span className="text-white/90">Total annual</span>
              <span className="text-emerald-400 font-mono">${total.toFixed(0)}</span>
            </div>
            <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "rgba(74,165,168,0.08)", border: "1px solid rgba(74,165,168,0.2)" }}>
              <DollarSign className="inline text-amber-400 mr-1" size={16} />
              <span className="text-amber-300 font-semibold">${perKm.toFixed(2)}/km</span>
              <span className="text-white/40 text-xs ml-2">all-in cost</span>
            </div>
          </div>
        </div>
      </main>
      <BrandFooter />
    </div>
  );
}
