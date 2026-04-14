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

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/* ─── Tokens ─── */
const C = {
  bg: "#060610",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  bone: "#F5F0E8",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.6)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
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
const PLATFORM_FEATURES: { glyph: KeteGlyph; title: string; desc: string }[] = [
  { glyph: "file", title: "Quoting & reporting", desc: "Structured templates with review steps" },
  { glyph: "shield", title: "Compliance checks", desc: "Rules and boundaries built in" },
  { glyph: "check", title: "Approval pathways", desc: "Human oversight at every stage" },
  { glyph: "people", title: "Role-based access", desc: "Right tools for each team member" },
  { glyph: "gear", title: "Business context", desc: "Configured to your operations" },
  { glyph: "headset", title: "Onboarding support", desc: "Up and running in 10 business days" },
];

const PACKS = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food safety, liquor licensing, guest experience.", color: "#3A7D6E", accentLight: "#5AADA0", to: "/manaaki" },
  { reo: "Waihanga", en: "Construction", desc: "H&S, consenting, project programmes, quality.", color: "#1A3A5C", accentLight: "#2A5A8C", to: "/waihanga/about" },
  { reo: "Auaha", en: "Creative & Media", desc: "Strategy, content, campaigns, analytics.", color: "#D4A843", accentLight: "#E8C76A", to: "/auaha/about" },
  { reo: "Arataki", en: "Automotive", desc: "Enquiry → sale → delivery → service → loyalty.", color: "#E8E8E8", accentLight: "#D8D8D8", to: "/arataki" },
  { reo: "Pikau", en: "Freight & Customs", desc: "Routes, declarations, customs compliance.", color: "#7ECFC2", accentLight: "#A8E6DA", to: "/pikau" },
];

const ROLLOUT = [
  { n: "01", title: "Choose the workflow", desc: "Start where consistency or oversight matters most." },
  { n: "02", title: "Configure the rules", desc: "Set boundaries, review points, and business context." },
  { n: "03", title: "Roll out & refine", desc: "Introduce to the team, review, and improve over time." },
];

const FAQS = [
  { q: "What does Assembl actually help with?", a: "Operational workflows — quoting, compliance, planning, reporting, admin, and follow-up." },
  { q: "Do we have to roll out everywhere at once?", a: "No. Start with one workflow, prove value, expand from there." },
  { q: "Is this designed for NZ businesses?", a: "Yes. Built for NZ operating conditions and sector realities." },
  { q: "What makes this different from generic tools?", a: "Governed workflows with clear boundaries — not open-ended, unmanaged usage." },
  { q: "Do people still stay involved?", a: "Yes. Review, approvals, and human oversight built into workflows." },
];

const CASE_STUDIES = [
  {
    title: "Christchurch residential builder",
    industry: "Construction",
    team: "8-person team",
    detail: "Replaced manual site safety briefings and Building Code lookups with governed workflows. Evidence packs now auto-generated for council sign-off.",
    stat: "4.2 hrs/wk",
    result: "saved on H&S documentation",
    color: "#1A3A5C",
  },
  {
    title: "Ponsonby café & bar group",
    industry: "Hospitality",
    team: "3 venues, 22 staff",
    detail: "Digital food control plans via WhatsApp replaced paper logs. MPI audit prep reduced from 2 days to 20 minutes.",
    stat: "98%",
    result: "food safety compliance",
    color: C.pounamu,
  },
  {
    title: "Tauranga freight forwarder",
    industry: "Freight & Customs",
    team: "12-person operation",
    detail: "HS code validation and automated Customs Declaration Packs eliminated manual entry errors and reduced clearance delays.",
    stat: "$14.2K",
    result: "saved per year",
    color: C.pounamuGlow,
  },
];

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { profile, atmosphere, isPersonalized } = usePersonalization();
  const hero = profile.preferences.heroVariant;
  const engagementDepth = profile.signals.engagementDepth;
  useReturnVisitor();

  // Reorder PACKS based on personalization
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
    <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Assembl helps teams handle quoting, compliance, planning, reporting, and admin more consistently — with built-in rules, oversight, and support designed for NZ operating conditions."
      />
      <BrandNav />

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-14 overflow-hidden">
        {/* Atmosphere overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: atmosphere.bgOverlay }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 20%, ${C.pounamu}10 0%, transparent 65%)`,
          opacity: atmosphere.particleBrightness,
        }} />

        <motion.p
          className="text-[11px] font-semibold tracking-[5px] uppercase mb-6"
          style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          className="max-w-3xl"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: isMobile ? "2rem" : "3.25rem",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          key={hero.headline} // remount on variant change for animation
        >
          <span style={{
            background: `linear-gradient(135deg, ${C.bone} 0%, ${C.pounamuGlow} 50%, ${C.bone} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
          }}>
            {hero.headline}
          </span>
        </motion.h1>

        <motion.p
          className="max-w-xl mt-6 text-base sm:text-lg leading-[1.7]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          key={hero.subheadline}
        >
          {hero.subheadline}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-10"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease }}
        >
          <Link
            to={hero.ctaLink}
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 rounded-full" style={{
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)`,
              backgroundSize: "200% auto",
            }} />
            <span className="relative z-10" style={{ color: "#09090F" }}>{hero.cta}</span>
            <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
          </Link>
          {hero.secondaryCta && (
            <Link to={hero.secondaryCtaLink || '/pricing'} className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full transition-all duration-300" style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <span className="group-hover:text-white/80 transition-colors">{hero.secondaryCta}</span>
            </Link>
          )}
        </motion.div>

        {/* Trust badges inline */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {[
            { label: "Built for control", color: C.pounamu },
            { label: "NZ-ready", color: C.pounamuLight },
            { label: "Practical outcomes", color: C.gold },
            { label: "Start small", color: C.navy },
          ].map((t) => (
            <span key={t.label} className="text-[11px] px-3 py-1.5 rounded-full" style={{
              background: `${t.color}10`, color: `${t.color}cc`, border: `1px solid ${t.color}18`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {t.label}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ EVIDENCE PACK ═══ */}
      <Section border>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fade}>
            <Eyebrow>FLAGSHIP OUTPUT</Eyebrow>
            <H2>
              Every workflow ends with a signed{" "}
              <span style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>evidence pack</span>
            </H2>
            <P className="mb-6">
              Structured, branded documents ready for legal sign-off, insurance claims, council submissions, and audit defence. A filable, forwardable artefact with compliance status codes and agent attribution.
            </P>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Compliance status codes", "Agent attribution", "Sign-off block", "PDF export", "Audit trail"].map((tag) => (
                <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: `${C.gold}12`, color: `${C.gold}cc`, border: `1px solid ${C.gold}20` }}>
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/sample/manaaki" className="inline-flex items-center gap-2 text-[14px] font-medium group" style={{ color: C.gold }}>
              View sample evidence pack <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Evidence pack preview card */}
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
              border: `1px solid rgba(255,255,255,0.06)`,
              boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${C.pounamu}06`,
            }}
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.pounamu}60, ${C.gold}40, transparent)` }} />
            <div className="p-8 space-y-5">
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <KeteMiniIcon glyph="shield" color={C.pounamu} size={36} />
                <div>
                  <p className="text-[14px] font-medium tracking-tight" style={{ color: C.t1, fontFamily: "'Lato', sans-serif" }}>Compliance Evidence Pack</p>
                  <p className="text-[11px] tracking-wide" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>Generated 13 Apr 2026 · Manaaki Kete</p>
                </div>
                <span className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-[2px] uppercase"
                  style={{ background: `${C.pounamu}18`, color: C.pounamuGlow, border: `1px solid ${C.pounamu}30` }}>
                  PASS
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Food Control Plan verification", ref: "FCP-2024" },
                  { label: "Temperature log compliance", ref: "TMP-047" },
                  { label: "Staff certification check", ref: "CERT-12" },
                  { label: "Privacy Act 2020, s.22 — satisfied", ref: "PA-s22" },
                ].map((item, idx) => (
                  <motion.div key={item.label} className="flex items-center gap-3 p-2 rounded-lg"
                    initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.06 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}20` }}>
                      <Check size={11} style={{ color: C.pounamuGlow }} />
                    </div>
                    <span className="text-[13px] flex-1" style={{ color: C.t2 }}>{item.label}</span>
                    <span className="text-[10px] tracking-wider" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>{item.ref}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pt-4 mt-1" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>Pack Sign-Off</p>
                <div className="flex gap-8">
                  {["Reviewer", "Date", "Status"].map((lbl) => (
                    <div key={lbl}>
                      <p className="text-[10px] mb-1" style={{ color: C.t3 }}>{lbl}</p>
                      <div className="w-20 h-[1px]" style={{ background: `linear-gradient(90deg, ${C.t3}, transparent)` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══ WHAT'S INCLUDED ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-10">
          <Eyebrow>PLATFORM</Eyebrow>
          <H2>What you get</H2>
          <P className="max-w-xl mx-auto">
            Guided support for operational tasks that are manual, inconsistent, or hard to manage at scale.
          </P>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {PLATFORM_FEATURES.map((item, i) => (
            <motion.div
              key={item.title}
              className="group relative flex items-start gap-4 rounded-xl px-5 py-5 transition-all duration-300 hover:translate-y-[-2px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
              }}
              {...stagger(i)}
            >
              <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${C.pounamu}14` }}>
                <KeteMiniIcon glyph={item.glyph} color={C.pounamuLight} size={32} />
              </div>
              <div>
                <p className="text-[14px] font-medium mb-0.5" style={{ color: C.t1 }}>{item.title}</p>
                <p className="text-[13px]" style={{ color: C.t3 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ INDUSTRY KETE ═══ */}
      <Section border id="industry-packs">
        <motion.div {...fade} className="text-center mb-10">
          <Eyebrow>INDUSTRY KETE</Eyebrow>
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
              <motion.div
                key={p.reo}
                layout
                layoutId={`kete-card-${p.reo}`}
                {...stagger(i)}
                className={isDetected ? 'sm:col-span-2 lg:col-span-1' : ''}
              >
                <Link
                  to={p.to}
                  className="group block relative rounded-2xl p-6 h-full transition-all duration-300 hover:translate-y-[-3px] overflow-hidden"
                  style={{
                    background: isDetected
                      ? `linear-gradient(135deg, ${p.color}08 0%, rgba(255,255,255,0.01) 100%)`
                      : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    border: isDetected
                      ? `1px solid ${p.color}30`
                      : `1px solid ${C.border}`,
                    boxShadow: isDetected ? `0 0 40px ${p.color}08` : undefined,
                  }}
                >
                  {isDetected && (
                    <div className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full tracking-[2px] uppercase"
                      style={{ background: `${p.color}15`, color: `${p.color}aa`, border: `1px solid ${p.color}25`, fontFamily: "'JetBrains Mono', monospace" }}>
                      Recommended
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
                  }} />
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <Suspense fallback={<KeteWeaveVisual size={44} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                      <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={56} />
                    </Suspense>
                    <div>
                      <p className="text-[10px] uppercase tracking-[3px] font-semibold mb-0.5" style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.en}</p>
                      <h3 className="text-xl font-light" style={{ fontFamily: "'Lato', sans-serif", color: C.white }}>{p.reo}</h3>
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed mb-4 relative z-10" style={{ color: C.t3 }}>{p.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-all group-hover:gap-3 relative z-10" style={{ color: p.color }}>
                    Explore <ArrowRight size={12} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
        </LayoutGroup>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-10">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <H2>Start small. Prove value. Expand.</H2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {ROLLOUT.map((step, i) => (
            <motion.div
              key={step.n}
              className="group relative rounded-2xl p-7 overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
              }}
              {...stagger(i)}
            >
              <span className="text-[12px] font-bold tracking-[3px]" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{step.n}</span>
              <h3 className="text-[17px] font-medium mt-3 mb-2" style={{ color: C.t1 }}>{step.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: C.t3 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ CASE STUDIES ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-10">
          <Eyebrow>NZ BUSINESSES</Eyebrow>
          <H2>Real scenarios, real outcomes</H2>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.title}
              className="group relative rounded-2xl p-7 flex flex-col overflow-hidden transition-all duration-300 hover:translate-y-[-3px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
              }}
              {...stagger(i)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[2px] px-2 py-0.5 rounded-full" style={{ background: `${cs.color}15`, color: cs.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {cs.industry}
                </span>
                <span className="text-[11px]" style={{ color: C.t3 }}>{cs.team}</span>
              </div>
              <h3 className="text-[17px] font-medium mb-3" style={{ color: C.t1 }}>{cs.title}</h3>
              <p className="text-[14px] leading-relaxed mb-4 flex-1" style={{ color: C.t3 }}>{cs.detail}</p>
              <div className="pt-4 mt-auto" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-2xl font-light" style={{
                  fontFamily: "'Lato', sans-serif",
                  background: `linear-gradient(135deg, ${cs.color}, ${C.bone})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{cs.stat}</p>
                <p className="text-[12px] mt-1" style={{ color: C.t3 }}>{cs.result}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ FAQ ═══ */}
      <Section border>
        <div className="max-w-2xl mx-auto">
          <motion.div {...fade} className="text-center mb-8">
            <Eyebrow>FAQ</Eyebrow>
            <H2>Common questions</H2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...stagger(i)}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left rounded-xl px-6 py-5 flex items-center justify-between gap-4 transition-all duration-300"
                  style={{
                    background: openFaq === i
                      ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                    border: `1px solid ${openFaq === i ? C.pounamu + "30" : C.border}`,
                  }}
                >
                  <span className="text-[15px] font-medium" style={{ color: C.t1 }}>{faq.q}</span>
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
      <section className="relative px-6 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${C.pounamu}08 0%, transparent 60%)`,
        }} />
        <div className="max-w-xl mx-auto relative z-10">
          <motion.div {...fade}>
            <H2>Bring more structure to how work gets done</H2>
            <P className="mb-10">
              Start with one workflow and see where governed support makes the biggest difference.
            </P>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)` }} />
                <span className="relative z-10" style={{ color: "#09090F" }}>Talk to us</span>
                <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
              </Link>
              <Link to="/pricing" className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full transition-all duration-300" style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <span className="group-hover:text-white/80 transition-colors">See pricing</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
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
function Section({ children, border, id }: { children: React.ReactNode; border?: boolean; id?: string }) {
  return (
    <section id={id} className="px-6 py-12 sm:py-16" style={border ? { borderTop: `1px solid ${C.border}` } : undefined}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold tracking-[4px] uppercase mb-4" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif", lineHeight: 1.15 }}>
      {children}
    </h2>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] sm:text-base leading-relaxed ${className}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}>
      {children}
    </p>
  );
}
