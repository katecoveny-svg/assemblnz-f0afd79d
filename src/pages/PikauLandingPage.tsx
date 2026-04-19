import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, FileText, Shield, Package, Anchor, ChevronDown } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import KeteSwitcherPill from "@/components/kete/KeteSwitcherPill";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import UseCaseToggle from "@/components/kete/UseCaseToggle";
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
        <KeteSwitcherPill activeKete="pikau" />

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

          {/* Live status strip */}
          <motion.div className="mb-6" variants={fadeUp} initial="hidden" animate="visible" custom={2.5}>
            <LiveStatusStrip pack="pikau" agentCodes={["maritime", "customs", "flux", "logistics"]} accent={POUNAMU} />
          </motion.div>

          {/* Compliance — single line */}
          <motion.p
            className="text-xs font-body mb-10 max-w-xl"
            style={{ color: "#5B6374", letterSpacing: "0.02em" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <span style={{ color: POUNAMU, fontWeight: 500 }}>Governed by</span> Customs &amp; Excise Act 2018, MPI biosecurity standards, Dangerous Goods Act, Privacy Act 2020.
          </motion.p>

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

        {/* ── Real Use Case (collapsed by default) ── */}
        <UseCaseToggle accent={POUNAMU}>
          <KeteUseCaseSection data={PIKAU_USE_CASE} />
        </UseCaseToggle>

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

        {/* Demo flow removed — replaced by the live KeteAgentChat (bottom-right) */}

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
