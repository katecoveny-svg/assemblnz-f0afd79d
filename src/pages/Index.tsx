import { useRef, useState } from "react";
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

/* ─── Design tokens — Pounamu primary, White secondary, Gold accent ─── */
const C = {
  bg: "#060610",
  surface: "#0A0A18",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",       // small accent only
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

/* ─── Kete weave section divider ─── */
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

/* ─── Typography components ─── */
const Eyebrow = ({ children, color }: { children: string; color?: string }) => (
  <span
    className="inline-block text-[10px] font-bold tracking-[4px] uppercase mb-5"
    style={{ fontFamily: FONT.mono, color: color || C.pounamuLight }}
  >
    {children}
  </span>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[2px] sm:tracking-[4px] mb-6"
    style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, lineHeight: 1.15 }}
  >
    {children}
  </h2>
);

const Body = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <p
    className={`text-sm sm:text-[15px] leading-relaxed ${className}`}
    style={{ fontFamily: FONT.body, color: C.textSec, ...style }}
  >
    {children}
  </p>
);

const SEC = "relative px-6 sm:px-8 py-24 sm:py-32";
const INNER = "max-w-5xl mx-auto";

/* ─── Data ─── */
const PROOF = [
  "5 industry kete",
  "6-layer agent stack",
  "Simulation-tested",
  "From $590 NZD/mo",
];

const PACKS: {
  reo: string;
  en: string;
  desc: string;
  color: string;
  to: string;
  accentLight: string;
}[] = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food Act plans, liquor licensing, guest experience, tourism operators.", color: "#3A7D6E", accentLight: "#5AADA0", to: "/packs/manaaki" },
  { reo: "Waihanga", en: "Construction", desc: "Site to sign-off. H&S, consenting, project programmes, quality records.", color: "#1A3A5C", accentLight: "#2A5A8C", to: "/hanga" },
  { reo: "Auaha", en: "Creative", desc: "Brief to published. Copy, image, video, podcast, ads, analytics.", color: "#D4A843", accentLight: "#E8C76A", to: "/packs/auaha" },
  { reo: "Arataki", en: "Automotive", desc: "Workshops, fleet, vehicle compliance, service scheduling.", color: "#E8E8E8", accentLight: "rgba(255,255,255,0.7)", to: "/contact" },
  { reo: "Pikau", en: "Freight & Customs", desc: "Route optimisation, declarations, broker hand-off, customs compliance.", color: "#7ECFC2", accentLight: "#A8E6DA", to: "/contact" },
];

const PIPELINE_STAGES = [
  { name: "Perception", desc: "Connects to your signals — messages, documents, calendars", color: C.pounamu },
  { name: "Memory", desc: "Business context carries forward across every session", color: C.pounamuLight },
  { name: "Reasoning", desc: "Policy-aware decision logic tuned to NZ legislation", color: C.white },
  { name: "Action", desc: "Executes within defined permissions and approval pathways", color: C.pounamuGlow },
  { name: "Explanation", desc: "Every output comes with a readable audit trail", color: C.gold },
  { name: "Simulation", desc: "Tests outcomes before they ship — not after", color: C.navy },
];

const DIFFS = [
  { num: "01", title: "Governed, not generic", body: "Every agent runs inside defined permissions, policy rules, and approval pathways. Not a chatbot. Not a replacement for your team.", accent: C.pounamu },
  { num: "02", title: "Simulation-tested", body: "Agents are tested against simulated scenarios before they touch production. Outputs are checked before they ship, not after.", accent: C.pounamuLight },
  { num: "03", title: "Built on NZ law", body: "Holidays Act 2003, Privacy Act 2020, Food Act 2014, Construction Contracts Act, IRD rules. Updated when the law updates.", accent: C.white },
  { num: "04", title: "Tikanga at the foundation", body: "Rangatiratanga, kaitiakitanga, manaakitanga, whanaungatanga. Built in, not bolted on.", accent: C.gold },
];

const PRICING = [
  {
    name: "Family",
    price: "$29",
    setup: "No setup fee",
    desc: "Whānau coordination over SMS. No app, no logins, just text.",
    features: ["SMS-first family agent", "School notices, calendar, meals", "Budget tracking", "Up to 6 family members"],
    highlight: false,
    accent: C.pounamuLight,
    stripeUrl: "https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c",
  },
  {
    name: "Operator",
    price: "$590",
    setup: "+ $1,490 setup (invoiced separately)",
    desc: "Sole traders and micro-SMEs. One kete, up to 5 seats, email support.",
    features: ["1 industry kete (your pick)", "Up to 5 seats", "Tikanga compliance layer", "Email support, 1 business day"],
    highlight: true,
    accent: C.pounamu,
    stripeUrl: "https://buy.stripe.com/14AdRbb5GeoEfFHct03oA0d",
    badge: "Most popular",
  },
  {
    name: "Leader",
    price: "$1,290",
    setup: "+ $1,990 setup (invoiced separately)",
    desc: "Multi-discipline SMEs. Two kete, 15 seats, signed quarterly compliance review.",
    features: ["2 industry kete", "Up to 15 seats", "Quarterly compliance review (signed)", "Monthly audit report"],
    highlight: false,
    accent: C.pounamuGlow,
    stripeUrl: "https://buy.stripe.com/eVq9AV3DefsIbpr64C3oA0e",
  },
  {
    name: "Enterprise",
    price: "$2,890",
    setup: "+ $2,990 setup (invoiced separately)",
    desc: "Multi-site, regulated, high-stakes. All five kete, unlimited seats, named success manager, 99.9% uptime SLA.",
    features: ["All 5 industry kete", "Unlimited seats", "NZ data residency", "Named success manager", "99.9% uptime SLA"],
    highlight: false,
    accent: C.navy,
    stripeUrl: "https://buy.stripe.com/14A4gB6Pq94k79bboW3oA0f",
  },
];

const OUTCOMES = [
  { title: "Quotes go out same-day.", body: "Two-hour quote builds drop to twelve minutes. Your win rate climbs because you're not the slowest in the inbox.", accent: C.pounamu },
  { title: "Compliance stops eating Sundays.", body: "Payroll, food safety, H&S, IRD. Assembl checks the rules on the day they change, not the week after you get fined.", accent: C.pounamuLight },
  { title: "Friday actually ends on Friday.", body: "Planning, reporting and the long admin tail run in the background. You get your evenings back.", accent: C.white },
];

const FOUR_POU = [
  { reo: "Rangatiratanga", en: "Self-determination", body: "Your data, your decisions, your direction.", accent: C.pounamu },
  { reo: "Kaitiakitanga", en: "Stewardship", body: "We care for the tools and the whenua they serve, with an intergenerational lens.", accent: C.pounamuLight },
  { reo: "Manaakitanga", en: "Care", body: "We look after our customers, our people, and our communities.", accent: C.gold },
  { reo: "Whanaungatanga", en: "Connection", body: "We build real relationships. We grow together.", accent: C.pounamuGlow },
];

/* ─── Animation presets ─── */
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
    style={{
      fontFamily: FONT.body,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      backdropFilter: "blur(8px)",
    }}
  />
);

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */
const Index = () => {
  const isMobile = useIsMobile();
  const pilotRef = useRef<HTMLDivElement>(null);
  const [pilotName, setPilotName] = useState("");
  const [pilotEmail, setPilotEmail] = useState("");
  const [pilotBiz, setPilotBiz] = useState("");

  const scrollToPilot = () => pilotRef.current?.scrollIntoView({ behavior: "smooth" });

  const handlePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = `Founding pilot application — ${pilotBiz}`;
      const { data: inserted, error } = await supabase
        .from("contact_submissions")
        .insert({ name: pilotName, email: pilotEmail, message: msg })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Application received. We'll be in touch within one business day.");
      setPilotName(""); setPilotEmail(""); setPilotBiz("");
      supabase.functions.invoke("send-contact-email", { body: { name: pilotName, email: pilotEmail, message: msg } }).catch(console.error);
      if (inserted?.id) supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="assembl — Governed Operational Intelligence for Aotearoa"
        description="Simulation-tested specialist digital workers for NZ business. Six-layer agent stack: perception, memory, reasoning, action, explanation, simulation. From $590/mo NZD ex GST."
      />
      <BrandNav />

      {/* ═══ 1 — HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-20 sm:pt-24 pb-12" style={{ zIndex: 1 }}>
        {/* 3D Kete network — green, blue, white orbs */}
        <HeroKeteNetwork isMobile={isMobile} />

        {/* Badge */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span
            className="inline-block text-[10px] tracking-[5px] uppercase px-5 py-2 rounded-full"
            style={{
              fontFamily: FONT.mono,
              color: C.pounamuLight,
              background: "rgba(58,125,110,0.08)",
              border: "1px solid rgba(58,125,110,0.2)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 30px rgba(58,125,110,0.1)",
            }}
          >
            Governed operational intelligence for Aotearoa
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="relative max-w-4xl"
          style={{
            fontFamily: FONT.heading,
            fontWeight: 300,
            fontSize: isMobile ? "1.75rem" : "3.25rem",
            lineHeight: 1.12,
            letterSpacing: isMobile ? "1px" : "2px",
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.5, ease }}
        >
          You're a 5-person business doing the work of 50.{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${C.pounamu} 0%, ${C.pounamuGlow} 50%, ${C.pounamu} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            assembl is the rest of the team.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="relative max-w-2xl mt-7"
          style={{ fontFamily: FONT.body, fontSize: isMobile ? "14px" : "17px", lineHeight: 1.8, color: C.textSec, zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.65, ease }}
        >
          Specialist digital workers that sit inside your existing workflows — governed by policy rules, tested against simulated scenarios, and built around NZ legislation. Not a chatbot. Not a workforce replacement. Better operational outcomes, stronger compliance, faster decisions.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative flex flex-col sm:flex-row gap-3 mt-10"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease }}
        >
          <button
            onClick={scrollToPilot}
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
          >
            Start a founding pilot <ArrowRight size={15} />
          </button>
          <a
            href="#pricing"
            className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
          >
            See pricing
          </a>
        </motion.div>

        {/* Scroll */}
        <motion.div
          className="mt-16"
          style={{ color: "rgba(255,255,255,0.15)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 2 — PROOF BAR ═══ */}
      <section className="px-6 sm:px-8 py-5 relative z-10">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {PROOF.map((label, i) => (
            <span key={label} className="flex items-center gap-x-1">
              <span
                className="px-4 py-1.5 rounded-full text-[11px]"
                style={{
                  fontFamily: FONT.mono,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.04em",
                  backdropFilter: "blur(8px)",
                }}
              >
                {label}
              </span>
              {i < PROOF.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "10px" }}>·</span>
              )}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ 3 — THE PROBLEM ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>THE PROBLEM</Eyebrow>
            <SectionHeading>Your team's already using AI. None of it's governed.</SectionHeading>
            <Body className="max-w-2xl mb-5">
              ChatGPT, Copilot, Gemini — running quietly on staff laptops. No audit trail. No compliance check. No idea what data's being fed into a model hosted offshore.
            </Body>
            <Body className="max-w-2xl" style={{ color: "rgba(255,255,255,0.38)" }}>
              Assembl is built differently. Every agent operates through a six-layer stack — perception, memory, reasoning, action, explanation, and simulation — inside defined permissions and approval pathways.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            {[
              { stat: "605,000", label: "NZ businesses", accent: C.pounamu },
              { stat: "97%", label: "have under 20 staff", accent: C.pounamuLight },
              { stat: "0%", label: "audit what their AI does", accent: C.gold },
            ].map((c, i) => (
              <LiquidGlassCard key={c.label} className="p-8 text-center" accentColor={c.accent} delay={i * 0.1}>
                <p className="text-4xl mb-2" style={{ fontFamily: FONT.heading, fontWeight: 300, color: c.accent }}>
                  {c.stat}
                </p>
                <p className="text-xs tracking-wider uppercase" style={{ fontFamily: FONT.mono, color: C.textMuted }}>
                  {c.label}
                </p>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 4 — COMPLIANCE PIPELINE ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>SIX-LAYER AGENT STACK</Eyebrow>
            <SectionHeading>Every agent. Six layers.<br />Governed end to end.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Every production-grade agent operates through a six-layer stack. No shortcuts, no black boxes. Your lawyers can actually read the audit trail.
            </Body>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {PIPELINE_STAGES.map((stage, i) => (
              <LiquidGlassCard
                key={stage.name}
                className="flex-1 p-6 text-center"
                accentColor={stage.color}
                delay={i * 0.08}
                glassIntensity="strong"
              >
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="text-[10px] tracking-[3px] uppercase"
                    style={{ fontFamily: FONT.mono, color: stage.color, fontWeight: 700 }}
                  >
                    Layer {i + 1}
                  </span>
                  <h3 className="text-lg" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}>
                    {stage.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: FONT.body, color: C.textSec }}>
                    {stage.desc}
                  </p>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <span className="hidden sm:block absolute -right-2 top-1/2 text-xs" style={{ color: C.textMuted }}>→</span>
                  )}
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 5 — OUTCOMES ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>WHAT CHANGES</Eyebrow>
            <SectionHeading>What the first 30 days look like.</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {OUTCOMES.map((o, i) => (
              <LiquidGlassCard key={o.title} className="p-8 h-full" accentColor={o.accent} delay={i * 0.1}>
                <h3 className="text-base mb-3" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}>
                  {o.title}
                </h3>
                <Body className="text-sm">{o.body}</Body>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6 — INDUSTRY KETE ═══ */}
      <section id="industry-packs" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>INDUSTRY KETE</Eyebrow>
            <SectionHeading>Five kete. Five sectors.<br />Specialist digital workers.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Each kete carries the legislation, workflows and terminology its industry actually uses. Specialist digital workers that operate inside defined permissions — not a generic chatbot pretending to know everything.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <LiquidGlassCard key={p.reo} className="h-full" accentColor={p.color} delay={i * 0.08}>
                <Link to={p.to} className="block h-full group p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <KeteWeaveVisual size={48} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[3px]" style={{ fontFamily: FONT.mono, color: p.color }}>
                        {p.en}
                      </p>
                      <h3 className="text-xl" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, letterSpacing: "1px" }}>
                        {p.reo}
                      </h3>
                    </div>
                  </div>
                  <Body className="text-sm">{p.desc}</Body>
                  <div
                    className="flex items-center gap-1 mt-5 text-[11px] transition-all duration-300 group-hover:gap-2"
                    style={{ fontFamily: FONT.body, color: p.color, fontWeight: 500 }}
                  >
                    Explore kete <ArrowRight size={11} />
                  </div>
                </Link>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 7 — WHY ASSEMBL ═══ */}
      <section id="why-assembl" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>WHY ASSEMBL</Eyebrow>
            <SectionHeading>Governed. Simulation-tested.<br />Built for Aotearoa.</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DIFFS.map((d, i) => (
              <LiquidGlassCard key={d.title} className="p-8 h-full" accentColor={d.accent} delay={i * 0.08}>
                <div className="flex items-start gap-5">
                  <span className="text-[11px] shrink-0 mt-0.5" style={{ fontFamily: FONT.mono, color: d.accent, opacity: 0.7 }}>
                    {d.num}
                  </span>
                  <div>
                    <h3 className="text-base mb-3" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}>
                      {d.title}
                    </h3>
                    <Body className="text-sm">{d.body}</Body>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8 — PRICING ═══ */}
      <section id="pricing" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Pricing that fits an NZ small business.</SectionHeading>
            <Body className="max-w-lg mx-auto">
              Monthly billing. 30-day notice. NZD ex GST (15% added at invoice). Setup fees can split across the first three invoices on request.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING.map((tier, i) => (
              <motion.div key={tier.name} className="relative" {...stagger(i)}>
                {tier.highlight && (
                  <div className="absolute -inset-px rounded-[17px] pointer-events-none" style={{
                    background: `linear-gradient(135deg, rgba(58,125,110,0.5) 0%, rgba(58,125,110,0.15) 50%, transparent 100%)`,
                    zIndex: 0,
                  }} />
                )}
                <LiquidGlassCard
                  animate={false}
                  className="p-7 h-full flex flex-col relative"
                  accentColor={tier.accent}
                  glassIntensity={tier.highlight ? "strong" : "medium"}
                  style={{
                    zIndex: 1,
                    ...(tier.highlight ? {
                      background: "rgba(5,15,12,0.92)",
                      border: "1px solid rgba(58,125,110,0.35)",
                      boxShadow: "0 0 0 1px rgba(58,125,110,0.1), 0 16px 48px rgba(58,125,110,0.12), 0 4px 24px rgba(0,0,0,0.4)",
                      transform: "scale(1.02)",
                    } : {}),
                  }}
                >
                  {tier.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${C.pounamu}, transparent)` }}
                    />
                  )}
                  {"badge" in tier && tier.badge && (
                    <span className="inline-block text-[9px] uppercase tracking-[2.5px] mb-3 px-2.5 py-1 rounded-full"
                      style={{ fontFamily: FONT.mono, color: C.pounamuLight, background: "rgba(58,125,110,0.12)", border: "1px solid rgba(58,125,110,0.25)" }}>
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-sm uppercase tracking-[2px] mb-1"
                    style={{ fontFamily: FONT.mono, fontWeight: 600, color: tier.highlight ? C.pounamuLight : "rgba(255,255,255,0.6)" }}>
                    {tier.name}
                  </h3>
                  <p className="text-4xl mb-1" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}>
                    {tier.price}<span className="text-sm" style={{ color: C.textMuted }}>/mo</span>
                  </p>
                  <p className="text-[10px] mb-1" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.25)" }}>NZD ex GST</p>
                  <p className="text-[10px] mb-5" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.4)" }}>{tier.setup}</p>
                  <Body className="mb-6 text-xs">{tier.desc}</Body>
                  <ul className="space-y-2.5 mt-auto mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="text-xs flex items-start gap-2.5" style={{ fontFamily: FONT.body, color: C.textSec }}>
                        <Check size={12} style={{ color: tier.accent, marginTop: "2px", flexShrink: 0 }} />{f}
                      </li>
                    ))}
                  </ul>
                  <a href={tier.stripeUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      fontFamily: FONT.body, fontWeight: 600, letterSpacing: "0.04em",
                      background: tier.highlight ? C.pounamu : "rgba(255,255,255,0.05)",
                      color: tier.highlight ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                      border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.08)",
                    }}>
                    Subscribe — {tier.price}/mo
                  </a>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div className="text-center mt-12" {...fade}>
            <p className="text-[11px] uppercase tracking-[3px] mb-2" style={{ fontFamily: FONT.mono, color: C.pounamuLight, fontWeight: 700 }}>
              OUTCOME ENGAGEMENTS · FROM $5,000/MO
            </p>
            <p className="text-xs max-w-xl mx-auto mb-3" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.55)" }}>
              We take on the result, not the hours. Base fee plus 10–20% of measured savings.
            </p>
            <Link to="/contact" className="text-xs underline" style={{ fontFamily: FONT.body, color: C.pounamuLight }}>Talk to us →</Link>
          </motion.div>

          <motion.p className="text-center mt-8 text-[11px]" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.25)" }} {...fade}>
            NZD ex GST · Setup fees can split across the first three invoices · Existing customers grandfathered until 2027-04-08
          </motion.p>
        </div>
      </section>

      {/* ═══ 9 — FOUNDING PILOT CTA ═══ */}
      <section ref={pilotRef} id="founding-pilot" className={`${SEC} relative z-10`}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>FOUNDING PILOTS</Eyebrow>
            <SectionHeading>Twenty businesses. One year.<br />The platform shaped around you.</SectionHeading>
            <Body className="mb-10">
              We work directly with twenty NZ businesses to wire Assembl into the way you already run things. Hands-on onboarding, weekly working sessions, founder access, and pricing locked at the founding rate forever.
            </Body>
          </motion.div>
          <motion.form
            onSubmit={handlePilot}
            className="rounded-2xl p-8 text-left space-y-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(58,125,110,0.2)",
              boxShadow: "0 0 48px rgba(58,125,110,0.06), 0 8px 32px rgba(0,0,0,0.45)",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <InputField value={pilotName} onChange={setPilotName} placeholder="Your name" />
            <InputField value={pilotEmail} onChange={setPilotEmail} placeholder="Email address" type="email" />
            <InputField value={pilotBiz} onChange={setPilotBiz} placeholder="Business name & industry" />
            <button
              type="submit"
              className="cta-glass-green w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              Apply for a founding pilot <Send size={14} />
            </button>
            <p className="text-[11px] text-center" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.2)" }}>
              Limited places. We respond within one business day.
            </p>
          </motion.form>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 10 — TRUST LAYER ═══ */}
      <section id="trust" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>TRUST LAYER</Eyebrow>
            <SectionHeading>Te Kāhui Reo —<br />the language collective.</SectionHeading>
            <Body className="max-w-2xl mx-auto mb-16">
              Te Kāhui Reo is the cultural and language layer that runs underneath every kete. Tikanga Māori governance is a quiet structural layer through the whole platform, not a disclaimer at the bottom.
            </Body>
          </motion.div>

          <motion.div {...fade} className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[4px]" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.3)" }}>
              The four pou
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOUR_POU.map((pou, i) => (
              <LiquidGlassCard key={pou.reo} className="p-8 h-full" accentColor={pou.accent} delay={i * 0.08}>
                <div className="flex items-start gap-4">
                  <KeteWeaveVisual size={32} accentColor={pou.accent} showNodes={false} showGlow={false} />
                  <div>
                    <h3 className="text-base mb-1" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}>
                      {pou.reo}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[2.5px] mb-3"
                      style={{ fontFamily: FONT.mono, color: pou.accent, opacity: 0.8 }}>
                      {pou.en}
                    </p>
                    <Body className="text-sm">{pou.body}</Body>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11 — TORO ═══ */}
      <section className="px-6 sm:px-8 py-20 relative z-10">
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <div className="flex justify-center mb-6">
              <KeteWeaveVisual size={48} accentColor={C.pounamuLight} accentLight={C.pounamuGlow} showNodes={false} />
            </div>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <h3 className="text-2xl uppercase tracking-[4px] mb-4" style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}>
              Toro
            </h3>
            <Body className="mb-8">SMS-first whānau navigator for Aotearoa. No app, no login, just text. $29/month.</Body>
            <Link
              to="/toroa"
              className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full"
            >
              Visit Toro <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default Index;
