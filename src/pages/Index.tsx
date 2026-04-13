import React, { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteMiniIcon, { type KeteGlyph } from "@/components/kete/KeteMiniIcon";

const KeteOrbHero = lazy(() => import("@/components/landing/KeteOrbHero"));
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
const TRUST_ITEMS = [
  { glyph: "shield" as KeteGlyph, label: "Built for control", desc: "Rules, approvals & review pathways", color: C.pounamu },
  { glyph: "globe" as KeteGlyph, label: "NZ-ready", desc: "Local operating conditions baked in", color: C.pounamuLight },
  { glyph: "bolt" as KeteGlyph, label: "Practical outcomes", desc: "Less admin, faster turnaround", color: C.gold },
  { glyph: "layers" as KeteGlyph, label: "Start small", desc: "One workflow, expand when proven", color: C.navy },
];

const WHAT_WE_DO = [
  "Preparing and reviewing quotes",
  "Checking compliance steps",
  "Supporting payroll and admin",
  "Coordinating planning and execution",
  "Drafting reports and follow-ups",
  "Keeping decisions visible",
];

const WHAT_YOU_GET: { glyph: KeteGlyph; text: string }[] = [
  { glyph: "file", text: "Defined workflow coverage" },
  { glyph: "people", text: "Role-based support" },
  { glyph: "shield", text: "Built-in rules & boundaries" },
  { glyph: "check", text: "Approval pathways" },
  { glyph: "gear", text: "Business context config" },
  { glyph: "headset", text: "Onboarding support" },
];

const OUTCOMES: { glyph: KeteGlyph; text: string; color: string }[] = [
  { glyph: "check", text: "Fewer missed steps", color: C.pounamu },
  { glyph: "refresh", text: "Less rework", color: C.pounamuLight },
  { glyph: "clock", text: "Faster turnaround", color: C.gold },
  { glyph: "chart", text: "Better visibility", color: C.pounamuGlow },
  { glyph: "clipboard", text: "Process discipline", color: C.pounamu },
  { glyph: "thumbs", text: "More confidence", color: C.pounamuLight },
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
    result: "4.2 hours saved per week on H&S documentation and consent tracking",
    detail: "Replaced manual site safety briefings and Building Code lookups with governed workflows. Evidence packs now auto-generated for council sign-off.",
    stat: "4.2 hrs/wk",
    color: "#1A3A5C",
  },
  {
    title: "Ponsonby café & bar group",
    industry: "Hospitality",
    team: "3 venues, 22 staff",
    result: "Food safety diary compliance from 60% → 98% in 6 weeks",
    detail: "Digital food control plans via WhatsApp replaced paper logs. MPI audit prep reduced from 2 days to 20 minutes.",
    stat: "98% compliant",
    color: C.pounamu,
  },
  {
    title: "Tauranga freight forwarder",
    industry: "Freight & Customs",
    team: "12-person operation",
    result: "$14,200/year saved on customs declaration errors and rework",
    detail: "HS code validation and automated Customs Declaration Packs eliminated manual entry errors and reduced clearance delays.",
    stat: "$14.2K saved",
    color: C.pounamuGlow,
  },
];

const CITATION_EXAMPLES = [
  { law: "Building Act 2004, s.362", context: "Consent processing timeframes", agent: "Waihanga" },
  { law: "Health and Safety at Work Act 2015, s.36", context: "PCBU obligations", agent: "Waihanga" },
  { law: "Food Act 2014, s.40", context: "Food control plan requirements", agent: "Manaaki" },
  { law: "Privacy Act 2020, s.22", context: "Information privacy principles", agent: "All agents" },
];

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactBiz, setContactBiz] = useState("");

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = `Homepage enquiry — ${contactBiz}`;
      const { data: inserted, error } = await supabase
        .from("contact_submissions")
        .insert({ name: contactName, email: contactEmail, message: msg })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Thanks — we'll be in touch within one business day.");
      setContactName(""); setContactEmail(""); setContactBiz("");
      supabase.functions.invoke("send-contact-email", { body: { name: contactName, email: contactEmail, message: msg } }).catch(console.error);
      if (inserted?.id) supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Assembl helps teams handle quoting, compliance, planning, reporting, and admin more consistently — with built-in rules, oversight, and support designed for NZ operating conditions."
      />
      <BrandNav />

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 pt-12 sm:pt-16 pb-8 overflow-hidden">
        {/* PHOTON-style dramatic ambient glows */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 90% 55% at 50% 20%, ${C.pounamu}14 0%, transparent 65%), radial-gradient(ellipse 65% 45% at 30% 60%, ${C.gold}0A 0%, transparent 55%), radial-gradient(ellipse 55% 35% at 75% 35%, ${C.pounamuGlow}08 0%, transparent 50%)`,
        }} />

        {/* Dot grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* Floating particles with trails */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2 + i * 1.0,
              height: 2 + i * 1.0,
              background: i % 3 === 0 ? C.gold : i % 3 === 1 ? C.pounamu : C.pounamuGlow,
              left: `${8 + i * 7.5}%`,
              top: `${12 + (i % 5) * 18}%`,
              opacity: 0.15,
              boxShadow: `0 0 ${8 + i * 2}px ${i % 3 === 0 ? C.gold : C.pounamu}40`,
            }}
            animate={{
              y: [0, -22 - i * 4, 0],
              opacity: [0.08, 0.3, 0.08],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}

        <Suspense fallback={
          <div className="relative flex items-center justify-center" style={{ width: 600, height: 600 }}>
            <div className="absolute rounded-full animate-pulse" style={{ width: 280, height: 280, background: `radial-gradient(circle, ${C.pounamu}15 0%, transparent 70%)` }} />
            <div className="absolute rounded-full" style={{ width: 200, height: 200, border: `1px solid ${C.pounamu}20`, boxShadow: `0 0 40px ${C.pounamu}10` }} />
            <p className="text-[10px] tracking-[4px] uppercase animate-pulse" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>Loading</p>
          </div>
        }>
          <KeteOrbHero hideText />
        </Suspense>
        <motion.p
          className="text-[11px] font-semibold tracking-[5px] uppercase mb-7"
          style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          GOVERNED WORKFLOWS · AOTEAROA
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
          transition={{ duration: 0.7, delay: 0.3, ease }}
        >
          <span style={{
            background: `linear-gradient(135deg, ${C.bone} 0%, ${C.pounamuGlow} 50%, ${C.bone} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
          }}>
            Governed workflow tools
          </span>
          <br />
          for{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.bone} 0%, ${C.gold} 60%, ${C.bone} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
          }}>
            NZ businesses
          </span>
        </motion.h1>

        <motion.p
          className="max-w-xl mt-6 text-base sm:text-lg leading-[1.7]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
        >
          Quoting, compliance, planning, reporting, and admin — handled more consistently with built-in rules, oversight, and NZ operating context.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-10"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
        >
          <Link
            to="/pricing"
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 rounded-full" style={{
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)`,
              backgroundSize: "200% auto",
            }} />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              boxShadow: `0 0 30px ${C.gold}50, 0 0 60px ${C.gold}25`,
            }} />
            <span className="relative z-10" style={{ color: "#09090F" }}>Start with one workflow</span>
            <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
          </Link>
          <Link to="/pricing" className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full transition-all duration-300" style={{
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <span className="group-hover:text-white/80 transition-colors">See pricing</span>
          </Link>
        </motion.div>
      </section>

      {/* ═══ EVIDENCE PACK HERO ═══ */}
      <section className="px-6 py-12 sm:py-16" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fade}>
            <p className="text-[11px] font-bold tracking-[4px] uppercase mb-4" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>
              FLAGSHIP OUTPUT
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif", lineHeight: 1.15 }}>
              Every workflow ends with a signed{" "}
              <span style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>evidence pack</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: C.t2 }}>
              Structured, branded documents ready for legal sign-off, insurance claims, council submissions, and audit defence. Not a chatbot response — a filable, forwardable artefact with compliance status codes and agent attribution.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Compliance status codes", "Agent attribution", "Sign-off block", "PDF export", "Tamper-evident audit trail"].map((tag) => (
                <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105" style={{ background: `${C.gold}12`, color: `${C.gold}cc`, border: `1px solid ${C.gold}20` }}>
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/sample/manaaki" className="inline-flex items-center gap-2 text-[14px] font-medium group" style={{ color: C.gold }}>
              View sample evidence pack <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
              border: `1px solid rgba(255,255,255,0.06)`,
              backdropFilter: "blur(20px)",
              boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${C.pounamu}06, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            whileHover={{ scale: 1.01, boxShadow: `0 20px 56px rgba(0,0,0,0.5), 0 0 100px ${C.pounamu}10, inset 0 1px 0 rgba(255,255,255,0.06)` }}
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.pounamu}60, ${C.gold}40, transparent)` }} />

            <div className="p-8 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <KeteMiniIcon glyph="shield" color={C.pounamu} size={36} />
                <div>
                  <p className="text-[14px] font-medium tracking-tight" style={{ color: C.t1, fontFamily: "'Lato', sans-serif" }}>Compliance Evidence Pack</p>
                  <p className="text-[11px] tracking-wide" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>Generated 13 Apr 2026 · Manaaki Kete</p>
                </div>
                <span
                  className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-[2px] uppercase"
                  style={{ background: `${C.pounamu}18`, color: C.pounamuGlow, border: `1px solid ${C.pounamu}30`, boxShadow: `0 0 12px ${C.pounamu}15` }}
                >
                  PASS
                </span>
              </div>

              {/* Check items */}
              <div className="space-y-2.5">
                {[
                  { label: "Food Control Plan verification", ref: "FCP-2024" },
                  { label: "Temperature log compliance", ref: "TMP-047" },
                  { label: "Staff certification check", ref: "CERT-12" },
                  { label: "Privacy Act 2020, s.22 — satisfied", ref: "PA-s22" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 p-2 rounded-lg transition-colors duration-300 hover:bg-white/[0.02]"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.06 }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}20`, boxShadow: `0 0 8px ${C.pounamu}15` }}>
                      <Check size={11} style={{ color: C.pounamuGlow }} />
                    </div>
                    <span className="text-[13px] flex-1" style={{ color: C.t2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.label}</span>
                    <span className="text-[10px] tracking-wider" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>{item.ref}</span>
                  </motion.div>
                ))}
              </div>

              {/* Sign-off block */}
              <div className="pt-4 mt-1" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>Pack Sign-Off</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: C.t3 }}>Reviewer</p>
                    <div className="w-28 h-[1px]" style={{ background: `linear-gradient(90deg, ${C.t3}, transparent)` }} />
                  </div>
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: C.t3 }}>Date</p>
                    <div className="w-20 h-[1px]" style={{ background: `linear-gradient(90deg, ${C.t3}, transparent)` }} />
                  </div>
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: C.t3 }}>Status</p>
                    <div className="w-16 h-[1px]" style={{ background: `linear-gradient(90deg, ${C.t3}, transparent)` }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="relative px-6 py-14" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${C.pounamu}06 0%, transparent 60%)`,
        }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {TRUST_ITEMS.map((t, i) => (
            <motion.div key={t.label} className="flex items-start gap-4 group" {...stagger(i)}>
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                <KeteMiniIcon glyph={t.glyph} color={t.color} size={40} />
              </div>
              <div>
                <p className="text-[15px] font-medium mb-0.5" style={{ color: C.t1 }}>{t.label}</p>
                <p className="text-[13px]" style={{ color: C.t3 }}>{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ WHAT ASSEMBL DOES ═══ */}
      <Section>
        <motion.div {...fade}>
          <Eyebrow>WHAT ASSEMBL DOES</Eyebrow>
          <H2>Structured support for work that slows teams down</H2>
          <P className="max-w-xl mb-8">
            Guided workflow support for operational tasks that are manual, inconsistent, or hard to manage at scale.
          </P>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {WHAT_WE_DO.map((item, i) => (
            <motion.div key={item} className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/[0.03]" {...stagger(i)}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}15`, boxShadow: `0 0 8px ${C.pounamu}10` }}>
                <Check size={12} className="shrink-0" style={{ color: C.pounamuGlow }} />
              </div>
              <span className="text-[15px]" style={{ color: C.t2 }}>{item}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ WHAT YOU GET ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>INCLUDED</Eyebrow>
          <H2>What you get</H2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {WHAT_YOU_GET.map((item, i) => (
            <motion.div
              key={item.text}
              className="group relative flex items-center gap-5 rounded-2xl px-6 py-6 transition-all duration-400 hover:translate-y-[-3px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 20px rgba(58,125,110,0.04)`,
              }}
              {...stagger(i)}
              whileHover={{ boxShadow: `0 8px 32px rgba(58,125,110,0.08), 0 0 40px rgba(58,125,110,0.04)` }}
            >
              {/* Top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent, ${C.pounamuLight}40, transparent)`,
              }} />
              <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg" style={{ background: `${C.pounamu}14` }}>
                <KeteMiniIcon glyph={item.glyph} color={C.pounamuLight} size={36} />
              </div>
              <span className="text-[15px] font-medium" style={{ color: C.t1 }}>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ OUTCOMES ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>OUTCOMES</Eyebrow>
          <H2>What this helps improve</H2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {OUTCOMES.map((o, i) => (
            <motion.div
              key={o.text}
              className="group relative flex items-center gap-5 rounded-2xl px-6 py-6 transition-all duration-400 hover:translate-y-[-3px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 20px ${o.color}06`,
              }}
              {...stagger(i)}
              whileHover={{ boxShadow: `0 8px 32px ${o.color}10, 0 0 40px ${o.color}06` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent, ${o.color}40, transparent)`,
              }} />
              <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${o.color}14` }}>
                <KeteMiniIcon glyph={o.glyph} color={o.color} size={36} />
              </div>
              <span className="text-[15px] font-medium" style={{ color: C.t1 }}>{o.text}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ INDUSTRY KETE ═══ */}
      <Section border id="industry-packs">
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>INDUSTRY KETE</Eyebrow>
          <H2>Sector-specific workflow packs</H2>
          <P className="max-w-xl mx-auto">
            Each kete is built around the jobs, pressures, and context of that sector.
          </P>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PACKS.map((p, i) => (
            <motion.div key={p.reo} {...stagger(i)}>
              <Link
                to={p.to}
                className="group block relative rounded-2xl p-6 h-full transition-all duration-400 hover:translate-y-[-3px] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: `1px solid ${C.border}`,
                  boxShadow: `0 4px 24px ${p.color}06`,
                }}
              >
                {/* Hover accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
                }} />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${p.color}08 0%, transparent 70%)`,
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
          ))}
        </div>
      </Section>

      {/* ═══ ROLLOUT ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <H2>Start small. Prove value. Expand.</H2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {ROLLOUT.map((step, i) => (
            <motion.div
              key={step.n}
              className="group relative rounded-2xl p-7 overflow-hidden transition-all duration-400 hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.2)`,
              }}
              {...stagger(i)}
              whileHover={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${C.pounamuLight}06` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent, ${C.pounamuLight}40, transparent)`,
              }} />
              <span className="text-[12px] font-bold tracking-[3px]" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{step.n}</span>
              <h3 className="text-[17px] font-medium mt-3 mb-2" style={{ color: C.t1 }}>{step.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: C.t3 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══ PRICING ═══ */}
      <Section border>
        <div className="max-w-xl mx-auto text-center">
          <motion.div {...fade}>
            <Eyebrow>PRICING</Eyebrow>
            <H2>Clear pricing, built around workflows</H2>
            <P className="mb-8">
              Start with one workflow. Plans scale with coverage, team size, and support needs.
            </P>
            <div className="relative rounded-2xl p-8 mb-8 overflow-hidden" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: `1px solid ${C.border}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${C.gold}05`,
            }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                background: `linear-gradient(90deg, transparent, ${C.gold}50, transparent)`,
              }} />
              <p className="text-4xl font-light" style={{ fontFamily: "'Lato', sans-serif" }}>
                <span style={{
                  background: `linear-gradient(135deg, ${C.bone}, ${C.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>From $590</span>
                <span className="text-base ml-2" style={{ color: C.t3 }}>NZD/mo ex GST</span>
              </p>
            </div>
            <Link
              to="/pricing"
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 rounded-full" style={{
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)`,
              }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                boxShadow: `0 0 30px ${C.gold}50, 0 0 60px ${C.gold}25`,
              }} />
              <span className="relative z-10" style={{ color: "#09090F" }}>See pricing</span>
              <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ═══ CITATION SHOWCASE ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>NZ LEGISLATIVE GROUNDING</Eyebrow>
          <H2>Every citation checked against current NZ law</H2>
          <P className="max-w-xl mx-auto">
            When an assembl workflow references legislation, it cites the specific Act, section, and year — then verifies it's current. No overseas tool can do this.
          </P>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {CITATION_EXAMPLES.map((cite, i) => (
            <motion.div
              key={cite.law}
              className="group relative rounded-xl px-6 py-5 overflow-hidden transition-all duration-400 hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.2)`,
              }}
              {...stagger(i)}
              whileHover={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${C.pounamu}06` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent, ${C.pounamuGlow}40, transparent)`,
              }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: C.pounamuGlow, fontFamily: "'JetBrains Mono', monospace" }}>{cite.law}</p>
              <p className="text-[13px] mb-2" style={{ color: C.t2 }}>{cite.context}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${C.pounamu}15`, color: C.pounamuLight }}>
                {cite.agent} kete
              </span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/tikanga" className="inline-flex items-center gap-2 text-[14px] font-medium group" style={{ color: C.pounamuLight }}>
            Learn about our governance pipeline <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Section>

      {/* ═══ CASE STUDIES ═══ */}
      <Section border>
        <motion.div {...fade} className="text-center mb-12">
          <Eyebrow>NZ BUSINESSES</Eyebrow>
          <H2>Real scenarios, real NZD savings</H2>
          <P className="max-w-xl mx-auto">
            620,000 NZ SMEs. 73% want specialist tools. Here's what governed workflows look like in practice.
          </P>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.title}
              className="group relative rounded-2xl p-7 flex flex-col overflow-hidden transition-all duration-400 hover:translate-y-[-3px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 24px ${cs.color}06`,
              }}
              {...stagger(i)}
              whileHover={{ boxShadow: `0 12px 40px ${cs.color}10, 0 0 50px ${cs.color}06` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent, ${cs.color}50, transparent)`,
              }} />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-[2px] px-2 py-0.5 rounded-full" style={{ background: `${cs.color}15`, color: cs.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {cs.industry}
                </span>
                <span className="text-[11px]" style={{ color: C.t3 }}>{cs.team}</span>
              </div>
              <h3 className="text-[17px] font-medium mb-3 relative z-10" style={{ color: C.t1 }}>{cs.title}</h3>
              <p className="text-[14px] leading-relaxed mb-4 flex-1 relative z-10" style={{ color: C.t3 }}>{cs.detail}</p>
              <div className="pt-4 mt-auto relative z-10" style={{ borderTop: `1px solid ${C.border}` }}>
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
        <div className="text-center mt-8">
          <Link to="/roi" className="inline-flex items-center gap-2 text-[14px] font-medium group" style={{ color: C.gold }}>
            Calculate your ROI <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Section>

      {/* ═══ FAQ ═══ */}
      <Section border>
        <div className="max-w-2xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
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
                    boxShadow: openFaq === i ? `0 4px 24px rgba(0,0,0,0.3), 0 0 30px ${C.pounamu}05` : "none",
                  }}
                >
                  <span className="text-[15px] font-medium" style={{ color: C.t1 }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform duration-200"
                    style={{ color: C.t3, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pt-2 pb-5 text-[14px] leading-relaxed" style={{ color: C.t3 }}>{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${C.pounamu}08 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 60% 40%, ${C.gold}05 0%, transparent 50%)`,
        }} />
        <div className="max-w-xl mx-auto relative z-10">
          <motion.div {...fade}>
            <H2>Bring more structure to how work gets done</H2>
            <P className="mb-10">
              Start with one workflow and see where governed support makes the biggest difference.
            </P>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full" style={{
                  background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)`,
                }} />
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  boxShadow: `0 0 30px ${C.gold}50, 0 0 60px ${C.gold}25`,
                }} />
                <span className="relative z-10" style={{ color: "#09090F" }}>See pricing</span>
                <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
              </Link>
              <Link to="/contact" className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium rounded-full transition-all duration-300" style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <span className="group-hover:text-white/80 transition-colors">Talk to us</span>
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
    <section id={id} className="px-6 py-20 sm:py-24" style={border ? { borderTop: `1px solid ${C.border}` } : undefined}>
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
