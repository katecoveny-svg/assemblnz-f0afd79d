import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Ship, FileText, Shield, AlertTriangle, Package, Globe, Anchor } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { PIKAU_USE_CASE } from "@/data/useCases";

const BG = "#FAFBFC";
const ACCENT = "#7ECFC2";
const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const BONE = "#F5F0E8";
const GOLD = "#D4A843";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const COMPLIANCE = [
  "Customs and Excise Act 2018 — declarations validated",
  "MPI biosecurity standards — clearance tracked",
  "Dangerous Goods Act — classification enforced",
  "Privacy Act 2020 · IPP 3A — importer data governed",
];

// Live roster — 4 verified active agents under pikau + cross-pack pakihi.
// MARINER, FLUX (fleet), HAVEN (cold-chain) live in pikau pack;
// GATEWAY served from pakihi pack via industryToolLoader.
const AGENTS = [
  { code: "MARINER", role: "Vessel tracking, AIS feeds & port logistics", icon: Anchor },
  { code: "GATEWAY", role: "Customs declarations & HS code validation", icon: FileText },
  { code: "FLUX", role: "Fleet & telematics — RUC, eRUC, route economy", icon: Package },
  { code: "HAVEN", role: "Cold-chain integrity & temperature audit trails", icon: Shield },
];

const DEMO_FLOW = [
  { step: "Import shipment", detail: "Enter cargo details, HS codes, origin, and incoterm", icon: Package },
  { step: "Auto-validate", detail: "Pikau validates HS codes, flags DG, checks MPI requirements", icon: Shield },
  { step: "Generate pack", detail: "Customs declaration pack produced with compliance checks", icon: FileText },
  { step: "Broker hand-off", detail: "Pack ready for your licensed customs broker to lodge", icon: Check },
];

export default function PikauLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Pikau — Freight & Customs | assembl"
          description="Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble. Built for NZ importers and logistics teams."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center justify-center px-6 pt-16 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}10 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${GOLD}06 0%, transparent 60%)`,
          }} />

          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: 3 + i * 1.5, height: 3 + i * 1.5,
              background: i % 2 === 0 ? ACCENT : POUNAMU,
              left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.15,
            }} animate={{ y: [0, -20 - i * 5, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }} />
          ))}

          <LandingKeteHero accentColor="#7ECFC2" accentLight="#A8E6DA" model="container" size={200} />

          <motion.p className="text-[10px] uppercase tracking-[5px] mb-6" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            PIKAU · FREIGHT & CUSTOMS
          </motion.p>

          <motion.h1 className="text-4xl sm:text-6xl font-display font-light tracking-[0.02em] mb-4 max-w-3xl leading-[1.1]"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <span style={{ background: `linear-gradient(135deg, #3D4250 0%, ${ACCENT} 50%, ${BONE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto" }}>
              Border compliance.
            </span>
            <br />
            <span style={{ background: `linear-gradient(135deg, #3D4250 0%, ${GOLD} 60%, ${BONE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto" }}>
              Sorted.
            </span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl font-display font-light tracking-[0.02em] mb-6 max-w-2xl" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            Operational intelligence for NZ freight and customs
          </motion.p>

          <motion.p className="text-sm sm:text-base max-w-xl mb-8 font-body leading-relaxed" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            HS code validation, incoterm handling, landed cost analysis, and broker hand-off — packed, checked, and ready to clear.
          </motion.p>

          <motion.div className="relative rounded-2xl px-7 py-6 max-w-md mb-12 text-left overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(58,125,110,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${POUNAMU}30`, backdropFilter: "blur(20px)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${POUNAMU}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }} variants={fadeUp} initial="hidden" animate="visible" custom={3}
            whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}60, transparent)` }} />
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>governed · human-in-the-loop</p>
            <ul className="space-y-3">
              {COMPLIANCE.map((item, idx) => (
                <motion.li key={item} className="flex items-start gap-3 text-xs font-body" style={{ color: "#9CA3AF" }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${POUNAMU}20`, boxShadow: `0 0 8px ${POUNAMU}20` }}>
                    <Check size={10} style={{ color: POUNAMU_LIGHT }} />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/pikau/dashboard" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold font-body overflow-hidden" style={{ color: "#3D4250" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${POUNAMU} 0%, #2D6A5E 100%)` }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10">Launch Pikau Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="group px-10 py-4 rounded-full text-sm font-medium font-body transition-all duration-300" style={{ color: "#6B7280", border: "1px solid rgba(74,165,168,0.15)", background: "rgba(255,255,255,0.5)" }}>
              <span className="group-hover:text-white/80 transition-colors">Book a freight walk-through</span>
            </Link>
          </motion.div>
        </main>

        {/* ── Real Use Case ── */}
        <KeteUseCaseSection data={PIKAU_USE_CASE} />

        {/* ── Agent Network ── */}
        <section className="relative px-6 pb-24 max-w-5xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${ACCENT}06 0%, transparent 70%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>specialist network</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>5 agents working together</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <motion.div key={a.code} className="group relative p-5 rounded-xl overflow-hidden cursor-default" style={{
                background: hoveredAgent === i ? `linear-gradient(135deg, ${ACCENT}10, rgba(255,255,255,0.02))` : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                border: `1px solid ${hoveredAgent === i ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.4s ease",
                boxShadow: hoveredAgent === i ? `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${ACCENT}08` : "none",
              }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)}>
                <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500" style={{ opacity: hoveredAgent === i ? 1 : 0, background: `linear-gradient(90deg, transparent, ${ACCENT}50, transparent)` }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400" style={{
                    background: hoveredAgent === i ? `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}10)` : `${ACCENT}10`,
                    boxShadow: hoveredAgent === i ? `0 0 16px ${ACCENT}15` : "none",
                  }}>
                    <a.icon size={18} style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: hoveredAgent === i ? BONE : "rgba(255,255,255,0.7)", transition: "color 0.3s" }}>{a.code}</span>
                </div>
                <p className="text-[12px] leading-relaxed transition-colors duration-300" style={{ color: hoveredAgent === i ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)" }}>{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Live Demo Flow ── */}
        <section className="relative px-6 pb-28 max-w-4xl mx-auto">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${ACCENT}06 0%, transparent 60%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>workflow</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>How it works</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {DEMO_FLOW.map((d, i) => (
              <motion.button key={d.step} onClick={() => setActiveDemo(i)} className="group relative p-5 rounded-xl text-left overflow-hidden" style={{
                background: activeDemo === i ? `${ACCENT}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeDemo === i ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`,
                boxShadow: activeDemo === i ? `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${ACCENT}06` : "none",
                transition: "all 0.4s ease",
              }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {activeDemo === i && <motion.div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} layoutId="pikau-demo-accent" />}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300" style={{
                    background: activeDemo === i ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)` : "rgba(255,255,255,0.06)",
                    boxShadow: activeDemo === i ? `0 0 16px ${ACCENT}30` : "none",
                  }}>
                    <d.icon size={14} style={{ color: activeDemo === i ? BG : "rgba(255,255,255,0.35)" }} />
                  </div>
                  <span className="text-xs font-medium transition-colors duration-300" style={{ color: activeDemo === i ? BONE : "rgba(255,255,255,0.5)" }}>{d.step}</span>
                </div>
                <p className="text-[11px] leading-relaxed transition-colors duration-300" style={{ color: activeDemo === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{d.detail}</p>
              </motion.button>
            ))}
          </div>

          <motion.div className="relative p-8 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${ACCENT}18`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${ACCENT}04, inset 0 1px 0 rgba(255,255,255,0.04)`,
          }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)` }} />
            <div className="flex items-center gap-2.5 mb-6">
              <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}40` }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="pk-0">
                {[
                  { label: "Description", value: "Automotive parts — brake pads" },
                  { label: "HS Code", value: "8708.30" },
                  { label: "Origin", value: "Yokohama, JP" },
                  { label: "Incoterm", value: "CIF" },
                  { label: "Value", value: "$12,400 NZD" },
                  { label: "DG", value: "No" },
                ].map((f, idx) => (
                  <motion.div key={f.label} className="p-3 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <span className="text-white/25 text-[10px]">{f.label}</span>
                    <p className="text-assembl-text/70 font-mono mt-1">{f.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 1 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="pk-1">
                {["HS code 8708.30 ✓ valid", "Dangerous goods: None", "MPI: No biosecurity risk", "Incoterm CIF — duties on buyer"].map((line, idx) => (
                  <motion.div key={line} className="flex items-center gap-3 text-xs p-3 rounded-lg" style={{ background: `${POUNAMU}08`, border: `1px solid ${POUNAMU}15` }}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${POUNAMU}20` }}>
                      <Check size={11} style={{ color: POUNAMU_LIGHT }} />
                    </div>
                    <span className="text-white/60">{line}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 2 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="pk-2">
                {[
                  { check: "CEA 2018 — declaration validated", st: "pass" },
                  { check: "MPI biosecurity — no risk", st: "pass" },
                  { check: "DG classification — N/A", st: "pass" },
                  { check: "Privacy Act 2020 — governed", st: "pass" },
                ].map((c, idx) => (
                  <motion.div key={c.check} className="flex items-center justify-between text-xs p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                    <span className="text-gray-500">{c.check}</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-semibold">{c.st}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 3 && (
              <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="pk-3">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, boxShadow: `0 0 30px ${ACCENT}15` }}>
                  <FileText size={28} style={{ color: ACCENT }} />
                </div>
                <p className="text-sm text-white/70 mb-1">Customs Declaration Pack ready</p>
                <p className="text-[10px] text-white/40">Hand off to your licensed customs broker for lodgement with NZ Customs</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        

        <section className="relative text-center px-6 pb-24">
          <motion.div className="relative inline-flex flex-col items-center gap-4 p-10 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${POUNAMU}25`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${ACCENT}05`,
          }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />
            <p className="text-sm text-white/60">Ready to streamline your freight compliance?</p>
            <Link to="/pikau/dashboard" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold transition-all overflow-hidden" style={{ color: "#3D4250" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: POUNAMU }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10">Open Pikau Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <TextUsButton keteName="Pikau" accentColor={ACCENT} showWhatsApp={false} />
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Pikau" keteLabel="Freight & Customs" accentColor="#7ECFC2"
          defaultAgentId="gateway" packId="pikau"
          starterPrompts={["What does Pikau cover for freight teams?", "How does customs declaration support work?", "Tell me about HS code validation", "What evidence packs do I get for shipments?"]}
        />
      </div>
    </LightPageShell>
  );
}
