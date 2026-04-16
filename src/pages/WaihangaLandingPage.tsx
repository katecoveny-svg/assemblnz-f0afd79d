import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, FileText, Wrench, Building, Users, HardHat, ClipboardCheck, AlertTriangle, Ruler } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteRaceVideo from "@/components/kete/KeteRaceVideo";
import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { WAIHANGA_USE_CASE } from "@/data/useCases";

const BG = "#FAFBFC";
const ACCENT = "#3A7D6E";
const POUNAMU = "#3A7D6E";
const ACCENT_LIGHT = "#7ECFC2";
const BONE = "#F5F0E8";
const GOLD = "#D4A843";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const AGENTS = [
  { code: "SENTINEL", role: "Site safety, HSWA compliance & hazard registers", icon: Shield },
  { code: "KAUPAPA", role: "CCA 2002, payment claims & variations", icon: FileText },
  { code: "FORGE", role: "Tender responses & contract drafting", icon: Wrench },
  { code: "TITAN", role: "Building Code B1–H1 checklists", icon: Building },
  { code: "PILOT", role: "Project scheduling & milestone tracking", icon: ClipboardCheck },
  { code: "APEX", role: "BIM coordination & clash detection", icon: Ruler },
  { code: "AROHA", role: "Staff rostering & employment compliance", icon: Users },
  { code: "ECHO", role: "Client communications & progress updates", icon: HardHat },
  { code: "SIGNAL", role: "Risk register & early warning system", icon: AlertTriangle },
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
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Waihanga — Construction | assembl"
          description="Site safety, building code compliance, tender writing, BIM coordination — construction operations without the paper trail chaos. Built for NZ builders."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${POUNAMU}12 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 70% 60%, ${GOLD}06 0%, transparent 60%)`,
          }} />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 3 + i * 1.5, height: 3 + i * 1.5,
                background: i % 2 === 0 ? POUNAMU : ACCENT_LIGHT,
                left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.15,
              }}
              animate={{ y: [0, -20 - i * 5, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            />
          ))}

          <LandingKeteHero accentColor="#3A7D6E" accentLight="#7ECFC2" model="hard-hat" size={200} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-6"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            WAIHANGA · CONSTRUCTION
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-6xl font-display font-light tracking-[0.02em] mb-4 max-w-3xl leading-[1.1]"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            <span style={{
              background: `linear-gradient(135deg, #1A1D29 0%, ${ACCENT_LIGHT} 50%, ${BONE} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto",
            }}>
              Site to sign-off.
            </span>
            <br />
            <span style={{
              background: `linear-gradient(135deg, #1A1D29 0%, ${GOLD} 60%, ${BONE} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto",
            }}>
              Tracked.
            </span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl font-display font-light tracking-[0.02em] mb-6 max-w-2xl" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            Operational intelligence for NZ construction
          </motion.p>

          <motion.p className="text-sm sm:text-base max-w-xl mb-8 font-body leading-relaxed" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Building Code checklists, CCA compliance, BIM coordination, site check-ins, and tender management — documented, checked, and evidence-packed.
          </motion.p>

          {/* Compliance badge — elevated glass card */}
          <motion.div
            className="relative rounded-2xl px-7 py-6 max-w-md mb-12 text-left overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(58,125,110,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${POUNAMU}30`, backdropFilter: "blur(20px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${POUNAMU}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            whileHover={{ scale: 1.02, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 80px ${POUNAMU}12, inset 0 1px 0 rgba(255,255,255,0.08)` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${POUNAMU}60 50%, transparent 100%)` }} />
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              governed · human-in-the-loop
            </p>
            <ul className="space-y-3">
              {COMPLIANCE.map((item, idx) => (
                <motion.li key={item} className="flex items-start gap-3 text-xs font-body" style={{ color: "#9CA3AF" }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${POUNAMU}20`, boxShadow: `0 0 8px ${POUNAMU}20` }}>
                    <Check size={10} style={{ color: ACCENT_LIGHT }} />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/waihanga/workflow" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold font-body transition-all duration-500 overflow-hidden" style={{ color: "#1A1D29" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${POUNAMU} 0%, #2D6A5E 50%, ${POUNAMU} 100%)`, backgroundSize: "200% auto" }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40, 0 0 60px ${POUNAMU}20` }} />
              <span className="relative z-10">Launch Construction Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="group px-10 py-4 rounded-full text-sm font-medium font-body transition-all duration-300" style={{ color: "#6B7280", border: "1px solid rgba(74,165,168,0.15)", background: "rgba(255,255,255,0.5)" }}>
              <span className="group-hover:text-white/80 transition-colors">Book a walk-through</span>
            </Link>
          </motion.div>
        </main>

        {/* ── Real Use Case ── */}
        <KeteUseCaseSection data={WAIHANGA_USE_CASE} />

        {/* ── Agent Network ── */}
        <section className="relative px-6 pb-24 max-w-5xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${GOLD}06 0%, transparent 70%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>specialist network</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>9 agents working together</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <motion.div key={a.code} className="group relative p-5 rounded-xl overflow-hidden cursor-default" style={{
                background: hoveredAgent === i ? `linear-gradient(135deg, rgba(58,125,110,0.1) 0%, rgba(212,168,67,0.05) 100%)` : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                border: `1px solid ${hoveredAgent === i ? POUNAMU + "40" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.4s ease",
                boxShadow: hoveredAgent === i ? `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${POUNAMU}08` : "none",
              }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)}>
                <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500" style={{ opacity: hoveredAgent === i ? 1 : 0, background: `linear-gradient(90deg, transparent 0%, ${POUNAMU}50 50%, transparent 100%)` }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400" style={{
                    background: hoveredAgent === i ? `linear-gradient(135deg, ${ACCENT_LIGHT}25 0%, ${ACCENT_LIGHT}10 100%)` : `${ACCENT_LIGHT}10`,
                    boxShadow: hoveredAgent === i ? `0 0 16px ${ACCENT_LIGHT}15` : "none",
                  }}>
                    <a.icon size={18} style={{ color: ACCENT_LIGHT }} />
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
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${POUNAMU}06 0%, transparent 60%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>workflow</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>How it works</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {DEMO_FLOW.map((d, i) => (
              <motion.button key={d.step} onClick={() => setActiveDemo(i)} className="group relative p-5 rounded-xl text-left overflow-hidden" style={{
                background: activeDemo === i ? `linear-gradient(135deg, ${ACCENT_LIGHT}12 0%, rgba(255,255,255,0.03) 100%)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeDemo === i ? ACCENT_LIGHT + "40" : "rgba(255,255,255,0.06)"}`,
                boxShadow: activeDemo === i ? `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${ACCENT_LIGHT}06` : "none",
                transition: "all 0.4s ease",
              }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {activeDemo === i && <motion.div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT_LIGHT} 50%, transparent 100%)` }} layoutId="waihanga-demo-accent" />}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300" style={{
                    background: activeDemo === i ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT_LIGHT}CC 100%)` : "rgba(255,255,255,0.06)",
                    boxShadow: activeDemo === i ? `0 0 16px ${ACCENT_LIGHT}30` : "none",
                  }}>
                    <d.icon size={14} style={{ color: activeDemo === i ? BG : "rgba(255,255,255,0.35)" }} />
                  </div>
                  <span className="text-xs font-medium transition-colors duration-300" style={{ color: activeDemo === i ? BONE : "rgba(255,255,255,0.5)" }}>{d.step}</span>
                </div>
                <p className="text-[11px] leading-relaxed transition-colors duration-300" style={{ color: activeDemo === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{d.detail}</p>
              </motion.button>
            ))}
          </div>

          {/* Demo preview — glass card */}
          <motion.div className="relative p-8 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${ACCENT_LIGHT}18`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${ACCENT_LIGHT}04, inset 0 1px 0 rgba(255,255,255,0.04)`,
          }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${ACCENT_LIGHT}30 50%, transparent 90%)` }} />
            <div className="flex items-center gap-2.5 mb-6">
              <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT_LIGHT, boxShadow: `0 0 10px ${ACCENT_LIGHT}40` }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT_LIGHT }}>Live preview</span>
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
                  <motion.div key={f.label} className="p-3 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <span className="text-white/25 text-[10px]">{f.label}</span>
                    <p className="text-assembl-text/70 font-mono mt-1">{f.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 1 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="wd-1">
                {["PPE check — hard hat, hi-vis, steel caps ✓", "Hazard register reviewed — 3 active hazards ✓", "Site briefing completed ✓", "Emergency contacts confirmed ✓"].map((line, idx) => (
                  <motion.div key={line} className="flex items-center gap-3 text-xs p-3 rounded-lg" style={{ background: `${POUNAMU}08`, border: `1px solid ${POUNAMU}15` }}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${POUNAMU}20` }}>
                      <Check size={11} style={{ color: ACCENT_LIGHT }} />
                    </div>
                    <span className="text-white/60">{line}</span>
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
                  <motion.div key={c.check} className="flex items-center justify-between text-xs p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                    <span className="text-gray-500">{c.check}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-white/25">{c.ref}</span>
                      <span className="text-emerald-400 text-[10px] uppercase font-semibold">{c.st}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 3 && (
              <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="wd-3">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT_LIGHT}15`, boxShadow: `0 0 30px ${ACCENT_LIGHT}15` }}>
                  <Shield size={28} style={{ color: ACCENT_LIGHT }} />
                </div>
                <p className="text-sm text-white/70 mb-1">Evidence pack signed</p>
                <p className="text-[10px] text-white/40">Site induction · Payment claim · Building code compliance — audit-ready trail</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        <KeteRaceVideo slug="waihanga" keteName="Waihanga" accentColor={ACCENT} />

        {/* ── CTA ── */}
        <section className="relative text-center px-6 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${POUNAMU}06 0%, transparent 60%)` }} />
          <motion.div className="relative inline-flex flex-col items-center gap-4 p-10 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${POUNAMU}25`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${POUNAMU}05`,
          }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}40, transparent)` }} />
            <p className="text-sm text-white/60">Ready to streamline your construction compliance?</p>
            <Link to="/waihanga/workflow" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold transition-all overflow-hidden" style={{ color: "#1A1D29" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: POUNAMU }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10">Open Waihanga Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <TextUsButton keteName="Waihanga" accentColor={POUNAMU} showWhatsApp={false} />
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
