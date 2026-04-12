import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Ship, FileText, Shield, AlertTriangle, Package, Globe, Anchor } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteRaceVideo from "@/components/kete/KeteRaceVideo";

const BG = "#09090F";
const ACCENT = "#7ECFC2";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const COMPLIANCE = [
  "Customs and Excise Act 2018 — declarations validated",
  "MPI biosecurity standards — clearance tracked",
  "Dangerous Goods Act — classification enforced",
  "Privacy Act 2020 · IPP 3A — importer data governed",
];

const AGENTS = [
  { code: "GATEWAY", role: "Customs declarations & HS validation", icon: FileText },
  { code: "MARINER", role: "Vessel tracking & port logistics", icon: Anchor },
  { code: "TRANSIT", role: "Road freight & delivery scheduling", icon: Ship },
  { code: "HARVEST", role: "Biosecurity & MPI clearance", icon: Shield },
  { code: "COUNTER", role: "Landed cost & duty calculation", icon: Globe },
  { code: "MOTOR", role: "Fleet management & compliance", icon: Package },
  { code: "ASCEND", role: "Air freight & express cargo", icon: AlertTriangle },
];

const DEMO_FLOW = [
  { step: "Import shipment", detail: "Enter cargo details, HS codes, origin, and incoterm" },
  { step: "Auto-validate", detail: "Pikau validates HS codes, flags DG, checks MPI requirements" },
  { step: "Generate pack", detail: "Customs declaration pack produced with compliance checks" },
  { step: "Broker hand-off", detail: "Pack ready for your licensed customs broker to lodge" },
];

export default function PikauLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Pikau — Freight & Customs | assembl"
          description="Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble. Built for NZ importers and logistics teams."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#7ECFC2" accentLight="#A8E6DA" model="container" size={160} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            PIKAU · FREIGHT & CUSTOMS
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Border compliance. Sorted.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ freight and customs
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            HS code validation, incoterm handling, landed cost analysis, and broker hand-off — packed, checked, and ready to clear. Pikau works alongside your existing freight systems from day one.
          </motion.p>

          {/* Compliance badge */}
          <motion.div
            className="rounded-2xl px-6 py-5 max-w-md mb-10 text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${POUNAMU}35`, backdropFilter: "blur(16px)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <p className="text-[10px] uppercase tracking-[3px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              governed · human-in-the-loop
            </p>
            <ul className="space-y-2.5">
              {COMPLIANCE.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/pikau/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Launch Pikau Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Book a freight walk-through
            </Link>
          </motion.div>
        </main>

        {/* ── Agent Network ── */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <motion.h2
            className="text-center text-xs uppercase tracking-[4px] mb-10"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            7 specialist agents
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.code}
                className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                    <a.icon size={16} style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-white/80">{a.code}</span>
                </div>
                <p className="text-[11px] text-white/45 leading-relaxed">{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Live Demo Flow ── */}
        <section className="px-6 pb-24 max-w-4xl mx-auto">
          <motion.h2
            className="text-center text-xs uppercase tracking-[4px] mb-10"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {DEMO_FLOW.map((d, i) => (
              <motion.button
                key={d.step}
                onClick={() => setActiveDemo(i)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activeDemo === i ? `${ACCENT}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeDemo === i ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: activeDemo === i ? ACCENT : "rgba(255,255,255,0.08)", color: activeDemo === i ? BG : "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-white/70">{d.step}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{d.detail}</p>
              </motion.button>
            ))}
          </div>

          {/* Demo preview card */}
          <motion.div
            className="mt-8 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20` }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Description", value: "Automotive parts — brake pads" },
                  { label: "HS Code", value: "8708.30" },
                  { label: "Origin", value: "Yokohama, JP" },
                  { label: "Incoterm", value: "CIF" },
                  { label: "Value", value: "$12,400 NZD" },
                  { label: "DG", value: "No" },
                ].map(f => (
                  <div key={f.label} className="text-xs"><span className="text-white/30">{f.label}: </span><span className="text-white/70 font-mono">{f.value}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 1 && (
              <div className="space-y-2">
                {["HS code 8708.30 ✓ valid", "Dangerous goods: None", "MPI: No biosecurity risk", "Incoterm CIF — duties on buyer"].map(line => (
                  <div key={line} className="flex items-center gap-2 text-xs"><Check size={12} style={{ color: POUNAMU }} /><span className="text-white/60">{line}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 2 && (
              <div className="space-y-2">
                {[
                  { check: "CEA 2018 — declaration validated", st: "pass" },
                  { check: "MPI biosecurity — no risk", st: "pass" },
                  { check: "DG classification — N/A", st: "pass" },
                  { check: "Privacy Act 2020 — governed", st: "pass" },
                ].map(c => (
                  <div key={c.check} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{c.check}</span>
                    <span className="text-emerald-400 text-[10px] uppercase">{c.st}</span>
                  </div>
                ))}
              </div>
            )}
            {activeDemo === 3 && (
              <div className="text-center py-4">
                <FileText size={32} style={{ color: ACCENT }} className="mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-1">Customs Declaration Pack ready</p>
                <p className="text-[10px] text-white/40">Hand off to your licensed customs broker for lodgement with NZ Customs</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Race Video ── */}
        <KeteRaceVideo slug="pikau" keteName="Pikau" accentColor={ACCENT} />

        {/* ── CTA ── */}
        <section className="text-center px-6 pb-24">
          <motion.div
            className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}25` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-sm text-white/60">Ready to streamline your freight compliance?</p>
            <Link to="/pikau/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Pikau Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Pikau"
          keteLabel="Freight & Customs"
          accentColor="#7ECFC2"
          defaultAgentId="gateway"
          packId="pikau"
          starterPrompts={[
            "What does Pikau cover for freight teams?",
            "How does customs declaration support work?",
            "Tell me about HS code validation",
            "What evidence packs do I get for shipments?",
          ]}
        />
      </div>
    </GlowPageWrapper>
  );
}
