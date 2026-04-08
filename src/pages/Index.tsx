import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, ChevronDown, Check, UtensilsCrossed, HardHat, Palette, Briefcase, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import HeroParticles from "@/components/HeroParticles";
import AmbientParticles from "@/components/AmbientParticles";

/* ─── Design tokens ─── */
const C = {
  bg: "#09090F",
  surface: "#0F0F1A",
  card: "#0A0A13",
  gold: "#D4A843",
  teal: "#3A7D6E",
  navy: "#1A3A5C",
  bone: "#F5F0E8",
  white: "#FFFFFF",
  textSec: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.35)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.15)",
};

const FONT = {
  heading: "'Lato', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Maunga (mountain) triangle SVG motif ─── */
const MaungaMark = ({ color = C.gold, size = 28, opacity = 0.7 }: { color?: string; size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 24" fill="none" style={{ opacity }}>
    <path d="M14 2 L27 23 L1 23 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M14 9 L21 23 L7 23 Z" fill={color} opacity={0.18} />
  </svg>
);

/* ─── Subtle kete weave divider ─── */
const WeaveDivider = () => (
  <div className="w-full overflow-hidden" style={{ height: 24, opacity: 0.12 }}>
    <svg width="100%" height="24" viewBox="0 0 400 24" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 30 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 14}, 0)`}>
          <path d="M0 12 L7 0 L14 12 L7 24 Z" stroke={C.gold} strokeWidth="0.8" fill="none" />
        </g>
      ))}
    </svg>
  </div>
);

/* ─── Shared components ─── */
const Eyebrow = ({ children }: { children: string }) => (
  <span
    className="inline-block text-[10px] font-bold tracking-[4px] uppercase mb-5"
    style={{ fontFamily: FONT.mono, color: C.gold }}
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

/* ─── Liquid Glass Card ─── */
const GlassCard = ({
  children,
  className = "",
  style = {},
  accentColor,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accentColor?: string;
}) => (
  <div
    className={`rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 ${className}`}
    style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: `1px solid rgba(255,255,255,0.10)`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      outline: "1px solid rgba(255,255,255,0.05)",
      ...style,
    }}
  >
    {accentColor && (
      <span
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
    )}
    {children}
  </div>
);

const InputField = ({
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    type={type}
    placeholder={placeholder}
    required={required}
    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
    style={{
      fontFamily: FONT.body,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.09)`,
    }}
  />
);

/* ─── Data ─── */
const PROOF = [
  "78 NZ-trained agents",
  "5 industry kete",
  "Built in Aotearoa",
  "From $590 NZD/mo",
  "SMS-ready",
];

const PACKS = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food Act plans, liquor licensing, guest experience, tourism operators.", color: C.gold, to: "/packs/manaaki", icon: UtensilsCrossed },
  { reo: "Hanga", en: "Construction", desc: "Site to sign-off. H&S, consenting, project programmes, quality records.", color: C.teal, to: "/packs/hanga", icon: HardHat },
  { reo: "Auaha", en: "Creative", desc: "Brief to published. Copy, image, video, podcast, ads, analytics.", color: "#F0D078", to: "/packs/auaha", icon: Palette },
  { reo: "Pakihi", en: "Business", desc: "The generalist kete. Quoting, payroll, planning, reporting for any sector.", color: "#5AADA0", to: "/packs/pakihi", icon: Briefcase },
  { reo: "Hangarau", en: "Technology", desc: "SaaS and IT teams. Sprint planning, customer support, security, docs.", color: "#4A7AB5", to: "/packs/hangarau", icon: Cpu },
];

const DIFFS = [
  { num: "01", title: "Trained on NZ law", body: "Holidays Act 2003, Privacy Act 2020, Food Act 2014, Construction Contracts Act, IRD rules. Updated when the law updates.", accent: C.gold },
  { num: "02", title: "Specialists, not generalists", body: "78 agents, each one tuned to a specific NZ workflow. No single chatbot pretending to know everything.", accent: C.teal },
  { num: "03", title: "Memory that compounds", body: "Decisions, projects and customer history carry forward. Tomorrow's session starts where today's ended.", accent: "#4A7AB5" },
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
    accent: C.teal,
    stripeUrl: "https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c",
  },
  {
    name: "Operator",
    price: "$590",
    setup: "+ $1,490 setup (invoiced separately)",
    desc: "Sole traders and micro-SMEs. One kete, up to 5 seats, email support.",
    features: ["1 industry kete (your pick)", "Up to 5 seats", "Tikanga compliance layer", "Email support, 1 business day"],
    highlight: true,
    accent: C.gold,
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
    accent: C.teal,
    stripeUrl: "https://buy.stripe.com/eVq9AV3DefsIbpr64C3oA0e",
  },
  {
    name: "Enterprise",
    price: "$2,890",
    setup: "+ $2,990 setup (invoiced separately)",
    desc: "Multi-site, regulated, high-stakes. All five kete, unlimited seats, named success manager, 99.9% uptime SLA.",
    features: ["All 5 industry kete", "Unlimited seats", "NZ data residency", "Named success manager", "99.9% uptime SLA"],
    highlight: false,
    accent: "#4A7AB5",
    stripeUrl: "https://buy.stripe.com/14A4gB6Pq94k79bboW3oA0f",
  },
];

const OUTCOMES = [
  {
    title: "Quotes go out same-day.",
    body: "Two-hour quote builds drop to twelve minutes. Your win rate climbs because you're not the slowest in the inbox.",
    accent: C.teal,
  },
  {
    title: "Compliance stops eating Sundays.",
    body: "Payroll, food safety, H&S, IRD. Assembl checks the rules on the day they change, not the week after you get fined.",
    accent: C.gold,
  },
  {
    title: "Friday actually ends on Friday.",
    body: "Planning, reporting and the long admin tail run in the background. You get your evenings back.",
    accent: "#4A7AB5",
  },
];

const FOUR_POU = [
  { reo: "Rangatiratanga", en: "Self-determination", body: "Your data, your decisions, your direction.", accent: C.gold },
  { reo: "Kaitiakitanga", en: "Stewardship", body: "We care for the tools and the whenua they serve, with an intergenerational lens.", accent: C.teal },
  { reo: "Manaakitanga", en: "Care", body: "We look after our customers, our people, and our communities.", accent: C.gold },
  { reo: "Whanaungatanga", en: "Connection", body: "We build real relationships. We grow together.", accent: C.teal },
];

/* ─── Animation preset ─── */
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

/* ─── Page ─── */
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
      setPilotName("");
      setPilotEmail("");
      setPilotBiz("");
      supabase.functions.invoke("send-contact-email", { body: { name: pilotName, email: pilotEmail, message: msg } }).catch(console.error);
      if (inserted?.id)
        supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="Assembl — 78 Specialist AI Agents for NZ Business"
        description="Five industry kete covering quoting, payroll, planning, marketing and compliance. Built around NZ law, not adapted from a US product. From $590 NZD/mo."
      />
      <BrandNav />
      <AmbientParticles />

      {/* ═══ 1 — HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-24 sm:pt-32 pb-16" style={{ zIndex: 1 }}>
        {/* Brighter centre glow for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(212,168,67,0.09) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 25%, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
        />

        {/* Hero particles */}
        <HeroParticles />

        {/* Maunga triangles — background motif */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.04 }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <path d="M600 40 L1100 560 L100 560 Z" stroke={C.gold} strokeWidth="1" fill="none" />
            <path d="M600 180 L900 560 L300 560 Z" stroke={C.gold} strokeWidth="0.8" fill="none" />
            <path d="M600 320 L740 560 L460 560 Z" fill={C.gold} opacity="0.6" />
          </svg>
        </div>

        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <span
            className="inline-block text-[10px] tracking-[5px] uppercase px-4 py-1.5 rounded-full"
            style={{
              fontFamily: FONT.mono,
              color: C.gold,
              background: "rgba(212,168,67,0.08)",
              border: "1px solid rgba(212,168,67,0.2)",
            }}
          >
            Built in Aotearoa · NZ-first AI
          </span>
        </motion.div>

        <motion.h1
          className="relative max-w-4xl"
          style={{
            fontFamily: FONT.heading,
            fontWeight: 300,
            fontSize: isMobile ? "1.75rem" : "3rem",
            lineHeight: 1.15,
            letterSpacing: isMobile ? "1px" : "2px",
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease }}
        >
          You're a 5-person business{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${C.gold} 0%, #F0D078 50%, ${C.gold} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            doing the work of 50.
          </span>
        </motion.h1>

        <motion.p
          className="relative max-w-2xl mt-7"
          style={{ fontFamily: FONT.body, fontSize: isMobile ? "14px" : "17px", lineHeight: 1.8, color: C.textSec, zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease }}
        >
          Assembl is the rest of the team. 78 specialist agents covering quoting, payroll, planning, marketing and compliance — built around NZ law, not adapted from a US product.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative flex flex-col sm:flex-row gap-3 mt-10"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
        >
          <button
            onClick={scrollToPilot}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{
              fontFamily: FONT.body,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${C.teal} 0%, #2d6358 100%)`,
              color: C.white,
              border: "1px solid rgba(58,125,110,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            Start a founding pilot <ArrowRight size={15} />
          </button>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:border-white/20 hover:text-white"
            style={{
              fontFamily: FONT.body,
              fontWeight: 500,
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: `1px solid rgba(255,255,255,0.1)`,
              letterSpacing: "0.02em",
            }}
          >
            See pricing
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          style={{ color: "rgba(255,255,255,0.18)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
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
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          {PROOF.map((label, i) => (
            <span key={label} className="flex items-center gap-x-1">
              <span
                className="px-4 py-1.5 rounded-full text-[11px]"
                style={{
                  fontFamily: FONT.mono,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.04em",
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

      {/* ═══ 3 — PROBLEM ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>THE PROBLEM</Eyebrow>
            <SectionHeading>You can't justify the stack.</SectionHeading>
            <Body className="max-w-2xl mb-5">
              Most NZ owner-led businesses run on 14 disconnected tools. A consultant for compliance. An agency for marketing. A bookkeeper for payroll. A planner for projects. None of them talk to each other. None of them carry yesterday's context into today's decisions.
            </Body>
            <Body className="max-w-2xl" style={{ color: "rgba(255,255,255,0.38)" }}>
              Generic AI fixes one corner of that. Assembl runs the whole operation.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            {[
              { stat: "605,000", label: "NZ businesses", accent: C.gold },
              { stat: "97%", label: "have under 20 staff", accent: C.teal },
              { stat: "$4.2B", label: "spent on outside professionals every year", accent: "#4A7AB5" },
            ].map((c, i) => (
              <motion.div key={c.label} {...stagger(i)}>
                <GlassCard className="p-8 text-center" accentColor={c.accent}>
                  <p
                    className="text-4xl mb-2"
                    style={{ fontFamily: FONT.heading, fontWeight: 300, color: c.accent }}
                  >
                    {c.stat}
                  </p>
                  <p className="text-xs tracking-wider uppercase" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.35)" }}>
                    {c.label}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 4 — OUTCOMES ═══ */}
      <section className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>WHAT CHANGES</Eyebrow>
            <SectionHeading>What the first 30 days look like.</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {OUTCOMES.map((o, i) => (
              <motion.div key={o.title} {...stagger(i)}>
                <GlassCard className="p-8 h-full" accentColor={o.accent}>
                  <h3
                    className="text-base mb-3"
                    style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}
                  >
                    {o.title}
                  </h3>
                  <Body className="text-sm">{o.body}</Body>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5 — INDUSTRY PACKS ═══ */}
      <section id="industry-packs" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>INDUSTRY PACKS</Eyebrow>
            <SectionHeading>Five kete. Five sectors. One shared brain.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Each kete carries the legislation, workflows and terminology its industry actually uses. They share one memory underneath.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <motion.div key={p.reo} {...stagger(i)}>
                <Link to={p.to} className="block h-full group">
                  <GlassCard className="p-7 h-full" accentColor={p.color} style={{ cursor: "pointer" }}>
                    <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                      style={{ background: `linear-gradient(180deg, ${p.color}, ${p.color}30)` }}
                    />
                    <div className="pl-4">
                      <div className="flex items-center gap-3 mb-5">
                        <p.icon size={20} style={{ color: p.color }} />
                        <p
                          className="text-[10px] uppercase tracking-[3px]"
                          style={{ fontFamily: FONT.mono, color: p.color }}
                        >
                          {p.en}
                        </p>
                      </div>
                      <h3
                        className="text-xl mb-3"
                        style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, letterSpacing: "1px" }}
                      >
                        {p.reo}
                      </h3>
                      <Body className="text-sm">{p.desc}</Body>
                      <div
                        className="flex items-center gap-1 mt-5 text-[11px] transition-all duration-300 group-hover:gap-2"
                        style={{ fontFamily: FONT.body, color: p.color, fontWeight: 500 }}
                      >
                        Explore kete <ArrowRight size={11} />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 6 — DIFFERENCE ═══ */}
      <section id="why-assembl" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>WHY NZ BUSINESSES PICK ASSEMBL</Eyebrow>
            <SectionHeading>Four things you won't get<br />from a US product.</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DIFFS.map((d, i) => (
              <motion.div key={d.title} {...stagger(i)}>
                <GlassCard className="p-8 h-full" accentColor={d.accent}>
                  <div className="flex items-start gap-5">
                    <span
                      className="text-[11px] shrink-0 mt-0.5"
                      style={{ fontFamily: FONT.mono, color: d.accent, opacity: 0.7 }}
                    >
                      {d.num}
                    </span>
                    <div>
                      <h3
                        className="text-base mb-3"
                        style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}
                      >
                        {d.title}
                      </h3>
                      <Body className="text-sm">{d.body}</Body>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7 — PRICING ═══ */}
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
              <motion.div
                key={tier.name}
                className="relative"
                {...stagger(i)}
              >
                {tier.highlight && (
                  <div
                    className="absolute -inset-px rounded-[17px] pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, rgba(212,168,67,0.5) 0%, rgba(212,168,67,0.15) 50%, rgba(212,168,67,0.0) 100%)`,
                      zIndex: 0,
                    }}
                  />
                )}
                <GlassCard
                  className="p-7 h-full flex flex-col relative"
                  style={{
                    zIndex: 1,
                    ...(tier.highlight
                      ? {
                          background: "rgba(15,12,5,0.92)",
                          border: `1px solid rgba(212,168,67,0.35)`,
                          boxShadow: `0 0 0 1px rgba(212,168,67,0.1), 0 16px 48px rgba(212,168,67,0.12), 0 4px 24px rgba(0,0,0,0.4)`,
                          transform: "scale(1.02)",
                        }
                      : {}),
                  }}
                >
                  {tier.highlight && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }}
                    />
                  )}
                  {"badge" in tier && tier.badge && (
                    <span
                      className="inline-block text-[9px] uppercase tracking-[2.5px] mb-3 px-2.5 py-1 rounded-full"
                      style={{ fontFamily: FONT.mono, color: C.gold, background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3
                    className="text-sm uppercase tracking-[2px] mb-1"
                    style={{ fontFamily: FONT.mono, fontWeight: 600, color: tier.highlight ? C.gold : "rgba(255,255,255,0.6)" }}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className="text-4xl mb-1"
                    style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}
                  >
                    {tier.price}
                    <span className="text-sm" style={{ color: C.textMuted }}>/mo</span>
                  </p>
                  <p className="text-[10px] mb-1" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.25)" }}>
                    NZD ex GST
                  </p>
                  <p className="text-[10px] mb-5" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.4)" }}>
                    {tier.setup}
                  </p>
                  <Body className="mb-6 text-xs">{tier.desc}</Body>
                  <ul className="space-y-2.5 mt-auto mb-6">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="text-xs flex items-start gap-2.5"
                        style={{ fontFamily: FONT.body, color: C.textSec }}
                      >
                        <Check size={12} style={{ color: tier.accent, marginTop: "2px", flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tier.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      fontFamily: FONT.body,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      background: tier.highlight ? C.gold : "rgba(255,255,255,0.05)",
                      color: tier.highlight ? "#09090F" : "rgba(255,255,255,0.7)",
                      border: tier.highlight ? "none" : `1px solid rgba(255,255,255,0.08)`,
                    }}
                  >
                    Subscribe — {tier.price}/mo
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            {...fade}
          >
            <p className="text-[11px] uppercase tracking-[3px] mb-2" style={{ fontFamily: FONT.mono, color: C.gold, fontWeight: 700 }}>
              OUTCOME ENGAGEMENTS · FROM $5,000/MO
            </p>
            <p className="text-xs max-w-xl mx-auto mb-3" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.55)" }}>
              We take on the result, not the hours. Base fee plus 10–20% of measured savings.
            </p>
            <Link to="/contact" className="text-xs underline" style={{ fontFamily: FONT.body, color: C.gold }}>
              Talk to us →
            </Link>
          </motion.div>

          <motion.p
            className="text-center mt-8 text-[11px]"
            style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.25)" }}
            {...fade}
          >
            NZD ex GST · Setup fees can split across the first three invoices · Existing customers grandfathered until 2027-04-08
          </motion.p>
        </div>
      </section>

      {/* ═══ 8 — FOUNDING PILOT CTA ═══ */}
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
              border: `1px solid rgba(212,168,67,0.15)`,
              boxShadow: "0 0 48px rgba(212,168,67,0.05), 0 8px 32px rgba(0,0,0,0.45)",
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
              className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
              style={{
                fontFamily: FONT.body,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${C.teal} 0%, #2d6358 100%)`,
                color: C.white,
                border: "1px solid rgba(58,125,110,0.4)",
                letterSpacing: "0.03em",
              }}
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

      {/* ═══ 9 — TRUST LAYER ═══ */}
      <section id="trust" className={`${SEC} relative z-10`}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>TRUST LAYER</Eyebrow>
            <SectionHeading>Te Kāhui Reo —<br />the language collective.</SectionHeading>
            <Body className="max-w-2xl mx-auto mb-16">
              Te Kāhui Reo is the cultural and language layer that runs underneath every kete. It strengthens te reo Māori, holds tikanga alignment, and helps Assembl operate with cultural integrity. Foundation, not feature.
            </Body>
          </motion.div>

          <motion.div {...fade} className="text-center mb-10">
            <p
              className="text-[10px] uppercase tracking-[4px]"
              style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.3)" }}
            >
              The four pou
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOUR_POU.map((pou, i) => (
              <motion.div key={pou.reo} {...stagger(i)}>
                <GlassCard className="p-8 h-full" accentColor={pou.accent}>
                  <div className="flex items-start gap-4">
                    <MaungaMark color={pou.accent} size={24} opacity={0.6} />
                    <div>
                      <h3
                        className="text-base mb-1"
                        style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white, letterSpacing: "0.5px" }}
                      >
                        {pou.reo}
                      </h3>
                      <p
                        className="text-[10px] uppercase tracking-[2.5px] mb-3"
                        style={{ fontFamily: FONT.mono, color: pou.accent, opacity: 0.8 }}
                      >
                        {pou.en}
                      </p>
                      <Body className="text-sm">{pou.body}</Body>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10 — ALSO FROM ASSEMBL (TŌROA) ═══ */}
      <section className="px-6 sm:px-8 py-20 relative z-10">
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <div className="flex justify-center mb-6">
              <MaungaMark color={C.gold} size={36} opacity={0.5} />
            </div>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <h3
              className="text-2xl uppercase tracking-[4px] mb-4"
              style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}
            >
              Tōroa
            </h3>
            <Body className="mb-8">
              SMS-first whānau navigator for Aotearoa. No app, no login, just text. $29/month.
            </Body>
            <Link
              to="/toroa"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02]"
              style={{
                fontFamily: FONT.body,
                fontWeight: 500,
                background: "transparent",
                color: "rgba(255,255,255,0.55)",
                border: `1px solid rgba(255,255,255,0.1)`,
                letterSpacing: "0.02em",
              }}
            >
              Visit Tōroa <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default Index;
