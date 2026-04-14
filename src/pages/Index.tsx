import React, { useState, lazy, Suspense, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import KeteParticleCanvas from "@/components/whariki/KeteParticleCanvas";
import GlassPanel from "@/components/whariki/GlassPanel";
import TanikoBorder from "@/components/whariki/TanikoBorder";
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
  tangaroa: "#1A3A5C",
  t1: "rgba(245,240,232,0.92)",
  t2: "rgba(245,240,232,0.75)",
  t3: "rgba(245,240,232,0.45)",
  border: "rgba(58,125,110,0.15)",
  glassBg: "rgba(10,22,40,0.7)",
};

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.6, ease },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07, duration: 0.5, ease },
});

/* ─── Data ─── */
const PACKS = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food safety, liquor licensing, staff scheduling — handled before you ask.", color: C.pounamu, accentLight: C.pounamuLight, to: "/manaaki", glyph: "bowl" as KeteGlyph },
  { reo: "Waihanga", en: "Construction", desc: "Payment claims, site safety, consent tracking — built for NZ construction.", color: C.navy, accentLight: "#2A5A8C", to: "/waihanga/about", glyph: "hardhat" as KeteGlyph },
  { reo: "Auaha", en: "Creative & Media", desc: "Campaign workflows, brand compliance, lead generation — your creative engine.", color: C.gold, accentLight: C.goldLight, to: "/auaha/about", glyph: "brush" as KeteGlyph },
  { reo: "Arataki", en: "Automotive", desc: "Vehicle compliance, workshop scheduling, fleet management — on autopilot.", color: "#E8E8E8", accentLight: "#D8D8D8", to: "/arataki", glyph: "compass" as KeteGlyph },
  { reo: "Pikau", en: "Freight & Customs", desc: "Customs declarations, freight tracking, border compliance — cleared and logged.", color: C.pounamuGlow, accentLight: "#A8E6DA", to: "/pikau", glyph: "container" as KeteGlyph },
  { reo: "Toro", en: "Family", desc: "School runs, meal planning, family admin — one less thing to worry about.", color: C.bone, accentLight: "#E8DDD0", to: "/toroa", glyph: "koru" as KeteGlyph },
];

const GOVERNANCE_LAYERS = [
  { name: "Kahu", label: "Perception", desc: "Detects what's relevant from incoming data.", color: C.pounamu },
  { name: "Iho", label: "Memory", desc: "Retains business context and prior decisions.", color: C.pounamuLight },
  { name: "Tā", label: "Reasoning", desc: "Applies rules, boundaries, and compliance logic.", color: C.gold },
  { name: "Mahara", label: "Action", desc: "Generates structured outputs and evidence packs.", color: C.goldLight },
  { name: "Mana", label: "Explanation", desc: "Logs every decision with full attribution.", color: C.pounamuGlow },
];

const ROLLOUT = [
  { n: "01", title: "Choose the workflow", desc: "Start where consistency or oversight matters most." },
  { n: "02", title: "Configure the rules", desc: "Set boundaries, review points, and business context." },
  { n: "03", title: "Roll out & refine", desc: "Introduce to the team, review, and improve over time." },
];

const EVIDENCE_ITEMS = [
  { label: "Food Control Plan verification", ref: "FCP-2024", kete: "Manaaki" },
  { label: "H&S site briefing log", ref: "HSB-047", kete: "Waihanga" },
  { label: "Vehicle compliance certificate", ref: "VCC-12", kete: "Arataki" },
];

const FAQS = [
  { q: "What does Assembl actually help with?", a: "Operational workflows — quoting, compliance, planning, reporting, admin, and follow-up." },
  { q: "Do we have to roll out everywhere at once?", a: "No. Start with one workflow, prove value, expand from there." },
  { q: "Is this designed for NZ businesses?", a: "Yes. Built for NZ operating conditions and sector realities." },
  { q: "What makes this different from generic tools?", a: "Governed workflows with clear boundaries — not open-ended, unmanaged usage." },
  { q: "Do people still stay involved?", a: "Yes. Review, approvals, and human oversight built into workflows." },
];

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { profile, atmosphere, isPersonalized } = usePersonalization();
  const hero = profile.preferences.heroVariant;
  const engagementDepth = profile.signals.engagementDepth;
  useReturnVisitor();

  const orderedPacks = useMemo(() => {
    if (!isPersonalized) return PACKS;
    const keteOrder = profile.preferences.keteOrder;
    const SLUG_MAP: Record<string, string> = {
      manaaki: 'Manaaki', waihanga: 'Waihanga', auaha: 'Auaha',
      arataki: 'Arataki', pikau: 'Pikau', toro: 'Toro',
    };
    const sorted = [...PACKS].sort((a, b) => {
      const aIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === a.reo)?.[0] as any ?? '');
      const bIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === b.reo)?.[0] as any ?? '');
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    return sorted;
  }, [isPersonalized, profile.preferences.keteOrder]);

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.bone }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Assembl helps teams handle quoting, compliance, planning, reporting, and admin more consistently — with built-in rules, oversight, and support designed for NZ operating conditions."
      />

      {/* Whāriki foundation — the woven mat beneath everything */}
      <WharikiFoundation />

      <div className="relative z-10">
        <BrandNav />
        <ContextBar />

        {/* ═══ HERO — Full viewport with Kete Particle Canvas ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Particle canvas background */}
          <KeteParticleCanvas />

          {/* Radial overlay for depth */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(10,22,40,0.6) 100%)",
          }} />

          {/* Atmosphere overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: atmosphere.bgOverlay, opacity: 0.5 }} />

          <div className="relative z-10 max-w-3xl">
            <motion.p
              className="text-[10px] font-semibold tracking-[5px] uppercase mb-8"
              style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            >
              Governed Intelligence for Aotearoa
            </motion.p>

            <motion.h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: isMobile ? "2rem" : "3.5rem",
                lineHeight: 1.1,
                letterSpacing: isMobile ? "3px" : "6px",
                textTransform: "uppercase" as const,
                color: C.white,
              }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              key={hero.headline}
            >
              {hero.headline}
            </motion.h1>

            <motion.p
              className="max-w-xl mx-auto mt-6 text-base sm:text-lg leading-[1.8]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              key={hero.subheadline}
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-10 justify-center"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease }}
            >
              {/* Primary CTA — Dawn Gold */}
              <Link
                to={hero.ctaLink}
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-semibold rounded-lg overflow-hidden"
                style={{
                  background: C.gold,
                  color: C.bg,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {hero.cta}
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary CTA — Ghost Pounamu */}
              {hero.secondaryCta && (
                <Link
                  to={hero.secondaryCtaLink || '/#industry-packs'}
                  className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-lg transition-all duration-300"
                  style={{
                    border: `1px solid ${C.pounamu}`,
                    color: C.bone,
                    background: "transparent",
                  }}
                >
                  {hero.secondaryCta}
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* ═══ WEAVE TRANSITION — strands tighten ═══ */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(58,125,110,0.06) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(58,125,110,0.06) 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }} />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, transparent, ${C.bg})`,
          }} />
        </div>

        {/* ═══ WHAT WE DO ═══ */}
        <Section>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fade}>
              <GlassPanel className="p-8 sm:p-10" goldRim>
                <p className="text-[15px] sm:text-base leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
                  Assembl gives New Zealand businesses specialist operational workflows that reduce admin, surface risk earlier, and keep people in control.
                </p>
                <WovenDivider className="my-6" />
                <p className="text-[15px] sm:text-base leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
                  We help teams act faster with better information — not replace the people who know the work best.
                </p>
              </GlassPanel>
            </motion.div>

            {/* Animated weave diagram — 6 strands converging */}
            <motion.div {...fade} className="flex justify-center">
              <svg width="280" height="280" viewBox="0 0 280 280" className="opacity-60">
                {PACKS.map((p, i) => {
                  const angle = (i / PACKS.length) * Math.PI * 2 - Math.PI / 2;
                  const ox = 140 + Math.cos(angle) * 120;
                  const oy = 140 + Math.sin(angle) * 120;
                  return (
                    <g key={p.reo}>
                      <line x1={ox} y1={oy} x2={140} y2={140} stroke={p.color} strokeWidth="1.5" opacity="0.4">
                        <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                      </line>
                      <circle cx={ox} cy={oy} r="5" fill={p.color} opacity="0.5" />
                      <text x={ox + Math.cos(angle) * 16} y={oy + Math.sin(angle) * 16} fill={p.color} fontSize="8" textAnchor="middle" dominantBaseline="middle" fontFamily="'JetBrains Mono', monospace" opacity="0.6">
                        {p.reo}
                      </text>
                    </g>
                  );
                })}
                {/* Central convergence node */}
                <circle cx="140" cy="140" r="10" fill={C.pounamu} opacity="0.3" />
                <circle cx="140" cy="140" r="5" fill={C.gold} opacity="0.6" />
              </svg>
            </motion.div>
          </div>
        </Section>

        {/* ═══ INDUSTRY KETE — 6 cards with tāniko borders ═══ */}
        <Section id="industry-packs">
          <motion.div {...fade} className="text-center mb-12">
            <Eyebrow color={C.pounamu}>YOUR INDUSTRY</Eyebrow>
            <H2>Sector-specific workflow packs</H2>
            <P className="max-w-xl mx-auto">
              Each kete is built around the jobs, pressures, and context of that sector.
            </P>
          </motion.div>
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {orderedPacks.map((p, i) => {
                const isDetected = isPersonalized && i === 0;
                return (
                  <motion.div key={p.reo} layout layoutId={`kete-card-${p.reo}`} {...stagger(i)}>
                    <Link to={p.to} className="group block h-full">
                      <GlassPanel
                        className={`p-0 h-full transition-all duration-300 group-hover:translate-y-[-4px] ${isDetected ? 'ring-1 ring-[rgba(212,168,83,0.3)]' : ''}`}
                        tilt
                      >
                        {/* Tāniko top border */}
                        <TanikoBorder variant="top" />

                        <div className="p-6">
                          {isDetected && (
                            <div className="text-[9px] px-2 py-0.5 rounded-full tracking-[2px] uppercase inline-block mb-3"
                              style={{ background: `${C.gold}15`, color: `${C.gold}aa`, border: `1px solid ${C.gold}25`, fontFamily: "'JetBrains Mono', monospace" }}>
                              Recommended for you
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-4">
                            <Suspense fallback={<KeteWeaveVisual size={44} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                              <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={56} />
                            </Suspense>
                            <div>
                              <h3
                                className="text-xl"
                                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase", color: C.white }}
                              >
                                {p.reo}
                              </h3>
                              <p className="text-[11px] tracking-[1px] uppercase" style={{ color: C.t3, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                                {p.en}
                              </p>
                            </div>
                          </div>

                          <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.t2 }}>{p.desc}</p>

                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-all group-hover:gap-3" style={{ color: p.color }}>
                            See a sample pack <ArrowRight size={12} />
                          </span>
                        </div>

                        {/* Fading weave pattern at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{
                          backgroundImage: `
                            linear-gradient(45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
                            linear-gradient(-45deg, rgba(58,125,110,0.04) 1px, transparent 1px)`,
                          backgroundSize: "12px 12px",
                          maskImage: "linear-gradient(transparent, rgba(0,0,0,0.3))",
                          WebkitMaskImage: "linear-gradient(transparent, rgba(0,0,0,0.3))",
                        }} />
                      </GlassPanel>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </Section>

        {/* ═══ HOW IT WORKS — 6 governance layers ═══ */}
        <Section>
          <motion.div {...fade} className="text-center mb-12">
            <Eyebrow color={C.gold}>HOW ASSEMBL WORKS</Eyebrow>
            <H2>Six layers of governed intelligence, woven together</H2>
            <P className="max-w-xl mx-auto">
              Every decision is checked, every action is logged, every output is something you can file.
            </P>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-1">
            {GOVERNANCE_LAYERS.map((layer, i) => (
              <motion.div key={layer.name} {...stagger(i)} className="relative">
                <GlassPanel className="p-5 flex items-center gap-5">
                  {/* Node */}
                  <div className="shrink-0 relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${layer.color}18` }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: layer.color, boxShadow: `0 0 12px ${layer.color}60` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] tracking-[3px] uppercase" style={{ color: layer.color, fontFamily: "'JetBrains Mono', monospace" }}>{layer.name}</span>
                      <span className="text-[13px]" style={{ color: C.t1, fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>{layer.label}</span>
                    </div>
                    <p className="text-[13px]" style={{ color: C.t3 }}>{layer.desc}</p>
                  </div>
                </GlassPanel>
                {/* Woven strand connecting to next */}
                {i < GOVERNANCE_LAYERS.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <svg width="2" height="8" viewBox="0 0 2 8">
                      <line x1="1" y1="0" x2="1" y2="8" stroke={C.pounamu} strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══ EVIDENCE PACKS ═══ */}
        <Section>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div {...fade}>
              <Eyebrow color={C.gold}>EVIDENCE PACKS</Eyebrow>
              <H2>Every workflow ends in a pack you can file, forward, or footnote</H2>
              <P className="mb-6">
                Not a chatbot response. A structured, evidence-backed document your auditor, your bank, or your regulator can trust.
              </P>
              <Link to="/sample/manaaki" className="inline-flex items-center gap-2 text-[14px] font-medium group" style={{ color: C.gold }}>
                View sample evidence pack <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
              <GlassPanel className="p-0" goldRim>
                <TanikoBorder variant="top" />
                <div className="p-8 space-y-5">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <KeteMiniIcon glyph="shield" color={C.pounamu} size={36} />
                    <div>
                      <p className="text-[11px] tracking-[3px] uppercase" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>Evidence Pack</p>
                      <p className="text-[14px]" style={{ color: C.t1, fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>Monthly Compliance Report</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-[2px] uppercase"
                      style={{ background: `${C.pounamu}18`, color: C.pounamuLight, border: `1px solid ${C.pounamu}30` }}>
                      PASS
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {EVIDENCE_ITEMS.map((item, idx) => (
                      <motion.div key={item.label} className="flex items-center gap-3 p-2 rounded-lg"
                        initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.06 }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}20` }}>
                          <Check size={11} style={{ color: C.pounamuLight }} />
                        </div>
                        <span className="text-[13px] flex-1" style={{ color: C.t2 }}>{item.label}</span>
                        <span className="text-[10px] tracking-wider" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>{item.ref}</span>
                      </motion.div>
                    ))}
                  </div>
                  <WovenDivider className="mt-4" />
                  <div className="flex gap-8 pt-2">
                    {["Reviewer", "Date", "Status"].map((lbl) => (
                      <div key={lbl}>
                        <p className="text-[10px] mb-1" style={{ color: C.t3 }}>{lbl}</p>
                        <div className="w-20 h-[1px]" style={{ background: `linear-gradient(90deg, ${C.t3}, transparent)` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <TanikoBorder variant="bottom" />
              </GlassPanel>
            </motion.div>
          </div>
        </Section>

        {/* ═══ TRUST — Governed from the ground up ═══ */}
        <Section>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow color={C.pounamu}>TRUST</Eyebrow>
            <H2>Governed from the ground up</H2>
            <P className="max-w-xl mx-auto">
              Five stages of oversight from policy to proof — so you never have to wonder if the system got it right.
            </P>
          </motion.div>

          {/* Connected governance nodes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 max-w-4xl mx-auto">
            {GOVERNANCE_LAYERS.map((layer, i) => (
              <React.Fragment key={layer.name}>
                <motion.div {...stagger(i)} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{
                    background: `${layer.color}15`,
                    boxShadow: `0 0 12px ${layer.color}20`,
                  }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: layer.color }} />
                  </div>
                  <span className="text-[10px] tracking-[2px] uppercase" style={{ color: layer.color, fontFamily: "'JetBrains Mono', monospace" }}>{layer.name}</span>
                  <span className="text-[11px] mt-0.5" style={{ color: C.t3 }}>{layer.label}</span>
                </motion.div>
                {i < GOVERNANCE_LAYERS.length - 1 && (
                  <svg className="hidden sm:block w-12 h-6 shrink-0" viewBox="0 0 48 6">
                    <path d="M0 3 Q12 1 24 3 Q36 5 48 3" fill="none" stroke={C.pounamu} strokeWidth="1" opacity="0.3" />
                    <path d="M0 3 Q12 5 24 3 Q36 1 48 3" fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.2" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </Section>

        {/* ═══ HOW TO START ═══ */}
        <Section>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow color={C.gold}>GET STARTED</Eyebrow>
            <H2>Start small. Prove value. Expand.</H2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {ROLLOUT.map((step, i) => (
              <motion.div key={step.n} {...stagger(i)}>
                <GlassPanel className="p-7 h-full" tilt>
                  <span className="text-[12px] font-bold tracking-[3px]" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{step.n}</span>
                  <h3 className="text-[17px] mt-3 mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "1px", color: C.t1 }}>{step.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: C.t3 }}>{step.desc}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══ FAQ ═══ */}
        <Section>
          <div className="max-w-2xl mx-auto">
            <motion.div {...fade} className="text-center mb-8">
              <Eyebrow color={C.pounamu}>FAQ</Eyebrow>
              <H2>Common questions</H2>
            </motion.div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <motion.div key={i} {...stagger(i)}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 transition-all duration-300 glass-panel"
                  >
                    <span className="text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: C.t1 }}>{faq.q}</span>
                    <ChevronDown size={16} className="shrink-0 transition-transform duration-200"
                      style={{ color: C.t3, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.25, ease }} className="overflow-hidden">
                    <p className="px-6 pt-2 pb-5 text-[14px] leading-relaxed" style={{ color: C.t3 }}>{faq.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative px-6 py-20 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${C.pounamu}08 0%, transparent 60%)`,
          }} />
          <div className="max-w-xl mx-auto relative z-10">
            <motion.div {...fade}>
              <H2>Ready to see what your industry team looks like?</H2>
              <P className="mb-10">
                Pick your kete. Run the demo. See the evidence pack it produces.
              </P>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-semibold rounded-lg" style={{
                  background: C.gold,
                  color: C.bg,
                }}>
                  See it in action <ArrowRight size={15} />
                </Link>
                <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-lg" style={{
                  border: `1px solid ${C.pounamu}`,
                  color: C.bone,
                }}>
                  See pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>

      <KeteAgentChat
        keteName="assembl"
        keteLabel="Platform Concierge"
        accentColor="#3A7D6E"
        defaultAgentId="echo"
        packId="assembl"
        starterPrompts={[
          "What industry kete is right for my business?",
          "How does the onboarding process work?",
          "What's included in the Operator plan?",
          "How does assembl handle compliance?",
        ]}
      />
    </div>
  );
};

export default Index;

/* ─── Layout primitives ─── */
function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-6 py-16 sm:py-20 relative">
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
      {/* Section divider — woven */}
      <div className="absolute bottom-0 left-0 right-0">
        <WovenDivider />
      </div>
    </section>
  );
}

function Eyebrow({ children, color = "#3A7D6E" }: { children: string; color?: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[4px] uppercase mb-4" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
      — {children} —
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl sm:text-3xl lg:text-[36px] mb-4"
      style={{
        fontFamily: "'Lato', sans-serif",
        fontWeight: 300,
        letterSpacing: "4px",
        textTransform: "uppercase",
        lineHeight: 1.15,
        color: "rgba(245,240,232,0.9)",
      }}
    >
      {children}
    </h2>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] sm:text-base leading-relaxed ${className}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.75)" }}>
      {children}
    </p>
  );
}
