import React, { useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import KeteIcon from "@/components/kete/KeteIcon";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteMiniIcon, { type KeteGlyph } from "@/components/kete/KeteMiniIcon";

const KeteOrbHero = lazy(() => import("@/components/landing/KeteOrbHero"));
const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/* ─── Design tokens ─── */
const C = {
  bg: "#060610",
  surface: "#0A0A18",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  white: "#FFFFFF",
  textSec: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.30)",
  border: "rgba(255,255,255,0.08)",
};

const FONT = {
  heading: "'Lato', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Divider ─── */
const WeaveDivider = () => (
  <div className="w-full overflow-hidden" style={{ height: 32, opacity: 0.08 }}>
    <svg width="100%" height="32" viewBox="0 0 600 32" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 44 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 14}, 0)`}>
          <path d="M0 16 L7 0 L14 16 L7 32 Z" stroke={C.pounamu} strokeWidth="0.6" fill="none" />
          <circle cx="7" cy="16" r="1" fill={C.pounamu} opacity="0.4" />
        </g>
      ))}
    </svg>
  </div>
);

/* ─── Typography ─── */
const Eyebrow = ({ children, color }: { children: string; color?: string }) => (
  <span className="inline-block text-[10px] font-bold tracking-[4px] uppercase mb-5" style={{ fontFamily: FONT.mono, color: color || C.pounamuLight }}>
    {children}
  </span>
);

const SectionHeading = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode }>(({ children }, ref) => (
  <h2 ref={ref} className="text-2xl sm:text-3xl lg:text-4xl tracking-[1px] sm:tracking-[2px] mb-6" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, lineHeight: 1.2 }}>
    {children}
  </h2>
));
SectionHeading.displayName = "SectionHeading";

const Body = React.forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(({ children, className = "", style }, ref) => (
  <p ref={ref} className={`text-sm sm:text-[15px] leading-relaxed ${className}`} style={{ fontFamily: FONT.body, color: C.textSec, ...style }}>
    {children}
  </p>
));
Body.displayName = "Body";

const SEC = "relative px-6 sm:px-8 py-24 sm:py-32";
const INNER = "max-w-5xl mx-auto";

/* ─── Animation ─── */
const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.65, ease },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { delay: i * 0.1, duration: 0.55, ease },
});

/* ─── Data ─── */
const TRUST_ITEMS: { glyph: KeteGlyph; label: string; desc: string; color: string }[] = [
  { glyph: "shield", label: "Built for control", desc: "Clear rules, approvals, and review pathways", color: C.pounamu },
  { glyph: "globe", label: "NZ-ready", desc: "Designed around local operating conditions", color: C.pounamuLight },
  { glyph: "bolt", label: "Practical outcomes", desc: "Less admin, better consistency, faster turnaround", color: C.gold },
  { glyph: "layers", label: "Start small", desc: "Begin with one workflow and expand when it proves value", color: C.navy },
];

const WHAT_WE_DO = [
  "Preparing and reviewing quotes",
  "Checking process and compliance steps",
  "Supporting payroll and admin workflows",
  "Coordinating planning and day-to-day execution",
  "Drafting reports, summaries, and follow-up actions",
  "Keeping context and prior decisions visible",
];

const WHAT_YOU_GET: { glyph: KeteGlyph; text: string }[] = [
  { glyph: "file", text: "Defined workflow coverage" },
  { glyph: "people", text: "Role-based support for specific jobs" },
  { glyph: "shield", text: "Built-in rules and operating boundaries" },
  { glyph: "check", text: "Approvals and review pathways where needed" },
  { glyph: "gear", text: "Configuration for your business context" },
  { glyph: "headset", text: "Onboarding and rollout support" },
  { glyph: "refresh", text: "Ongoing refinement as your needs evolve" },
];

const BEST_FIT = [
  "Reduce manual admin and back-and-forth",
  "Improve consistency across repetitive tasks",
  "Support staff with better operational tools",
  "Make reporting and follow-up easier",
  "Keep workflows aligned to internal rules and requirements",
  "Introduce modern workflow support without creating extra risk",
];

const OUTCOMES: { glyph: KeteGlyph; text: string }[] = [
  { glyph: "check", text: "Fewer missed steps" },
  { glyph: "refresh", text: "Less rework" },
  { glyph: "clock", text: "Faster turnaround" },
  { glyph: "chart", text: "Better visibility across workflows" },
  { glyph: "clipboard", text: "Clearer process discipline" },
  { glyph: "book", text: "Easier onboarding for staff" },
  { glyph: "thumbs", text: "More confidence in how work is being handled" },
];

const PACKS: { reo: string; en: string; desc: string; color: string; to: string; accentLight: string }[] = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food Act plans, liquor licensing, guest experience, tourism operators.", color: "#3A7D6E", accentLight: "#5AADA0", to: "/manaaki" },
  { reo: "Waihanga", en: "Construction", desc: "Site to sign-off. H&S, consenting, project programmes, quality records.", color: "#1A3A5C", accentLight: "#2A5A8C", to: "/waihanga/about" },
  { reo: "Auaha", en: "Creative & Media", desc: "Strategy, content, brand voice, design, campaigns, lead formation, analytics.", color: "#D4A843", accentLight: "#E8C76A", to: "/auaha/about" },
  { reo: "Arataki", en: "Automotive", desc: "Enquiry → test drive → sale → delivery → service → loyalty.", color: "#E8E8E8", accentLight: "#D8D8D8", to: "/arataki" },
  { reo: "Pikau", en: "Freight & Customs", desc: "Route optimisation, declarations, broker hand-off, customs compliance.", color: "#7ECFC2", accentLight: "#A8E6DA", to: "/pikau" },
];

const GOVERNANCE = [
  "Defined permissions",
  "Approval pathways",
  "Visibility over outputs",
  "Policy and process alignment",
  "Human review where required",
  "Clearer operational boundaries",
];

const ROLLOUT_STEPS = [
  { num: "1", title: "Choose the workflow", desc: "Start with one business process where consistency, speed, or oversight matters." },
  { num: "2", title: "Configure the rules", desc: "Set the boundaries, review points, and business context that shape how the workflow operates." },
  { num: "3", title: "Roll out and refine", desc: "Introduce it to the team, review how it performs, and improve it over time." },
];

const FAQS = [
  { q: "What does Assembl actually help with?", a: "Assembl supports operational workflows such as quoting, compliance steps, planning, reporting, admin, and follow-up." },
  { q: "Do we have to roll this out everywhere at once?", a: "No. Most businesses start with one workflow, prove value, and expand from there." },
  { q: "Is this designed for NZ businesses?", a: "Yes. Assembl is positioned for NZ operating conditions and sector realities." },
  { q: "What makes this different from generic tools?", a: "Assembl is designed around governed workflows, clear boundaries, and practical operational use — not open-ended, unmanaged usage." },
  { q: "Do people still stay involved?", a: "Yes. Review, approvals, and human oversight can be built into the workflow where needed." },
];

const InputField = ({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    type={type}
    placeholder={placeholder}
    required
    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
    style={{ fontFamily: FONT.body, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(8px)" }}
  />
);

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactBiz, setContactBiz] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Assembl helps teams handle quoting, compliance, planning, reporting, and admin more consistently — with built-in rules, oversight, and support designed for NZ operating conditions."
      />
      <BrandNav />

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-20 sm:pt-28 pb-16" style={{ zIndex: 1 }}>
        <Suspense fallback={null}>
          <KeteOrbHero hideText />
        </Suspense>

        <motion.h1
          className="relative max-w-3xl mt-4"
          style={{ fontFamily: FONT.heading, fontWeight: 300, fontSize: isMobile ? "1.65rem" : "3rem", lineHeight: 1.15, letterSpacing: isMobile ? "0.5px" : "1.5px", zIndex: 1 }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.4, ease }}
        >
          Governed workflow tools for{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.pounamu} 0%, ${C.pounamuGlow} 50%, ${C.pounamu} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            NZ businesses
          </span>
        </motion.h1>

        <motion.p
          className="relative max-w-2xl mt-6"
          style={{ fontFamily: FONT.body, fontSize: isMobile ? "14px" : "16px", lineHeight: 1.8, color: C.textSec, zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.55, ease }}
        >
          Assembl helps teams handle quoting, compliance, planning, reporting, and admin more consistently — with built-in rules, oversight, and support designed for NZ operating conditions.
        </motion.p>

        <motion.div
          className="relative flex flex-col sm:flex-row gap-3 mt-10"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7, ease }}
        >
          <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
            Start with one workflow <ArrowRight size={15} />
          </Link>
          <Link to="/pricing" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
            See pricing
          </Link>
        </motion.div>

        <motion.div className="mt-14" style={{ color: "rgba(255,255,255,0.15)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="px-6 sm:px-8 py-12 relative z-10" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_ITEMS.map((t, i) => (
            <motion.div key={t.label} className="text-center p-5" {...stagger(i)}>
              <t.icon size={22} className="mx-auto mb-3" style={{ color: t.color }} />
              <p className="text-sm mb-1" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}>{t.label}</p>
              <p className="text-xs" style={{ fontFamily: FONT.body, color: C.textMuted }}>{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ WHAT ASSEMBL DOES ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>WHAT ASSEMBL DOES</Eyebrow>
            <SectionHeading>Structured support for the work that slows teams down</SectionHeading>
            <Body className="max-w-2xl mb-5">
              Assembl gives your business guided workflow support for operational tasks that are often manual, inconsistent, or hard to manage at scale.
            </Body>
            <Body className="max-w-2xl mb-3" style={{ color: C.pounamuLight, fontWeight: 500 }}>
              That can include:
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-3xl">
            {WHAT_WE_DO.map((item, i) => (
              <motion.div key={item} className="flex items-start gap-3" {...stagger(i)}>
                <Check size={14} className="mt-1 shrink-0" style={{ color: C.pounamu }} />
                <p className="text-sm" style={{ fontFamily: FONT.body, color: C.textSec }}>{item}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="mt-12 max-w-2xl">
            <Body style={{ color: "rgba(255,255,255,0.38)" }}>
              This is not about adding another generic tool. It is about making important work more consistent, more visible, and easier to manage.
            </Body>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ WHAT YOU GET ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>VALUE</Eyebrow>
            <SectionHeading>What you get for your money</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Every rollout is designed to be clear, structured, and practical.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_YOU_GET.map((item, i) => (
              <LiquidGlassCard key={item.text} className="p-6" accentColor={C.pounamu} delay={i * 0.06}>
                <div className="flex items-start gap-4">
                  <item.icon size={18} className="mt-0.5 shrink-0" style={{ color: C.pounamuLight }} />
                  <p className="text-sm" style={{ fontFamily: FONT.body, color: C.textSec }}>{item.text}</p>
                </div>
              </LiquidGlassCard>
            ))}
          </div>

          <motion.div {...fade} className="text-center mt-10">
            <Body style={{ color: C.pounamuLight, fontWeight: 500 }}>
              The goal is simple: help your team move faster without losing control.
            </Body>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ BEST FIT ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>BEST FIT</Eyebrow>
            <SectionHeading>Best suited to businesses that need to</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-3xl">
            {BEST_FIT.map((item, i) => (
              <motion.div key={item} className="flex items-start gap-3" {...stagger(i)}>
                <ArrowRight size={13} className="mt-1 shrink-0" style={{ color: C.pounamuLight }} />
                <p className="text-sm" style={{ fontFamily: FONT.body, color: C.textSec }}>{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ OUTCOMES ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>OUTCOMES</Eyebrow>
            <SectionHeading>What this helps improve</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Assembl is built to support better day-to-day operations. That often means:
            </Body>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {OUTCOMES.map((o, i) => (
              <LiquidGlassCard key={o.text} className="p-5 text-center" accentColor={C.pounamu} delay={i * 0.06}>
                <o.icon size={20} className="mx-auto mb-3" style={{ color: C.pounamuLight }} />
                <p className="text-xs" style={{ fontFamily: FONT.body, color: C.textSec }}>{o.text}</p>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ INDUSTRY KETE ═══ */}
      <section id="industry-packs" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>INDUSTRY KETE</Eyebrow>
            <SectionHeading>Industry kete built around real NZ workflows</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Assembl is structured around sector-specific kete so businesses can start with tools that reflect the realities of their work. Each kete is designed around the jobs, pressures, and operating context of that sector — so support feels relevant from day one.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <LiquidGlassCard key={p.reo} className="h-full" accentColor={p.color} delay={i * 0.08}>
                <Link to={p.to} className="block h-full group p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <Suspense fallback={<KeteWeaveVisual size={48} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                      <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={64} />
                    </Suspense>
                    <div>
                      <p className="text-[10px] uppercase tracking-[3px]" style={{ fontFamily: FONT.mono, color: p.color }}>{p.en}</p>
                      <h3 className="text-xl" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, letterSpacing: "1px" }}>{p.reo}</h3>
                    </div>
                  </div>
                  <Body className="text-sm">{p.desc}</Body>
                  <div className="flex items-center gap-1 mt-5 text-[11px] transition-all duration-300 group-hover:gap-2" style={{ fontFamily: FONT.body, color: p.color, fontWeight: 500 }}>
                    Explore kete <ArrowRight size={11} />
                  </div>
                </Link>
              </LiquidGlassCard>
            ))}
          </div>

          <motion.div {...fade} className="text-center mt-10">
            <Link to="/kete" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ fontFamily: FONT.body, color: C.pounamuLight, fontWeight: 500 }}>
              Explore industry kete <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ WHY GOVERNANCE MATTERS ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>GOVERNANCE</Eyebrow>
            <SectionHeading>Built for control, not guesswork</SectionHeading>
            <Body className="max-w-2xl mx-auto">
              Many teams are already using digital tools in ways that are hard to monitor, hard to review, and difficult to keep consistent. Assembl is designed to bring structure around that work through:
            </Body>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {GOVERNANCE.map((item, i) => (
              <LiquidGlassCard key={item} className="p-5 text-center" accentColor={C.pounamu} delay={i * 0.06}>
                <p className="text-sm" style={{ fontFamily: FONT.body, color: C.textSec }}>{item}</p>
              </LiquidGlassCard>
            ))}
          </div>

          <motion.div {...fade} className="text-center mt-10 max-w-xl mx-auto">
            <Body style={{ color: C.pounamuLight, fontWeight: 500 }}>
              So your team can move faster inside a more accountable system.
            </Body>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ HOW ROLLOUT WORKS ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>ROLLOUT</Eyebrow>
            <SectionHeading>Start small. Prove value. Expand carefully.</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {ROLLOUT_STEPS.map((step, i) => (
              <LiquidGlassCard key={step.num} className="p-8" accentColor={C.pounamu} delay={i * 0.1}>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4 text-lg" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.pounamuLight, background: `${C.pounamu}15`, border: `1px solid ${C.pounamu}30` }}>
                  {step.num}
                </span>
                <h3 className="text-base mb-3" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}>{step.title}</h3>
                <Body className="text-sm">{step.desc}</Body>
              </LiquidGlassCard>
            ))}
          </div>

          <motion.div {...fade} className="text-center mt-10">
            <Body style={{ color: "rgba(255,255,255,0.38)" }}>
              This approach keeps the rollout practical and low-friction.
            </Body>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ PRICING TEASER ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Clear pricing, built around workflow coverage</SectionHeading>
            <Body className="mb-8">
              Start with one workflow and grow from there. Plans are structured around workflow coverage, team size, level of governance and review, and rollout and support needs.
            </Body>

            <LiquidGlassCard className="p-10 mb-8" accentColor={C.pounamu} glassIntensity="strong">
              <p className="text-4xl mb-2" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}>
                From $590<span className="text-lg" style={{ color: C.textMuted }}> NZD/month ex GST</span>
              </p>
            </LiquidGlassCard>

            <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
              See pricing <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ FAQ ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={`${INNER} max-w-3xl mx-auto`}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading>Questions businesses usually ask</SectionHeading>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...stagger(i)}>
                <LiquidGlassCard className="overflow-hidden" accentColor={C.pounamu} animate={false}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4"
                  >
                    <p className="text-sm" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}>{faq.q}</p>
                    <ChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-300"
                      style={{ color: C.pounamuLight, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <Body className="text-sm">{faq.a}</Body>
                    </div>
                  </motion.div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ FINAL CTA ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <SectionHeading>Bring more structure to the way work gets done</SectionHeading>
            <Body className="mb-10">
              Start with one workflow and see where governed operational support can make the biggest difference.
            </Body>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
                See pricing <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
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
