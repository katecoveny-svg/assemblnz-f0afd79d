import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

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

/* ─── Shared components ─── */
const Eyebrow = ({ children }: { children: string }) => (
  <span
    className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4"
    style={{ fontFamily: FONT.mono, color: C.gold }}
  >
    {children}
  </span>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="text-2xl sm:text-3xl lg:text-4xl uppercase tracking-[2px] sm:tracking-[4px] mb-6"
    style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white, lineHeight: 1.25 }}
  >
    {children}
  </h2>
);

const Body = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p
    className={`text-sm sm:text-[15px] leading-relaxed ${className}`}
    style={{ fontFamily: FONT.body, color: C.textSec }}
  >
    {children}
  </p>
);

const SEC = "relative px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";

const GlassCard = ({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: "rgba(15,15,26,0.7)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: `1px solid ${C.border}`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      ...style,
    }}
  >
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
    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
    style={{
      fontFamily: FONT.body,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${C.border}`,
    }}
  />
);

/* ─── Data ─── */
const PROOF = [
  "42 specialist agents",
  "5 industry packs",
  "Built in Aotearoa",
  "From $89/month NZD",
  "SMS-ready",
];

const PACKS = [
  {
    reo: "Manaaki",
    en: "Hospitality & Tourism",
    desc: "Guest experience, food safety, liquor licensing, lodge operations, adventure tourism.",
    color: C.gold,
    to: "/manaaki",
  },
  {
    reo: "Hanga",
    en: "Construction",
    desc: "Site to sign-off. Safety, consenting, project management, tenders, quality.",
    color: C.teal,
    to: "/hanga",
  },
  {
    reo: "Auaha",
    en: "Creative & Media",
    desc: "Brief to published. Copy, image, video, podcast, ads, analytics.",
    color: C.gold,
    to: "/auaha",
  },
  {
    reo: "Pakihi",
    en: "Business & Commerce",
    desc: "Accounting, insurance, retail, trade, agriculture, real estate, immigration.",
    color: "#5AADA0",
    to: "/pakihi",
  },
  {
    reo: "Hangarau",
    en: "Technology",
    desc: "Security, DevOps, infrastructure, monitoring, manufacturing, IP.",
    color: C.navy,
    to: "/hangarau",
  },
];

const DIFFS = [
  {
    title: "NZ-context intelligence",
    body: "Built around local legislation, tax, employment law, and industry realities. Not an overseas product localised after the fact.",
    accent: C.gold,
  },
  {
    title: "Specialist, not generic",
    body: "42 purpose-built agents across five industry packs. Each one trained on the workflows that matter to your sector.",
    accent: C.teal,
  },
  {
    title: "Shared business memory",
    body: "Work compounds over time. Context, decisions, and project history carry forward instead of resetting every session.",
    accent: C.navy,
  },
  {
    title: "Cultural and language layer",
    body: "Te K\u0101hui Reo strengthens reo quality, tikanga alignment, and trust across every interaction.",
    accent: C.gold,
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "$89",
    desc: "For sole traders and micro-businesses getting started.",
    features: ["5 agents", "1 industry pack", "Email support", "Basic memory"],
  },
  {
    name: "Pro",
    price: "$299",
    desc: "For growing teams that need more horsepower.",
    features: ["20 agents", "2 industry packs", "Priority support", "Full memory", "Custom workflows"],
    highlight: true,
  },
  {
    name: "Business",
    price: "$599",
    desc: "For established businesses running complex operations.",
    features: ["All agents", "3 industry packs", "Dedicated support", "Team access", "Compliance alerts"],
  },
  {
    name: "Industry Suite",
    price: "$1,499",
    desc: "Full platform. Every agent. Every pack. White-glove onboarding.",
    features: ["All agents", "All 5 packs", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
  },
];

const FOUR_POU = [
  { reo: "Rangatiratanga", en: "Self-determination", body: "Every wh\u0101nau and business owns their data, their decisions, their direction." },
  { reo: "Kaitiakitanga", en: "Stewardship", body: "We care for the tools we build and the whenua they serve, with an intergenerational lens." },
  { reo: "Manaakitanga", en: "Care", body: "We look after our customers, our people, and the communities we operate in." },
  { reo: "Whanaungatanga", en: "Connection", body: "We build genuine relationships. We don\u2019t extract \u2014 we grow together." },
];

/* ─── Animation preset ─── */
const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6 },
};

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
      const msg = `Founding pilot application \u2014 ${pilotBiz}`;
      const { data: inserted, error } = await supabase
        .from("contact_submissions")
        .insert({ name: pilotName, email: pilotEmail, message: msg })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Application received. We\u2019ll be in touch within 24 hours.");
      setPilotName("");
      setPilotEmail("");
      setPilotBiz("");
      supabase.functions
        .invoke("send-contact-email", { body: { name: pilotName, email: pilotEmail, message: msg } })
        .catch(console.error);
      if (inserted?.id)
        supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="Assembl \u2014 The Operating System for NZ Business"
        description="42 specialist agents across 5 industry packs. One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution \u2014 built in Aotearoa."
      />
      <BrandNav />

      {/* ═══ 1 \u2014 HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-20 sm:pt-28 pb-14" style={{ zIndex: 1 }}>
        {/* Subtle warm glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 35% at 50% 25%, rgba(212,168,67,0.035) 0%, transparent 70%)" }}
        />

        <motion.h1
          className="relative max-w-3xl uppercase tracking-[2px] sm:tracking-[4px]"
          style={{
            fontFamily: FONT.heading,
            fontWeight: 300,
            fontSize: isMobile ? "1.65rem" : "2.75rem",
            lineHeight: 1.2,
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          The operating system for{" "}
          <span style={{ color: C.gold }}>NZ business.</span>
        </motion.h1>

        <motion.p
          className="relative max-w-xl mt-6"
          style={{ fontFamily: FONT.body, fontSize: isMobile ? "15px" : "17px", lineHeight: 1.75, color: C.textSec, zIndex: 1 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative flex flex-col sm:flex-row gap-3 mt-10"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <button
            onClick={scrollToPilot}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{
              fontFamily: FONT.body,
              fontWeight: 500,
              background: C.teal,
              color: C.white,
              border: "1px solid rgba(58,125,110,0.6)",
            }}
          >
            Become a founding pilot <ArrowRight size={16} />
          </button>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{
              fontFamily: FONT.body,
              fontWeight: 500,
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              border: `1px solid ${C.border}`,
            }}
          >
            View pricing
          </Link>
        </motion.div>

        <motion.div
          className="mt-12"
          style={{ color: "rgba(255,255,255,0.2)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={22} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 2 \u2014 PROOF BAR ═══ */}
      <section className="px-6 sm:px-8 py-6">
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {PROOF.map((p) => (
            <span
              key={p}
              className="px-4 py-1.5 rounded-full text-[11px]"
              style={{
                fontFamily: FONT.mono,
                fontWeight: 500,
                background: "rgba(15,15,26,0.7)",
                border: `1px solid ${C.border}`,
                color: C.textSec,
                letterSpacing: "0.03em",
              }}
            >
              {p}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ 3 \u2014 PROBLEM ═══ */}
      <section className={SEC}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>THE PROBLEM</Eyebrow>
            <SectionHeading>Enterprise work, small-team resources.</SectionHeading>
            <Body className="max-w-2xl mb-8">
              Most owner-led businesses in Aotearoa carry too much operational complexity across too many disconnected tools. They need help with quoting, admin, compliance, planning, people, reporting, and growth — but they cannot justify a stack of consultants, agencies, and enterprise software.
            </Body>
            <Body className="max-w-2xl">
              Generic tools help in pieces. Assembl brings the whole operation closer together.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
            {[
              { stat: "605,000", label: "NZ enterprises" },
              { stat: "97%", label: "are small businesses" },
              { stat: "$4.2B", label: "professional services spend" },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(15,15,26,0.6)",
                  border: `1px solid ${C.border}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="text-2xl font-light mb-1" style={{ fontFamily: FONT.heading, color: C.gold }}>
                  {c.stat}
                </p>
                <p className="text-xs" style={{ fontFamily: FONT.body, color: C.textMuted }}>
                  {c.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4 \u2014 OUTCOMES ═══ */}
      <section className={SEC}>
        <div className={`${INNER} text-center`}>
          <motion.div {...fade}>
            <Eyebrow>OUTCOMES</Eyebrow>
          </motion.div>
          <motion.h2
            className="uppercase tracking-[3px] sm:tracking-[6px] mb-10"
            style={{
              fontFamily: FONT.heading,
              fontWeight: 300,
              fontSize: isMobile ? "1.75rem" : "3.25rem",
              lineHeight: 1.3,
              color: C.white,
            }}
            {...fade}
          >
            Win work.{" "}
            <span style={{ color: C.teal }}>Run work.</span>{" "}
            <span style={{ color: C.gold }}>Stay sharp.</span>
          </motion.h2>
          <motion.div {...fade}>
            <Body className="max-w-lg mx-auto">
              Close faster, operate tighter, and stay ahead of the compliance changes that affect your business every month.
            </Body>
          </motion.div>
        </div>
      </section>

      {/* ═══ 5 \u2014 INDUSTRY PACKS ═══ */}
      <section id="industry-packs" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>INDUSTRY PACKS</Eyebrow>
            <SectionHeading>Five packs. Built for your sector.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              Each pack carries the specialist knowledge your industry demands \u2014 legislation, workflows, terminology, and compliance rules \u2014 woven into one place.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <motion.div
                key={p.reo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link to={p.to} className="block h-full">
                  <GlassCard
                    className="p-7 h-full hover:border-white/15 transition-all duration-300"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="w-8 h-[2px] rounded-full mb-5" style={{ background: p.color }} />
                    <h3
                      className="text-lg mb-1"
                      style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}
                    >
                      {p.reo}
                    </h3>
                    <p
                      className="text-xs uppercase tracking-[2px] mb-4"
                      style={{ fontFamily: FONT.mono, color: p.color }}
                    >
                      {p.en}
                    </p>
                    <Body>{p.desc}</Body>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6 \u2014 DIFFERENCE ═══ */}
      <section id="why-assembl" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>THE DIFFERENCE</Eyebrow>
            <SectionHeading>Built for Aotearoa, not adapted as an afterthought.</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DIFFS.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <GlassCard className="p-8 h-full">
                  <div className="w-8 h-[2px] rounded-full mb-5" style={{ background: d.accent }} />
                  <h3
                    className="text-base mb-3"
                    style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}
                  >
                    {d.title}
                  </h3>
                  <Body>{d.body}</Body>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7 \u2014 PRICING ═══ */}
      <section id="pricing" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Accessible pricing for real businesses.</SectionHeading>
            <Body className="max-w-lg mx-auto">
              All plans are per month, in NZD + GST. No lock-in contracts.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlassCard
                  className="p-7 h-full flex flex-col"
                  style={
                    tier.highlight
                      ? { border: `1px solid rgba(212,168,67,0.3)`, boxShadow: "0 8px 32px rgba(212,168,67,0.08)" }
                      : {}
                  }
                >
                  {tier.highlight && (
                    <span
                      className="text-[10px] uppercase tracking-[2px] mb-3"
                      style={{ fontFamily: FONT.mono, color: C.gold }}
                    >
                      Most popular
                    </span>
                  )}
                  <h3 className="text-base mb-1" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}>
                    {tier.name}
                  </h3>
                  <p className="text-3xl font-light mb-1" style={{ fontFamily: FONT.heading, color: C.white }}>
                    {tier.price}
                    <span className="text-sm" style={{ color: C.textMuted }}>
                      /mo
                    </span>
                  </p>
                  <Body className="mb-6 text-xs">{tier.desc}</Body>
                  <ul className="space-y-2 mt-auto">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="text-xs flex items-start gap-2"
                        style={{ fontFamily: FONT.body, color: C.textSec }}
                      >
                        <span style={{ color: C.teal, marginTop: "2px" }}>&bull;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8 \u2014 FOUNDING PILOT CTA ═══ */}
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
              background: "rgba(15,15,26,0.6)",
              border: `1px solid ${C.border}`,
              boxShadow: "0 0 30px rgba(212,168,67,0.06), 0 4px 24px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <InputField value={pilotName} onChange={setPilotName} placeholder="Your name" />
            <InputField value={pilotEmail} onChange={setPilotEmail} placeholder="Email" type="email" />
            <InputField value={pilotBiz} onChange={setPilotBiz} placeholder="Business name & industry" />
            <button
              type="submit"
              className="w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                fontFamily: FONT.body,
                background: C.teal,
                color: C.white,
                border: "1px solid rgba(58,125,110,0.6)",
              }}
            >
              Apply for founding pilot <Send size={14} />
            </button>
            <p className="text-[11px] text-center" style={{ color: C.textMuted }}>
              Limited places. We will be in touch within 24 hours.
            </p>
          </motion.form>
        </div>
      </section>

      {/* ═══ 9 \u2014 TRUST LAYER ═══ */}
      <section id="trust" className={SEC}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>TRUST LAYER</Eyebrow>
            <SectionHeading>Te K&#257;hui Reo &mdash; the language collective.</SectionHeading>
            <Body className="max-w-2xl mx-auto mb-14">
              A cross-platform cultural and language intelligence layer. It strengthens reo quality, supports tikanga alignment, and helps organisations operate with genuine cultural integrity. Not an add-on. Part of the foundation.
            </Body>
          </motion.div>

          <motion.div {...fade} className="text-center mb-8">
            <p
              className="text-xs uppercase tracking-[3px]"
              style={{ fontFamily: FONT.mono, color: C.gold }}
            >
              The four pou
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOUR_POU.map((pou, i) => (
              <motion.div
                key={pou.reo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <GlassCard className="p-7 h-full">
                  <h3 className="text-base mb-1" style={{ fontFamily: FONT.heading, fontWeight: 400, color: C.white }}>
                    {pou.reo}
                  </h3>
                  <p className="text-xs mb-3" style={{ fontFamily: FONT.mono, color: C.gold }}>
                    {pou.en}
                  </p>
                  <Body>{pou.body}</Body>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10 \u2014 FOOTER NOTE: T\u014cROA ═══ */}
      <section className="px-6 sm:px-8 py-16">
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <h3
              className="text-xl uppercase tracking-[3px] mb-4"
              style={{ fontFamily: FONT.heading, fontWeight: 300, color: C.white }}
            >
              T&#333;roa
            </h3>
            <Body className="mb-6">
              SMS-first family navigator for Aotearoa. Designed for wh&#257;nau, everyday coordination, and practical support. No app, no login. Just text. $29/month.
            </Body>
            <Link
              to="/toroa"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
              style={{
                fontFamily: FONT.body,
                fontWeight: 500,
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: `1px solid ${C.border}`,
              }}
            >
              Visit T&#333;roa <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default Index;
