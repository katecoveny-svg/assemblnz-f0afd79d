/**
 * AKO — Early Childhood Education kete landing page.
 *
 * Shipped 2026-04-18 ahead of the 20 April 2026 ECE licensing criteria wedge.
 * HIGH-RISK classified: admin & compliance assistance only — never replaces
 * sleep checks, ratio checks, or sight supervision.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Shield, Baby, FileSearch, FileText,
  Gauge, ShieldAlert, Sparkles,
} from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import HeroBackdropNext from "@/components/next/HeroBackdropNext";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import KeteSwitcherPill from "@/components/kete/KeteSwitcherPill";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import TextUsButton from "@/components/kete/TextUsButton";
import AkoCriteriaMatcherDemo from "@/components/ako/AkoCriteriaMatcherDemo";
import AkoWorkflowExplorer from "@/components/ako/AkoWorkflowExplorer";
import AkoTransparencyPackGenerator from "@/components/ako/AkoTransparencyPackGenerator";

const ACCENT = "#7BA7C7";       // soft sky — calm, professional, education-coded
const ACCENT_LIGHT = "#A8C8DD";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const AGENTS = [
  { code: "APEX-AKO", role: "20 April 2026 licensing criteria specialist (~78 criteria)", icon: FileSearch },
  { code: "NOVA-AKO", role: "Whānau-facing transparency pack writer (reading age 12)", icon: FileText },
  { code: "MANA-AKO", role: "Graduated enforcement readiness scorer ()", icon: Gauge },
];

const COMPLIANCE = [
  "Education and Training Act 2020 — every output cited",
  "20 April 2026 licensing criteria — ~78 criteria after consolidation",
  "Director of Regulation regime (operational from 20 Apr 2026)",
  "Te Whāriki — curriculum integration evidence-mapped",
];

const WORKFLOWS = [
  {
    title: "Licensing Criteria Matcher",
    sub: "APEX-AKO → NOVA-AKO → MANA",
    desc: "Ingests current centre policies (upload or URL), matches line-by-line against the 20 April 2026 criteria, outputs a gap report with draft rewrites in your voice.",
    icon: FileSearch,
    flagship: true,
  },
  {
    title: "Transparency Pack Generator",
    sub: "NOVA-AKO → ANCHOR → MANA",
    desc: "Generates the four mandatory parent-facing documents — complaints procedure, ERO access, licensing status, operational summary. Auto-refreshes when criteria change.",
    icon: FileText,
  },
  {
    title: "Graduated Enforcement Readiness",
    sub: "MANA-AKO → APEX → AROHA",
    desc: "Single dashboard per centre: against each of the ~78 criteria, with the top 3 remediation priorities ranked by Director of Regulation focus areas.",
    icon: Gauge,
  },
];

export default function AkoLandingPage() {
  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Ako — Early Childhood Education | assembl"
          description="Built for the 20 April 2026 ECE licensing wedge. Licensing criteria matcher, transparency pack generator, graduated enforcement readiness — for 4,500+ NZ services."
        />
        <BrandNav />
        <KeteSwitcherPill activeKete="ako" />

        {/* ── Hero ── */}
        <HeroBackdropNext variant="layered" accentTint={`${POUNAMU}10`}>
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}10 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${POUNAMU}06 0%, transparent 60%)`,
          }} />

          <LandingKeteHero accentColor={ACCENT} accentLight={ACCENT_LIGHT} />

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative z-10 text-[11px] tracking-[5px] uppercase mb-3"
            style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}
          >
            AKO · TE KETE ARONUI · KNOWLEDGE & LEARNING
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative z-10 text-4xl md:text-5xl font-light tracking-tight max-w-3xl"
            style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}
          >
            Built for the 20 April 2026 ECE licensing wedge
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative z-10 mt-5 max-w-2xl text-[15px] leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            98 criteria reduced to ~78. New Director of Regulation. Graduated enforcement tools.
            Every centre re-orienting compliance simultaneously. Ako gives head teachers their hours back —
            three workflows, nothing more, shipped on day one.
          </motion.p>

          {/* Sector strip */}
          <motion.div
            className="relative z-10 mt-10 max-w-4xl w-full"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { stat: "4,500+", label: "Licensed early learning services" },
                { stat: "20 Apr 2026", label: "New criteria take effect — wedge date" },
                { stat: "98 → 78", label: "Criteria consolidated · ~20% removed" },
                { stat: "23 Feb 2026", label: "Director of Regulation operational" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 text-left"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${ACCENT}20`,
                  }}
                >
                  <div className="text-2xl font-light" style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}>
                    {m.stat}
                  </div>
                  <div className="text-[11px] tracking-wider mt-1" style={{ color: "#6B7280" }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 flex gap-3 flex-wrap justify-center relative z-10">
            <TextUsButton keteName="AKO" accentColor={ACCENT} />
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light transition-all hover:gap-3"
              style={{ background: ACCENT, color: "white", boxShadow: `0 8px 24px ${ACCENT}40` }}
            >
              Join the AKO pilot <ArrowRight size={14} />
            </Link>
          </div>

          {/* HIGH-RISK disclaimer */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative z-10 mt-8 max-w-2xl"
          >
            <div
              className="rounded-2xl p-4 flex items-start gap-3 text-left"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(192, 89, 79, 0.25)",
              }}
            >
              <ShieldAlert size={18} style={{ color: "#C0594F", flexShrink: 0, marginTop: 2 }} />
              <div className="text-[12px] leading-relaxed" style={{ color: "#3D4250" }}>
                <strong style={{ color: "#C0594F" }}>HIGH-RISK classification.</strong>{" "}
                Ako agents provide administrative and compliance assistance only.
                They never replace the sleep check, ratio check, or sight-supervision obligations
                that remain with qualified kaiako at all times.
              </div>
            </div>
          </motion.div>
        </main>

        {/* ── Flagship demo: Criteria Matcher ── */}
        <section className="px-6 py-20" style={{ background: `${ACCENT}06` }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                FLAGSHIP WORKFLOW · LIVE DEMO
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                Licensing Criteria Matcher
              </h2>
              <p className="mt-3 text-sm max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
                Upload your current policies. APEX-AKO matches them line-by-line against the 20 April 2026 criteria.
                NOVA-AKO drafts replacement language in your voice. MANA signs the dated evidence pack.
              </p>
            </motion.div>

            <AkoCriteriaMatcherDemo />
          </div>
        </section>

        {/* ── All 3 workflows ── */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                THE THREE AKO WORKFLOWS · MVP
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                Three core workflows. Nothing more.
              </h2>
              <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                Shipped on Lovable, Supabase and Claude — the existing stack. No expansion until the wedge is held.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {WORKFLOWS.map((w, i) => {
                const Icon = w.icon;
                return (
                  <motion.div
                    key={w.title}
                    custom={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="rounded-2xl p-6 relative"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(20px)",
                      border: w.flagship ? `1.5px solid ${ACCENT}50` : "1px solid rgba(0,0,0,0.05)",
                      boxShadow: w.flagship ? `0 12px 40px ${ACCENT}20` : "0 4px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    {w.flagship && (
                      <span className="absolute top-3 right-3 text-[9px] tracking-[2px] uppercase px-2 py-0.5 rounded-full"
                        style={{ background: ACCENT, color: "white", fontFamily: "'JetBrains Mono', monospace" }}>
                        Flagship
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
                      <Icon size={18} style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-base font-medium mb-1" style={{ color: "#3D4250" }}>{w.title}</h3>
                    <p className="text-[10px] tracking-wider uppercase mb-3" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                      {w.sub}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{w.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Explorer for the other 2 workflows */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="mb-6"
            >
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                EXPLORE THE PIPELINE · CLICK A WORKFLOW
              </p>
              <h3 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                What an evidence-pack output looks like
              </h3>
            </motion.div>
            <AkoWorkflowExplorer accent={ACCENT} />

            <div className="mt-10">
              <AkoTransparencyPackGenerator />
            </div>
          </div>
        </section>

        {/* ── Agents ── */}
        <section className="px-6 py-20" style={{ background: "rgba(58,125,110,0.02)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>
                YOUR AKO TEAM
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                Three specialist agents · all HIGH-RISK
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.code}
                    className="rounded-xl p-5 text-center"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      border: `1px solid ${ACCENT}20`,
                    }}
                  >
                    <Icon size={22} style={{ color: ACCENT, margin: "0 auto 10px" }} />
                    <div className="text-[13px] font-medium mb-1" style={{ color: "#3D4250", fontFamily: "'JetBrains Mono', monospace" }}>
                      {agent.code}
                    </div>
                    <div className="text-[12px] mt-1 leading-snug" style={{ color: "#6B7280" }}>
                      {agent.role}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Compliance — single line + live status ── */}
        <section className="px-6 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <LiveStatusStrip pack="ako" agentCodes={["edu", "guardian", "operations"]} accent={POUNAMU} />
            <p className="text-xs" style={{ color: "#5B6374", letterSpacing: "0.02em" }}>
              <span style={{ color: POUNAMU, fontWeight: 500 }}>Governed by</span> Education and Training Act 2020, 20 April 2026 licensing criteria, Te Whāriki, Director of Regulation regime.
            </p>
          </div>
        </section>

        {/* ── Chat ── */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <KeteAgentChat
              keteName="AKO"
              keteLabel="Early Childhood Education"
              accentColor={ACCENT}
              defaultAgentId="apex-ako"
              packId="ako"
              starterPrompts={[
                "Match my Health & Safety policy against the 20 April 2026 criteria",
                "Generate our four parent-facing transparency documents",
                "Where am I RED for the Director of Regulation regime?",
              ]}
            />
          </div>
        </section>

        
        <BrandFooter />
      </div>
    </LightPageShell>
  );
}
