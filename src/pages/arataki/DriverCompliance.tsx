import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const VEHICLES = [
  { reg: "MXA 412", type: "Ford Transit", wof: "2026-04-19", cof: null, rucKm: 3420, driver: "Tama R.", licence: "Class 1 Full", status: "warn" },
  { reg: "KLB 789", type: "Toyota Hiace", wof: "2026-09-01", cof: null, rucKm: 8100, driver: "Aroha M.", licence: "Class 1 Full", status: "ok" },
  { reg: "FGH 223", type: "Isuzu NLR", wof: null, cof: "2026-11-15", rucKm: 5600, driver: "James T.", licence: "Class 2 Full", status: "ok" },
  { reg: "PLQ 901", type: "Ford Ranger", wof: "2026-06-30", cof: null, rucKm: 142, driver: "Mere W.", licence: "Class 1 Full", status: "critical" },
  { reg: "ZZT 554", type: "Mitsubishi Canter", wof: null, cof: "2026-08-20", rucKm: 4200, driver: "Kahu P.", licence: "Class 2 Full", status: "ok" },
  { reg: "ABC 678", type: "Toyota Hilux", wof: "2026-12-01", cof: null, rucKm: 7800, driver: "Sam L.", licence: "Class 1 Full", status: "ok" },
];

const statusBadge = (s: string) => {
  if (s === "ok") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Compliant</span>;
  if (s === "warn") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Due soon</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Action needed</span>;
};

export default function DriverCompliance() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#3D4250" }}>
      <SEO title="Driver Compliance Dashboard | Arataki | assembl" description="WoF/CoF expiry, RUC balance, licence class watch, logbook prompts for NZ fleets." />
      <BrandNav />
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-32">
        <Link to="/arataki" className="text-xs text-white/40 hover:text-white/60 mb-6 inline-block">← Back to Arataki</Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          <Shield className="inline mr-3 text-violet-400" size={28} />Driver Compliance
        </motion.h1>
        <p className="text-gray-500 mb-10 max-w-xl">WoF/CoF expiry, RUC balance, licence class watch, and logbook prompts.</p>

        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-7 text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3 border-b border-gray-100">
            <span>Reg</span><span>Vehicle</span><span>WoF/CoF</span><span>RUC left</span><span>Driver</span><span>Licence</span><span>Status</span>
          </div>
          {VEHICLES.map((v, i) => (
            <motion.div key={v.reg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="grid grid-cols-7 items-center px-6 py-4 text-sm border-b border-white/[0.03]">
              <span className="text-white/80 font-mono text-xs">{v.reg}</span>
              <span className="text-white/60">{v.type}</span>
              <span className="text-white/60 flex items-center gap-1.5">
                {v.status === "warn" && <AlertTriangle size={12} className="text-amber-400" />}
                {v.status === "critical" && <AlertTriangle size={12} className="text-red-400" />}
                {v.status === "ok" && <CheckCircle2 size={12} className="text-emerald-400" />}
                {v.wof ? `WoF ${v.wof}` : `CoF ${v.cof}`}
              </span>
              <span className={`font-mono text-xs ${v.rucKm < 500 ? "text-red-400" : v.rucKm < 2000 ? "text-amber-400" : "text-gray-500"}`}>{v.rucKm.toLocaleString()} km</span>
              <span className="text-white/60">{v.driver}</span>
              <span className="text-gray-500 text-xs">{v.licence}</span>
              <span>{statusBadge(v.status)}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-red-400" /><span className="text-sm font-semibold text-red-300">Action needed</span></div>
            <p className="text-xs text-gray-500">PLQ 901 — RUC balance at 142km. Purchase additional RUC before tomorrow's run or assign to local duties only.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-amber-400" /><span className="text-sm font-semibold text-amber-300">Due soon</span></div>
            <p className="text-xs text-gray-500">MXA 412 — WoF expires 19 April (4 days). Book inspection this week to avoid compliance gap.</p>
          </div>
        </div>
      </main>
      <BrandFooter />
    </div>
  );
}
