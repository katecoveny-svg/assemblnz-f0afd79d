import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, FileText, Wrench, Building, Users, HardHat, ClipboardCheck, AlertTriangle, Ruler } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const BG = "#09090F";
const ACCENT = "#3A7D6E";
const POUNAMU = "#3A7D6E";
const ACCENT_LIGHT = "#7ECFC2";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
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
  { step: "Create project", detail: "Site address, consent number, scope, and key dates" },
  { step: "Site induction", detail: "Digital check-in, hazard register review, PPE confirmation" },
  { step: "Payment claim", detail: "CCA-compliant claim generated from scheduled values" },
  { step: "Evidence pack", detail: "Compliance trail signed and ready for audit" },
];

export default function WaihangaLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Waihanga — Construction | assembl"
          description="Site safety, building code compliance, tender writing, BIM coordination — construction operations without the paper trail chaos. Built for NZ builders."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#3A7D6E" accentLight="#7ECFC2" model="hard-hat" size={160} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            WAIHANGA · CONSTRUCTION
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Site to sign-off. Tracked.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ construction
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Building Code checklists, CCA compliance, BIM coordination, site check-ins, and tender management — documented, checked, and evidence-packed.
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
            <Link to="/waihanga/workflow" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${POUNAMU}, hsl(42 78% 55%))`, color: "#fff", boxShadow: `0 0 30px ${POUNAMU}40` }}>
              Launch Construction Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Book a walk-through
            </Link>
          </motion.div>
        </main>

        {/* ── Agent Network ── */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <motion.h2
            className="text-center text-xs uppercase tracking-[4px] mb-10"
            style={{ color: ACCENT_LIGHT, fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            9 specialist agents
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT_LIGHT}15` }}>
                    <a.icon size={16} style={{ color: ACCENT_LIGHT }} />
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
            style={{ color: ACCENT_LIGHT, fontFamily: "'JetBrains Mono', monospace" }}
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
                  background: activeDemo === i ? `${ACCENT_LIGHT}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeDemo === i ? ACCENT_LIGHT + "40" : "rgba(255,255,255,0.06)"}`,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: activeDemo === i ? ACCENT_LIGHT : "rgba(255,255,255,0.08)", color: activeDemo === i ? BG : "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-white/70">{d.step}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{d.detail}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="mt-8 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT_LIGHT}20` }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_LIGHT }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT_LIGHT }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Project", value: "Riverstone Apartments — Stage 2" },
                  { label: "Consent", value: "BCA-2026-04182" },
                  { label: "Site", value: "42 Hobson St, Auckland CBD" },
                  { label: "Scope", value: "12-unit residential, 4 storeys" },
                  { label: "Start", value: "22 Apr 2026" },
                  { label: "PC target", value: "18 Dec 2026" },
                ].map(f => (
                  <div key={f.label} className="text-xs"><span className="text-white/30">{f.label}: </span><span className="text-white/70 font-mono">{f.value}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 1 && (
              <div className="space-y-2">
                {["PPE check — hard hat, hi-vis, steel caps ✓", "Hazard register reviewed — 3 active hazards ✓", "Site briefing completed ✓", "Emergency contacts confirmed ✓"].map(line => (
                  <div key={line} className="flex items-center gap-2 text-xs"><Check size={12} style={{ color: POUNAMU }} /><span className="text-white/60">{line}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 2 && (
              <div className="space-y-2">
                {[
                  { check: "CCA 2002 s20 — payment claim format valid", st: "pass" },
                  { check: "Schedule of values — $142,000 claimed", st: "pass" },
                  { check: "Retention — 5% held per contract", st: "pass" },
                  { check: "Working day count — within 20 WD window", st: "pass" },
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
                <Shield size={32} style={{ color: ACCENT_LIGHT }} className="mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-1">Evidence pack signed</p>
                <p className="text-[10px] text-white/40">Site induction · Payment claim · Building code compliance — audit-ready trail</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center px-6 pb-24">
          <motion.div
            className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}25` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-sm text-white/60">Ready to streamline your construction compliance?</p>
            <Link to="/waihanga/workflow" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Waihanga Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Waihanga" keteLabel="Construction" accentColor="#3A7D6E"
          defaultAgentId="kaupapa" packId="hanga"
          starterPrompts={["What does Waihanga cover for builders?", "How does CCA payment claim compliance work?", "Tell me about Building Code checklists", "What evidence packs do I get for site safety?"]}
        />
      </div>
    </GlowPageWrapper>
  );
}
