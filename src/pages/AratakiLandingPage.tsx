import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Fuel, Calculator, MapPin, Shield, FileText, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const BG = "#09090F";
const POUNAMU = "#3A7D6E";
const GOLD = "#D4A843";

const SECTIONS = [
  {
    icon: Fuel, title: "FuelOracle", route: "/arataki/fuel-oracle",
    desc: "Live NZ fuel pricing across Z, BP, Mobil, Gull, Waitomo. Route cost optimisation for every trip.",
  },
  {
    icon: Calculator, title: "Vehicle Economy Calculator", route: "/arataki/vehicle-economy",
    desc: "Real-world per-km cost including RUC, depreciation, maintenance, and insurance.",
  },
  {
    icon: MapPin, title: "Route Intelligence", route: "/arataki/route-intelligence",
    desc: "Live NZ weather, roadworks, and closures integrated into trip planning.",
  },
  {
    icon: Shield, title: "Driver Compliance", route: "/arataki/driver-compliance",
    desc: "WoF/CoF expiry, RUC balance, licence class watch, and logbook prompts.",
  },
  {
    icon: FileText, title: "Evidence & Insurance",
    desc: "Contemporaneous trip logs as an insurance and claim-defence artefact. Every trip documented.",
  },
];

const COMPLIANCE = [
  "Land Transport Act — WoF/CoF and licence compliance enforced",
  "Road User Charges Act — RUC balance monitored per vehicle",
  "H&S at Work Act 2015 — driver fatigue rules, rest breaks tracked",
  "Fair Trading Act 1986 — advertising claims scanned",
];

export default function AratakiLandingPage() {
  return (
    <GlowPageWrapper accentColor="#E8E8E8">
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO title="Arataki — Automotive Intelligence for NZ Fleets | assembl" description="Fuel, routes, vehicle economy and driver compliance — one governed agent, contemporaneous evidence, every trip." />
        <BrandNav />

        {/* Hero */}
        <main className="relative flex flex-col items-center px-6 pt-20 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${POUNAMU}10 0%, transparent 70%)`,
          }} />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Car size={28} style={{ color: "#E8E8E8" }} />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            Automotive intelligence, for NZ fleets
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            Fuel, routes, vehicle economy and driver compliance — one governed agent, contemporaneous evidence, every trip.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4">
            <Link to="/simulator" className="px-6 py-3 rounded-full text-sm font-medium" style={{ background: POUNAMU, color: "#fff" }}>
              See Arataki in action <ArrowRight className="inline ml-1" size={14} />
            </Link>
            <Link to="/contact" className="px-6 py-3 rounded-full text-sm font-medium" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
              Talk to us
            </Link>
          </motion.div>
        </main>

        {/* Sections */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {s.route ? (
                  <Link to={s.route} className="block rounded-2xl p-6 h-full group transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <s.icon size={24} className="text-white/40 group-hover:text-white/70 transition-colors mb-4" />
                    <h3 className="text-base font-semibold text-white/90 mb-2 flex items-center gap-2">{s.title} <ChevronRight size={14} className="text-white/20 group-hover:text-white/50" /></h3>
                    <p className="text-sm text-white/45">{s.desc}</p>
                  </Link>
                ) : (
                  <div className="rounded-2xl p-6 h-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <s.icon size={24} className="text-white/40 mb-4" />
                    <h3 className="text-base font-semibold text-white/90 mb-2">{s.title}</h3>
                    <p className="text-sm text-white/45">{s.desc}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-light text-center mb-8" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(255,255,255,0.8)" }}>
            NZ compliance, built in
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {COMPLIANCE.map(c => (
              <div key={c} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <Shield size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">{c}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Scenario CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <div className="rounded-2xl p-10" style={{ background: `${POUNAMU}08`, border: `1px solid ${POUNAMU}20` }}>
            <h3 className="text-xl font-light text-white/80 mb-3" style={{ fontFamily: "'Lato', sans-serif" }}>Try a scenario</h3>
            <p className="text-sm text-white/45 mb-6">Run a realistic 6-vehicle courier fleet scenario and see every step — fuel, routes, compliance, evidence pack.</p>
            <Link to="/simulator" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium" style={{ background: POUNAMU, color: "#fff" }}>
              Run Arataki scenario <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <BrandFooter />
        <KeteAgentChat keteName="Arataki" keteLabel="Automotive" accentColor="#E8E8E8"
          defaultAgentId="motor" packId="arataki"
          starterPrompts={["What does Arataki cover for fleets?", "How does vehicle economy calculation work?", "Tell me about driver compliance tracking", "What evidence packs do I get for insurance?"]}
        />
      </div>
    </GlowPageWrapper>
  );
}
