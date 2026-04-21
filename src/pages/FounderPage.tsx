import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import portraitImg from "@/assets/founder-kate-portrait.jpg";
import workingImg from "@/assets/founder-kate-working.jpg";

const PearlGlobe = lazy(() => import("@/components/pearl/PearlGlobe"));
const DataRibbons = lazy(() => import("@/components/pearl/FluffyCloud"));

/* Warm Pearl palette — same tokens as PearlIndex */
const PEARL = {
  bg: "#FAF6EF",
  linen: "#F4EFE6",
  ink: "#0E1513",
  pounamu: "#1F4D47",
  seaGlass: "#C4D6D2",
  opal: "#E8EEEC",
  harbour: "#1B2A2E",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease },
};

/* ─── Atomic typography ─── */
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
  weight = 300,
  className = "",
}: {
  children: React.ReactNode;
  italic?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  color?: string;
  weight?: 300 | 400 | 500;
  className?: string;
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
        lineHeight: size === "xxl" || size === "xl" ? 1.05 : 1.18,
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
  large = false,
  className = "",
}: {
  children: React.ReactNode;
  large?: boolean;
  className?: string;
}) => (
  <p
    className={className}
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: large ? 18 : 17,
      lineHeight: 1.6,
      color: "rgba(14,21,19,0.74)",
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
        background: PEARL.ink,
        padding: "18px 32px",
        borderRadius: 8,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </Link>
  );
};

/* ─── HERO — portrait + headline (editorial split) ─── */
function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: PEARL.bg, paddingTop: 120, paddingBottom: 140 }}
    >
      {/* soft ribbon drifting behind the headline */}
      <div className="absolute inset-x-0 pointer-events-none" style={{ top: "20%", height: 420 }}>
        <Suspense fallback={null}>
          <DataRibbons intensity="soft" tone="seaglass" height={420} opacity={0.4} />
        </Suspense>
      </div>

      {/* small pearl globe drifting top-right */}
      <div
        className="absolute hidden md:block pointer-events-none"
        style={{ top: "8%", right: "-4%", width: 320, height: 320, opacity: 0.55 }}
      >
        <Suspense fallback={null}>
          <PearlGlobe size={320} drift="slow" opacity={0.6} />
        </Suspense>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 md:px-10 relative z-10">
        <motion.div {...fadeUp} className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          {/* Headline column */}
          <div className="md:col-span-7 order-2 md:order-1">
            <Eyebrow>The founder · Kate Hudson</Eyebrow>
            <Serif size="xxl" weight={300}>
              I built Assembl
              <br />
              to give time
            </Serif>
            <Serif size="xxl" weight={400} italic color={PEARL.pounamu}>
              back.
            </Serif>
            <div style={{ maxWidth: 520, marginTop: 32 }}>
              <Body large>
                Premium intelligence with a human heart — built in Aotearoa, for the people who carry too much at once.
              </Body>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-12">
              <InkButton to="/">See the platform</InkButton>
              <InkButton to="/pricing" variant="underline">
                View pricing
              </InkButton>
            </div>
          </div>

          {/* Portrait column */}
          <div className="md:col-span-5 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease }}
              className="relative"
              style={{
                borderRadius: 4,
                overflow: "hidden",
                boxShadow:
                  "0 30px 80px -40px rgba(14,21,19,0.18), 0 10px 30px -20px rgba(14,21,19,0.10)",
              }}
            >
              <img
                src={portraitImg}
                alt="Kate Hudson, founder of Assembl, photographed in warm New Zealand morning light"
                style={{ width: "100%", height: "auto", display: "block" }}
                loading="eager"
                fetchPriority="high"
              />
              {/* subtle pearl wash over edges to bond with canvas */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(250,246,239,0.06) 0%, rgba(250,246,239,0) 35%, rgba(250,246,239,0.18) 100%)",
                }}
              />
            </motion.div>
            <p
              className="mt-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(14,21,19,0.55)",
                letterSpacing: "0.01em",
              }}
            >
              Kate Hudson, founder · Aotearoa New Zealand
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Founder voice — narrow column, paragraph-as-moment ─── */
function FounderVoice() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: PEARL.bg, paddingTop: 160, paddingBottom: 160 }}
    >
      <motion.div
        {...fadeUp}
        className="max-w-[680px] mx-auto px-6 md:px-10"
      >
        <Eyebrow>In her own words</Eyebrow>
        <Serif size="lg" weight={300} className="mb-16">
          Assembl exists because time matters.
        </Serif>

        <div className="space-y-8">
          {[
            "I know what overwork feels like. I know what constant motion costs.",
            "I know what it's like to be stretched between ambition, responsibility, and family.",
            "I built Assembl for New Zealand families, teams, and communities — for the people carrying too much at once, for the businesses trying to stay compliant as the law keeps changing, for the evenings that never start on time.",
          ].map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(22px, 2vw, 26px)",
                lineHeight: 1.5,
                color: PEARL.ink,
                letterSpacing: "-0.005em",
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

/* ─── Working portrait — full-bleed editorial moment ─── */
function WorkingPortrait() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: PEARL.linen, paddingTop: 120, paddingBottom: 120 }}
    >
      <motion.div {...fadeUp} className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div
          className="relative"
          style={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0 40px 100px -50px rgba(14,21,19,0.20), 0 12px 32px -20px rgba(14,21,19,0.08)",
          }}
        >
          <img
            src={workingImg}
            alt="Kate Hudson working on Assembl in soft New Zealand morning light"
            style={{ width: "100%", height: "auto", display: "block" }}
            loading="lazy"
          />
          {/* gentle pearl edge wash so the photo sits inside the linen, not on top of it */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(244,239,230,0.10) 0%, rgba(244,239,230,0) 25%, rgba(244,239,230,0) 75%, rgba(244,239,230,0.18) 100%)",
            }}
          />
        </div>
        <div className="grid md:grid-cols-12 gap-8 mt-12 max-w-[960px] mx-auto">
          <div className="md:col-span-5">
            <Eyebrow>The work, quietly done</Eyebrow>
          </div>
          <div className="md:col-span-7">
            <Body large>
              Assembl runs the loops in the background — privacy checks, contract reviews, food
              diaries, site inductions, customs clearances — and hands back a finished pack you can
              file, forward or footnote. Not another dashboard. A finished thing.
            </Body>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Belief — italic pounamu sign-off ─── */
function Belief() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: PEARL.bg, paddingTop: 160, paddingBottom: 160 }}
    >
      {/* soft ribbon system */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: 380 }}>
        <Suspense fallback={null}>
          <DataRibbons intensity="soft" tone="mixed" height={380} opacity={0.42} />
        </Suspense>
      </div>

      {/* small drifting globe */}
      <div
        className="absolute hidden md:block pointer-events-none"
        style={{ top: "10%", left: "-3%", width: 240, height: 240, opacity: 0.5 }}
      >
        <Suspense fallback={null}>
          <PearlGlobe size={240} drift="med" opacity={0.55} />
        </Suspense>
      </div>

      <motion.div
        {...fadeUp}
        className="max-w-[760px] mx-auto px-6 md:px-10 relative z-10"
      >
        <Eyebrow>The belief</Eyebrow>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(28px, 2.8vw, 40px)",
            lineHeight: 1.4,
            color: PEARL.ink,
            marginBottom: 32,
          }}
        >
          I believe AI should do more than make businesses efficient.
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(28px, 2.8vw, 40px)",
            lineHeight: 1.4,
            color: PEARL.pounamu,
          }}
        >
          It should give people time back.
          <br />
          Time to think. Time to be present.
          <br />
          Time for what matters most.
        </p>
      </motion.div>
    </section>
  );
}

/* ─── What I'm building — 3 quiet pillars ─── */
function ThreePillars() {
  const pillars = [
    {
      label: "Built in Aotearoa",
      body:
        "Assembl is grounded in New Zealand law, tikanga, and the way work actually happens here. Not retrofitted from somewhere else.",
    },
    {
      label: "A finished thing, every time",
      body:
        "Every loop closes with an evidence pack — source-cited, audit-ready, dated. File it. Forward it. Footnote it.",
    },
    {
      label: "Quiet, on purpose",
      body:
        "No dashboards to manage. No notifications to chase. The agent runs the work in the background and returns the time.",
    },
  ];
  return (
    <section
      style={{ background: PEARL.bg, paddingTop: 160, paddingBottom: 160 }}
    >
      <motion.div {...fadeUp} className="max-w-[1120px] mx-auto px-6 md:px-10">
        <Eyebrow>What I'm building</Eyebrow>
        <Serif size="lg" weight={300} className="mb-20" >
          Practical AI agents that finish the work.
        </Serif>
        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {pillars.map((p, i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${PEARL.seaGlass}`,
                paddingTop: 28,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 14,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: PEARL.pounamu,
                  marginBottom: 16,
                }}
              >
                0{i + 1} · {p.label}
              </p>
              <Body>{p.body}</Body>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Closing — signature + CTA ─── */
function Closing() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: PEARL.bg, paddingTop: 200, paddingBottom: 200 }}
    >
      {/* large pearl globe drifting behind */}
      <div
        className="absolute hidden md:block pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 640,
          height: 640,
          opacity: 0.5,
        }}
      >
        <Suspense fallback={null}>
          <PearlGlobe size={640} drift="slow" opacity={0.55} />
        </Suspense>
      </div>

      <motion.div
        {...fadeUp}
        className="max-w-[760px] mx-auto px-6 md:px-10 text-center relative z-10"
      >
        <Eyebrow>An invitation</Eyebrow>
        <Serif size="xl" weight={300}>
          If this resonates,
        </Serif>
        <Serif size="xl" weight={400} italic color={PEARL.pounamu}>
          come and build with us.
        </Serif>

        <div className="mt-16 flex flex-col items-center gap-6">
          <InkButton to="/onboarding">Start with one pack →</InkButton>
          <InkButton to="/contact" variant="underline">
            Or get in touch
          </InkButton>
        </div>

        <p
          className="mt-20"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 22,
            color: "rgba(14,21,19,0.55)",
          }}
        >
          — Kate
        </p>
      </motion.div>
    </section>
  );
}

/* ─── Page ─── */
export default function FounderPage() {
  return (
    <>
      <SEO
        title="Kate Hudson · Founder of Assembl"
        description="The founder of Assembl on why time matters — and what it means to build practical AI agents in Aotearoa New Zealand. Premium intelligence with a human heart."
      />
      <BrandNav />
      <main style={{ background: PEARL.bg }}>
        <Hero />
        <FounderVoice />
        <WorkingPortrait />
        <Belief />
        <ThreePillars />
        <Closing />
      </main>
      <BrandFooter />
    </>
  );
}
