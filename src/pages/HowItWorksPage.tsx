import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import IhoRoutingVisualizer from "@/components/demo/IhoRoutingVisualizer";
import HowItWorksFlow from "@/components/landing/HowItWorksFlow";
import { INDUSTRY_KETE_LIST } from "@/assets/brand/kete";

const KeteFocus = lazy(() => import("@/components/pearl/KeteFocus"));

/* ─── Pearl palette — same tokens as PearlIndex (homepage) ─── */
const PEARL = {
  bg: "#FBFAF7",        // Icy Pearl canvas
  linen: "#F3F4F2",     // Moonstone — section break tint
  opal: "#E8EEEC",      // Opal Shimmer
  ink: "#0E1513",       // Deep Calm
  pounamu: "#1F4D47",   // accent
  seaGlass: "#C4D6D2",  // hairline / ribbons
  muted: "#8B8479",     // eyebrow grey
  bodyInk: "rgba(14,21,19,0.72)",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease },
};

/* ─── Atomic pieces (mirrors PearlIndex) ─── */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="lowercase mb-8"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      letterSpacing: "0.18em",
      color: PEARL.muted,
    }}
  >
    {children}
  </p>
);

const Serif = ({
  children,
  italic = false,
  size = "md",
  color,
  className = "",
  weight = 300,
}: {
  children: React.ReactNode;
  italic?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  color?: string;
  className?: string;
  weight?: 300 | 400 | 500;
}) => {
  const sizes: Record<string, string> = {
    xs: "clamp(20px, 1.6vw, 24px)",
    sm: "clamp(22px, 1.8vw, 28px)",
    md: "clamp(28px, 2.6vw, 38px)",
    lg: "clamp(40px, 4.5vw, 56px)",
    xl: "clamp(48px, 6vw, 80px)",
    xxl: "clamp(56px, 7.5vw, 104px)",
  };
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        fontSize: sizes[size],
        lineHeight: size === "xxl" || size === "xl" ? 1.05 : 1.15,
        letterSpacing: "-0.012em",
        color: color ?? PEARL.ink,
        display: "block",
      }}
    >
      {children}
    </span>
  );
};

const Body = ({
  children,
  className = "",
  large = false,
}: {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
}) => (
  <p
    className={className}
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: large ? 18 : 17,
      lineHeight: 1.55,
      color: PEARL.bodyInk,
      fontWeight: 400,
    }}
  >
    {children}
  </p>
);

const InkButton = ({
  to,
  children,
  variant = "solid",
}: {
  to: string;
  children: React.ReactNode;
  variant?: "solid" | "underline";
}) => {
  if (variant === "underline") {
    return (
      <Link
        to={to}
        className="inline-block transition-colors"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: PEARL.ink,
          borderBottom: `1px solid ${PEARL.ink}`,
          paddingBottom: 2,
          fontWeight: 500,
        }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      data-magnetic
      className="inline-block transition-all hover:-translate-y-px"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 15,
        color: "#FBFAF7",
        background: PEARL.pounamu,
        padding: "18px 32px",
        borderRadius: 999,
        fontWeight: 500,
        letterSpacing: "0.01em",
        boxShadow: "0 10px 30px -12px rgba(31, 77, 71, 0.35)",
      }}
    >
      {children}
    </Link>
  );
};

/* ─── Content ─── */
const STEPS = [
  {
    num: "01",
    title: "Understand your business",
    desc: "During onboarding, we map your current workflows, tools, and pain points. No contract required before we start.",
    details: ["Workflow mapping session", "Pain point audit", "No commitment required"],
  },
  {
    num: "02",
    title: "Design your kete",
    desc: "We configure your Assembl instance using the kete and specialist agents that match your industry. You see the design and we iterate based on your feedback.",
    details: ["Custom agent configuration", "Industry-specific workflows", "Compliance pipeline setup"],
  },
  {
    num: "03",
    title: "Deploy & evolve",
    desc: "We deploy your instance and run weekly optimisation calls for the first month. Your team learns the platform, and we monitor for improvement opportunities.",
    details: ["Weekly optimisation calls", "Team training sessions", "Continuous improvement"],
  },
];

const KETE = [
  {
    name: "Manaaki",
    sub: "Hospitality",
    to: "/packs/manaaki",
    desc: "Food Act plans, liquor licensing, guest experience, tourism operators. Every compliance deadline tracked.",
    agents: ["AURA", "HAVEN", "TIDE", "BEACON"],
  },
  {
    name: "Waihanga",
    sub: "Construction",
    to: "/waihanga",
    desc: "Site to sign-off. H&S, consenting, project programmes, quality records. WorkSafe-aligned.",
    agents: ["ĀRAI", "KAUPAPA", "ATA", "RAWA"],
  },
  {
    name: "Auaha",
    sub: "Creative & Media",
    to: "/packs/auaha",
    desc: "Strategy, content, brand voice, design, campaigns, lead formation, analytics — one coordinated studio.",
    agents: ["Rautaki", "Kōrero", "Mana Kupu", "Toi"],
  },
  {
    name: "Arataki",
    sub: "Automotive",
    to: "/arataki",
    desc: "Enquiry → test drive → sale → delivery → service → loyalty. Warranty claims, loan cars, workshop booking.",
    agents: ["Coming Q3 2026"],
  },
  {
    name: "Pikau",
    sub: "Freight & Customs",
    to: "/contact",
    desc: "Route optimisation, declarations, broker hand-off, customs compliance. Cross-border ready.",
    agents: ["Coming Q3 2026"],
  },
];

const PIPELINE = [
  { name: "Kahu", question: "What's allowed here?", desc: "Policy detection" },
  { name: "Iho", question: "Which specialist handles this?", desc: "Routing" },
  { name: "Tā", question: "Does the work, properly", desc: "Execution + NZ correctness" },
  { name: "Mahara", question: "Checks against what we've learned", desc: "Memory + cross-verification" },
  { name: "Mana", question: "Proves it was done right", desc: "Assurance + human-in-the-loop" },
];

/* ─── Sections ─── */
function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "78vh", background: PEARL.bg }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 70% 40%, rgba(255,236,210,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 70%, rgba(228,238,236,0.45) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute hidden md:flex items-center justify-center pointer-events-none"
        style={{ top: "8%", right: "-4%", width: 620, height: 680, opacity: 0.85 }}
      >
        <Suspense fallback={null}>
          <KeteFocus size={620} sparkles={42} rimSparkles={24} priority />
        </Suspense>
      </div>

      <div className="relative z-10 max-w-[1120px] mx-auto px-6 md:px-10 pt-40 md:pt-52 pb-32">
        <div className="max-w-[680px]">
          <Eyebrow>How it works</Eyebrow>
          <Serif size="xl">
            Shared intelligence for{" "}
            <Serif size="xl" italic color={PEARL.pounamu} className="inline">
              Aotearoa business.
            </Serif>
          </Serif>
          <div style={{ marginTop: 28, maxWidth: 580 }}>
            <Body large>
              Specialist operational workflows packaged into industry kete — each one wrapped in a
              five-stage compliance pipeline that runs before anything ships, not after. Built around
              NZ law, not adapted from a US product.
            </Body>
          </div>
          <div className="flex flex-wrap items-center gap-6" style={{ marginTop: 40 }}>
            <InkButton to="/contact">Talk to us</InkButton>
            <InkButton to="/pricing" variant="underline">
              View pricing
            </InkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const Section = ({ children, alt = false }: { children: React.ReactNode; alt?: boolean }) => (
  <section
    className="relative px-6 md:px-10"
    style={{
      paddingTop: 160,
      paddingBottom: 160,
      background: alt ? PEARL.linen : PEARL.bg,
    }}
  >
    <div className="max-w-[1120px] mx-auto">{children}</div>
  </section>
);

const HowItWorksPage = () => (
  <div className="min-h-screen flex flex-col relative" style={{ background: PEARL.bg, color: PEARL.ink }}>
    <SEO
      title="How Assembl Works — Specialist operational workflows for NZ business"
      description="A library of specialist agents across five industry kete, governed by a single compliance pipeline that checks every output against current NZ law."
      path="/how-it-works"
    />
    <BrandNav />

    <Hero />

    {/* ─── 3-STEP PROCESS ─── */}
    <Section>
      <motion.div {...fadeUp} className="max-w-[680px] mb-20">
        <Eyebrow>Three steps</Eyebrow>
        <Serif size="lg">From first contact to live operations.</Serif>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.num}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.08 }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: 28,
                color: PEARL.pounamu,
                marginBottom: 18,
                fontWeight: 300,
              }}
            >
              {s.num}
            </p>
            <Serif size="sm" className="mb-4">
              {s.title}
            </Serif>
            <div style={{ marginBottom: 20 }}>
              <Body>{s.desc}</Body>
            </div>
            <ul className="space-y-2.5">
              {s.details.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: PEARL.bodyInk,
                  }}
                >
                  <Check size={14} style={{ color: PEARL.pounamu, marginTop: 4, flexShrink: 0 }} />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>

    {/* ─── FIVE-STAGE PIPELINE ─── */}
    <Section alt>
      <motion.div {...fadeUp} className="max-w-[680px] mb-20">
        <Eyebrow>Five-stage pipeline</Eyebrow>
        <Serif size="lg" className="mb-6">
          Every action logged.{" "}
          <Serif size="lg" italic color={PEARL.pounamu} className="inline">
            Every output auditable.
          </Serif>
        </Serif>
        <Body>
          Every output passes through all five stages. Draft-only posture — no agent publishes,
          sends, or executes without a named human operator's approval.
        </Body>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {PIPELINE.map((stage, i) => (
          <motion.div
            key={stage.name}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            style={{
              background: "rgba(255,255,255,0.55)",
              border: `1px solid ${PEARL.opal}`,
              borderRadius: 16,
              padding: 24,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <p
              className="lowercase mb-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: PEARL.muted,
              }}
            >
              stage {String(i + 1).padStart(2, "0")}
            </p>
            <Serif size="sm" className="mb-3">
              {stage.name}
            </Serif>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 18,
                color: PEARL.pounamu,
                marginBottom: 10,
                lineHeight: 1.3,
              }}
            >
              "{stage.question}"
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: PEARL.bodyInk,
                lineHeight: 1.55,
              }}
            >
              {stage.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>

    {/* ─── NGĀ KETE ─── */}
    <Section>
      <motion.div {...fadeUp} className="max-w-[680px] mb-20">
        <Eyebrow>Ngā kete</Eyebrow>
        <Serif size="lg" className="mb-6">
          Five industry kete,{" "}
          <Serif size="lg" italic color={PEARL.pounamu} className="inline">
            woven in Aotearoa.
          </Serif>
        </Serif>
        <Body>
          Each kete carries the legislation, workflows and terminology its industry actually uses.
          They share one intelligence layer underneath — aligning with tikanga Māori governance
          principles, NZ-hosted.
        </Body>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {KETE.map((k, i) => (
          <motion.div
            key={k.name}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
          >
            <Link
              to={k.to}
              data-magnetic
              className="block h-full group transition-all hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: `1px solid ${PEARL.opal}`,
                borderRadius: 20,
                padding: 32,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <p
                className="lowercase mb-3"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: PEARL.muted,
                }}
              >
                {k.sub}
              </p>
              <Serif size="md" className="mb-5">
                {k.name}
              </Serif>
              <div style={{ marginBottom: 24 }}>
                <Body>{k.desc}</Body>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {k.agents.map((a) => (
                  <span
                    key={a}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: `${PEARL.pounamu}10`,
                      color: PEARL.pounamu,
                      border: `1px solid ${PEARL.pounamu}25`,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div
                className="inline-flex items-center gap-2 transition-all group-hover:gap-3"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: PEARL.pounamu,
                  fontWeight: 500,
                }}
              >
                {k.to === "/contact" ? "Talk to us" : "Explore kete"}
                <ArrowRight size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>

    {/* ─── IHO ROUTING DEMO ─── */}
    <Section alt>
      <motion.div {...fadeUp} className="max-w-[680px] mb-16 mx-auto text-center">
        <Eyebrow>Live demo</Eyebrow>
        <Serif size="lg" className="mb-6">
          See Iho{" "}
          <Serif size="lg" italic color={PEARL.pounamu} className="inline">
            route in real time.
          </Serif>
        </Serif>
        <Body>
          Type any business question and watch the routing engine classify intent, load skills, and
          select the right agent.
        </Body>
      </motion.div>
      <motion.div
        {...fadeUp}
        className="max-w-3xl mx-auto"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: `1px solid ${PEARL.opal}`,
          borderRadius: 20,
          padding: 4,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <IhoRoutingVisualizer />
      </motion.div>
    </Section>

    {/* ─── CTA ─── */}
    <Section>
      <motion.div {...fadeUp} className="max-w-[680px] mx-auto text-center">
        <Eyebrow>Ready to begin</Eyebrow>
        <Serif size="lg" className="mb-6">
          See how it works for{" "}
          <Serif size="lg" italic color={PEARL.pounamu} className="inline">
            your business.
          </Serif>
        </Serif>
        <div style={{ marginBottom: 36 }}>
          <Body>
            Tell us about your business and we'll show you exactly which kete fit your workflows.
          </Body>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <InkButton to="/contact">Get started</InkButton>
          <InkButton to="/pricing" variant="underline">
            View pricing
          </InkButton>
        </div>
      </motion.div>
    </Section>

    <BrandFooter />
  </div>
);

export default HowItWorksPage;
