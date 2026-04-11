import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, FileText, Wrench, Building, Users } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const BG = "#09090F";
const ACCENT = "#3A7D6E";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const WORKFLOWS = [
  { icon: Shield, label: "Site safety & check-ins", desc: "Digital site check-ins, hazard registers, toolbox talks — safety documented before anyone steps on site." },
  { icon: Building, label: "Building code compliance", desc: "NZ Building Code checklists B1 through H1. Every clause tracked, every sign-off recorded." },
  { icon: FileText, label: "Tender & contract writing", desc: "Tender responses drafted from your past work. Construction Contracts Act 2002 compliance built in." },
  { icon: Wrench, label: "BIM coordination", desc: "3D model viewer, clash detection notes, design stage tracking — Concept through to Construction Docs." },
  { icon: Users, label: "Subcontractor management", desc: "Payment claims, retention money tracking, variation registers — CCA Form 1 compliance handled." },
  { icon: FileText, label: "Document intelligence", desc: "Specs, drawings, RFIs scanned and summarised. Key obligations surfaced before they're missed." },
];

const COMPLIANCE = [
  "Construction Contracts Act 2002 — payment claims enforced",
  "NZ Building Code B1–H1 — checklists tracked",
  "HSWA — site safety documented and auditable",
  "Privacy Act 2020 · IPP 3A — contractor data governed",
];

export default function WaihangaLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Waihanga — Construction | assembl"
          description="Site safety, building code compliance, tender writing, BIM coordination — construction operations without the paper trail chaos. Built for NZ builders."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#3A7D6E" accentLight="#7ECFC2" model="hard-hat" size={160} />

          {/* Kete label */}
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
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${POUNAMU}35`,
              backdropFilter: "blur(16px)",
            }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <p
              className="text-[10px] uppercase tracking-[3px] mb-3"
              style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            >
              governed · human-in-the-loop
            </p>
            <ul className="space-y-2.5">
              {COMPLIANCE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <Link
              to="/contact"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90"
              style={{ background: POUNAMU, color: "#fff" }}
            >
              Book a construction walk-through <ArrowRight size={16} />
            </Link>
            <Link
              to="/waihanga/about"
              className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              View a sample evidence pack
            </Link>
          </motion.div>
        </main>

        {/* Workflows */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <motion.h2
            className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.08em] text-center mb-12"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Nine specialist agents. Consent to completion.
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOWS.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <LiquidGlassCard className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${POUNAMU}15` }}>
                      <w.icon size={20} style={{ color: POUNAMU }} />
                    </div>
                    <h3 className="text-sm font-display font-light uppercase tracking-[0.08em] text-white/90">{w.label}</h3>
                  </div>
                  <p className="text-xs font-body text-white/50 leading-relaxed">{w.desc}</p>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Waihanga"
          keteLabel="Construction"
          accentColor="#3A7D6E"
          defaultAgentId="kaupapa"
          packId="hanga"
          starterPrompts={[
            "What does Waihanga cover for builders?",
            "How does CCA payment claim compliance work?",
            "Tell me about Building Code checklists",
            "What evidence packs do I get for site safety?",
          ]}
        />
      </div>
    </GlowPageWrapper>
  );
}
