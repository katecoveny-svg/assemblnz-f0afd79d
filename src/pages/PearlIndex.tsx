import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

const PearlGlobe = lazy(() => import("@/components/pearl/PearlGlobe"));
const RoomCloud = lazy(() => import("@/components/pearl/RoomCloud"));
const FairyLightStrand = lazy(() =>
  import("@/components/pearl/FluffyCloud").then((m) => ({ default: m.FairyLightStrand }))
);

/* ─── Pearl palette — ICY (cool, luminous, moonlit dawn) ─── */
const PEARL = {
  bg: "#FBFAF7",         // Icy Pearl — primary canvas
  linen: "#F3F4F2",      // Moonstone — section break tint
  moonstone: "#F3F4F2",  // alias
  opal: "#E8EEEC",       // Opal Shimmer — radial washes, globe feathering
  ink: "#0E1513",
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
    className="uppercase mb-8"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      letterSpacing: "0.32em",
      color: PEARL.pounamu,
      fontWeight: 500,
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
      color: "rgba(14,21,19,0.72)",
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

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "92vh", background: PEARL.bg }}
    >
      {/* Hero is a calm "room" with a photoreal cumulus cloud floating inside.
          The cloud reacts to cursor with parallax, ambient bob, and sparkles. */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <RoomCloud height={820} />
        </Suspense>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10" style={{ paddingTop: "16vh" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <Eyebrow>Assembl · Built in Aotearoa</Eyebrow>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{ duration: 1.2, ease, delay: 0.15 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(48px, 7.6vw, 104px)",
            lineHeight: 1.04,
            letterSpacing: "-0.018em",
            color: PEARL.ink,
            maxWidth: "16ch",
            margin: 0,
          }}
        >
          Trusted AI solutions for Aotearoa.{" "}
          <span style={{ fontStyle: "italic", color: PEARL.pounamu, fontWeight: 400 }}>
            built to give you valuable time back.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.5 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(20px, 1.9vw, 26px)",
            color: PEARL.pounamu,
            marginTop: 28,
            letterSpacing: "0.005em",
          }}
        >
          Premium intelligence that understands what matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.7 }}
          style={{ maxWidth: 620, marginTop: 36 }}
        >
          <Body large>
            NZ specialist AI agents and workflows designed to help business, teams and communities move through complexity with more control and clarity. Every workflow produces a pack that can be filed or audited - and stays current as the law changes.
          </Body>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.9 }}
          className="flex items-center gap-8 flex-wrap"
          style={{ marginTop: 44 }}
        >
          <InkButton to="/how-it-works">See what a quiet day looks like</InkButton>
          <InkButton to="/pricing" variant="underline">View pricing</InkButton>
        </motion.div>
      </div>
    </section>
  );
}

function WhyAssembl() {
  return (
    <section className="relative" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      {/* Quiet globe top-right */}
      <div className="absolute hidden lg:block" style={{ top: 80, right: "-4%", width: 280, height: 280 }}>
        <Suspense fallback={null}>
          <PearlGlobe size={280} drift="slow" opacity={0.55} />
        </Suspense>
      </div>

      <motion.div {...fadeUp} className="max-w-[680px] mx-auto px-6">
        <Eyebrow>Why Assembl</Eyebrow>
        <Serif size="lg">Assembl exists because time matters.</Serif>

        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            "I know what overwork feels like. I know what constant motion costs.",
            "I know what it’s like to be stretched between ambition, responsibility, and family.",
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

        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 14 }}>
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
      {/* Soft ribbon system flowing horizontally behind the section */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: 360 }}>
        <Suspense fallback={null}>
          <DataRibbons intensity="soft" tone="mixed" height={360} opacity={0.45} />
        </Suspense>
      </div>

      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10">
        <Eyebrow>What Assembl is</Eyebrow>
        <Serif size="lg" className="mb-10">
          A platform of practical AI agents that finish the work — and give the time back.
        </Serif>
        <div style={{ maxWidth: 680, marginBottom: 96 }}>
          <Body large>
            Assembl is a New Zealand-built platform of specialist AI agents — one for hospitality, construction, automotive, freight, creative, retail, early childhood, and one for the household. Each agent runs an end-to-end workflow for you and closes it with a single evidence pack: source-cited, audit-ready, dated, current with New Zealand law.
          </Body>
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
          <div>
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
              Efficient, end-to-end, in your industry. A food diary. A site induction. A customs clearance. A contract review. A WoF reminder. A privacy check. The agent runs the whole loop in the background — and hands you a finished pack, not another dashboard to manage.
            </Body>
          </div>
          <div>
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

          {/* Small feathery globe between columns */}
          <div className="hidden md:block absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200 }}>
            <Suspense fallback={null}>
              <PearlGlobe size={200} drift="med" opacity={0.55} />
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
      {/* Fairy-light strand draping across the top of the section */}
      <div className="absolute pointer-events-none" style={{ top: 24, left: "8%", right: "8%", display: "flex", justifyContent: "space-between" }}>
        <Suspense fallback={null}>
          <FairyLightStrand width={360} height={70} bulbs={8} direction="drape" />
        </Suspense>
        <Suspense fallback={null}>
          <FairyLightStrand width={300} height={60} bulbs={6} direction="drape" />
        </Suspense>
      </div>
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
              <div className="absolute -top-2 -right-4 hidden md:block" style={{ width: 70, height: 70 }}>
                <Suspense fallback={null}>
                  <PearlGlobe size={70} drift="slow" opacity={0.45} />
                </Suspense>
              </div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: 56,
                  color: PEARL.pounamu,
                  display: "block",
                  marginBottom: 16,
                  lineHeight: 1,
                }}
              >
                {s.n}
              </span>
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
  { mi: "Manaaki", en: "Hospitality", line: "Food diary, licensing, rostering — closed daily.", to: "/manaaki" },
  { mi: "Waihanga", en: "Construction", line: "Site inductions, consenting, H&S evidence — packed per project.", to: "/waihanga/about" },
  { mi: "Auaha", en: "Creative", line: "Contracts, IP clearance, invoicing — ready to send.", to: "/auaha/about" },
  { mi: "Arataki", en: "Automotive & Fleet", line: "MVSA, RUC, WoF, Land Transport — current as the law updates.", to: "/arataki" },
  { mi: "Pikau", en: "Freight & Customs", line: "Customs & Excise, biosecurity, import health — evidence every shipment.", to: "/pikau" },
  { mi: "Hoko", en: "Retail", line: "Compliance, stock, trading standards — end of day, closed.", to: "/hoko" },
  { mi: "Ako", en: "Early Childhood", line: "Ratios, safety, registrations — pack filed, not chased.", to: "/ako" },
  { mi: "Tōro", en: "Family", line: "The household load, quietly organised. $29 a month.", to: "/toroa" },
];

function KetesGrid() {
  return (
    <section className="relative" style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.bg }}>
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>What it covers</Eyebrow>
        <Serif size="lg">Built for the way New Zealand actually works.</Serif>
        <div style={{ maxWidth: 680, marginTop: 24, marginBottom: 80 }}>
          <Body large>Eight packs. One quiet intelligence layer behind all of them.</Body>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {KETES.map((k, i) => (
            <motion.div
              key={k.mi}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.05 }}
            >
              <Link to={k.to} className="block group" data-magnetic>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: PEARL.pounamu,
                    letterSpacing: "0.02em",
                    marginBottom: 8,
                    fontWeight: 400,
                  }}
                >
                  {k.mi}
                </p>
                <Serif size="xs" className="mb-3">{k.en}</Serif>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(14,21,19,0.65)",
                  }}
                >
                  {k.line}
                </p>
                <div
                  style={{
                    height: 1,
                    background: PEARL.seaGlass,
                    marginTop: 24,
                    opacity: 0.5,
                    transition: "opacity 0.3s",
                  }}
                  className="group-hover:opacity-100"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 48, maxWidth: 680 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(14,21,19,0.55)",
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
      style={{ paddingTop: 180, paddingBottom: 180, background: PEARL.bg }}
    >
      {/* Soft opal wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(232,238,236,0.55) 0%, transparent 70%)",
        }}
      />
      {/* Centrepiece globe */}
      <div className="absolute hidden md:block" style={{ top: "50%", left: "50%", transform: "translate(-50%, -55%)", width: 460, height: 460, opacity: 0.7 }}>
        <Suspense fallback={null}>
          <PearlGlobe size={460} drift="slow" opacity={0.7} />
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

const TIERS = [
  { name: "Tōro", sub: "Family", price: "$29", per: "/ mo", setup: "No setup", desc: "A household that runs itself." },
  { name: "Operator", sub: "1 industry pack", price: "$1,490", per: "/ mo", setup: "+ $590 setup", desc: "One industry pack plus the full platform." },
  { name: "Leader", sub: "2 industry packs", price: "$1,990", per: "/ mo", setup: "+ $1,290 setup", desc: "Two industry packs plus the full platform." },
  { name: "Enterprise", sub: "All 7 packs", price: "$2,990", per: "/ mo", setup: "+ $2,890 setup", desc: "Every industry pack plus the full platform." },
  { name: "Outcome", sub: "Custom", price: "from $5,000", per: "", setup: "Bespoke engagement", desc: "When the work is bespoke and the pack is the contract." },
];

function Pricing() {
  return (
    <section style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.linen, position: "relative", overflow: "hidden" }}>
      {/* Soft fairy strand at the top — draped between section breaks */}
      <div className="absolute pointer-events-none" style={{ top: 32, left: "50%", transform: "translateX(-50%)" }}>
        <Suspense fallback={null}>
          <FairyLightStrand width={420} height={80} bulbs={9} direction="drape" />
        </Suspense>
      </div>
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>Pricing</Eyebrow>
        <Serif size="lg" className="mb-20">
          One quiet subscription. No surprises.
        </Serif>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-12">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.06 }}
              style={{ borderLeft: i === 0 ? "none" : `1px solid ${PEARL.seaGlass}`, paddingLeft: i === 0 ? 0 : 24 }}
              className="md:pl-6"
            >
              <Serif size="sm" className="mb-2">{t.name}</Serif>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(14,21,19,0.5)",
                  marginBottom: 24,
                }}
              >
                {t.sub}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: 36,
                    color: PEARL.ink,
                    lineHeight: 1,
                  }}
                >
                  {t.price}
                </span>
                {t.per && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(14,21,19,0.55)" }}>
                    {t.per}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(14,21,19,0.55)", marginBottom: 16 }}>
                {t.setup}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(14,21,19,0.75)", lineHeight: 1.55 }}>
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(14,21,19,0.55)",
            marginTop: 64,
            maxWidth: 720,
            lineHeight: 1.6,
          }}
        >
          Every paid tier includes the cross-cutting agents — HR (Aroha), security (Signal), monitoring (Sentinel). NZD, GST exclusive. 12% off annual with code <strong style={{ color: PEARL.ink }}>ANNUAL12</strong>.
        </p>
      </motion.div>
    </section>
  );
}

function Closing() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 200, paddingBottom: 200, background: PEARL.bg }}
    >
      {/* Soft closing ribbon */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: 420 }}>
        <Suspense fallback={null}>
          <DataRibbons intensity="soft" tone="mixed" height={420} opacity={0.4} />
        </Suspense>
      </div>

      {/* Largest globe of the page, drifting behind the text */}
      <div
        className="absolute hidden md:block"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 720,
          height: 720,
          opacity: 0.6,
        }}
      >
        <Suspense fallback={null}>
          <PearlGlobe size={720} drift="slow" opacity={0.6} />
        </Suspense>
      </div>

      <motion.div {...fadeUp} className="max-w-[900px] mx-auto px-6 text-center relative z-10">
        <Eyebrow>What it gives you back</Eyebrow>
        <Serif size="xl" className="mb-20">
          The day you actually wanted.
        </Serif>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 64 }}>
          {[
            "The 6:45am kitchen.",
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

        <InkButton to="/start">Start with one pack →</InkButton>
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
          Assembl<span style={{ color: PEARL.pounamu }}>.</span>
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
          Premium intelligence that understands what matters.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(14,21,19,0.6)", marginBottom: 24 }}>
          Time is the thing. We give it back.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(14,21,19,0.45)", letterSpacing: "0.04em" }}>
          Assembl · Built in Aotearoa · assembl.co.nz
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function PearlIndex() {
  return (
    <>
      <SEO
        title="Assembl — Premium intelligence that understands what matters"
        description="NZ specialist AI agents and workflows designed to help business, teams and communities move through complexity with more control and clarity. Every workflow produces a pack that can be filed or audited - and stays current as the law changes."
      />
      <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
        <BrandNav />
        <Hero />
        <WhyAssembl />
        <WhatAssemblIs />
        <HowItWorks />
        <KetesGrid />
        <LiveCompliance />
        <Tikanga />
        <Pricing />
        <Closing />
        <PearlFooter />
      </div>
    </>
  );
}
