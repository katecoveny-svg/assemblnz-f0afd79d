import React, { lazy, Suspense, useMemo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ArrowRight, Check, Shield, Layers, Brain, Eye as EyeIcon, Zap, TestTube } from "lucide-react";
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
import WharikiFoundation from "@/components/whariki/WharikiFoundation";
import WovenDivider from "@/components/whariki/WovenDivider";
import { KETE } from "@/data/pricing";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/* ─── Tokens ─── */
const C = {
  bg: "#080E1A",
  pounamu: "#3A7D6E",
  pounamuLight: "#7ECFC2",
  pounamuGlow: "#5AADA0",
  gold: "#D4A853",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  bone: "#F5F0E8",
  white: "#FFFFFF",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08, duration: 0.5, ease },
});

/* ─── Data ─── */
const KETE_COLORS: Record<string, { color: string; accentLight: string; to: string }> = {
  manaaki: { color: C.pounamu, accentLight: C.pounamuLight, to: "/manaaki" },
  waihanga: { color: C.navy, accentLight: "#2A5A8C", to: "/waihanga/about" },
  auaha: { color: C.gold, accentLight: C.goldLight, to: "/auaha/about" },
  arataki: { color: "#C8C8C8", accentLight: "#A8A8A8", to: "/arataki" },
  pikau: { color: C.pounamuGlow, accentLight: "#A8E6DA", to: "/pikau" },
};

const PACKS = [
  ...KETE.map((k) => ({
    reo: k.name, en: k.eng, desc: k.desc,
    ...KETE_COLORS[k.key],
  })),
  { reo: "Toro", en: "Family", desc: "School runs, meal planning, family admin — one less thing to worry about.", color: C.bone, accentLight: "#E8DDD0", to: "/toroa" },
];

const LAYERS_DATA = [
  { name: "Perception", desc: "Reads your real inputs: invoices, emails, sensor data, calendar events.", icon: EyeIcon },
  { name: "Memory", desc: "Separates verified facts from inferred guesses. Keeps a validated knowledge base.", icon: Brain },
  { name: "Reasoning", desc: "Combines pattern recognition with hard compliance rules. Never guesses on legislation.", icon: Layers },
  { name: "Action", desc: "Every action is classified: allowed, needs approval, or forbidden.", icon: Zap },
  { name: "Explanation", desc: "Logs the reason behind every material decision in plain language.", icon: Shield },
  { name: "Simulation", desc: "Tests workflows against realistic scenarios before they touch production.", icon: TestTube },
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
  const { profile, isPersonalized } = usePersonalization();
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
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.bone }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. Built for NZ."
      />
      <WharikiFoundation />

      <div className="relative z-10">
        <BrandNav />
        <ContextBar />

        {/* ═══════════════════════════════════════════════════
            HERO — Cinematic full viewport
        ═══════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Deep luminous layers */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse 45% 40% at 50% 48%, rgba(212,168,83,0.10) 0%, transparent 50%),
              radial-gradient(ellipse 65% 55% at 50% 52%, rgba(58,125,110,0.08) 0%, transparent 55%),
              radial-gradient(ellipse 90% 90% at 50% 50%, rgba(8,14,26,0.85) 0%, ${C.bg} 100%)
            `,
          }} />

          {/* Animated orbs */}
          <motion.div className="absolute pointer-events-none" style={{ width: 500, height: 500, top: "5%", left: "5%", background: "radial-gradient(circle, rgba(58,125,110,0.10) 0%, transparent 60%)", filter: "blur(80px)" }}
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute pointer-events-none" style={{ width: 400, height: 400, bottom: "10%", right: "8%", background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 60%)", filter: "blur(70px)" }}
            animate={{ x: [0, -40, 0], y: [0, 25, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
          {/* Central bloom */}
          <motion.div className="absolute pointer-events-none" style={{ width: 350, height: 350, top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 50%)", filter: "blur(50px)" }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

          {/* Video layer */}
          <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ opacity: 0.25, mixBlendMode: "screen" }}>
            <source src="/hero-woven-video.mp4" type="video/mp4" />
          </video>

          {/* Edge vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(8,14,26,0.9) 100%)" }} />
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: `linear-gradient(transparent, ${C.bg})` }} />

          <div className="relative z-10 max-w-3xl">
            {/* Status badge */}
            <motion.div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-12"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: C.pounamuGlow, boxShadow: `0 0 10px ${C.pounamuGlow}80` }} />
              <span className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
                Now onboarding NZ businesses
              </span>
            </motion.div>

            {/* H1 — Bigger, bolder, glowing */}
            <motion.h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: isMobile ? "2.25rem" : "4rem",
                lineHeight: 1.05,
                letterSpacing: isMobile ? "6px" : "12px",
                textTransform: "uppercase" as const,
                color: C.white,
                textShadow: "0 0 60px rgba(255,255,255,0.12), 0 0 120px rgba(212,168,83,0.08)",
              }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease }}
            >
              The operating system<br />for NZ business
            </motion.h1>

            {/* Glowing accent bar */}
            <motion.div className="mx-auto mt-10 mb-10" style={{ width: 100, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, boxShadow: `0 0 30px rgba(212,168,83,0.5), 0 0 60px rgba(212,168,83,0.2)` }}
              initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease }} />

            <motion.p
              className="max-w-[500px] mx-auto text-[16px] sm:text-[18px] leading-[2]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.6)" }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
            >
              Specialist workflows that reduce admin, surface risk earlier, and keep your people in control.
            </motion.p>

            {/* CTA buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-5 mt-16 justify-center"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease }}
            >
              <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-14 py-[18px] text-[11px] font-semibold rounded-full transition-all duration-300 tracking-[3px] uppercase hover:scale-[1.03]"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: C.bg,
                  boxShadow: `0 4px 30px rgba(212,168,83,0.35), 0 0 60px rgba(212,168,83,0.15)`,
                  fontFamily: "'Lato', sans-serif",
                }}>
                Get started <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link to="/demos" className="group inline-flex items-center justify-center gap-3 px-14 py-[18px] text-[11px] font-medium rounded-full transition-all duration-300 tracking-[3px] uppercase hover:border-white/20"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(16px)",
                  fontFamily: "'Lato', sans-serif",
                }}>
                See it in action <ArrowRight size={13} className="opacity-40 group-hover:opacity-70 transition-opacity" />
              </Link>
            </motion.div>

            <motion.p className="mt-24 text-[9px] tracking-[6px] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
            >
              Trusted · Intelligent · Aotearoa
            </motion.p>
          </div>
        </section>

        {/* ═══ WHAT WE DO — Bright cards on dark ═══ */}
        <Sect>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div {...fade}>
              <LuminousCard>
                <p className="text-[10px] tracking-[4px] uppercase mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>
                  — What we do —
                </p>
                <p className="text-[17px] leading-[2] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
                  Assembl creates New Zealand business specialist operational workflows that reduce admin, surface risk earlier, and keep people in control.
                </p>
                <div className="h-px my-6" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent)" }} />
                <p className="text-[15px] leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)" }}>
                  We help teams act faster with better information — not replace the people who know the work best.
                </p>
              </LuminousCard>
            </motion.div>

            {/* Kete convergence — brighter */}
            <motion.div {...fade}>
              <LuminousCard className="text-center py-12">
                <p className="text-[10px] tracking-[4px] uppercase mb-8" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                  Industry kete
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {PACKS.map((p) => (
                    <Link to={p.to} key={p.reo} className="text-[9px] tracking-[2px] uppercase px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "rgba(255,255,255,0.7)",
                        border: `1px solid rgba(255,255,255,0.1)`,
                        background: `rgba(255,255,255,0.03)`,
                      }}>
                      <span style={{ color: p.color }}>{p.reo}</span> <span style={{ opacity: 0.4 }}>/ {p.en}</span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.1), ${C.gold}80)` }} />
                  <div className="w-5 h-5 rounded-full mt-2" style={{
                    background: `radial-gradient(circle, ${C.goldLight} 0%, ${C.gold} 100%)`,
                    boxShadow: `0 0 30px ${C.gold}50, 0 0 60px ${C.gold}20`,
                  }} />
                  <p className="mt-3 text-[9px] tracking-[4px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>
                    Iho Router
                  </p>
                </div>
              </LuminousCard>
            </motion.div>
          </div>
        </Sect>

        {/* ═══ DEMOS — Glowing cards ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.gold}>Governance in action</SectionEyebrow>
            <SectionH2>See the pipeline in action</SectionH2>
            <SectionP>Four 60-second demos showing how Assembl enforces NZ law, tikanga, and human oversight.</SectionP>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Pipeline Walkthrough", desc: "Watch a query flow through five governance stages", to: "/demos/pipeline", accent: C.pounamuGlow },
              { title: "Evidence Pack", desc: "See the structured output your team keeps", to: "/demos/evidence-pack", accent: C.gold },
              { title: "Confidence Scoring", desc: "Every claim tagged with source and citation", to: "/demos/confidence-scoring", accent: C.pounamuLight },
              { title: "Kaitiaki Gate", desc: "Sacred content guardrail and human-in-the-loop", to: "/demos/kaitiaki-gate", accent: "#E87461" },
            ].map((d, i) => (
              <motion.div key={d.title} {...stagger(i)}>
                <Link to={d.to} className="group block h-full">
                  <LuminousCard className="h-full hover:translate-y-[-6px] transition-all duration-300">
                    <div className="w-3 h-3 rounded-full mb-5" style={{ background: d.accent, boxShadow: `0 0 20px ${d.accent}50, 0 0 40px ${d.accent}20` }} />
                    <h3 className="text-[13px] mb-3 tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>{d.title}</h3>
                    <p className="text-[12px] leading-[1.8] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{d.desc}</p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-medium group-hover:gap-3 transition-all" style={{ color: d.accent }}>
                      Try it <ArrowRight size={10} />
                    </span>
                  </LuminousCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ INDUSTRY KETE ═══ */}
        <Sect id="industry-packs">
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.pounamuGlow}>Your industry</SectionEyebrow>
            <SectionH2>Sector-specific workflow packs</SectionH2>
          </motion.div>
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {orderedPacks.map((p, i) => {
                const isDetected = isPersonalized && i === 0;
                return (
                  <motion.div key={p.reo} layout layoutId={`kete-${p.reo}`} {...stagger(i)}>
                    <Link to={p.to} className="group block h-full">
                      <LuminousCard className="h-full hover:translate-y-[-6px] transition-all duration-300" accentColor={p.color}>
                        {isDetected && (
                          <span className="text-[9px] px-3 py-1 rounded-full tracking-[2px] uppercase inline-block mb-4"
                            style={{ background: `${C.gold}15`, color: C.gold, border: `1px solid ${C.gold}30`, fontFamily: "'JetBrains Mono', monospace" }}>
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center gap-4 mb-5">
                          <Suspense fallback={<KeteWeaveVisual size={40} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                            <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={48} />
                          </Suspense>
                          <div>
                            <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.2rem", letterSpacing: "5px", textTransform: "uppercase", color: C.white }}>{p.reo}</h3>
                            <p className="text-[11px] tracking-[2px] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.en}</p>
                          </div>
                        </div>
                        <p className="text-[14px] leading-[1.8] mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>{p.desc}</p>
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium group-hover:gap-3 transition-all" style={{ color: p.color }}>
                          Explore <ArrowRight size={12} />
                        </span>
                      </LuminousCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </Sect>

        {/* ═══ HOW IT WORKS — 6 layers ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.gold}>How assembl works</SectionEyebrow>
            <SectionH2>Six layers of governed intelligence</SectionH2>
            <SectionP>Every decision checked, every action logged, every output something you can file.</SectionP>
          </motion.div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
            {LAYERS_DATA.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <motion.div key={layer.name} {...stagger(i)}>
                  <LuminousCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `rgba(255,255,255,0.06)`, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <Icon size={18} style={{ color: i % 2 === 0 ? C.pounamuLight : C.goldLight }} />
                      </div>
                      <div>
                        <p className="text-[13px] mb-1 tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>
                          <span className="text-[10px] mr-2" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                          {layer.name}
                        </p>
                        <p className="text-[12px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.4)" }}>{layer.desc}</p>
                      </div>
                    </div>
                  </LuminousCard>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ EVIDENCE PACKS ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.gold}>Evidence packs</SectionEyebrow>
            <SectionH2>Every workflow ends in a pack you can file</SectionH2>
            <SectionP>Not a chatbot response. A structured document your auditor, bank, or regulator can trust.</SectionP>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {EVIDENCE_PACKS.map((pack, i) => (
              <motion.div key={pack.kete} {...stagger(i)}>
                <LuminousCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: C.gold, boxShadow: `0 0 8px ${C.gold}60` }} />
                    <p className="text-[9px] tracking-[3px] uppercase" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>Evidence Pack</p>
                  </div>
                  <h3 className="text-[15px] mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>{pack.title}</h3>
                  <p className="text-[10px] tracking-[2px] uppercase mb-5" style={{ color: C.pounamuGlow, fontFamily: "'JetBrains Mono', monospace" }}>{pack.kete} · {pack.date}</p>
                  <div className="space-y-2.5">
                    {pack.checks.map((c) => (
                      <div key={c.ref} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamuGlow}20` }}>
                          <Check size={11} style={{ color: C.pounamuLight }} />
                        </div>
                        <span className="text-[12px] flex-1" style={{ color: "rgba(255,255,255,0.6)" }}>{c.label}</span>
                        <span className="text-[9px] tracking-wider" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{c.ref}</span>
                      </div>
                    ))}
                  </div>
                </LuminousCard>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ TRUST PIPELINE ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.pounamuGlow}>Trust</SectionEyebrow>
            <SectionH2>Governed from the ground up</SectionH2>
            <SectionP>Five stages of oversight from policy to proof.</SectionP>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-3 max-w-4xl mx-auto">
            {TRUST_NODES.map((node, i) => (
              <React.Fragment key={node.name}>
                <motion.div {...stagger(i)} className="flex flex-col items-center text-center min-w-[100px]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: `0 0 20px ${C.pounamuGlow}15` }}>
                    <div className="w-3.5 h-3.5 rounded-full" style={{ background: C.pounamuGlow, boxShadow: `0 0 12px ${C.pounamuGlow}60` }} />
                  </div>
                  <span className="text-[10px] tracking-[3px] uppercase font-bold" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{node.name}</span>
                  <span className="text-[10px] mt-2 max-w-[130px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.35)" }}>{node.desc}</span>
                </motion.div>
                {i < TRUST_NODES.length - 1 && (
                  <div className="hidden sm:block w-8 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Sect>

        {/* ═══ CTA ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center">
            <SectionEyebrow color={C.pounamuGlow}>Questions?</SectionEyebrow>
            <SectionH2>Got questions?</SectionH2>
            <SectionP className="mb-10">Check our FAQ on the pricing page, or get in touch.</SectionP>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/pricing#faq" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-[11px] tracking-[2px] uppercase font-medium rounded-full transition-all duration-300 hover:border-white/20"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Lato', sans-serif" }}>
                View FAQ
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-[11px] tracking-[2px] uppercase font-medium rounded-full transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.bg, boxShadow: `0 4px 24px rgba(212,168,83,0.3)`, fontFamily: "'Lato', sans-serif" }}>
                Talk to us
              </Link>
            </div>
          </motion.div>
        </Sect>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative px-6 py-32 text-center overflow-hidden">
          {/* Bright glow behind */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.06) 0%, transparent 60%)`,
          }} />
          <div className="max-w-xl mx-auto relative z-10">
            <motion.div {...fade}>
              <LuminousCard className="p-12 sm:p-16 text-center">
                <SectionH2>Ready to see your industry team?</SectionH2>
                <SectionP className="mb-12">Pick your kete. Run the demo. See the evidence pack it produces.</SectionP>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-12 py-4 text-[11px] tracking-[2px] uppercase font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
                    style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.bg, boxShadow: `0 4px 30px rgba(212,168,83,0.35), 0 0 60px rgba(212,168,83,0.15)`, fontFamily: "'Lato', sans-serif" }}>
                    See it in action <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-12 py-4 text-[11px] tracking-[2px] uppercase font-medium rounded-full transition-all duration-300 hover:border-white/20"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Lato', sans-serif" }}>
                    Book a walkthrough
                  </Link>
                </div>
              </LuminousCard>
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

/* ─── Layout Primitives ─── */

function Sect({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-6 py-28 sm:py-36 relative">
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
      {/* Subtle section divider */}
      <div className="absolute bottom-0 left-[15%] right-[15%] h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
      }} />
    </section>
  );
}

function SectionEyebrow({ children, color = "#3A7D6E" }: { children: string; color?: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[5px] uppercase mb-5"
      style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
      — {children} —
    </p>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-[34px] lg:text-[40px] mb-6"
      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", lineHeight: 1.1, color: "rgba(255,255,255,0.92)" }}>
      {children}
    </h2>
  );
}

function SectionP({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] sm:text-[16px] leading-[1.9] max-w-xl mx-auto ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.45)" }}>
      {children}
    </p>
  );
}

/* ─── Luminous Card — the core surface component ─── */
function LuminousCard({ children, className = "", accentColor }: { children: React.ReactNode; className?: string; accentColor?: string }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden p-7 ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(20,28,45,0.9) 0%, rgba(12,20,35,0.8) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Top edge highlight */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{
        background: `linear-gradient(90deg, transparent, ${accentColor ? accentColor + "40" : "rgba(255,255,255,0.12)"}, transparent)`,
      }} />
      {children}
    </div>
  );
}
