import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

const MiniCloud = lazy(() => import("@/components/pearl/MiniCloud"));
const KeteFocus = lazy(() => import("@/components/pearl/KeteFocus"));
const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));
const FairyLightStrand = lazy(() =>
  import("@/components/pearl/FluffyCloud").then((m) => ({ default: m.FairyLightStrand }))
);
const HeroCloud = lazy(() =>
  import("@/components/pearl/FluffyCloud").then((m) => ({ default: m.HeroCloud }))
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

const HERO_IMAGE = "/img/evidence/home-vessel.jpg";
const HERO_VIDEO = "/videos/vessel-rotate-720p.mp4";
const GOLD_THREAD = "#D4A853";

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

function Hero() {
  const reduceMotion = useReducedMotion();
  const coreInitial = reduceMotion ? false : { opacity: 0.76, y: 18 };
  const visualInitial = reduceMotion ? false : { opacity: 0.9, y: 24, scale: 0.985 };

  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:min-h-[88vh] lg:px-10 lg:py-28"
      style={{
        background:
          "linear-gradient(135deg, #FAF7F2 0%, #F4EFE6 42%, #E8EFE9 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 82% 16%, rgba(31,77,71,0.18), transparent 30%), radial-gradient(circle at 12% 88%, rgba(212,168,83,0.16), transparent 34%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-45 blur-3xl"
        style={{ background: "rgba(31,77,71,0.12)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "18%",
          background: `linear-gradient(180deg, transparent 0%, ${PEARL.bg} 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <motion.div
          className="lg:col-span-6"
          initial={coreInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Eyebrow>Assembl evidence vessel</Eyebrow>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(40px, 5.4vw, 74px)",
              lineHeight: 0.98,
              letterSpacing: "-0.01em",
              color: "#23211F",
              maxWidth: "14.5ch",
              margin: 0,
            }}
          >
            Specialist agents for NZ work that needs proof.
          </h1>

          <motion.div
            initial={coreInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.08, ease }}
            style={{ maxWidth: 590, marginTop: 22 }}
          >
            <Body>
              Assembl runs operational AI in the open: every workflow is grounded in New Zealand context, reviewed by people, and sealed with an evidence pack you can file, forward, or footnote.
            </Body>
          </motion.div>

          <motion.div
            initial={coreInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.16, ease }}
            className="flex items-center gap-4 flex-wrap pl-16"
            style={{ marginTop: 24 }}
          >
            <InkButton to="/demos">Run a proof demo</InkButton>
            <InkButton to="/kete" variant="outline">Explore kete</InkButton>
          </motion.div>

          <motion.div
            className="grid max-w-[620px] gap-3 sm:grid-cols-3"
            initial={coreInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.24, ease }}
            style={{ marginTop: 40 }}
          >
            {["Privacy Act aware", "Human sign-off", "Evidence pack sealed"].map((item) => (
              <div
                key={item}
                className="rounded-[18px] px-4 py-3 text-[11px] uppercase"
                style={{
                  background: "rgba(250,247,242,0.72)",
                  border: "1px solid rgba(31,77,71,0.16)",
                  color: PEARL.pounamu,
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.16em",
                }}
              >
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative lg:col-span-6"
          initial={visualInitial}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.08, ease }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[34px] border border-white/70 bg-white/40 shadow-[0_34px_90px_-42px_rgba(35,33,31,0.42)]">
            <video
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply"
              autoPlay={!reduceMotion}
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
            <img
              src={HERO_IMAGE}
              alt="Assembl Evidence Vessel sculptural pounamu form"
              className="relative z-10 h-full w-full object-cover"
              fetchPriority="high"
            />
            <div
              aria-hidden
              className="absolute inset-x-8 bottom-8 z-20 flex items-center justify-between rounded-full px-4 py-3 text-[10px] uppercase backdrop-blur-xl"
              style={{
                background: "rgba(250,247,242,0.74)",
                border: "1px solid rgba(255,255,255,0.7)",
                color: "#23211F",
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.18em",
              }}
            >
              <span>Evidence vessel</span>
              <span style={{ color: GOLD_THREAD }}>sealed proof</span>
            </div>
          </div>
          <div
            aria-hidden
            className="absolute -bottom-8 left-1/2 h-16 w-[72%] -translate-x-1/2 rounded-full blur-2xl"
            style={{ background: "rgba(31,77,71,0.16)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function WhyAssembl() {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 96, background: PEARL.bg }}>
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
    <section className="relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 96, background: PEARL.bg }}>
      {/* (atmospheric ribbon removed — hero room cloud carries the section) */}

      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10">
        <Eyebrow>What Assembl is</Eyebrow>
        <Serif size="lg" className="mb-10">
          A platform of practical specialist agents that finish the work — and give the time back.
        </Serif>
        <div style={{ maxWidth: 680, marginBottom: 56 }}>
          <Body large>
            Assembl is a New Zealand-built platform of specialist agents — one for hospitality, construction, automotive, freight, creative, retail, early childhood, and one for the household. Each agent runs an end-to-end workflow for you and closes it with a single evidence pack: source-cited, audit-ready, dated, current with New Zealand law.
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

          {/* Background feathery cloud — large, soft, sits behind the columns */}
          <div
            className="hidden md:block absolute pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 880,
              height: 880,
              zIndex: 0,
            }}
          >
            <Suspense fallback={null}>
              <MiniCloud size={880} drift="slow" opacity={0.32} />
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
      style={{ paddingTop: 180, paddingBottom: 180, background: PEARL.bg }}
    >
      {/* Soft opal wash — golden-hour through mist */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(232,238,236,0.55) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 50% 40%, rgba(248,233,196,0.22) 0%, transparent 70%)",
        }}
      />
      {/* Atmospheric wisp tucked top-right */}
      <div className="absolute hidden md:block pointer-events-none" style={{ top: 48, right: "8%", width: 180, height: 180 }}>
        <Suspense fallback={null}>
          <MiniCloud size={180} drift="slow" opacity={0.35} />
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

/* ─── See it in action — surface the live demos already wired into the platform ─── */
const SEE_IT_DEMOS = [
  {
    n: "01",
    mi: "Kaitiaki",
    en: "Tikanga gate",
    line: "How tikanga shapes every Assembl decision — four pou, four checks, before any output ships.",
    to: "/demos/kaitiaki-gate",
  },
  {
    n: "02",
    mi: "Tukanga",
    en: "Compliance pipeline",
    line: "Five quiet stages from intent to evidence — Kahu, Iho, Tā, Mahara, Mana.",
    to: "/demos/pipeline",
  },
  {
    n: "03",
    mi: "Pukapuka",
    en: "Evidence pack",
    line: "What a finished, source-cited, audit-ready pack actually looks like when the work is done.",
    to: "/demos/evidence-pack",
  },
  {
    n: "04",
    mi: "Hui",
    en: "Meeting copilot",
    line: "Notes, summaries and follow-ups — kept quietly alongside your day, not after it.",
    to: "/hui",
  },
];

function SeeItInAction() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 160, paddingBottom: 160, background: PEARL.linen }}
    >
      {/* Soft fairy strand at the top — matches the rhythm used elsewhere on Pearl */}
      <div className="absolute pointer-events-none" style={{ top: 32, left: "50%", transform: "translateX(-50%)" }}>
        <Suspense fallback={null}>
          <FairyLightStrand width={420} height={80} bulbs={9} direction="drape" />
        </Suspense>
      </div>

      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10">
        <Eyebrow>See it in action</Eyebrow>
        <Serif size="lg">Four quiet demonstrations.</Serif>
        <div style={{ maxWidth: 680, marginTop: 24, marginBottom: 80 }}>
          <Body large>
            The platform behind the kete. Four short walk-throughs you can browse without signing up — the cultural gate, the compliance pipeline, the evidence pack, and the meeting copilot.
          </Body>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {SEE_IT_DEMOS.map((d, i) => (
            <motion.div
              key={d.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.06 }}
            >
              <Link
                to={d.to}
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
                  minHeight: 280,
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
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: 28,
                    color: PEARL.pounamu,
                    letterSpacing: "0.04em",
                    marginBottom: 24,
                    lineHeight: 1,
                  }}
                >
                  {d.n}
                </p>
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
                  {d.mi}
                </p>
                <Serif size="sm" className="mb-3">{d.en}</Serif>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(15,42,38,0.7)",
                    flex: 1,
                  }}
                >
                  {d.line}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: PEARL.ink,
                    marginTop: 24,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                  }}
                >
                  Open demo →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 56, maxWidth: 680 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(15,42,38,0.55)",
              lineHeight: 1.6,
            }}
          >
            Each demonstration is a working slice of the production platform — the same gate, pipeline, pack and copilot every kete uses. No signup. Browse the
            {" "}
            <Link to="/demos" style={{ color: PEARL.ink, borderBottom: `1px solid ${PEARL.ink}` }}>
              full demos hub
            </Link>
            {" "}
            for confidence scoring and more.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

const TIERS = [
  { name: "Tōro", sub: "Family", price: "$29", per: "/ mo", setup: "No setup", desc: "A household that runs itself." },
  { name: "Operator", sub: "1 Kete", price: "$1,490", per: "/ mo", setup: "+ $590 setup", desc: "One kete plus the full platform." },
  { name: "Leader", sub: "2 Ketes", price: "$1,990", per: "/ mo", setup: "+ $1,290 setup", desc: "Two ketes plus the full platform." },
  { name: "Enterprise", sub: "All 7 Ketes", price: "$2,990", per: "/ mo", setup: "+ $2,890 setup", desc: "Every kete plus the full platform." },
  { name: "Outcome", sub: "Custom", price: "from $5,000", per: "", setup: "Bespoke engagement", desc: "When the work is bespoke and the evidence pack is the contract." },
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
                  color: "rgba(15,42,38,0.5)",
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
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(15,42,38,0.55)" }}>
                    {t.per}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(15,42,38,0.55)", marginBottom: 16 }}>
                {t.setup}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(15,42,38,0.75)", lineHeight: 1.55 }}>
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(15,42,38,0.55)",
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
      {/* Closing cloud — softer, lower in the frame than the hero, holding the most generous spread of fairy lights */}
      <div
        className="absolute hidden md:flex items-center justify-center pointer-events-none"
        style={{
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1100,
          height: 620,
          opacity: 0.85,
        }}
      >
        <Suspense fallback={null}>
          <HeroCloud height={520} opacity={0.85} />
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
          Premium intelligence that understands what matters.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(15,42,38,0.6)", marginBottom: 24 }}>
          Time is the thing. We give it back.
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
  return (
    <>
      <SEO
        title="Assembl — Premium intelligence that understands what matters"
        description="NZ specialist agents and workflows designed to help business, teams and communities move through complexity with more control and clarity. Every workflow produces a pack that can be filed or audited - and stays current as the law changes."
      />
      <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
        <BrandNav />
        <Hero />
        <WhyAssembl />
        <WhatAssemblIs />
        <HowItWorks />
        <KetesGrid />
        <LiveCompliance />
        <SeeItInAction />
        <Tikanga />
        <Pricing />
        <Closing />
        <PearlFooter />
      </div>
    </>
  );
}
