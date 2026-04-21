import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "92vh", background: PEARL.bg }}
    >
      {/* Soft icy backdrop wash — full-bleed, anchored on right where the kete lives */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 72% 42%, rgba(255,236,210,0.55) 0%, rgba(255,236,210,0.18) 38%, transparent 68%), radial-gradient(ellipse 70% 60% at 28% 72%, rgba(228,238,236,0.5) 0%, transparent 70%), linear-gradient(180deg, rgba(255,248,236,0.35) 0%, transparent 55%)",
        }}
      />
      {/* Horizontal pearl band — unifies hero across full width so the kete reads as one continuous atmosphere */}
      <div
        className="absolute hidden md:block pointer-events-none"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background:
            "radial-gradient(ellipse 65% 55% at 75% 45%, rgba(255,242,222,0.42) 0%, rgba(255,242,222,0.12) 45%, transparent 70%)",
        }}
      />
      {/* Desktop: kete nested INSIDE a warm pearl cloud — TRUE full-bleed across the whole hero */}
      <div
        className="absolute hidden md:block pointer-events-none"
        style={{
          inset: 0,
          width: "100%",
          height: "100%",
          // Soft radial mask so the kete container has NO visible edge — it dissolves into the page
          maskImage:
            "radial-gradient(ellipse 60% 70% at 70% 50%, black 28%, rgba(0,0,0,0.55) 55%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 70% at 70% 50%, black 28%, rgba(0,0,0,0.55) 55%, transparent 82%)",
        }}
      >
        {/* Layer 0 — warm pearl cumulus that wraps the kete */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Suspense fallback={null}>
            <HeroCloud height={820} opacity={0.95} />
          </Suspense>
        </div>
        {/* Layer 0.5 — Aotearoa silhouette watermark, hand-traced inside the mist */}
        <svg
          viewBox="0 0 200 320"
          width={280}
          height={448}
          className="absolute"
          style={{
            top: "30%",
            left: "42%",
            filter: "blur(1.4px)",
            opacity: 0.7,
            mixBlendMode: "multiply",
          }}
          aria-hidden="true"
        >
          {/* North Island — softened hand-traced shape */}
          <path
            d="M118 24 C 132 30 138 46 134 60 C 142 70 150 86 146 102 C 158 110 162 128 152 142 C 156 158 148 174 132 178 C 122 188 106 188 96 180 C 82 184 68 174 70 158 C 60 150 60 134 70 124 C 64 110 72 92 88 88 C 92 72 102 58 104 44 C 106 32 110 24 118 24 Z"
            fill="rgba(31,77,71,0.06)"
          />
          {/* South Island */}
          <path
            d="M70 196 C 88 198 110 210 124 226 C 138 242 142 264 130 282 C 116 298 92 304 70 296 C 50 288 38 268 42 248 C 46 228 56 210 70 196 Z"
            fill="rgba(31,77,71,0.06)"
          />
          {/* Stewart Island — tiny dot */}
          <ellipse cx="92" cy="312" rx="6" ry="3.5" fill="rgba(31,77,71,0.05)" />
        </svg>
        {/* Layer 1 — the kete, nested in the mist */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Suspense fallback={null}>
            <KeteFocus size={680} sparkles={56} rimSparkles={40} priority warmGlow />
          </Suspense>
        </div>
      </div>
      {/* Mobile: kete in cloud, behind copy — TRUE full-bleed (100vw) so it spans the whole device width */}
      <div
        className="absolute md:hidden pointer-events-none"
        style={{
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          height: "min(78vh, 560px)",
          opacity: 0.95,
          maskImage:
            "radial-gradient(ellipse 80% 65% at 50% 50%, black 32%, rgba(0,0,0,0.55) 60%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 65% at 50% 50%, black 32%, rgba(0,0,0,0.55) 60%, transparent 88%)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Suspense fallback={null}>
            <HeroCloud height={520} opacity={0.85} />
          </Suspense>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Suspense fallback={null}>
            <KeteFocus size={Math.min(420, typeof window !== "undefined" ? window.innerWidth * 0.92 : 380)} sparkles={32} priority warmGlow />
          </Suspense>
        </div>
      </div>
      {/* Bottom fade — bleeds the hero atmosphere into the next section seamlessly */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "18%",
          background: `linear-gradient(180deg, transparent 0%, ${PEARL.bg} 100%)`,
        }}
      />

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
          Built for the way New Zealand actually works.
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
            NZ specialist AI agents and workflows that finish the work — and give you valuable time back. Every workflow produces a pack that can be filed or audited, and stays current as the law changes.
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
    <section className="relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 96, background: PEARL.bg }}>

      <motion.div {...fadeUp} className="max-w-[680px] mx-auto px-6">
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

      {/* Quiet cloud breaks the page beneath the text */}
      <div className="relative mx-auto hidden md:flex items-center justify-center pointer-events-none" style={{ width: 240, height: 240, marginTop: 56 }}>
        <Suspense fallback={null}>
          <MiniCloud size={240} drift="slow" opacity={0.4} />
        </Suspense>
      </div>
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
