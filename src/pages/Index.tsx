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

/* ─── Design tokens — Constellation palette ─── */
const C = {
  bg: "#060610",
  surface: "#0A0A18",
  card: "#080C18",
  electric: "#00CFFF",
  electricLight: "#66E0FF",
  aurora: "#00FF9C",
  ocean: "#1B5E6B",
  bone: "#F2F0EC",
  white: "#FFFFFF",
  textSec: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.35)",
  border: "rgba(0,207,255,0.08)",
  borderHover: "rgba(0,207,255,0.2)",
};

const FONT = {
  heading: "'Lato', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Constellation node SVG motif ─── */
const ConstellationMark = ({ color = C.electric, size = 28, opacity = 0.7 }: { color?: string; size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ opacity }}>
    <circle cx="14" cy="6" r="3" fill={color} opacity="0.8" />
    <circle cx="6" cy="22" r="2.5" fill={color} opacity="0.6" />
    <circle cx="22" cy="22" r="2.5" fill={color} opacity="0.6" />
    <line x1="14" y1="6" x2="6" y2="22" stroke={color} strokeWidth="0.8" opacity="0.3" />
    <line x1="14" y1="6" x2="22" y2="22" stroke={color} strokeWidth="0.8" opacity="0.3" />
    <line x1="6" y1="22" x2="22" y2="22" stroke={color} strokeWidth="0.8" opacity="0.2" />
  </svg>
);

/* ─── Constellation weave divider ─── */
const WeaveDivider = () => (
  <div className="w-full overflow-hidden" style={{ height: 24, opacity: 0.15 }}>
    <svg width="100%" height="24" viewBox="0 0 400 24" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 30 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 14}, 0)`}>
          <circle cx="7" cy="12" r="1.5" fill={i % 2 === 0 ? C.electric : C.aurora} opacity="0.6" />
          <line x1="0" y1="12" x2="14" y2="12" stroke={C.electric} strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}
    </svg>
  </div>
);

/* ─── Shared components ─── */
const Eyebrow = ({ children }: { children: string }) => (
  <span
    className="inline-block text-[10px] font-bold tracking-[4px] uppercase mb-5"
    style={{ fontFamily: FONT.mono, color: C.electric }}
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
    className={`rounded-2xl relative overflow-hidden group ${className}`}
    style={{
      background: "rgba(8,12,24,0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${C.border}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(0,207,255,0.02)",
      transition: "border-color 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1)",
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
    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors focus:border-[rgba(0,207,255,0.3)]"
    style={{
      fontFamily: FONT.body,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(0,207,255,0.08)`,
    }}
  />
);

/* ─── Data ─── */
const PROOF = [
  { label: "5 hours a week back", accent: C.electric },
  { label: "5 industry kete", accent: C.aurora },
  { label: "Built in Aotearoa", accent: C.electric },
  { label: "From $590/month NZD", accent: C.aurora },
  { label: "SMS-ready", accent: C.electric },
];

const PACKS = [
  { reo: "Manaaki", en: "Hospitality", desc: "Food safety, liquor licensing, guest experience, tourism operations.", color: C.electric, to: "/manaaki" },
  { reo: "Waihanga", en: "Construction", desc: "Site to sign-off. Safety, consenting, project management, quality.", color: C.aurora, to: "/hanga" },
  { reo: "Auaha", en: "Creative", desc: "Brief to published. Copy, image, video, podcast, ads, analytics.", color: C.electricLight, to: "/auaha" },
  { reo: "Arataki", en: "Automotive", desc: "Workshops, fleet, vehicle compliance, service scheduling.", color: C.aurora, to: "/arataki" },
  { reo: "Pikau", en: "Freight & Customs", desc: "Route optimisation, declarations, broker hand-off, customs compliance.", color: C.ocean, to: "/pikau" },
];

const DIFFS = [
  { num: "01", title: "NZ-context intelligence", body: "Built around local legislation, tax, employment law, and industry realities. Not an overseas product localised after the fact.", accent: C.electric },
  { num: "02", title: "Specialist, not generic", body: "Purpose-built agents across five industry kete. Each one tuned to the workflows that matter to your sector.", accent: C.aurora },
  { num: "03", title: "Shared business memory", body: "Work compounds over time. Context, decisions, and project history carry forward instead of resetting every session.", accent: C.ocean },
  { num: "04", title: "Cultural and language layer", body: "Tikanga governance is woven through every agent — Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga.", accent: C.electric },
];

const PRICING = [
  {
    name: "Family",
    price: "$29",
    setup: "No setup fee",
    desc: "NZ whānau — household coordination by SMS, no app required.",
    features: ["SMS-first family agent", "School notices, calendar, meals", "Budget tracking", "Up to 6 family members"],
    highlight: false,
    accent: C.aurora,
  },
  {
    name: "Operator",
    price: "$590",
    setup: "+ $1,490 setup",
    desc: "Sole traders and micro-SMEs — one industry, one team, one source of truth.",
    features: ["1 industry kete (your pick)", "Up to 5 seats", "Tikanga compliance layer", "Email support, 1 business day", "99.0% uptime"],
    highlight: false,
    accent: C.aurora,
  },
  {
    name: "Leader",
    price: "$1,290",
    setup: "+ $1,990 setup",
    desc: "Multi-discipline SMEs — covers two parts of the business with quarterly compliance review.",
    features: ["2 industry kete (your pick)", "Up to 15 seats", "Quarterly compliance review (signed)", "Monthly audit report", "99.5% uptime"],
    highlight: true,
    accent: C.electric,
  },
  {
    name: "Enterprise",
    price: "$2,890",
    setup: "+ $2,990 setup",
    desc: "Multi-site, regulated, high-stakes. Every kete, the SLA, and a named human to call.",
    features: ["All 5 industry kete", "Unlimited seats", "NZ data residency (attested)", "Named success manager", "99.9% uptime SLA"],
    highlight: false,
    accent: C.ocean,
  },
];

const FOUR_POU = [
  { reo: "Rangatiratanga", en: "Self-determination", body: "Every whānau and business owns their data, their decisions, their direction.", accent: C.electric },
  { reo: "Kaitiakitanga", en: "Stewardship", body: "We care for the tools we build and the whenua they serve, with an intergenerational lens.", accent: C.aurora },
  { reo: "Manaakitanga", en: "Care", body: "We look after our customers, our people, and the communities we operate in.", accent: C.electric },
  { reo: "Whanaungatanga", en: "Connection", body: "We build genuine relationships. We don't extract — we grow together.", accent: C.aurora },
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
      toast.success("Application received. We'll be in touch within 24 hours.");
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
    <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="Assembl — The Operating System for NZ Business"
        description="Specialist AI agents across 5 industry kete — Manaaki, Waihanga, Auaha, Arataki, Pikau. One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution. Built in Aotearoa."
      />
      <BrandNav />

      {/* ═══ 1 — HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-24 sm:pt-32 pb-16" style={{ zIndex: 1 }}>
        {/* Radial constellation glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 45% at 50% 20%, rgba(0,207,255,0.06) 0%, rgba(0,255,156,0.02) 40%, transparent 70%)" }}
        />
        {/* Constellation background motif */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <circle cx="600" cy="150" r="4" fill={C.electric} opacity="0.8" />
            <circle cx="300" cy="400" r="3" fill={C.aurora} opacity="0.6" />
            <circle cx="900" cy="400" r="3" fill={C.electric} opacity="0.6" />
            <circle cx="450" cy="250" r="2" fill="#fff" opacity="0.5" />
            <circle cx="750" cy="250" r="2" fill="#fff" opacity="0.5" />
            <line x1="600" y1="150" x2="300" y2="400" stroke={C.electric} strokeWidth="0.8" opacity="0.15" />
            <line x1="600" y1="150" x2="900" y2="400" stroke={C.electric} strokeWidth="0.8" opacity="0.15" />
            <line x1="300" y1="400" x2="900" y2="400" stroke={C.aurora} strokeWidth="0.8" opacity="0.1" />
            <line x1="600" y1="150" x2="450" y2="250" stroke="#fff" strokeWidth="0.5" opacity="0.1" />
            <line x1="600" y1="150" x2="750" y2="250" stroke="#fff" strokeWidth="0.5" opacity="0.1" />
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
              color: C.electric,
              background: "rgba(0,207,255,0.06)",
              border: "1px solid rgba(0,207,255,0.2)",
            }}
          >
            NZ&rsquo;s first specialist AI platform
          </span>
        </motion.div>

        <motion.h1
          className="relative max-w-4xl uppercase"
          style={{
            fontFamily: FONT.heading,
            fontWeight: 300,
            fontSize: isMobile ? "2rem" : "3.5rem",
            lineHeight: 1.1,
            letterSpacing: isMobile ? "2px" : "4px",
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease }}
        >
          The operating system for{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${C.electric} 0%, ${C.aurora} 50%, ${C.electric} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NZ business.
          </span>
        </motion.h1>

        <motion.p
          className="relative max-w-2xl mt-7"
          style={{ fontFamily: FONT.body, fontSize: isMobile ? "15px" : "18px", lineHeight: 1.8, color: C.textSec, zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease }}
        >
          One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution.
          Built in Aotearoa, for Aotearoa.
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
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,207,255,0.3)]"
            style={{
              fontFamily: FONT.body,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${C.electric} 0%, #0090B3 100%)`,
              color: "#060610",
              border: "1px solid rgba(0,207,255,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            Become a founding pilot <ArrowRight size={15} />
          </button>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:border-[rgba(0,255,156,0.3)] hover:text-white"
            style={{
              fontFamily: FONT.body,
              fontWeight: 500,
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: `1px solid rgba(255,255,255,0.1)`,
              letterSpacing: "0.02em",
            }}
          >
            View pricing
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          style={{ color: "rgba(0,207,255,0.2)" }}
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
      <section className="px-6 sm:px-8 py-5">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          {PROOF.map((p, i) => (
            <span key={p.label} className="flex items-center gap-x-1">
              <span
                className="px-4 py-1.5 rounded-full text-[11px]"
                style={{
                  fontFamily: FONT.mono,
                  background: "rgba(0,207,255,0.03)",
                  border: `1px solid rgba(0,207,255,0.07)`,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.04em",
                }}
              >
                {p.label}
              </span>
              {i < PROOF.length - 1 && (
                <span style={{ color: "rgba(0,207,255,0.15)", fontSize: "10px" }}>·</span>
              )}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ 3 — PROBLEM ═══ */}
      <section className={SEC}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>THE PROBLEM</Eyebrow>
            <SectionHeading>Enterprise work,<br />small-team resources.</SectionHeading>
            <Body className="max-w-2xl mb-5">
              Most owner-led businesses in Aotearoa carry too much operational complexity across too many disconnected tools. They need help with quoting, admin, compliance, planning, people, reporting, and growth — but they cannot justify a stack of consultants, agencies, and enterprise software.
            </Body>
            <Body className="max-w-2xl" style={{ color: "rgba(255,255,255,0.38)" }}>
              Generic tools help in pieces. Assembl brings the whole operation closer together.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            {[
              { stat: "605,000", label: "NZ enterprises", accent: C.electric },
              { stat: "97%", label: "are small businesses", accent: C.aurora },
              { stat: "$4.2B", label: "professional services spend", accent: C.ocean },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                className="rounded-2xl p-8 text-center relative overflow-hidden"
                style={{
                  background: "rgba(8,12,24,0.7)",
                  border: `1px solid rgba(0,207,255,0.07)`,
                }}
                {...stagger(i)}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.accent}50, transparent)` }}
                />
                <p
                  className="text-4xl mb-2"
                  style={{ fontFamily: FONT.heading, fontWeight: 300, color: c.accent }}
                >
                  {c.stat}
                </p>
                <p className="text-xs tracking-wider uppercase" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.35)" }}>
                  {c.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 4 — OUTCOMES ═══ */}
      <section className={SEC}>
        <div className={`${INNER} text-center`}>
          <motion.div {...fade}>
            <Eyebrow>OUTCOMES</Eyebrow>
          </motion.div>
          <motion.h2
            className="uppercase mb-10"
            style={{
              fontFamily: FONT.heading,
              fontWeight: 300,
              fontSize: isMobile ? "2rem" : "3.75rem",
              lineHeight: 1.15,
              letterSpacing: isMobile ? "2px" : "5px",
              color: C.white,
            }}
            {...fade}
          >
            Win work.{" "}
            <span style={{ color: C.aurora }}>Run work.</span>
            <br />
            <span style={{ color: C.electric }}>Stay sharp.</span>
          </motion.h2>
          <motion.div {...fade}>
            <Body className="max-w-lg mx-auto">
              Close faster, operate tighter, and stay ahead of the compliance changes that affect your business every month.
            </Body>
          </motion.div>
        </div>
      </section>

      {/* ═══ 5 — INDUSTRY PACKS ═══ */}
      <section id="industry-packs" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>INDUSTRY PACKS</Eyebrow>
            <SectionHeading>Five kete. Built for your sector.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Each kete carries the specialist knowledge your industry demands — legislation, workflows, terminology, and compliance rules — woven into one place.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <motion.div key={p.reo} {...stagger(i)}>
                <Link to={p.to} className="block h-full group">
                  <GlassCard
                    className="p-7 h-full"
                    accentColor={p.color}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                      style={{ background: `linear-gradient(180deg, ${p.color}, ${p.color}30)` }}
                    />
                    <div className="pl-4">
                      <div className="flex items-center gap-3 mb-5">
                        <ConstellationMark color={p.color} size={22} opacity={0.85} />
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
      <section id="why-assembl" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>THE DIFFERENCE</Eyebrow>
            <SectionHeading>Built for Aotearoa,<br />not adapted as an afterthought.</SectionHeading>
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
      <section id="pricing" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-16">
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Accessible pricing for real businesses.</SectionHeading>
            <Body className="max-w-lg mx-auto">
              All prices NZD ex GST (add 15% at invoice). Monthly billing, 30-day cancellation notice. Setup fees splittable across the first 3 invoices on request.
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
                      background: `linear-gradient(135deg, rgba(0,207,255,0.5) 0%, rgba(0,207,255,0.15) 50%, rgba(0,207,255,0.0) 100%)`,
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
                          background: "rgba(0,15,25,0.92)",
                          border: `1px solid rgba(0,207,255,0.35)`,
                          boxShadow: `0 0 0 1px rgba(0,207,255,0.1), 0 16px 48px rgba(0,207,255,0.12), 0 4px 24px rgba(0,0,0,0.5)`,
                          transform: "scale(1.02)",
                        }
                      : {}),
                  }}
                >
                  {tier.highlight && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${C.electric}, transparent)` }}
                    />
                  )}
                  {tier.highlight && (
                    <span
                      className="inline-block text-[9px] uppercase tracking-[2.5px] mb-3 px-2.5 py-1 rounded-full"
                      style={{ fontFamily: FONT.mono, color: C.electric, background: "rgba(0,207,255,0.08)", border: "1px solid rgba(0,207,255,0.2)" }}
                    >
                      Most popular
                    </span>
                  )}
                  <h3
                    className="text-sm uppercase tracking-[2px] mb-1"
                    style={{ fontFamily: FONT.mono, fontWeight: 600, color: tier.highlight ? C.electric : "rgba(255,255,255,0.6)" }}
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
                  <Link
                    to="/contact"
                    className="block w-full text-center py-2.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      fontFamily: FONT.body,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      background: tier.highlight ? C.electric : "rgba(0,207,255,0.05)",
                      color: tier.highlight ? "#060610" : "rgba(255,255,255,0.7)",
                      border: tier.highlight ? "none" : `1px solid rgba(0,207,255,0.08)`,
                    }}
                  >
                    Talk to us
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            {...fade}
          >
            <p className="text-[11px] uppercase tracking-[3px] mb-2" style={{ fontFamily: FONT.mono, color: C.electric, fontWeight: 700 }}>
              OUTCOME · FROM $5,000/MO
            </p>
            <p className="text-xs max-w-xl mx-auto mb-3" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.55)" }}>
              Bespoke engagements where Assembl takes on the outcome — freight route optimisation, building maintenance scheduling, fleet uptime. Base fee + 10–20% of measured savings. Scoped per engagement.
            </p>
            <Link to="/contact" className="text-xs underline" style={{ fontFamily: FONT.body, color: C.electric }}>
              Talk to us about an Outcome engagement →
            </Link>
          </motion.div>

          <motion.p
            className="text-center mt-8 text-[11px]"
            style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.25)" }}
            {...fade}
          >
            NZD ex GST · Setup fees splittable across first 3 invoices · Existing customers grandfathered until 2027-04-08
          </motion.p>
        </div>
      </section>

      {/* ═══ 8 — FOUNDING PILOT CTA ═══ */}
      <section ref={pilotRef} id="founding-pilot" className={SEC}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>FOUNDING PILOTS</Eyebrow>
            <SectionHeading>Be one of the first.</SectionHeading>
            <Body className="mb-10">
              We work directly with a small group of founding businesses to configure Assembl for their operations. Hands-on onboarding, direct access to the team, and input that shapes the platform.
            </Body>
          </motion.div>
          <motion.form
            onSubmit={handlePilot}
            className="rounded-2xl p-8 text-left space-y-4"
            style={{
              background: "rgba(8,12,24,0.85)",
              backdropFilter: "blur(20px)",
              border: `1px solid rgba(0,207,255,0.15)`,
              boxShadow: "0 0 48px rgba(0,207,255,0.05), 0 8px 32px rgba(0,0,0,0.5)",
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
              className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,207,255,0.2)]"
              style={{
                fontFamily: FONT.body,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${C.electric} 0%, #0090B3 100%)`,
                color: "#060610",
                border: "1px solid rgba(0,207,255,0.4)",
                letterSpacing: "0.03em",
              }}
            >
              Apply for founding pilot <Send size={14} />
            </button>
            <p className="text-[11px] text-center" style={{ fontFamily: FONT.mono, color: "rgba(255,255,255,0.2)" }}>
              Limited places. We will be in touch within 24 hours.
            </p>
          </motion.form>
        </div>
      </section>

      <WeaveDivider />

      {/* ═══ 9 — TRUST LAYER ═══ */}
      <section id="trust" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>TRUST LAYER</Eyebrow>
            <SectionHeading>Te Kāhui Reo —<br />the language collective.</SectionHeading>
            <Body className="max-w-2xl mx-auto mb-16">
              A cross-platform cultural and language intelligence layer. It strengthens reo quality, supports tikanga alignment, and helps organisations operate with genuine cultural integrity. Not an add-on. Part of the foundation.
            </Body>
          </motion.div>

          <motion.div {...fade} className="text-center mb-10">
            <p
              className="text-[10px] uppercase tracking-[4px]"
              style={{ fontFamily: FONT.mono, color: "rgba(0,207,255,0.3)" }}
            >
              The four pou
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOUR_POU.map((pou, i) => (
              <motion.div key={pou.reo} {...stagger(i)}>
                <GlassCard className="p-8 h-full" accentColor={pou.accent}>
                  <div className="flex items-start gap-4">
                    <ConstellationMark color={pou.accent} size={24} opacity={0.6} />
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

      {/* ═══ 10 — FOOTER NOTE: TŌROA ═══ */}
      <section className="px-6 sm:px-8 py-20">
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <div className="flex justify-center mb-6">
              <ConstellationMark color={C.electric} size={36} opacity={0.5} />
            </div>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <h3
              className="text-2xl uppercase tracking-[4px] mb-4"
              style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}
            >
              Tōroa
            </h3>
            <Body className="mb-8">
              SMS-first family navigator for Aotearoa. Designed for whānau, everyday coordination, and practical support. No app, no login. Just text. $29/month.
            </Body>
            <Link
              to="/toroa"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:border-[rgba(0,255,156,0.25)] hover:text-white hover:scale-[1.02]"
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
