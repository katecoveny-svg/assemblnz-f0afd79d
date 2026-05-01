import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { track } from "@/lib/analytics";
import { tier } from "@/data/tierLadder";

const KeteFocus = lazy(() => import("@/components/pearl/KeteFocus"));
const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));
const FairyLightStrand = lazy(() =>
  import("@/components/pearl/FluffyCloud").then((m) => ({ default: m.FairyLightStrand }))
);

/* ─── Pearl palette — WARM (sunlit, candle-warm, golden-hour) ─── */
const PEARL = {
  bg: "#FAF6EF",         // Warm Pearl — primary canvas
  linen: "#F4EFE6",      // Linen — section break tint
  moonstone: "#F4EFE6",  // alias (legacy refs)
  opal: "#E8EEEC",       // Opal Shimmer — radial washes, cloud feathering
  ink: "#0F2A26",        // Forest Ink — deep pounamu, never black
  pounamu: "#1F4D47",
  seaGlass: "#C4D6D2",
  harbour: "#1B2A2E",
};

/* ─── Motion presets ─── */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease },
};

/* ─── Atomic pieces ─── */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="lowercase mb-8"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      letterSpacing: "0.18em",
      color: "#8B8479",
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
      color: "rgba(15,42,38,0.72)",
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
  variant?: "solid" | "outline" | "underline";
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
  if (variant === "outline") {
    return (
      <Link
        to={to}
        data-magnetic
        className="inline-block transition-all hover:-translate-y-px"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: PEARL.ink,
          padding: "12px 24px",
          border: `1px solid ${PEARL.ink}`,
          borderRadius: 8,
          fontWeight: 500,
          letterSpacing: "0.01em",
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

/* ─── Sections ─── */

function MinimalNav() {
  return (
    <nav
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(250,246,239,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${PEARL.opal}`,
      }}
      aria-label="Primary"
    >
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          aria-label="Assembl — home"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 22,
            color: PEARL.ink,
            letterSpacing: "0.01em",
          }}
        >
          assembl<span style={{ color: PEARL.pounamu }}>.</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to="/"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: PEARL.ink,
              fontWeight: 500,
            }}
          >
            Home
          </Link>
          <Link
            to="/contact"
            data-cta="nav-contact"
            className="inline-flex items-center rounded-full transition hover:-translate-y-px"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "#FBFAF7",
              background: PEARL.pounamu,
              padding: "10px 20px",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "88vh", background: PEARL.bg }}>
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-24 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#7A8B82] mb-6">
          Built in Aotearoa
        </p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-[#0F2A26] mb-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
          Quiet AI that gives time back.
        </h1>
        <p className="text-lg md:text-xl text-[#0F2A26]/80 max-w-2xl mx-auto mb-10">
          Specialist AI advisory for Customs Brokers and Architectural firms. We embed AI to capture
          decades of domain expertise before it walks out the door.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <a href="/contact" data-cta="hero-primary"
             className="inline-flex items-center gap-2 rounded-full bg-[#0F2A26] px-7 py-3 text-white font-medium hover:bg-[#1F4D47] transition">
            Book a Pilot Sprint
            <span aria-hidden>→</span>
          </a>
        </div>
        <p className="text-sm text-[#7A8B82]">
          NZ$5,000 + GST · Two weeks · One workflow · Money-back guarantee
        </p>
      </div>
    </section>
  );
}

function TwoVerticalProblem() {
  const cols = [
    {
      eyebrow: "Customs Brokerage",
      body:
        "5–10 years to train a licensed broker. Your most experienced people are approaching retirement. Who classifies the tricky shipments when they're gone?",
    },
    {
      eyebrow: "Architecture & Construction",
      body:
        "73% of building consents receive RFIs. Missing documents and vague specs cost firms weeks of rework and reputational damage.",
    },
  ];
  return (
    <section style={{ paddingTop: 140, paddingBottom: 140, background: PEARL.linen }}>
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>The problem</Eyebrow>
        <Serif size="lg" className="mb-16">Two industries. One quiet crisis: knowledge walking out the door.</Serif>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {cols.map((c) => (
            <div key={c.eyebrow}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: PEARL.pounamu,
                  fontWeight: 500,
                  marginBottom: 20,
                }}
              >
                {c.eyebrow}
              </p>
              <Body large>{c.body}</Body>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// Legacy hero body (kept inert below this point so the closing brace count stays valid).
// The original layered hero below was replaced by the single-offer hero above.
// (Legacy hero body removed — single-offer hero above is the live hero.)


/* ─── Three priority product cards (above the kete grid) ───────────
 *  Tier prices come from src/data/tierLadder.ts (locked source of
 *  truth). To change pricing copy here, edit tierLadder.ts — never
 *  hard-code monthly/setup numbers in this file.
 */
const PRODUCT_CARDS = [
  {
    title: "Pilot in 30 Days",
    price: tier("pilotSprint").price,
    blurb: "One painful workflow, governed and live in a month.",
    to: "/contact?offer=pilot-30",
    cta: "Book a pilot",
  },
  {
    title: "Landlord",
    price: tier("operator").price,
    blurb: "Governed property admin and compliance for NZ landlords.",
    to: "/landlord",
    cta: "See Landlord",
  },
  {
    title: "Mariner",
    price: tier("leader").price,
    blurb: "Maritime compliance and operational assistant for Aotearoa operators.",
    to: "/mariner",
    cta: "See Mariner",
  },
];

function PriorityProducts() {
  return (
    <section className="relative" style={{ paddingTop: 100, paddingBottom: 60, background: PEARL.bg }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <motion.div {...fadeUp}>
          <Eyebrow>Where to start</Eyebrow>
          <Serif size="lg">Three ways into Assembl.</Serif>
          <div style={{ marginTop: 12, maxWidth: 620 }}>
            <Body large>Pick the offer that matches the work in front of you. The full kete library sits below.</Body>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {PRODUCT_CARDS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="rounded-3xl p-8 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(31,77,71,0.10)",
                boxShadow: "0 8px 30px rgba(111,97,88,0.06)",
              }}
            >
              <p
                className="lowercase mb-3"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.28em",
                  color: PEARL.pounamu,
                  fontWeight: 500,
                }}
              >
                {p.price}
              </p>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: 30,
                  lineHeight: 1.15,
                  color: PEARL.ink,
                  margin: 0,
                  marginBottom: 14,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "rgba(15,42,38,0.72)",
                  margin: 0,
                  marginBottom: 28,
                  flex: 1,
                }}
              >
                {p.blurb}
              </p>
              <Link
                to={p.to}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: PEARL.ink,
                  borderBottom: `1px solid ${PEARL.ink}`,
                  paddingBottom: 2,
                  fontWeight: 500,
                  alignSelf: "flex-start",
                }}
              >
                {p.cta} →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyAssembl() {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      {/* Atmospheric cloud removed */}

      <motion.div {...fadeUp} className="max-w-[680px] mx-auto px-6 relative z-10">
        <Eyebrow>Why Assembl</Eyebrow>
        <Serif size="lg">Assembl exists because time matters.</Serif>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            "I know what overwork feels like. I know what constant motion costs.",
            "I know what it's like to be stretched between ambition, responsibility, and family.",
            "Assembl exists because time matters.",
            "I built this for New Zealand families, teams, and communities — for the people carrying too much at once, for the businesses trying to stay compliant as the law keeps changing, for the evenings that never start on time.",
          ].map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 23,
                lineHeight: 1.55,
                color: PEARL.ink,
                margin: 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              lineHeight: 1.45,
              color: PEARL.ink,
              margin: 0,
            }}
          >
            I believe AI should do more than make businesses efficient.
          </p>
          {[
            "It should give people time back.",
            "Time to think. Time to be present. Time for what matters most.",
          ].map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1.45,
                color: PEARL.pounamu,
                margin: 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function WhatAssemblIs() {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      {/* (atmospheric ribbon removed — hero room cloud carries the section) */}

      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10">
        <Eyebrow>What Assembl is</Eyebrow>
        <Serif size="lg" className="mb-10">
          A platform of practical AI agents that finish the work — and give the time back.
        </Serif>
        <div style={{ maxWidth: 680, marginBottom: 56 }}>
          <Body large>
            Assembl is a New Zealand-built platform of specialist AI agents — one for hospitality, construction, automotive, freight, creative, retail, early childhood, and one for the household. Each agent runs an end-to-end workflow for you and closes it with a single evidence pack: source-cited, audit-ready, dated, current with New Zealand law.
          </Body>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 relative">
          <div className="relative" style={{ zIndex: 2 }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: PEARL.pounamu,
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              The work itself
            </p>
            <Body large>
              Efficient, end-to-end, specific to your industry. A food diary. A site induction. A customs clearance. A contract review. A WoF reminder. A privacy check. The agent runs the whole loop in the background — and hands you a finished pack, not another dashboard to manage.
            </Body>
          </div>
          <div className="relative" style={{ zIndex: 2 }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 14,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PEARL.pounamu,
                marginBottom: 20,
              }}
            >
              What it is for
            </p>
            <Body large>
              Efficient for value. Efficient for time. Efficiency is not the prize — it is the path. Every loop Assembl closes is a minute, an hour, an evening returned to you. We do not measure ourselves in speed. We measure ourselves in the time we give back, and the value you spend it on.
            </Body>
          </div>

          {/* Background canonical kete — large, soft, sits behind the columns */}
          <div
            className="hidden md:block absolute pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 720,
              height: 720,
              zIndex: 0,
              opacity: 0.5,
            }}
            aria-hidden
          >
            <Suspense fallback={null}>
              <FeatherKete variant="base" size={720} drift="slow" />
            </Suspense>
          </div>
          {/* Data-light strand woven across the cloud — obvious network of connected lights */}
          <div
            className="hidden md:block absolute pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 720,
              height: 220,
              zIndex: 1,
              opacity: 0.95,
            }}
          >
            <Suspense fallback={null}>
              <FairyLightStrand width={720} height={220} bulbs={14} direction="drape" />
            </Suspense>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", h: "The agent runs the work.", p: "Privacy check. Contract review. Food diary. Site induction. Whatever your day needs. Quietly, in the background." },
    { n: "02", h: "The pack closes the loop.", p: "Source-cited. Audit-ready. Dated. One artefact your team, your regulator, or your board can act on." },
    { n: "03", h: "The law stays current.", p: "When New Zealand legislation moves, your checks move with it. Centrally. Without a meeting." },
  ];
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.linen }}>
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>How it works</Eyebrow>
        <Serif size="lg">Every workflow ends in a pack.</Serif>
        <div style={{ maxWidth: 680, marginTop: 24 }}>
          <Body large>
            File it. Forward it. Footnote it. Every job an Assembl agent closes produces a single evidence pack — source-cited, audit-ready, dated. Not a dashboard. Not a stream. A finished thing.
          </Body>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-20" style={{ marginTop: 96 }}>
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: i * 0.1 }}
              className="relative"
            >
              <Serif size="sm" className="mb-4">{s.h}</Serif>
              <Body>{s.p}</Body>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const KETES = [
  { mi: "Manaaki", en: "Hospitality", line: "Food diary, licensing, rostering — closed daily.", to: "/manaaki", variant: "manaaki" as const },
  { mi: "Waihanga", en: "Construction", line: "Site inductions, consenting, H&S evidence — packed per project.", to: "/waihanga/about", variant: "waihanga" as const },
  { mi: "Auaha", en: "Creative", line: "Contracts, IP clearance, invoicing — ready to send.", to: "/auaha/about", variant: "auaha" as const },
  { mi: "Arataki", en: "Automotive & Fleet", line: "MVSA, RUC, WoF, Land Transport — current as the law updates.", to: "/arataki", variant: "arataki" as const },
  { mi: "Pikau", en: "Freight & Customs", line: "Customs & Excise, biosecurity, import health — evidence every shipment.", to: "/pikau", variant: "pikau" as const },
  { mi: "Hoko", en: "Retail", line: "Compliance, stock, trading standards — end of day, closed.", to: "/hoko", variant: "hoko" as const },
  { mi: "Ako", en: "Early Childhood", line: "Ratios, safety, registrations — pack filed, not chased.", to: "/ako", variant: "ako" as const },
  { mi: "Tōro", en: "Family", line: "The household load, quietly organised. $29 a month.", to: "/toroa", variant: "toro" as const },
];

function KetesGrid() {
  return (
    <section className="relative" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>What it covers</Eyebrow>
        <Serif size="lg">One kete per industry. One platform underneath.</Serif>
        <div style={{ maxWidth: 680, marginTop: 24, marginBottom: 80 }}>
          <Body large>Eight ketes. One quiet intelligence layer behind all of them.</Body>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {KETES.map((k, i) => (
            <motion.div
              key={k.mi}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.05 }}
            >
              <Link
                to={k.to}
                className="block group h-full"
                data-magnetic
                style={{
                  borderRadius: 20,
                  border: `1px solid ${PEARL.seaGlass}`,
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(10px)",
                  padding: 32,
                  boxShadow: "0 1px 2px rgba(15,42,38,0.04), 0 8px 28px -12px rgba(31,77,71,0.10)",
                  transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = PEARL.pounamu;
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(15,42,38,0.05), 0 18px 48px -16px rgba(31,77,71,0.22)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = PEARL.seaGlass;
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,42,38,0.04), 0 8px 28px -12px rgba(31,77,71,0.10)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="mb-6 flex items-center justify-center" style={{ height: 200 }}>
                  <Suspense fallback={null}>
                    <FeatherKete variant={k.variant} size={200} drift="slow" alt={`${k.mi} kete`} />
                  </Suspense>
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: 15,
                    color: PEARL.pounamu,
                    letterSpacing: "0.02em",
                    marginBottom: 8,
                    fontWeight: 400,
                  }}
                >
                  {k.mi}
                </p>
                <Serif size="sm" className="mb-3">{k.en}</Serif>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(15,42,38,0.7)",
                  }}
                >
                  {k.line}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 48, maxWidth: 680 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(15,42,38,0.55)",
              lineHeight: 1.6,
            }}
          >
            Business, professional services, or technology? You use Assembl as a platform — same Operator tier, no industry bundle, build your own workflows on Iho and the compliance pipeline.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function LiveCompliance() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}
    >
      {/* Soft opal wash — golden-hour through mist */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(232,238,236,0.55) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 50% 40%, rgba(248,233,196,0.22) 0%, transparent 70%)",
        }}
      />
      {/* Canonical kete tucked top-right */}
      <div className="absolute hidden md:block pointer-events-none" style={{ top: 48, right: "8%", width: 180, height: 180, opacity: 0.7 }} aria-hidden>
        <Suspense fallback={null}>
          <FeatherKete variant="base" size={180} drift="slow" />
        </Suspense>
      </div>
      <motion.div {...fadeUp} className="max-w-[680px] mx-auto px-6 text-center relative z-10">
        <Eyebrow>Live compliance</Eyebrow>
        <Serif size="lg" className="mb-12">
          Your compliance stays current — because we do.
        </Serif>
        <Body large>
          When New Zealand law changes, every Assembl check updates centrally. Your business inherits the change automatically. No internal scramble. No consultant invoice. No “we’ll update the SOP next month.”
        </Body>

        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 22,
            color: PEARL.ink,
            marginTop: 56,
            letterSpacing: "0.04em",
            lineHeight: 1.5,
          }}
        >
          Live compliance.&nbsp;&nbsp;Written in plain English.&nbsp;&nbsp;Backed by source citation.
        </p>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: PEARL.pounamu,
            marginTop: 36,
            fontWeight: 500,
          }}
        >
          Simulation-tested · Policy-governed · Human-in-the-loop
        </p>
      </motion.div>
    </section>
  );
}

function Tikanga() {
  return (
    <section style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      <motion.div {...fadeUp} className="max-w-[680px] mx-auto px-6">
        <Eyebrow>Tikanga</Eyebrow>
        <Serif size="lg" className="mb-12">
          We work alongside, not over.
        </Serif>
        <Body large>
          Te reo Māori and tikanga are living taonga. We engage Te Hiku Media’s Kaitiakitanga Licence framework for any Māori-origin capability, and we’re paused on new te reo features until the right partnership is in place.
        </Body>
        <div style={{ height: 24 }} />
        <Body large>We want to work alongside the experts, not claim to be them.</Body>
      </motion.div>
    </section>
  );
}

// Home page: single-offer pricing card. The full tier ladder
// (Tōro / Operator / Leader / Enterprise / Outcome) lives at /pricing.
function Pricing() {
  return (
    <section className="py-20 px-6" style={{ background: PEARL.bg }}>
      <div className="max-w-3xl mx-auto rounded-2xl border border-[#0F2A26]/10 bg-white p-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#7A8B82] mb-4">The offer</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#0F2A26] mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
          Pilot Sprint · NZ$5,000 + GST
        </h2>
        <p className="text-[#0F2A26]/75 mb-8 text-lg">
          Two weeks. One painful workflow automated. Or your money back.
        </p>
        <a href="/contact" data-cta="pricing-primary"
           className="inline-flex rounded-full bg-[#0F2A26] px-7 py-3 text-white font-medium hover:bg-[#1F4D47] transition">
          Start your Pilot Sprint
        </a>
      </div>
    </section>
  );
}


function Closing() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 180, paddingBottom: 180, background: PEARL.bg }}
    >
      {/* Closing kete trio — canonical FeatherKete imagery, soft and low in the frame */}
      <div
        className="absolute hidden md:flex items-center justify-center gap-12 pointer-events-none"
        style={{
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1100,
          height: 520,
          opacity: 0.55,
        }}
        aria-hidden
      >
        <Suspense fallback={null}>
          <FeatherKete variant="manaaki" size={280} drift="slow" />
          <FeatherKete variant="base" size={360} drift="slow" />
          <FeatherKete variant="auaha" size={280} drift="slow" />
        </Suspense>
      </div>

      <motion.div {...fadeUp} className="max-w-[900px] mx-auto px-6 text-center relative z-10">
        <Eyebrow>{" "}</Eyebrow>
        <Serif size="xl" className="mb-20">
          {" "}
        </Serif>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 64 }}>
          {[
            " ",
            "The guest greeted properly.",
            "The team member looked in the eye.",
            "The evening that starts on time.",
          ].map((l) => (
            <p
              key={l}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(24px, 2.4vw, 34px)",
                color: PEARL.ink,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {l}
            </p>
          ))}
        </div>

        <InkButton to="/start">Start with one kete →</InkButton>
      </motion.div>
    </section>
  );
}

function PearlFooter() {
  return (
    <footer style={{ paddingTop: 80, paddingBottom: 80, background: PEARL.bg, borderTop: `1px solid ${PEARL.opal}` }}>
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 text-center">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 24,
            color: PEARL.ink,
            marginBottom: 16,
          }}
        >
          assembl<span style={{ color: PEARL.pounamu }}>.</span>
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 18,
            color: PEARL.pounamu,
            marginBottom: 8,
          }}
        >
          Premium intelligence with a human heart.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(15,42,38,0.6)", marginBottom: 24 }}>
          Time is the most valuable thing you own. Assembl gives it back.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(15,42,38,0.45)", letterSpacing: "0.04em" }}>
          Assembl · Built in Aotearoa · assembl.co.nz
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function PearlIndex() {
  useEffect(() => {
    track("page_version_seen", { page: "/", version: "two_vertical_v1" });
  }, []);

  // JSON-LD for the Pilot Sprint offer.
  const pilotOfferJsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": "https://www.assembl.co.nz/#pilot-sprint",
    name: "Pilot Sprint",
    description:
      "Two-week pilot sprint for Customs Brokers and Architectural firms. One painful workflow automated, or your money back.",
    url: "https://www.assembl.co.nz/contact",
    price: "5000",
    priceCurrency: "NZD",
    priceSpecification: {
      "@type": "PriceSpecification",
      price: "5000",
      priceCurrency: "NZD",
      valueAddedTaxIncluded: false,
      description: "NZD 5,000 ex GST. Two weeks. Money-back guarantee.",
    },
    eligibleRegion: { "@type": "Country", name: "New Zealand" },
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Assembl", url: "https://www.assembl.co.nz" },
    category: "Pilot programme",
  };

  return (
    <>
      <SEO
        title="Assembl — Quiet AI that gives time back · Pilot Sprint NZ$5,000"
        ogTitle="Quiet AI that gives time back — Pilot Sprint NZ$5,000"
        description="Specialist AI advisory for Customs Brokers and Architectural firms. Two-week Pilot Sprint, NZ$5,000 + GST. One painful workflow automated, or your money back."
        path="/"
        image="https://www.assembl.co.nz/assembl-og.png"
        imageAlt="Assembl — quiet AI for NZ Customs Brokers and Architectural firms. Pilot Sprint NZ$5,000."
        twitterCreator="@AssemblNZ"
        jsonLd={pilotOfferJsonLd}
      />
      <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
        <MinimalNav />
        <Hero />
        <TwoVerticalProblem />
        <Pricing />
        <Tikanga />
        <Closing />
        <PearlFooter />
      </div>
    </>
  );
}
