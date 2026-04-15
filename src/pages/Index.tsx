import React, { lazy, Suspense, useMemo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { useReturnVisitor } from "@/hooks/useReturnVisitor";
import ContextBar from "@/components/personalized/ContextBar";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteMiniIcon, { type KeteGlyph } from "@/components/kete/KeteMiniIcon";
import WharikiFoundation from "@/components/whariki/WharikiFoundation";
import { KETE } from "@/data/pricing";
import GlassPanel from "@/components/whariki/GlassPanel";
import MaungaBorder from "@/components/whariki/MaungaBorder";
import WovenDivider from "@/components/whariki/WovenDivider";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/* ─── Tokens ─── */
const C = {
  bg: "#0A1628",
  pounamu: "#3A7D6E",
  pounamuLight: "#4FE4A7",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A853",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  bone: "#F5F0E8",
  white: "#FFFFFF",
  t1: "rgba(245,240,232,0.92)",
  t2: "rgba(245,240,232,0.75)",
  t3: "rgba(245,240,232,0.45)",
  border: "rgba(58,125,110,0.15)",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.4, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07, duration: 0.4, ease },
});

/* ─── Data (sourced from pricing.ts) ─── */
const KETE_COLORS: Record<string, { color: string; accentLight: string; to: string }> = {
  manaaki: { color: C.pounamu, accentLight: C.pounamuLight, to: "/manaaki" },
  waihanga: { color: C.navy, accentLight: "#2A5A8C", to: "/waihanga/about" },
  auaha: { color: C.gold, accentLight: C.goldLight, to: "/auaha/about" },
  arataki: { color: "#C8C8C8", accentLight: "#A8A8A8", to: "/arataki" },
  pikau: { color: C.pounamuGlow, accentLight: "#A8E6DA", to: "/pikau" },
};

const PACKS = [
  ...KETE.map((k) => ({
    reo: k.name,
    en: k.eng,
    desc: k.desc,
    ...KETE_COLORS[k.key],
  })),
  { reo: "Toro", en: "Family", desc: "School runs, meal planning, family admin — one less thing to worry about.", color: C.bone, accentLight: "#E8DDD0", to: "/toroa" },
];

const LAYERS = [
  { name: "Perception", desc: "Reads your real inputs: invoices, emails, sensor data, calendar events." },
  { name: "Memory", desc: "Separates verified facts from inferred guesses. Keeps a validated knowledge base." },
  { name: "Reasoning", desc: "Combines pattern recognition with hard compliance rules. Never guesses on legislation." },
  { name: "Action", desc: "Every action is classified: allowed, needs approval, or forbidden. No rogue moves." },
  { name: "Explanation", desc: "Logs the reason behind every material decision in plain language." },
  { name: "Simulation", desc: "Tests workflows against realistic scenarios before they touch production." },
];

const TRUST_NODES = [
  { name: "Kahu", desc: "Policy layer — what's allowed" },
  { name: "Iho", desc: "Routing — picks the right specialist" },
  { name: "Tā", desc: "Execution — does the work" },
  { name: "Mahara", desc: "Memory — learns and remembers" },
  { name: "Mana", desc: "Assurance — proves it was done right" },
];

const EVIDENCE_PACKS = [
  {
    kete: "Manaaki", title: "Monthly Food Safety Report", date: "March 2026",
    checks: [
      { label: "Food Control Plan verification", ref: "FCP-2024", pass: true },
      { label: "Temperature log compliance", ref: "TMP-047", pass: true },
      { label: "Staff certification check", ref: "CERT-12", pass: true },
    ],
  },
  {
    kete: "Waihanga", title: "Site Safety Evidence Pack", date: "March 2026",
    checks: [
      { label: "H&S site briefing log", ref: "HSB-091", pass: true },
      { label: "Payment claim schedule verified", ref: "PCS-004", pass: true },
    ],
  },
  {
    kete: "Arataki", title: "Vehicle Compliance Pack", date: "March 2026",
    checks: [
      { label: "WoF/CoF status verified", ref: "VCC-12", pass: true },
      { label: "Workshop service log", ref: "WSL-033", pass: true },
    ],
  },
];




/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const { profile, atmosphere, isPersonalized } = usePersonalization();
  const hero = profile.preferences.heroVariant;
  useReturnVisitor();

  const orderedPacks = useMemo(() => {
    if (!isPersonalized) return PACKS;
    const keteOrder = profile.preferences.keteOrder;
    const SLUG_MAP: Record<string, string> = {
      manaaki: "Manaaki", waihanga: "Waihanga", auaha: "Auaha",
      arataki: "Arataki", pikau: "Pikau", toro: "Toro",
    };
    return [...PACKS].sort((a, b) => {
      const aIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === a.reo)?.[0] as any ?? "");
      const bIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === b.reo)?.[0] as any ?? "");
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
  }, [isPersonalized, profile.preferences.keteOrder]);

  return (
    <div className="min-h-screen relative" style={{ background: `linear-gradient(180deg, #0A1628 0%, #0D1E35 30%, #0A1628 60%, #0E1A2E 100%)`, color: C.bone }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. Built for NZ."
      />
      <WharikiFoundation />

      <div className="relative z-10">
        <BrandNav />
        <ContextBar />

        {/* ═══ HERO — Full viewport + Kete Particle Canvas ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
          {/* Deep luminous background — not flat */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 55%, rgba(79,228,167,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 30% 30%, rgba(0,220,200,0.10) 0%, transparent 50%),
              radial-gradient(ellipse 35% 45% at 70% 60%, rgba(212,168,83,0.07) 0%, transparent 50%),
              radial-gradient(ellipse 80% 80% at 50% 50%, rgba(10,30,50,0.9) 0%, rgba(6,14,28,1) 100%)
            `,
          }} />
          {/* Breathing glow pulse */}
          <div className="absolute inset-0 pointer-events-none animate-[glowPulse_4s_ease-in-out_infinite]" style={{
            background: "radial-gradient(ellipse 55% 45% at 50% 55%, rgba(79,228,167,0.10) 0%, transparent 60%)",
          }} />
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none">
            <source src="/hero-woven-video.mp4" type="video/mp4" />
          </video>
          {/* Vignette edges */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(6,14,28,0.7) 100%)",
          }} />
          {/* Dark scrim behind text for legibility */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6,14,28,0.6) 0%, transparent 80%)",
          }} />

          <div className="relative z-10 max-w-3xl">
            <motion.h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: isMobile ? "1.75rem" : "3.25rem",
                lineHeight: 1.1,
                letterSpacing: isMobile ? "3px" : "6px",
                textTransform: "uppercase" as const,
                color: C.white,
                textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(6,14,28,0.9)",
              }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              The operating system for NZ business.
            </motion.h1>

            <motion.p
              className="max-w-[640px] mx-auto mt-6 text-base sm:text-lg leading-[1.8]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.8)", textShadow: "0 1px 20px rgba(0,0,0,0.7)" }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease }}
            >
              Specialist operational workflows that reduce admin, surface risk earlier, and keep people in control.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-10 justify-center"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease }}
            >
              <Link to="/contact" className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-semibold rounded-lg transition-all duration-300"
                style={{ background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.5)", color: C.goldLight, boxShadow: "0 0 20px rgba(212,168,83,0.15), inset 0 1px 0 rgba(212,168,83,0.2)", fontFamily: "'Plus Jakarta Sans', sans-serif", backdropFilter: "blur(8px)" }}>
                Get started <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/demos" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-lg transition-all duration-300"
                style={{ border: `1px solid ${C.pounamu}`, color: C.bone, backdropFilter: "blur(8px)" }}>
                See it in action →
              </Link>
            </motion.div>

            <motion.p
              className="mt-10 text-[11px] tracking-[3px] uppercase"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: C.gold, textShadow: "0 1px 16px rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
            >
              Trusted. Intelligent. Aotearoa.
            </motion.p>
          </div>
        </section>

        {/* Weave transition — strands tighten */}
        <div className="relative h-20 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(45deg, rgba(58,125,110,0.06) 1px, transparent 1px), linear-gradient(-45deg, rgba(58,125,110,0.06) 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${C.bg})` }} />
        </div>

        {/* ═══ WHAT WE DO ═══ */}
        <Sect>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fade}>
              <GlassPanel className="p-8 sm:p-10" goldRim>
                <p className="text-[15px] sm:text-base leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
                  Assembl creates New Zealand business specialist operational workflows, that reduce admin, surface risk earlier, and keep people in control.
                </p>
                <WovenDivider className="my-6" />
                <p className="text-[15px] sm:text-base leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
                  We help teams act faster with better information — not replace the people who know the work best.
                </p>
              </GlassPanel>
            </motion.div>
            {/* Convergence visual — cinematic hero style */}
            <motion.div {...fade} className="relative flex justify-center items-center rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
              {/* Static woven background */}
              <div className="absolute inset-0 pointer-events-none opacity-50" style={{
                backgroundImage: `linear-gradient(45deg, ${C.pounamu}12 1px, transparent 1px), linear-gradient(-45deg, ${C.gold}08 1px, transparent 1px), linear-gradient(135deg, ${C.pounamu}06 1px, transparent 1px)`,
                backgroundSize: "18px 18px, 24px 24px, 12px 12px",
              }} />
              {/* Dark scrim */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(6,14,28,0.65) 0%, rgba(6,14,28,0.85) 100%)",
              }} />
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(6,14,28,0.8) 100%)",
              }} />
              {/* Convergence nodes */}
              <div className="relative z-10 flex flex-col items-center py-10">
                <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-[240px]">
                  {PACKS.map((p) => (
                    <span key={p.reo} className="text-[9px] tracking-[2px] uppercase px-2.5 py-1 rounded-full"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: p.color,
                        border: `1px solid ${p.color}40`,
                        background: `${p.color}10`,
                        textShadow: `0 0 12px ${p.color}60`,
                      }}>
                      {p.reo} <span style={{ opacity: 0.55, fontSize: "8px" }}>/ {p.en}</span>
                    </span>
                  ))}
                </div>
                <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${C.pounamu}60, ${C.gold}60)` }} />
                <div className="w-4 h-4 rounded-full mt-1" style={{
                  background: `radial-gradient(circle, ${C.gold} 0%, ${C.pounamu}80 100%)`,
                  boxShadow: `0 0 20px ${C.pounamu}40, 0 0 40px ${C.gold}20`,
                }} />
                <p className="mt-3 text-[10px] tracking-[3px] uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold, textShadow: "0 1px 12px rgba(0,0,0,0.7)" }}>
                  Iho
                </p>
              </div>
            </motion.div>
          </div>
        </Sect>

        {/* ═══ DEMOS SECTION ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-12">
            <Eye color={C.gold}>GOVERNANCE IN ACTION</Eye>
            <H2>See the governance pipeline in action</H2>
            <P className="max-w-xl mx-auto">
              Four 60-second demos showing how Assembl enforces NZ law, tikanga, and human oversight before any output reaches a user.
            </P>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { title: "Pipeline Walkthrough", desc: "Watch a query flow through five governance stages", to: "/demos/pipeline", accent: C.pounamu },
              { title: "Evidence Pack", desc: "See the structured, watermarked output your team keeps", to: "/demos/evidence-pack", accent: C.gold },
              { title: "Confidence Scoring", desc: "Every claim tagged with source, confidence, and citation", to: "/demos/confidence-scoring", accent: C.pounamuLight },
              { title: "Kaitiaki Gate", desc: "Sacred content guardrail and human-in-the-loop escalation", to: "/demos/kaitiaki-gate", accent: "#E87461" },
            ].map((d, i) => (
              <motion.div key={d.title} {...stagger(i)}>
                <Link to={d.to} className="group block h-full">
                  <GlassPanel className="p-6 h-full" tilt>
                    <div className="w-3 h-3 rounded-full mb-4" style={{ background: d.accent, boxShadow: `0 0 12px ${d.accent}40` }} />
                    <h3 className="text-[13px] mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: C.t1 }}>{d.title}</h3>
                    <p className="text-[12px] mb-3" style={{ color: C.t3 }}>{d.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium group-hover:gap-3 transition-all" style={{ color: d.accent }}>
                      Try it <ArrowRight size={10} />
                    </span>
                  </GlassPanel>
                </Link>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ AAAIP CALLOUT ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center">
            <GlassPanel className="p-6 sm:p-8 max-w-2xl mx-auto" goldRim>
              <p className="text-[10px] tracking-[3px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>Research Lab</p>
              <p className="text-[15px] leading-relaxed mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
                Live AAAIP pilots and audit log for the Aotearoa Agentic AI Platform bid.
              </p>
              <Link to="/aaaip" className="inline-flex items-center gap-2 text-[13px] font-medium hover:gap-3 transition-all" style={{ color: C.gold }}>
                View Research Lab <ArrowRight size={12} />
              </Link>
            </GlassPanel>
          </motion.div>
        </Sect>

        {/* ═══ INDUSTRY KETE ═══ */}
        <Sect id="industry-packs">
          <motion.div {...fade} className="text-center mb-12">
            <Eye color={C.pounamu}>YOUR INDUSTRY</Eye>
            <H2>Sector-specific workflow packs</H2>
          </motion.div>
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {orderedPacks.map((p, i) => {
                const isDetected = isPersonalized && i === 0;
                return (
                  <motion.div key={p.reo} layout layoutId={`kete-${p.reo}`} {...stagger(i)}>
                    <Link to={p.to} className="group block h-full">
                      <div className="glass-panel h-full rounded-2xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-4px]"
                        style={isDetected ? { boxShadow: `0 0 40px ${C.gold}12, inset 0 1px 0 rgba(212,168,83,0.25)` } : undefined}>
                        <MaungaBorder variant="top" accentColor={p.color} />
                        <div className="p-6 relative z-[1]">
                          {isDetected && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full tracking-[2px] uppercase inline-block mb-3"
                              style={{ background: `${C.gold}15`, color: `${C.gold}aa`, border: `1px solid ${C.gold}25`, fontFamily: "'JetBrains Mono', monospace" }}>
                              Recommended for you
                            </span>
                          )}
                          <div className="flex items-center gap-4 mb-4">
                            <Suspense fallback={<KeteWeaveVisual size={40} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                              <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={48} />
                            </Suspense>
                            <div>
                              <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.15rem", letterSpacing: "4px", textTransform: "uppercase", color: C.white }}>{p.reo}</h3>
                              <p className="text-[11px] tracking-[1px] uppercase" style={{ color: "rgba(245,240,232,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>{p.en}</p>
                            </div>
                          </div>
                          <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.t2 }}>{p.desc}</p>
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium group-hover:gap-3 transition-all" style={{ color: p.color }}>
                            See a sample pack <ArrowRight size={12} />
                          </span>
                        </div>
                        {/* Fading weave at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-0" style={{
                          backgroundImage: `linear-gradient(45deg, rgba(58,125,110,0.04) 1px, transparent 1px), linear-gradient(-45deg, rgba(58,125,110,0.04) 1px, transparent 1px)`,
                          backgroundSize: "12px 12px",
                          maskImage: "linear-gradient(transparent, rgba(0,0,0,0.3))",
                          WebkitMaskImage: "linear-gradient(transparent, rgba(0,0,0,0.3))",
                        }} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </Sect>

        {/* ═══ HOW IT WORKS — 6 layers ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-12">
            <Eye color={C.gold}>HOW ASSEMBL WORKS</Eye>
            <H2>Six layers of governed intelligence, woven together</H2>
            <P className="max-w-xl mx-auto">
              Every decision is checked, every action is logged, every output is something you can file.
            </P>
          </motion.div>
          <div className="max-w-2xl mx-auto space-y-1">
            {LAYERS.map((layer, i) => (
              <motion.div key={layer.name} {...stagger(i)}>
                <GlassPanel className="p-5 flex items-center gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${i % 2 === 0 ? C.pounamu : C.gold}15` }}>
                    <span className="text-[11px] font-bold" style={{ color: i % 2 === 0 ? C.pounamuLight : C.goldLight, fontFamily: "'JetBrains Mono', monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <p className="text-[13px] mb-0.5" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: C.t1 }}>{layer.name}</p>
                    <p className="text-[13px]" style={{ color: C.t3 }}>{layer.desc}</p>
                  </div>
                </GlassPanel>
                {i < LAYERS.length - 1 && (
                  <div className="flex justify-center">
                    <svg width="4" height="12" viewBox="0 0 4 12">
                      <path d="M1 0 Q2 6 3 12" fill="none" stroke={C.pounamu} strokeWidth="1" opacity="0.3" />
                      <path d="M3 0 Q2 6 1 12" fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.2" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ EVIDENCE PACKS ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-12">
            <Eye color={C.gold}>EVIDENCE PACKS</Eye>
            <H2>Every workflow ends in a pack you can file, forward, or footnote</H2>
            <P className="max-w-xl mx-auto">
              Not a chatbot response. A structured, evidence-backed document your auditor, your bank, or your regulator can trust.
            </P>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {EVIDENCE_PACKS.map((pack, i) => (
              <motion.div key={pack.kete} {...stagger(i)}>
                <GlassPanel className="p-0 h-full" tilt>
                   <MaungaBorder variant="top" />
                   <div className="p-6">
                     <p className="text-[10px] tracking-[3px] uppercase mb-1" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>Evidence Pack</p>
                     <h3 className="text-[15px] mb-0.5" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: C.t1 }}>{pack.title}</h3>
                     <p className="text-[11px] tracking-[1px] uppercase mb-4" style={{ color: C.pounamu, fontFamily: "'JetBrains Mono', monospace" }}>{pack.kete} · {pack.date}</p>
                     <div className="space-y-2">
                       {pack.checks.map((c) => (
                         <div key={c.ref} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(58,125,110,0.06)" }}>
                           <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}20` }}>
                             <Check size={10} style={{ color: C.pounamuLight }} />
                           </div>
                           <span className="text-[12px] flex-1" style={{ color: C.t2 }}>{c.label}</span>
                           <span className="text-[9px] tracking-wider" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>{c.ref}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                   <MaungaBorder variant="bottom" />
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ TRUST / COMPLIANCE PIPELINE ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-12">
            <Eye color={C.pounamu}>TRUST</Eye>
            <H2>Governed from the ground up</H2>
            <P className="max-w-md mx-auto">Five stages of oversight from policy to proof.</P>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 max-w-4xl mx-auto">
            {TRUST_NODES.map((node, i) => (
              <React.Fragment key={node.name}>
                <motion.div {...stagger(i)} className="flex flex-col items-center text-center min-w-[80px]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: `${C.pounamu}15`, boxShadow: `0 0 12px ${C.pounamu}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: C.pounamu }} />
                  </div>
                  <span className="text-[10px] tracking-[2px] uppercase font-bold" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{node.name}</span>
                  <span className="text-[10px] mt-1 max-w-[120px]" style={{ color: C.t3 }}>{node.desc}</span>
                </motion.div>
                {i < TRUST_NODES.length - 1 && (
                  <svg className="hidden sm:block w-10 h-6 shrink-0" viewBox="0 0 40 6">
                    <path d="M0 3 Q10 1 20 3 Q30 5 40 3" fill="none" stroke={C.pounamu} strokeWidth="1" opacity="0.3" />
                    <path d="M0 3 Q10 5 20 3 Q30 1 40 3" fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.2" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </Sect>

        {/* ═══ CTA to Pricing FAQ ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center">
            <Eye color={C.pounamu}>QUESTIONS?</Eye>
            <H2>Got questions?</H2>
            <P className="max-w-md mx-auto mb-8">
              Check our comprehensive FAQ on the pricing page, or get in touch.
            </P>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing#faq" className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium rounded-lg"
                style={{ border: `1px solid ${C.pounamu}`, color: C.bone }}>
                View FAQ
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium rounded-lg"
                style={{ border: `1px solid ${C.gold}50`, color: C.goldLight }}>
                Talk to us
              </Link>
            </div>
          </motion.div>
        </Sect>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative px-4 sm:px-6 py-20 sm:py-24 text-center overflow-hidden">
          {/* Cinematic background */}
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none">
            <source src="/hero-woven-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(6,14,28,0.7) 0%, rgba(6,14,28,0.9) 100%)",
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(6,14,28,0.85) 100%)",
          }} />
          <div className="max-w-xl mx-auto relative z-10">
            <motion.div {...fade}>
              <GlassPanel className="p-10 sm:p-16" goldRim>
                <H2>Ready to see what your industry team looks like?</H2>
                <P className="mb-10">
                  Pick your kete. Run the demo. See the evidence pack it produces.
                </P>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact" className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-semibold rounded-lg transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                      color: C.bg,
                      boxShadow: `0 4px 24px rgba(212,168,83,0.35), 0 0 40px rgba(212,168,83,0.15)`,
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}>
                    See it in action <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ border: `1px solid ${C.pounamu}`, color: C.bone, backdropFilter: "blur(8px)", boxShadow: `0 0 20px ${C.pounamu}15` }}>
                    Book a walkthrough
                  </Link>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>

      <KeteAgentChat
        keteName="assembl" keteLabel="Platform Concierge" accentColor="#3A7D6E"
        defaultAgentId="echo" packId="assembl"
        starterPrompts={["What industry kete is right for my business?", "How does the onboarding process work?", "What's included in the Operator plan?", "How does assembl handle compliance?"]}
      />
    </div>
  );
};

export default Index;

/* ─── Layout primitives ─── */
function Sect({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-4 sm:px-6 py-16 sm:py-20 relative">
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
      <div className="absolute bottom-0 left-0 right-0"><WovenDivider /></div>
    </section>
  );
}

function Eye({ children, color = "#3A7D6E" }: { children: string; color?: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[4px] uppercase mb-4"
      style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
      — {children} —
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-[36px] mb-4"
      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1.15, color: "rgba(245,240,232,0.9)" }}>
      {children}
    </h2>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] sm:text-base leading-relaxed ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.75)" }}>
      {children}
    </p>
  );
}
