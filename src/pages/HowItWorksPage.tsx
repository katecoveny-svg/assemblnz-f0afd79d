import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import IhoRoutingVisualizer from "@/components/demo/IhoRoutingVisualizer";
import MatarikiStarfield from "@/components/MatarikiStarfield";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import GlassKeteSphere from "@/components/kete/GlassKeteSphere";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import NextHero from "@/components/next/NextHero";

/* ─── Design tokens ─── */
const C = {
  bg: "#FAFBFC",
  gold: "#4AA5A8",
  goldLight: "#A8DDDB",
  teal: "#3A7D6E",
  tealLight: "#5AADA0",
  navy: "#1A3A5C",
  text: "#3D4250",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
};

const FONT = {
  heading: "'Lato', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    num: "01",
    title: "Understand your business",
    desc: "During onboarding, we map your current workflows, tools, and pain points. No contract required before we start.",
    details: ["Workflow mapping session", "Workflow mapping", "Pain point audit", "No commitment required"],
    color: C.gold,
    accentLight: C.goldLight,
  },
  {
    num: "02",
    title: "Design your kete",
    desc: "We configure your Assembl instance using the kete and specialist agents that match your industry. You see the design and we iterate based on your feedback.",
    details: ["Custom agent configuration", "Industry-specific workflows", "Compliance pipeline setup", "Iterate with your team"],
    color: C.teal,
    accentLight: C.tealLight,
  },
  {
    num: "03",
    title: "Deploy & evolve",
    desc: "We deploy your instance and run weekly optimisation calls for the first month. Your team learns the platform, and we monitor for improvement opportunities.",
    details: ["Weekly optimisation calls", "Team training sessions", "Performance monitoring", "Continuous improvement"],
    color: C.navy,
    accentLight: "#4A7AB5",
  },
];

const KETE = [
  { name: "Manaaki", sub: "Hospitality", color: C.gold, accentLight: C.goldLight, to: "/packs/manaaki",
    desc: "Food Act plans, liquor licensing, guest experience, tourism operators. Every compliance deadline tracked.",
    agents: ["AURA", "HAVEN", "TIDE", "BEACON"] },
  { name: "Waihanga", sub: "Construction", color: C.teal, accentLight: C.tealLight, to: "/waihanga",
    desc: "Site to sign-off. H&S, consenting, project programmes, quality records. WorkSafe-aligned.",
    agents: ["ĀRAI", "KAUPAPA", "ATA", "RAWA"] },
  { name: "Auaha", sub: "Creative & Media", color: "#A8DDDB", accentLight: "#FFE866", to: "/packs/auaha",
    desc: "Strategy, content, brand voice, design, campaigns, lead formation, analytics — one coordinated studio, not six tools and a freelancer.",
    agents: ["Rautaki", "Kōrero", "Mana Kupu", "Toi"] },
  { name: "Arataki", sub: "Automotive", color: C.navy, accentLight: "#4A7AB5", to: "/arataki",
    desc: "Enquiry → test drive → sale → delivery → service → loyalty. Warranty claims, loan cars, workshop booking — the dealership relay race handled.",
    agents: ["Coming Q3 2026"] },
  { name: "Pikau", sub: "Freight & Customs", color: "#5AADA0", accentLight: "#7ECFC2", to: "/contact",
    desc: "Route optimisation, declarations, broker hand-off, customs compliance. Cross-border ready.",
    agents: ["Coming Q3 2026"] },
];

const PIPELINE = [
  { name: "Kahu", question: "What's allowed here?", desc: "Policy detection", color: C.teal },
  { name: "Iho", question: "Which specialist handles this?", desc: "Routing", color: C.gold },
  { name: "Tā", question: "Does the work, properly", desc: "Execution + NZ English / te reo correctness", color: "#4A7AB5" },
  { name: "Mahara", question: "Checks against what we've learned", desc: "Memory + cross-verification", color: C.teal },
  { name: "Mana", question: "Proves it was done right", desc: "Assurance, disclaimers, human-in-the-loop", color: C.gold },
];

const SEC = "relative px-6 sm:px-8 py-24 sm:py-32";
const INNER = "max-w-5xl mx-auto";
const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.65, ease },
};

/* ─── Weave section divider ─── */
const WeaveDivider = () => (
  <div className="w-full overflow-hidden" style={{ height: 32, opacity: 0.08 }}>
    <svg width="100%" height="32" viewBox="0 0 600 32" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 44 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 14}, 0)`}>
          <path d="M0 16 L7 0 L14 16 L7 32 Z" stroke={C.gold} strokeWidth="0.6" fill="none" />
          <circle cx="7" cy="16" r="1" fill={C.gold} opacity="0.4" />
        </g>
      ))}
    </svg>
  </div>
);

const Eyebrow = ({ children, color = C.gold }: { children: string; color?: string }) => (
  <span
    className="inline-block text-[10px] font-bold tracking-[4px] uppercase mb-5"
    style={{ fontFamily: FONT.mono, color }}
  >
    {children}
  </span>
);

const HowItWorksPage = () => (
  <div className="min-h-screen flex flex-col relative" style={{ background: C.bg, color: C.text }}>
    <SEO
      title="How Assembl Works — Specialist operational workflows for NZ business"
      description="A library of specialist agents across five industry kete, governed by a single compliance pipeline that checks every output against current NZ law. Onboarding industry pilots now."
      path="/how-it-works"
    />
    <BrandNav />
    {/* MatarikiStarfield removed — light glass background only */}

    {/* ═══ HERO — cinematic NextHero shell ═══ */}
    <NextHero
      variant="layered"
      eyebrow="How it works"
      title={
        <>
          Shared intelligence for{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "#3A7D6E" }}>
            Aotearoa business.
          </em>
        </>
      }
      subtitle="Specialist operational workflows packaged into industry kete — each one wrapped in a five-stage compliance pipeline that runs before anything ships, not after. Built around NZ law, not adapted from a US product."
      minHeight="78vh"
    />

    <WeaveDivider />

    {/* ═══ 3-STEP PROCESS ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={INNER}>
        <motion.div {...fade} className="text-center mb-16">
          <Eyebrow color={C.teal}>THREE STEPS</Eyebrow>
          <h2 className="text-2xl sm:text-4xl" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            From first contact to live operations.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <LiquidGlassCard key={s.num} className="p-8 h-full" accentColor={s.color} delay={i * 0.1}>
              <div className="flex items-center gap-4 mb-6">
                <KeteWeaveVisual size={40} accentColor={s.color} accentLight={s.accentLight} showNodes={false} showGlow={false} />
                <div>
                  <span className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: FONT.mono, color: s.color, opacity: 0.7 }}>
                    Step {s.num}
                  </span>
                  <h3 className="text-base" style={{ fontFamily: FONT.heading, fontWeight: 400, letterSpacing: "0.5px" }}>
                    {s.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ fontFamily: FONT.body, color: C.textSec }}>
                {s.desc}
              </p>
              <ul className="space-y-2">
                {s.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs" style={{ fontFamily: FONT.body, color: C.textMuted }}>
                    <Check size={11} style={{ color: s.color, marginTop: "2px", flexShrink: 0 }} />
                    {d}
                  </li>
                ))}
              </ul>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>

    <WeaveDivider />

    {/* ═══ FIVE-STAGE PIPELINE ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={INNER}>
        <motion.div {...fade} className="text-center mb-16">
          <Eyebrow>FIVE-STAGE PIPELINE</Eyebrow>
          <h2 className="text-2xl sm:text-4xl mb-4" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            Every action logged. Every output auditable.
          </h2>
          <p className="text-sm max-w-2xl mx-auto" style={{ fontFamily: FONT.body, color: C.textSec }}>
            Every output passes through all five stages. Draft-only posture — no agent publishes, sends, or executes without a named human operator's approval.
          </p>
        </motion.div>

        {/* Pipeline flow — horizontal with connecting weave */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden sm:block absolute top-1/2 left-[10%] right-[10%] h-px" style={{ background: `linear-gradient(90deg, ${C.teal}30, ${C.gold}30, ${C.teal}30)` }} />

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {PIPELINE.map((stage, i) => (
              <LiquidGlassCard key={stage.name} className="text-center p-5" accentColor={stage.color} delay={i * 0.08} glassIntensity="strong">
                <div className="flex flex-col items-center gap-3">
                  <KeteWeaveVisual size={36} accentColor={stage.color} showNodes={false} showGlow />
                  <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: FONT.mono, color: stage.color, fontWeight: 700 }}>
                    Stage {i + 1}
                  </span>
                  <h3 className="text-sm" style={{ fontFamily: FONT.heading, fontWeight: 400 }}>
                    {stage.name}
                  </h3>
                  <p className="text-[12px] leading-snug" style={{ fontFamily: FONT.body, color: "#1A1D29", fontWeight: 600 }}>
                    "{stage.question}"
                  </p>
                  <p className="text-[10px] tracking-wider uppercase" style={{ fontFamily: FONT.mono, color: C.textSec }}>
                    {stage.desc}
                  </p>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>

    <WeaveDivider />

    {/* ═══ NGĀ KETE — Animated weave cards ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={INNER}>
        <motion.div {...fade} className="text-center mb-16">
          <Eyebrow>NGĀ KETE</Eyebrow>
          <h2 className="text-2xl sm:text-4xl mb-4" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            Five industry kete, woven in Aotearoa.
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ fontFamily: FONT.body, color: C.textSec }}>
            Each kete carries the legislation, workflows and terminology its industry actually uses. They share one intelligence layer underneath — aligning with tikanga Māori governance principles, NZ-hosted.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {KETE.map((k, i) => (
            <LiquidGlassCard key={k.name} className="h-full" accentColor={k.color} delay={i * 0.08}>
              <Link to={k.to} className="block h-full group p-7">
                <div className="flex items-center gap-5 mb-5">
                  <KeteWeaveVisual size={56} accentColor={k.color} accentLight={k.accentLight} showNodes showGlow />
                  <div>
                    <p className="text-[10px] uppercase tracking-[3px]" style={{ fontFamily: FONT.mono, color: k.color }}>
                      {k.sub}
                    </p>
                    <h3 className="text-xl" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
                      {k.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ fontFamily: FONT.body, color: C.textSec }}>
                  {k.desc}
                </p>
                {/* Agent pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {k.agents.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] px-2.5 py-1 rounded-full"
                      style={{
                        fontFamily: FONT.mono,
                        background: `${k.color}12`,
                        color: k.color,
                        border: `1px solid ${k.color}25`,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <div
                  className="flex items-center gap-1 text-[11px] transition-all duration-300 group-hover:gap-2"
                  style={{ fontFamily: FONT.body, color: k.color, fontWeight: 500 }}
                >
                  {k.to === "/contact" ? "Talk to us" : "Explore kete"} <ArrowRight size={11} />
                </div>
              </Link>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>

    <WeaveDivider />

    {/* ═══ IHO ROUTING DEMO ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={`${INNER} max-w-3xl`}>
        <motion.div {...fade} className="text-center mb-10">
          <Eyebrow color={C.teal}>LIVE DEMO</Eyebrow>
          <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            See Iho route in real time
          </h2>
          <p className="text-sm" style={{ fontFamily: FONT.body, color: C.textSec }}>
            Type any business question and watch the routing engine classify intent, load skills, and select the right agent.
          </p>
        </motion.div>
        <LiquidGlassCard accentColor={C.teal} glassIntensity="strong" className="p-1">
          <IhoRoutingVisualizer />
        </LiquidGlassCard>
      </div>
    </section>

    <WeaveDivider />

    {/* ═══ PRICING NUDGE ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={`${INNER} max-w-3xl text-center`}>
        <motion.div {...fade}>
          <div className="flex justify-center mb-6">
            <KeteWeaveVisual size={48} accentColor={C.teal} accentLight={C.tealLight} showNodes={false} />
          </div>
          <Eyebrow color={C.teal}>PRICING</Eyebrow>
          <h2 className="text-2xl sm:text-3xl mb-6" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            Pricing that fits an NZ small business.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ fontFamily: FONT.body, color: C.textSec }}>
            Priced by the kete you need each month. Setup fees can be split across the first 3 invoices on request.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:scale-[1.02]"
            style={{
              fontFamily: FONT.heading,
              fontWeight: 400,
              background: "rgba(58,125,110,0.1)",
              border: "1px solid rgba(58,125,110,0.3)",
              color: C.teal,
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 20px rgba(58,125,110,0.08)",
            }}
          >
            See full pricing <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ═══ CTA ═══ */}
    <section className={`${SEC} z-10`}>
      <div className={`${INNER} max-w-2xl text-center mx-auto`}>
        <motion.div {...fade}>
          <div className="flex justify-center mb-6">
            <KeteWeaveVisual size={64} accentColor={C.gold} accentLight={C.goldLight} />
          </div>
          <h2 className="text-2xl sm:text-3xl mb-4" style={{ fontFamily: FONT.heading, fontWeight: 300, letterSpacing: "1px" }}>
            Ready to see how it works for your business?
          </h2>
          <p className="text-sm mb-8" style={{ fontFamily: FONT.body, color: C.textSec }}>
            Tell us about your business and we'll show you exactly which kete fit your workflows.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:scale-[1.02]"
            style={{
              fontFamily: FONT.heading,
              fontWeight: 400,
              background: C.gold,
              color: "#09090F",
              boxShadow: `0 0 30px ${C.gold}30`,
            }}
          >
            Get started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default HowItWorksPage;
