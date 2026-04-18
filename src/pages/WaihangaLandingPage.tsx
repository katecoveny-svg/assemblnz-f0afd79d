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

          {/* Compliance badge — light glass */}
          <motion.div className="relative rounded-3xl px-7 py-6 max-w-md mb-12 text-left" style={glass} variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ color: C.pounamu, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              governed · human-in-the-loop
            </p>
            <ul className="space-y-3">
              {COMPLIANCE.map((item, idx) => (
                <motion.li key={item} className="flex items-start gap-3 text-[13px]" style={{ color: C.textSecondary }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${C.pounamu}15` }}>
                    <Check size={11} style={{ color: C.pounamu }} />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

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

        {/* ── Real Use Case ── */}
        <KeteUseCaseSection data={WAIHANGA_USE_CASE} />

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

        {/* ── Live Demo Flow ── */}
        <section className="relative px-6 py-32 max-w-4xl mx-auto">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[5px] mb-4 uppercase" style={{ color: C.pounamu, fontFamily: "'JetBrains Mono', monospace" }}>— workflow —</p>
            <h2 className="text-2xl sm:text-[36px] font-light" style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-0.02em", color: C.text }}>How it works</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
            {DEMO_FLOW.map((d, i) => (
              <motion.button key={d.step} onClick={() => setActiveDemo(i)} className="group relative rounded-3xl p-5 text-left overflow-hidden transition-all duration-300"
                style={{
                  ...glass,
                  borderColor: activeDemo === i ? C.pounamu : "rgba(255,255,255,0.9)",
                  boxShadow: activeDemo === i
                    ? `0 10px 40px -10px ${C.pounamu}20, 0 4px 12px rgba(0,0,0,0.04)`
                    : glass.boxShadow,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {activeDemo === i && <motion.div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${C.pounamu}, transparent)` }} layoutId="waihanga-demo-accent" />}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: activeDemo === i ? `${C.pounamu}15` : `${C.pounamu}08` }}>
                    <d.icon size={15} style={{ color: C.pounamu }} />
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: activeDemo === i ? C.text : C.textSecondary }}>{d.step}</span>
                </div>
                <p className="text-[12px] leading-[1.7]" style={{ color: C.textTertiary }}>{d.detail}</p>
              </motion.button>
            ))}
          </div>

          {/* Demo preview — light glass card */}
          <motion.div className="relative rounded-3xl p-8 overflow-hidden" style={glass} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2.5 mb-6">
              <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: C.pounamu }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] uppercase tracking-[3px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.pounamu }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="wd-0">
                {[
                  { label: "Project", value: "Riverstone Apartments — Stage 2" },
                  { label: "Consent", value: "BCA-2026-04182" },
                  { label: "Site", value: "42 Hobson St, Auckland CBD" },
                  { label: "Scope", value: "12-unit residential, 4 storeys" },
                  { label: "Start", value: "22 Apr 2026" },
                  { label: "PC target", value: "18 Dec 2026" },
                ].map((f, idx) => (
                  <motion.div key={f.label} className="p-3 rounded-2xl text-xs" style={{ background: `${C.lavender}40`, border: `1px solid ${C.pounamu}10` }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <span className="text-[10px]" style={{ color: C.textTertiary }}>{f.label}</span>
                    <p className="mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, fontSize: "12px" }}>{f.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 1 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="wd-1">
                {["PPE check — hard hat, hi-vis, steel caps ✓", "Hazard register reviewed — 3 active hazards ✓", "Site briefing completed ✓", "Emergency contacts confirmed ✓"].map((line, idx) => (
                  <motion.div key={line} className="flex items-center gap-3 text-[13px] p-3 rounded-2xl" style={{ background: `${C.pounamu}06`, border: `1px solid ${C.pounamu}10` }}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${C.pounamu}15` }}>
                      <Check size={11} style={{ color: C.pounamu }} />
                    </div>
                    <span style={{ color: C.textSecondary }}>{line}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 2 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="wd-2">
                {[
                  { check: "CCA 2002 s20 — payment claim format valid", st: "pass", ref: "CCA-20" },
                  { check: "Schedule of values — $142,000 claimed", st: "pass", ref: "SOV-14" },
                  { check: "Retention — 5% held per contract", st: "pass", ref: "RET-05" },
                  { check: "Working day count — within 20 WD window", st: "pass", ref: "WD-20" },
                ].map((c, idx) => (
                  <motion.div key={c.check} className="flex items-center justify-between text-[13px] p-3 rounded-2xl" style={{ background: `${C.lavender}40`, border: `1px solid ${C.pounamu}10` }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                    <span style={{ color: C.textSecondary }}>{c.check}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}>{c.ref}</span>
                      <span className="text-[10px] uppercase font-semibold" style={{ color: C.pounamu }}>{c.st}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 3 && (
              <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="wd-3">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${C.pounamu}10` }}>
                  <Shield size={28} style={{ color: C.pounamu }} />
                </div>
                <p className="text-[15px] mb-1" style={{ color: C.text }}>Evidence pack signed</p>
                <p className="text-[12px]" style={{ color: C.textTertiary }}>Site induction · Payment claim · Building code compliance — audit-ready trail</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        

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
