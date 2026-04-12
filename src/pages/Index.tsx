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
  navy: "#1A3A5C",
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
      <section className="relative flex flex-col items-center text-center px-6 pt-20 sm:pt-24 pb-16">
        <Suspense fallback={null}>
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
          Governed workflow tools
          <br />
          for{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.pounamu}, ${C.pounamuGlow})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
          <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
            Start with one workflow <ArrowRight size={15} />
          </Link>
          <Link to="/pricing" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
            See pricing
          </Link>
        </motion.div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="px-6 py-12" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map((t, i) => (
            <motion.div key={t.label} className="flex items-start gap-4" {...stagger(i)}>
              <KeteMiniIcon glyph={t.glyph} color={t.color} size={40} />
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
            <motion.div key={item} className="flex items-center gap-3 py-2" {...stagger(i)}>
              <Check size={16} className="shrink-0" style={{ color: C.pounamu }} />
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
              className="group flex items-center gap-5 rounded-2xl px-6 py-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 2px 16px rgba(58,125,110,0.04)`,
              }}
              {...stagger(i)}
            >
              <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${C.pounamu}14` }}>
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
              className="group flex items-center gap-5 rounded-2xl px-6 py-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 2px 16px ${o.color}08`,
              }}
              {...stagger(i)}
            >
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
                className="group block rounded-2xl p-6 h-full transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.border}`,
                  boxShadow: `0 2px 20px ${p.color}06`,
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Suspense fallback={<KeteWeaveVisual size={44} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                    <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={56} />
                  </Suspense>
                  <div>
                    <p className="text-[10px] uppercase tracking-[3px] font-semibold mb-0.5" style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.en}</p>
                    <h3 className="text-xl font-light" style={{ fontFamily: "'Lato', sans-serif", color: C.white }}>{p.reo}</h3>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.t3 }}>{p.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-all group-hover:gap-3" style={{ color: p.color }}>
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
              className="rounded-2xl p-7"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}
              {...stagger(i)}
            >
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
            <div className="rounded-2xl p-8 mb-8" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <p className="text-4xl font-light" style={{ fontFamily: "'Lato', sans-serif" }}>
                From $590
                <span className="text-base ml-2" style={{ color: C.t3 }}>NZD/mo ex GST</span>
              </p>
            </div>
            <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
              See pricing <ArrowRight size={15} />
            </Link>
          </motion.div>
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
                  className="w-full text-left rounded-xl px-6 py-5 flex items-center justify-between gap-4 transition-colors"
                  style={{ background: openFaq === i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)", border: `1px solid ${C.border}` }}
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
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <motion.div {...fade}>
            <H2>Bring more structure to how work gets done</H2>
            <P className="mb-10">
              Start with one workflow and see where governed support makes the biggest difference.
            </P>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
                See pricing <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
                Talk to us
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
