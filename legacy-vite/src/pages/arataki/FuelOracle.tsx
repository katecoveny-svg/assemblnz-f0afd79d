import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Fuel, MapPin, TrendingDown } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";

const FUEL_DATA = [
  { station: "Z Taupō", brand: "Z Energy", diesel: 2.449, petrol91: 2.719, updated: "2 min ago" },
  { station: "BP Huntly", brand: "BP", diesel: 2.469, petrol91: 2.739, updated: "5 min ago" },
  { station: "Gull Taupō", brand: "Gull", diesel: 2.419, petrol91: 2.689, updated: "8 min ago" },
  { station: "Mobil Hamilton", brand: "Mobil", diesel: 2.459, petrol91: 2.729, updated: "3 min ago" },
  { station: "Waitomo Tokoroa", brand: "Waitomo", diesel: 2.389, petrol91: 2.659, updated: "12 min ago" },
];

const glassCard: React.CSSProperties = {
  background: "transparent",
  boxShadow: `
    6px 6px 16px rgba(166,166,180,0.35),
    -6px -6px 16px rgba(255,255,255,0.85),
    inset 0 1px 0 rgba(255,255,255,0.6)
  `,
};

export default function FuelOracle() {
  const cheapest = FUEL_DATA.reduce((a, b) => a.diesel < b.diesel ? a : b);
  return (
    <LightPageShell>
      <SEO title="FuelOracle — Live NZ Fuel Pricing | Arataki | assembl" description="Live NZ fuel pricing across Z, BP, Mobil, Gull, Waitomo. Route cost optimisation for fleets." />
      <BrandNav />
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-32">
        <Link to="/arataki" className="text-xs text-[#3D4250]/40 hover:text-[#3D4250]/60 mb-6 inline-block">← Back to Arataki</Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-light mb-3 text-[#3D4250]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <Fuel className="inline mr-3 text-[#4AA5A8]" size={28} />FuelOracle
        </motion.h1>
        <p className="text-[#3D4250]/50 mb-10 max-w-xl">Live NZ fuel pricing across Z, BP, Mobil, Gull, Waitomo — automatically selects cheapest stops on your route.</p>

        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="grid grid-cols-5 text-xs font-semibold text-[#3D4250]/40 uppercase tracking-wider px-6 py-3 border-b border-[#4AA5A8]/[0.08]">
            <span>Station</span><span>Brand</span><span>Diesel</span><span>91</span><span>Updated</span>
          </div>
          {FUEL_DATA.map((f, i) => (
            <motion.div key={f.station} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`grid grid-cols-5 px-6 py-4 text-sm ${f === cheapest ? "bg-[#4AA5A8]/[0.04]" : ""} border-b border-[#4AA5A8]/[0.05]`}>
              <span className="text-[#3D4250]/80 flex items-center gap-2"><MapPin size={12} className="text-[#3D4250]/25" />{f.station}</span>
              <span className="text-[#3D4250]/50">{f.brand}</span>
              <span className={f === cheapest ? "text-[#3A7D6E] font-semibold" : "text-[#3D4250]/70"}>${f.diesel.toFixed(3)}</span>
              <span className="text-[#3D4250]/50">${f.petrol91.toFixed(3)}</span>
              <span className="text-[#3D4250]/30">{f.updated}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(74,165,168,0.05)", border: "1px solid rgba(74,165,168,0.12)" }}>
          <TrendingDown size={16} className="text-[#3A7D6E]" />
          <span className="text-sm text-[#3A7D6E]">Best diesel: <strong>{cheapest.station}</strong> at ${cheapest.diesel.toFixed(3)}/L — saves ~$4.20 per fill vs most expensive</span>
        </div>
      </main>
      <BrandFooter />
    </LightPageShell>
  );
}
