import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, FileText, Wrench, Building, Users, HardHat, ClipboardCheck, AlertTriangle, Ruler } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import UseCaseToggle from "@/components/kete/UseCaseToggle";

import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { WAIHANGA_USE_CASE } from "@/data/useCases";

const C = {
  bg: "#FAFBFC",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  teal: "#4AA5A8",
  pounamu: "#3A7D6E",
  pounamuLight: "#7ECFC2",
  gold: "#D4A843",
  lavender: "#E8E6F0",
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 10px 40px -10px rgba(58,125,110,0.12), 0 4px 12px rgba(0,0,0,0.03)",
};

// Live roster — ARC (waihanga pack) + 8 specialists from the legacy hanga pack
// that serve waihanga via industryToolLoader. 9 active agents total.
const AGENTS = [
  { code: "ARC", role: "Council consents, RC/BC pathways & PIM checks", icon: Building },
  { code: "ĀRAI", role: "HSWA site safety, hazard registers & toolbox talks", icon: Shield },
  { code: "KAUPAPA", role: "CCA 2002, payment claims & variation governance", icon: FileText },
  { code: "ATA", role: "Tender writing, scope clarification & bid review", icon: Wrench },
  { code: "RAWA", role: "Materials, takeoffs & supplier quote comparison", icon: Ruler },
  { code: "WHAKAAĒ", role: "Approvals workflow & stakeholder sign-off", icon: ClipboardCheck },
  { code: "PAI", role: "Quality records, NCRs & defect close-out", icon: HardHat },
  { code: "TERRA", role: "Ground conditions, geotech & site investigation", icon: AlertTriangle },
  { code: "PINNACLE", role: "Project scheduling, milestones & critical path", icon: Users },
];

const COMPLIANCE = [
  "Construction Contracts Act 2002 — payment claims enforced",
  "NZ Building Code B1–H1 — checklists tracked",
  "HSWA — site safety documented and auditable",
  "Privacy Act 2020 · IPP 3A — contractor data governed",
];

const DEMO_FLOW = [
  { step: "Create project", detail: "Site address, consent number, scope, and key dates", icon: ClipboardCheck },
  { step: "Site induction", detail: "Digital check-in, hazard register review, PPE confirmation", icon: Shield },
  { step: "Payment claim", detail: "CCA-compliant claim generated from scheduled values", icon: FileText },
  { step: "Evidence pack", detail: "Compliance trail signed and ready for audit", icon: Check },
];

export default function WaihangaLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
        <SEO
          title="Waihanga — Construction | assembl"
          description="Site safety, building code compliance, tender writing, BIM coordination — construction operations without the paper trail chaos. Built for NZ builders."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          {/* Ambient pastel blobs */}
          <motion.div className="absolute pointer-events-none" style={{
            width: 500, height: 500, top: "5%", left: "-5%",
            background: `radial-gradient(circle, rgba(58,125,110,0.08) 0%, transparent 60%)`,
            filter: "blur(80px)",
          }} animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute pointer-events-none" style={{
            width: 400, height: 400, top: "20%", right: "-3%",
            background: `radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 60%)`,
            filter: "blur(80px)",
          }} animate={{ x: [0, -25, 0], y: [0, 20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} />

          <LandingKeteHero accentColor={C.pounamu} accentLight={C.pounamuLight} model="hard-hat" size={200} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-6"
            style={{ color: C.pounamu, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            WAIHANGA · CONSTRUCTION
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-6xl font-light tracking-tight mb-4 max-w-3xl leading-[1.1]"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-0.02em", color: C.text }}
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Site to sign-off. Tracked.
          </motion.h1>

          <motion.p className="text-lg sm:text-xl font-light mb-6 max-w-2xl" style={{ fontFamily: "'Lato', sans-serif", color: C.textSecondary }} variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            Operational intelligence for NZ construction
          </motion.p>

          <motion.p className="text-[15px] max-w-xl mb-8 leading-[1.7]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Building Code checklists, CCA compliance, BIM coordination, site check-ins, and tender management — documented, checked, and evidence-packed.
          </motion.p>

          {/* Live status strip */}
          <motion.div className="mb-6" variants={fadeUp} initial="hidden" animate="visible" custom={2.5}>
            <LiveStatusStrip pack="waihanga" agentCodes={["forge", "guardian", "operations", "vertex", "axis"]} accent={C.pounamu} />
          </motion.div>

          {/* Compliance — single line */}
          <motion.p
            className="text-xs mb-10 max-w-xl"
            style={{ color: C.textSecondary, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.02em" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <span style={{ color: C.pounamu, fontWeight: 500 }}>Governed by</span> Construction Contracts Act 2002, NZ Building Code B1–H1, HSWA, Privacy Act 2020.
          </motion.p>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/waihanga/workflow" className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-[13px] font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{ background: C.pounamu, color: "#FFFFFF", boxShadow: `0 4px 20px ${C.pounamu}30`, fontFamily: "'Lato', sans-serif" }}>
              Launch Construction Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="group px-10 py-5 rounded-full text-[13px] font-medium transition-all duration-300"
              style={{ color: C.pounamu, border: `1px solid ${C.pounamu}`, background: "#FFFFFF", fontFamily: "'Lato', sans-serif" }}>
              Book a walk-through
            </Link>
          </motion.div>
        </main>

        {/* ── Real Use Case (collapsed by default) ── */}
        <UseCaseToggle accent={C.pounamu}>
          <KeteUseCaseSection data={WAIHANGA_USE_CASE} />
        </UseCaseToggle>

        {/* ── Agent Network ── */}
        <section className="relative px-6 py-32 max-w-5xl mx-auto">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[5px] mb-4 uppercase" style={{ color: C.pounamu, fontFamily: "'JetBrains Mono', monospace" }}>— specialist network —</p>
            <h2 className="text-2xl sm:text-[36px] font-light" style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-0.02em", color: C.text }}>9 agents working together</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((a, i) => (
              <motion.div key={a.code} className="group relative rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  ...glass,
                  boxShadow: hoveredAgent === i
                    ? `0 10px 40px -10px ${C.pounamu}25, 0 4px 12px rgba(0,0,0,0.04)`
                    : glass.boxShadow,
                }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${C.pounamu}10` }}>
                    <a.icon size={18} style={{ color: C.pounamu }} />
                  </div>
                  <span className="text-[12px] font-medium tracking-[2px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{a.code}</span>
                </div>
                <p className="text-[13px] leading-[1.7]" style={{ color: C.textSecondary }}>{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Demo flow removed — replaced by the live KeteAgentChat (bottom-right) */}

        

        {/* ── CTA ── */}
        <section className="relative text-center px-6 py-32">
          <motion.div className="relative inline-flex flex-col items-center gap-6 p-12 rounded-3xl" style={glass}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[17px]" style={{ color: C.textSecondary }}>Ready to streamline your construction compliance?</p>
            <Link to="/waihanga/workflow" className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-[13px] font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{ background: C.pounamu, color: "#FFFFFF", boxShadow: `0 4px 20px ${C.pounamu}30`, fontFamily: "'Lato', sans-serif" }}>
              Open Waihanga Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <TextUsButton keteName="Waihanga" accentColor={C.pounamu} showWhatsApp={false} />
          </motion.div>
        </section>

        
        <BrandFooter />
        <KeteAgentChat
          keteName="Waihanga" keteLabel="Construction" accentColor="#3A7D6E"
          defaultAgentId="kaupapa" packId="waihanga"
          starterPrompts={["What does Waihanga cover for builders?", "How does CCA payment claim compliance work?", "Tell me about Building Code checklists", "What evidence packs do I get for site safety?"]}
        />
      </div>
    </LightPageShell>
  );
}
