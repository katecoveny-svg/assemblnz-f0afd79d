import React, { useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import GlowIcon from "@/components/GlowIcon";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { useReturnVisitor } from "@/hooks/useReturnVisitor";
import ContextBar from "@/components/personalized/ContextBar";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import NoiseOverlay from "@/components/NoiseOverlay";
import CursorFollower from "@/components/CursorFollower";
import HeroNext from "@/components/next/HeroNext";
import CompliancePipeline from "@/components/landing/CompliancePipeline";
import MigrationFeatureSection from "@/components/MigrationFeatureSection";
import ScrollDepthLayers from "@/components/hero/ScrollDepthLayers";
import HomepageProofStrip from "@/components/kete/HomepageProofStrip";
import WeeklyChangesDigest from "@/components/landing/WeeklyChangesDigest";
import { DotDivider } from "@/components/MicroDetails";
import { KeteHoverEffect } from "@/components/KeteHoverEffects";
import InteractiveTryItDemo from "@/components/landing/InteractiveTryItDemo";
import { ALL_USE_CASES } from "@/data/useCases";
import { KETE } from "@/data/pricing";
import { manaakiMark } from "@/assets/brand";

/* ─── Light Palette Tokens ─── */
const C = {
  bg: "#FAFBFC",
  surface: "#FFFFFF",
  teal: "#4AA5A8",
  tealLight: "#6CBFC1",
  ochre: "#4AA5A8",
  ochreLight: "#F0C670",
  lavender: "#E8E6F0",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
};

/* Kete pastel bleed colors */
const KETE_BLEED: Record<string, string> = {
  manaaki: "rgba(232,140,120,0.08)",
  waihanga: "rgba(74,165,168,0.08)",
  auaha: "rgba(155,142,196,0.08)",
  arataki: "rgba(74,165,168,0.08)",
  pikau: "rgba(108,191,193,0.08)",
  hoko: "rgba(198,107,92,0.08)",
  ako: "rgba(123,167,199,0.08)",
  toro: "rgba(74,165,168,0.06)",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.7, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08, duration: 0.6, ease },
});

/* ─── Data ─── */
const KETE_COLORS: Record<string, { color: string; accentLight: string; to: string }> = {
  manaaki: { color: C.teal, accentLight: C.tealLight, to: "/manaaki" },
  waihanga: { color: C.ochre, accentLight: C.ochreLight, to: "/waihanga/about" },
  auaha: { color: "#9B8EC4", accentLight: "#B8ADDB", to: "/auaha/about" },
  arataki: { color: C.teal, accentLight: C.tealLight, to: "/arataki" },
  pikau: { color: C.tealLight, accentLight: "#A8E6DA", to: "/pikau" },
  hoko: { color: "#C66B5C", accentLight: "#E89484", to: "/hoko" },
  ako: { color: "#7BA7C7", accentLight: "#A8C8DD", to: "/ako" },
};

/** 7 industry kete — the locked marketing set. Tōro renders separately as the consumer tier. */
const INDUSTRY_PACKS = KETE.map((k) => ({
  reo: k.name, en: k.eng, desc: k.desc,
  ...KETE_COLORS[k.key],
}));

/** Tōro — consumer/whānau kete, visually distinguished below the 7 industry tiles. */
const TORO_PACK = {
  reo: "Tōro",
  en: "Family",
  desc: "Admin, contracts, school notices, household documents. Built for families running life.",
  color: C.ochre,
  accentLight: C.ochreLight,
  to: "/toro",
};

/** Combined for personalization re-ordering only (Tōro pinned last). */
const PACKS = [...INDUSTRY_PACKS, TORO_PACK];

const LAYERS_DATA = [
  { name: "Kahu — Intake", desc: "Receives the request, classifies data sensitivity, checks PII, and routes to the right specialist agent.", icon: "Eye", color: "#4AA5A8" },
  { name: "Iho — Reasoning", desc: "The specialist agent processes the task — grounded in NZ legislation with section references, never guessing.", icon: "Brain", color: "#4AA5A8" },
  { name: "Tā — Action", desc: "Generates the output: draft, calculation, document, or creative. Every action classified: allowed, needs approval, or forbidden.", icon: "Zap", color: "#4AA5A8" },
  { name: "Mahara — Memory", desc: "Logs the decision, updates shared business memory, and creates the audit trail in plain language.", icon: "Shield", color: "#4AA5A8" },
  { name: "Mana — Evidence", desc: "Packages the output into a structured evidence pack your auditor, bank, or regulator can trust.", icon: "Activity", color: "#4AA5A8" },
];




const START_HERE = [
  { title: "Ask A Live Agent", desc: "Open a working agent and ask real business questions.", to: "/chat/echo", accent: C.teal, icon: "MessageSquare" },
  { title: "Review A Document", desc: "Paste a contract or brief and get risks flagged instantly.", to: "/waihanga", accent: C.ochre, icon: "FileText" },
  { title: "Make An Ad", desc: "Generate campaigns and visuals that look finished.", to: "/auaha/ads", accent: "#9B8EC4", icon: "Megaphone" },
  { title: "Run The Demo", desc: "Show a client what Assembl does in 60 seconds.", to: "/demos", accent: C.tealLight, icon: "Rocket" },
];

/* ─── Live Demo Chat ─── */
const DEMO_MESSAGES = [
  { role: "user" as const, text: "Do I need a food control plan for my cafe?" },
  { role: "agent" as const, text: "Yes — under the Food Act 2014, all food businesses in NZ must operate under either a Food Control Plan (FCP) or a National Programme.", citation: "Food Act 2014, s 37–40", highlight: "Food Act 2014" },
  { role: "agent" as const, text: "A cafe that prepares and serves food on-site typically requires a template Food Control Plan, registered with your local council. I can draft one for you now.", citation: "MPI Template FCP-03", highlight: "template Food Control Plan" },
];

function LiveDemoChatSection() {
  const [showMessages, setShowMessages] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setShowMessages(1), 600));
    timers.push(setTimeout(() => setShowMessages(2), 1800));
    timers.push(setTimeout(() => setShowMessages(3), 3200));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-[680px] mx-auto">
      <GlowCard className="overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `1px solid rgba(74,165,168,0.08)` }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: `${C.teal}10` }}>
            <img src={manaakiMark} alt="AURA" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] tracking-[3px] uppercase font-medium" style={{ color: C.text }}>AURA</p>
            <p className="text-[11px]" style={{ color: C.textTertiary }}>Hospitality · Food Safety Specialist</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}15` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: C.teal }} />
            <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal }}>Active</span>
          </div>
        </div>
        <div className="px-6 py-6 space-y-5 min-h-[220px]">
          {DEMO_MESSAGES.slice(0, showMessages).map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="rounded-2xl rounded-tr-md px-5 py-3.5" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}12` }}>
                      <p className="text-[14px] leading-[1.7]" style={{ color: C.text }}>{msg.text}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: `${C.lavender}` }}>
                      <GlowIcon name="User" size={16} color={C.textSecondary} glow />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: `${C.teal}10` }}>
                    <GlowIcon name="Bot" size={16} color={C.teal} glow />
                  </div>
                  <div>
                    <div className="rounded-2xl rounded-tl-md px-5 py-3.5" style={{ background: C.lavender + "60" }}>
                      <p className="text-[14px] leading-[1.8]" style={{ color: C.text }}>
                        {msg.text.split(msg.highlight!).map((part, j, arr) => (
                          <React.Fragment key={j}>
                            {part}
                            {j < arr.length - 1 && <span style={{ color: C.teal, fontWeight: 500 }}>{msg.highlight}</span>}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                    <p className="mt-2 px-2 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}>
                      📎 {msg.citation}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {showMessages < 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-2 pl-12">
              <div className="w-2 h-2 rounded-full" style={{ background: C.teal }} />
              <div className="w-2 h-2 rounded-full" style={{ background: C.teal, opacity: 0.6 }} />
              <div className="w-2 h-2 rounded-full" style={{ background: C.teal, opacity: 0.3 }} />
            </motion.div>
          )}
        </div>
        <div className="px-6 pb-5">
          <button onClick={() => navigate("/chat/hospitality")} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group" style={{
            background: C.lavender + "40",
            border: `1px solid rgba(74,165,168,0.08)`,
          }}>
            <span className="text-[13px]" style={{ color: C.textTertiary }}>Ask your own question…</span>
            <Send size={16} style={{ color: C.teal }} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </GlowCard>
      <div className="text-center mt-8">
        <Link to="/chat/hospitality" className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase transition-all hover:gap-3" style={{ fontFamily: "'Lato', sans-serif", color: C.teal }}>
          Try it live with your own question <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const { profile, isPersonalized } = usePersonalization();
  useReturnVisitor();



  // Personalize order of the 7 industry packs only — Tōro stays pinned at the end.
  const orderedIndustryPacks = useMemo(() => {
    if (!isPersonalized) return INDUSTRY_PACKS;
    const keteOrder = profile.preferences.keteOrder;
    const SLUG_MAP: Record<string, string> = {
      manaaki: "Manaaki", waihanga: "Waihanga", auaha: "Auaha",
      arataki: "Arataki", pikau: "Pikau", hoko: "Hoko", ako: "Ako",
    };
    return [...INDUSTRY_PACKS].sort((a, b) => {
      const aIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === a.reo)?.[0] as any ?? "");
      const bIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === b.reo)?.[0] as any ?? "");
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
  }, [isPersonalized, profile.preferences.keteOrder]);
  const orderedPacks = orderedIndustryPacks; // back-compat alias for any leftover ref

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.text }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. Built for NZ."
      />
      {/* WharikiFoundation removed — light glass background */}
      
      <NoiseOverlay />
      <CursorFollower />

      <ScrollDepthLayers>
      <div className="relative z-10">
        <BrandNav />
        <ContextBar />

        {/* ═══ HERO ═══ */}
        <HeroNext variant="layered" />

        {/* ═══ LIVE PROOF STRIP ═══ */}
        <div className="px-4 -mt-2 mb-4 text-center">
          <HomepageProofStrip />
        </div>

        {/* Video teaser is admin-only — see /admin/showcase-videos */}

        {/* ═══ TRY IT LIVE — 3-step interactive demo ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-10">
            <SectionEyebrow>Try it live · 60 seconds</SectionEyebrow>
            <SectionH2>Pick a kete. Run an agent. Get an evidence pack.</SectionH2>
            <SectionP>No signup. Pick your industry below and watch a real workflow run end-to-end.</SectionP>
          </motion.div>
          <motion.div {...fade}>
            <InteractiveTryItDemo />
          </motion.div>
        </Sect>

        {/* ═══ FALLBACK: single-agent live demo (kept for variety) ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-10">
            <SectionEyebrow>And a closer look</SectionEyebrow>
            <SectionH2>One agent, one citation, in real time.</SectionH2>
          </motion.div>
          <motion.div {...fade}>
            <LiveDemoChatSection />
          </motion.div>
        </Sect>

        {/* ═══ START HERE ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>What do you need?</SectionEyebrow>
            <SectionH2>Choose the job you need done</SectionH2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto">
            {START_HERE.map((item, i) => {
              return (
                <motion.div key={item.title} {...stagger(i)}>
                  <Link to={item.to} className="group block h-full">
                    <GlowCard className="h-full hover:translate-y-[-4px] transition-all duration-300" accentColor={item.accent}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{
                        background: `${item.accent}12`,
                        boxShadow: `3px 3px 8px rgba(166,166,180,0.3), -3px -3px 8px rgba(255,255,255,0.85), 0 0 20px ${item.accent}15`,
                      }}>
                        <GlowIcon name={item.icon} size={20} color={item.accent} glow />
                      </div>
                      <h3 className="text-[15px] mb-3 font-semibold" style={{ color: C.text }}>{item.title}</h3>
                      <p className="text-[14px] leading-[1.7] mb-5" style={{ color: C.textSecondary, fontWeight: 450 }}>{item.desc}</p>
                      <span className="inline-flex items-center gap-2 text-[12px] font-medium group-hover:gap-3 transition-all" style={{ color: item.accent }}>
                        Open now <ArrowRight size={12} />
                      </span>
                    </GlowCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ WHAT WE DO ═══ */}
        <Sect>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div {...fade}>
              <GlowCard>
                <p className="text-[10px] tracking-[4px] uppercase mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal }}>— What we do —</p>
                <p className="text-[18px] leading-[1.7] mb-6" style={{ fontWeight: 400, color: C.text }}>
                  Assembl creates New Zealand business specialist operational workflows that reduce admin, surface risk earlier, and keep people in control.
                </p>
                <div className="my-6"><DotDivider /></div>
                <p className="text-[15px] leading-[1.7]" style={{ fontWeight: 400, color: C.textSecondary }}>
                  We help teams act faster with better information — not replace the people who know the work best.
                </p>
              </GlowCard>
            </motion.div>
            <motion.div {...fade}>
              <GlowCard className="text-center py-12">
                <p className="text-[10px] tracking-[4px] uppercase mb-8" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}>Industry kete</p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {PACKS.map((p) => (
                    <Link to={p.to} key={p.reo} className="text-[10px] tracking-[1px] px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, border: `1px solid rgba(74,165,168,0.12)`, background: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: p.color, fontWeight: 500 }}>{p.reo}</span> <span style={{ color: C.textTertiary }}>/ {p.en}</span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, rgba(74,165,168,0.1), ${C.teal}60)` }} />
                  <div className="w-6 h-6 rounded-full mt-2" style={{ background: C.teal, boxShadow: `0 4px 20px ${C.teal}30` }} />
                  <p className="mt-3 text-[9px] tracking-[4px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal }}>Iho Router</p>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </Sect>

        {/* ═══ INDUSTRY KETE — 7 industry tiles ═══ */}
        <Sect id="industry-packs">
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>Your industry</SectionEyebrow>
            <SectionH2>Seven industry kete</SectionH2>
            <SectionP>Pick the one that fits your business. Operator gets one, Leader two, Enterprise all seven plus Tōro.</SectionP>
          </motion.div>
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
              {orderedIndustryPacks.map((p, i) => {
                const isDetected = isPersonalized && i === 0;
                const bleedColor = KETE_BLEED[p.reo.toLowerCase()] || "transparent";
                return (
                  <motion.div key={p.reo} layout layoutId={`kete-${p.reo}`} {...stagger(i)} className="relative">
                    <div className="absolute inset-0 rounded-[32px]" style={{
                      background: `radial-gradient(circle at 50% 50%, ${bleedColor}, transparent 70%)`,
                      filter: "blur(40px)", transform: "scale(1.2)",
                    }} />
                    <Link to={p.to} className="group block h-full relative">
                      <GlowCard className="h-full hover:translate-y-[-4px] transition-all duration-300" accentColor={p.color}>
                        <KeteHoverEffect kete={p.reo} />
                        {isDetected && (
                          <span className="text-[9px] px-3 py-1 rounded-full tracking-[2px] uppercase inline-block mb-4"
                            style={{ background: `${C.teal}08`, color: C.teal, border: `1px solid ${C.teal}15`, fontFamily: "'JetBrains Mono', monospace" }}>
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center gap-4 mb-5">
                          <KeteWeaveVisual size={48} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />
                          <div>
                            <h3 className="text-[18px] font-medium" style={{ color: C.text }}>{p.reo}</h3>
                            <p className="text-[12px] mt-0.5 font-medium" style={{ color: C.textTertiary }}>{p.en}</p>
                          </div>
                        </div>
                        <p className="text-[14px] leading-[1.7] mb-5" style={{ color: C.textSecondary }}>{p.desc}</p>
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium group-hover:gap-3 transition-all" style={{ color: p.color }}>
                          Explore <ArrowRight size={12} />
                        </span>
                      </GlowCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>

          {/* ─── Tōro — consumer tier, distinguished row ─── */}
          <div className="mt-12 max-w-[1200px] mx-auto">
            <div className="text-center mb-6">
              <p className="text-[10px] tracking-[5px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}>
                — For whānau, not businesses —
              </p>
            </div>
            <motion.div {...stagger(0)} className="relative">
              <Link to={TORO_PACK.to} className="group block">
                <GlowCard className="hover:translate-y-[-4px] transition-all duration-300" accentColor={TORO_PACK.color}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <KeteWeaveVisual size={64} accentColor={TORO_PACK.color} accentLight={TORO_PACK.accentLight} showNodes={false} showGlow />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="text-[22px] font-medium" style={{ color: C.text }}>{TORO_PACK.reo}</h3>
                        <span className="text-[12px] font-medium" style={{ color: C.textTertiary }}>— {TORO_PACK.en} · $29/mo</span>
                      </div>
                      <p className="text-[14px] leading-[1.7]" style={{ color: C.textSecondary }}>{TORO_PACK.desc}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium group-hover:gap-3 transition-all" style={{ color: TORO_PACK.color }}>
                      Explore Tōro <ArrowRight size={12} />
                    </span>
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          </div>

          {/* ─── Operator-as-platform shortcut for Business / Tech / Pro Services ─── */}
          <div className="mt-8 max-w-[1200px] mx-auto text-center">
            <p className="text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
              Don't fit a pre-built industry kete? <Link to="/platform" className="underline" style={{ color: C.teal }}>Operator-as-platform</Link> — same price, no kete bundle, you build on top of Iho.
            </p>
          </div>
        </Sect>

        {/* ═══ REAL USE CASES ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>Real use cases</SectionEyebrow>
            <SectionH2>A day in the life</SectionH2>
            <SectionP>Real NZ businesses. Real scenarios. See what changes.</SectionP>
          </motion.div>
          <div className="space-y-6 max-w-4xl mx-auto">
            {ALL_USE_CASES.map((uc, i) => (
              <motion.div key={uc.kete} {...stagger(i)}>
                <Link to={uc.to} className="group block">
                  <GlowCard className="hover:translate-y-[-4px] transition-all duration-300" accentColor={uc.data.accentColor}>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-base font-medium"
                        style={{ background: `${uc.data.accentColor}10`, color: uc.data.accentColor }}>
                        {uc.data.persona.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-[10px] tracking-[2px] uppercase font-medium" style={{ color: uc.data.accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
                            {uc.kete} · {uc.en}
                          </span>
                          <span className="text-[10px]" style={{ color: C.textTertiary }}>
                            {uc.data.persona.name}, {uc.data.persona.role}
                          </span>
                        </div>
                        <p className="text-[13px] leading-[1.7] mb-3" style={{ color: C.textSecondary }}>
                          {uc.data.situation.substring(0, 180)}…
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {uc.data.benefits.slice(0, 3).map(b => (
                            <span key={b.label} className="text-[9px] px-2.5 py-1 rounded-full"
                              style={{ background: `${uc.data.accentColor}06`, color: uc.data.accentColor, border: `1px solid ${uc.data.accentColor}12`, fontFamily: "'JetBrains Mono', monospace" }}>
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight size={16} className="shrink-0 mt-2 opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all" style={{ color: uc.data.accentColor }} />
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ HOW IT WORKS ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>How assembl works</SectionEyebrow>
            <SectionH2>Five stages of governed intelligence</SectionH2>
            <SectionP>Every decision checked, every action logged, every output something you can file.</SectionP>
          </motion.div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LAYERS_DATA.map((layer, i) => {
              return (
                <motion.div key={layer.name} {...stagger(i)}>
                  <GlowCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{
                        background: `${layer.color}12`,
                        boxShadow: `3px 3px 8px rgba(166,166,180,0.3), -3px -3px 8px rgba(255,255,255,0.85)`,
                      }}>
                        <GlowIcon name={layer.icon} size={18} color={layer.color} glow />
                      </div>
                      <div>
                        <p className="text-[14px] mb-1 font-semibold" style={{ color: C.text }}>
                          <span className="inline-flex items-center gap-1.5 mr-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
                            <span className="text-[10px] font-normal" style={{ color: C.textTertiary, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                          </span>
                          {layer.name}
                        </p>
                        <p className="text-[13px] leading-[1.7]" style={{ color: C.textSecondary }}>{layer.desc}</p>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ SEAMLESS MIGRATION ═══ */}
        <MigrationFeatureSection />

        {/* ═══ EVIDENCE PACKS ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>Evidence packs</SectionEyebrow>
            <SectionH2>Every workflow ends in a pack you can file</SectionH2>
            <SectionP>Not a chatbot response. A structured document your auditor, bank, or regulator can trust.</SectionP>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
            {[
              { kete: "Manaaki", title: "Monthly Food Safety Report", date: "March 2026", checks: [
                { label: "Food Control Plan verification", ref: "FCP-2024", pass: true },
                { label: "Temperature log compliance", ref: "TMP-047", pass: true },
                { label: "Staff certification check", ref: "CERT-12", pass: true },
              ]},
              { kete: "Waihanga", title: "Site Safety Evidence Pack", date: "March 2026", checks: [
                { label: "H&S site briefing log", ref: "HSB-091", pass: true },
                { label: "Payment claim schedule verified", ref: "PCS-004", pass: true },
              ]},
              { kete: "Arataki", title: "Vehicle Compliance Pack", date: "March 2026", checks: [
                { label: "WoF/CoF status verified", ref: "VCC-12", pass: true },
                { label: "Workshop service log", ref: "WSL-033", pass: true },
              ]},
            ].map((pack, i) => (
              <motion.div key={pack.kete} {...stagger(i)}>
                <GlowCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.teal }} />
                    <p className="text-[9px] tracking-[3px] uppercase font-medium" style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>Evidence Pack</p>
                  </div>
                  <h3 className="text-[15px] mb-1 font-medium" style={{ color: C.text }}>{pack.title}</h3>
                  <p className="text-[10px] tracking-[2px] uppercase mb-5" style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{pack.kete} · {pack.date}</p>
                  <div className="space-y-2.5">
                    {pack.checks.map((c) => (
                      <div key={c.ref} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: C.lavender + "40" }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.teal}15` }}>
                          <GlowIcon name="Check" size={12} color={C.teal} glow />
                        </div>
                        <span className="text-[12px] flex-1" style={{ color: C.text }}>{c.label}</span>
                        <span className="text-[9px] tracking-wider" style={{ color: C.textTertiary, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{c.ref}</span>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ TRUST PIPELINE — draw on scroll ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow>Trust</SectionEyebrow>
            <SectionH2>Governed from the ground up</SectionH2>
            <SectionP>Every decision checked, every action logged, every output something you can file.</SectionP>
          </motion.div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LAYERS_DATA.map((layer, i) => {
              return (
                <motion.div key={layer.name} {...stagger(i)}>
                  <GlowCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{
                        background: `${layer.color}12`,
                        boxShadow: `3px 3px 8px rgba(166,166,180,0.3), -3px -3px 8px rgba(255,255,255,0.85)`,
                      }}>
                        <GlowIcon name={layer.icon} size={18} color={layer.color} glow />
                      </div>
                      <div>
                        <p className="text-[14px] mb-1 font-semibold" style={{ color: C.text }}>
                          <span className="inline-flex items-center gap-1.5 mr-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
                            <span className="text-[10px] font-normal" style={{ color: C.textTertiary, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                          </span>
                          {layer.name}
                        </p>
                        <p className="text-[13px] leading-[1.7]" style={{ color: C.textSecondary }}>{layer.desc}</p>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ COMPLIANCE PIPELINE ═══ */}
        <CompliancePipeline />

        {/* ═══ WHAT CHANGED THIS WEEK ═══ */}
        <WeeklyChangesDigest />

        {/* ═══ KERERŪ NON-CONFLICT POSITIONING ═══ */}
        <Sect>
          <motion.div {...fade} className="max-w-3xl mx-auto text-center">
            <SectionEyebrow>How we fit with the NZ AI ecosystem</SectionEyebrow>
            <h3 className="text-[22px] sm:text-[28px] mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, lineHeight: 1.3, color: C.text }}>
              Kererū.ai answers <em style={{ color: C.teal, fontStyle: "normal" }}>where</em> your data lives.<br />
              Assembl answers <em style={{ color: C.teal, fontStyle: "normal" }}>what</em> your data does.
            </h3>
            <p className="text-[15px] leading-[1.8] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
              Kererū is NZ-sovereign AI infrastructure. Assembl is the product layer built on top — pre-trained on NZ law, tikanga-governed, with industry kete that turn compliance into evidence packs. We think NZ businesses need both.
            </p>
            <p className="text-[13px] leading-[1.8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textTertiary }}>
              We're actively working with NZ-owned infrastructure partners so your data can stay on NZ soil. Sovereign hosting is in flight — not yet live for every customer. Ask us where your specific kete runs.
            </p>
          </motion.div>
        </Sect>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative px-6 py-32 text-center">
          <div className="max-w-xl mx-auto relative z-10">
            <motion.div {...fade}>
              <GlowCard className="p-12 sm:p-16 text-center">
                <SectionH2>Ready to see your industry team?</SectionH2>
                <SectionP className="mb-12">Pick your kete. Run the demo. See the evidence pack it produces.</SectionP>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
                    style={{ background: `linear-gradient(145deg, #55BFC1, ${C.teal})`, color: "#FFFFFF", boxShadow: `0 6px 24px rgba(74,165,168,0.35), 0 2px 8px rgba(74,165,168,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`, fontFamily: "'Lato', sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
                    See it in action <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-5 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
                    style={{ background: "linear-gradient(145deg, #F5F5F8, #E4E4E8)", border: `1px solid rgba(74,165,168,0.2)`, color: C.teal, fontFamily: "'Lato', sans-serif", boxShadow: `4px 4px 10px rgba(166,166,180,0.4), -4px -4px 10px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.8)` }}>
                    Book a walkthrough
                  </Link>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>
      </ScrollDepthLayers>

      <KeteAgentChat
        keteName="assembl" keteLabel="Platform Concierge" accentColor="#4AA5A8"
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
    <section id={id} className="px-4 sm:px-6 py-16 sm:py-32 relative">
      <div className="max-w-[1200px] mx-auto relative z-10">{children}</div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center py-2">
        <DotDivider />
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-medium tracking-[5px] uppercase mb-5"
      style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>
      — {children} —
    </p>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg sm:text-[36px] lg:text-[42px] mb-4 sm:mb-6"
      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#3D4250", textShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {children}
    </h2>
  );
}

function SectionP({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[14px] sm:text-[17px] leading-[1.7] max-w-xl mx-auto ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "#4B5563" }}>
      {children}
    </p>
  );
}

/* ─── Glow Card — 3D neumorphic glass ─── */
function GlowCard({ children, className = "", accentColor }: { children: React.ReactNode; className?: string; accentColor?: string }) {
  const ac = accentColor || "#4AA5A8";
  return (
    <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-10 ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(238,238,242,0.65))",
        backdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: `
          6px 6px 16px rgba(166,166,180,0.3),
          -6px -6px 16px rgba(255,255,255,0.85),
          inset 0 1px 0 rgba(255,255,255,0.9),
          0 0 40px -15px ${ac}25
        `,
      }}
    >
      {/* Top glass shine */}
      <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)",
      }} />
      {/* Accent glow line */}
      <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${ac}30, transparent)`,
        filter: `blur(1px)`,
      }} />
      {children}
    </div>
  );
}
