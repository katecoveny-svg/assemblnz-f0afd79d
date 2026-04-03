import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#09090F",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(212,168,67,0.25)",
  gold: "#D4A843",
  pounamu: "#3A7D6E",
  pounamuLight: "#4D9E8C",
  navy: "#1A3A5C",
  white: "#FFFFFF",
  white60: "rgba(255,255,255,0.60)",
  white40: "rgba(255,255,255,0.40)",
  white20: "rgba(255,255,255,0.20)",
};

const T = {
  eyebrow: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "3.5px",
    textTransform: "uppercase" as const,
    color: C.gold,
  },
  h1: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 300,
    fontSize: "clamp(42px, 6vw, 80px)",
    lineHeight: 1.06,
    letterSpacing: "-1px",
  },
  h2: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 900,
    fontSize: "clamp(28px, 4vw, 44px)",
    lineHeight: 1.1,
    color: C.white,
  },
  h3: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    letterSpacing: "0.5px",
    color: C.gold,
  },
  body: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 300,
    fontSize: "17px",
    lineHeight: 1.75,
    color: C.white60,
  },
  bodyMed: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 400,
    fontSize: "15px",
    lineHeight: 1.7,
    color: C.white60,
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 400,
    fontSize: "12px",
    letterSpacing: "0.5px",
  },
};

// ─── Constellation mark (inline SVG) ─────────────────────────────────────────
const ConstellationMark = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Connection lines */}
    <line x1="24" y1="8" x2="10" y2="38" stroke={C.borderGold} strokeWidth="1.2" strokeOpacity="0.6" />
    <line x1="24" y1="8" x2="38" y2="38" stroke={C.pounamuLight} strokeWidth="1.2" strokeOpacity="0.5" />
    <line x1="10" y1="38" x2="38" y2="38" stroke={C.pounamu} strokeWidth="1.2" strokeOpacity="0.4" />
    {/* Top node — gold */}
    <circle cx="24" cy="8" r="4" fill={C.gold} />
    <circle cx="24" cy="8" r="7" fill={C.gold} fillOpacity="0.12" />
    {/* Bottom-left node — pounamu */}
    <circle cx="10" cy="38" r="3.5" fill={C.pounamu} />
    <circle cx="10" cy="38" r="6" fill={C.pounamu} fillOpacity="0.12" />
    {/* Bottom-right node — pounamu light */}
    <circle cx="38" cy="38" r="3" fill={C.pounamuLight} />
    <circle cx="38" cy="38" r="5.5" fill={C.pounamuLight} fillOpacity="0.12" />
  </svg>
);

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeUpView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

// ─── Reusable stat pill ───────────────────────────────────────────────────────
const StatPill = ({ value, label }: { value: string; label: string }) => (
  <div
    style={{
      background: "rgba(212,168,67,0.06)",
      border: `1px solid ${C.borderGold}`,
      borderRadius: "12px",
      padding: "20px 28px",
      textAlign: "center",
      flex: "1 1 160px",
      minWidth: "160px",
    }}
  >
    <div
      style={{
        ...T.mono,
        fontSize: "28px",
        fontWeight: 700,
        color: C.gold,
        letterSpacing: "-0.5px",
        marginBottom: "6px",
      }}
    >
      {value}
    </div>
    <div style={{ ...T.mono, color: C.white40 }}>{label}</div>
  </div>
);

// ─── Pou card ─────────────────────────────────────────────────────────────────
const PouCard = ({
  title,
  subtitle,
  body,
  delay,
}: {
  title: string;
  subtitle: string;
  body: string;
  delay: number;
}) => (
  <motion.div
    {...fadeUpView(delay)}
    style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${C.borderGold}`,
      borderRadius: "16px",
      padding: "28px 24px",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      flex: "1 1 220px",
      minWidth: "220px",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "2px",
        background: `linear-gradient(90deg, ${C.gold}, ${C.pounamu})`,
        borderRadius: "2px",
        marginBottom: "18px",
      }}
    />
    <div style={{ ...T.h3, marginBottom: "4px" }}>{title}</div>
    <div
      style={{
        ...T.mono,
        color: C.pounamu,
        marginBottom: "12px",
        fontSize: "11px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}
    >
      {subtitle}
    </div>
    <p style={{ ...T.bodyMed, fontSize: "14px", lineHeight: 1.65 }}>{body}</p>
  </motion.div>
);

// ─── Timeline item ────────────────────────────────────────────────────────────
const TimelineItem = ({
  year,
  label,
  active,
}: {
  year: string;
  label: string;
  active?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
    <div
      style={{
        width: active ? "14px" : "10px",
        height: active ? "14px" : "10px",
        borderRadius: "50%",
        background: active ? C.gold : C.pounamu,
        boxShadow: active ? `0 0 16px ${C.gold}60` : "none",
        marginBottom: "12px",
        flexShrink: 0,
      }}
    />
    <div
      style={{
        ...T.mono,
        color: active ? C.gold : C.white40,
        fontSize: "13px",
        fontWeight: active ? 700 : 400,
        marginBottom: "4px",
      }}
    >
      {year}
    </div>
    <div
      style={{
        ...T.bodyMed,
        fontSize: "12px",
        textAlign: "center",
        color: active ? C.white60 : C.white40,
        lineHeight: 1.4,
      }}
    >
      {label}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const BrandStoryPage = () => {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.white }}>
      <BrandNav />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 100px",
          overflow: "hidden",
        }}
      >
        {/* Starfield */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.55) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,0.45) 0%, transparent 100%)," +
              "radial-gradient(1.5px 1.5px at 44% 33%, rgba(255,255,255,0.5) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 58% 85%, rgba(255,255,255,0.4) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 67% 14%, rgba(255,255,255,0.55) 0%, transparent 100%)," +
              "radial-gradient(1.5px 1.5px at 78% 52%, rgba(255,255,255,0.45) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 88% 38%, rgba(255,255,255,0.5) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 6% 55%, rgba(255,255,255,0.35) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 35% 91%, rgba(255,255,255,0.4) 0%, transparent 100%)," +
              "radial-gradient(1.5px 1.5px at 92% 78%, rgba(255,255,255,0.5) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 20% 44%, rgba(255,255,255,0.35) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 51% 61%, rgba(255,255,255,0.4) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 74% 27%, rgba(255,255,255,0.45) 0%, transparent 100%)," +
              "radial-gradient(1.5px 1.5px at 3% 88%, rgba(255,255,255,0.35) 0%, transparent 100%)," +
              "radial-gradient(1px 1px at 96% 11%, rgba(255,255,255,0.5) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Radial glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            width: "900px",
            height: "600px",
            background: `radial-gradient(ellipse at center, ${C.gold}08 0%, ${C.pounamu}05 40%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "820px" }}>
          <motion.div {...fadeUp(0)} style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <ConstellationMark size={52} />
          </motion.div>

          <motion.p {...fadeUp(0.1)} style={T.eyebrow}>
            The Founding Story
          </motion.p>

          <motion.h1
            {...fadeUp(0.2)}
            style={{
              ...T.h1,
              margin: "20px 0 0",
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.pounamu} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Built from Aotearoa,
            <br />
            for Aotearoa.
          </motion.h1>

          <motion.p
            {...fadeUp(0.35)}
            style={{
              ...T.body,
              maxWidth: "560px",
              margin: "28px auto 0",
              fontSize: "18px",
            }}
          >
            New Zealand's first business intelligence platform — 43 specialist agents,
            16 industries, one unified system grounded in NZ law and culture.
          </motion.p>

          <motion.div
            {...fadeUp(0.5)}
            style={{ marginTop: "48px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              to="/signup"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${C.gold} 0%, #B8912A 100%)`,
                color: "#0A0A0F",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.3px",
                textDecoration: "none",
                boxShadow: `0 0 32px ${C.gold}30`,
                transition: "opacity 0.2s",
              }}
            >
              Start for free
            </Link>
            <Link
              to="/pricing"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                borderRadius: "10px",
                background: "transparent",
                color: C.white60,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                textDecoration: "none",
                border: `1px solid ${C.border}`,
                transition: "color 0.2s",
              }}
            >
              See pricing
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "180px",
            background: `linear-gradient(to bottom, transparent, ${C.bg})`,
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ── 2. THE PROBLEM ──────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: "1080px", margin: "0 auto" }}>
        <motion.div {...fadeUpView()}>
          <p style={T.eyebrow}>The Problem</p>
          <h2
            style={{
              ...T.h2,
              marginTop: "16px",
              marginBottom: "24px",
              maxWidth: "680px",
            }}
          >
            NZ businesses were drowning in complexity.
          </h2>
          <p style={{ ...T.body, maxWidth: "640px", marginBottom: "16px" }}>
            50+ Acts of Parliament. Six different software platforms. Compliance costs climbing every year.
            And not a single tool that understood New Zealand — its law, its culture, its people.
          </p>
          <p style={{ ...T.body, maxWidth: "640px", marginBottom: "56px" }}>
            Business owners were spending hours each week trying to keep up with legislation,
            chasing advisors, and making decisions without the intelligence layer they deserved.
          </p>
        </motion.div>

        <motion.div
          {...fadeUpView(0.15)}
          style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
        >
          <StatPill value="620,000" label="NZ SMEs" />
          <StatPill value="$4.2B" label="Compliance market" />
          <StatPill value="73%" label="Want AI tools" />
          <StatPill value="50+" label="Acts of Parliament" />
        </motion.div>
      </section>

      {/* ── 3. THE FOUNDER ──────────────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div {...fadeUpView()}>
            <p style={T.eyebrow}>The Founder</p>
          </motion.div>

          <div
            style={{
              display: "flex",
              gap: "64px",
              alignItems: "flex-start",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            {/* Left — identity */}
            <motion.div {...fadeUpView(0.1)} style={{ flex: "0 0 280px", minWidth: "220px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.gold}20, ${C.pounamu}20)`,
                  border: `2px solid ${C.borderGold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <ConstellationMark size={36} />
              </div>
              <h3
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 900,
                  fontSize: "24px",
                  color: C.white,
                  marginBottom: "6px",
                }}
              >
                Kate Hudson
              </h3>
              <p style={{ ...T.mono, color: C.pounamu, marginBottom: "4px" }}>Founder & CEO, Assembl</p>
              <p style={{ ...T.mono, color: C.white40, marginBottom: "24px" }}>Auckland, Aotearoa New Zealand</p>
              <div
                style={{
                  padding: "14px 18px",
                  background: `linear-gradient(135deg, ${C.pounamu}10, transparent)`,
                  border: `1px solid ${C.pounamu}30`,
                  borderRadius: "10px",
                }}
              >
                <p style={{ ...T.mono, color: C.pounamu, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
                  Whakapapa
                </p>
                <p style={{ ...T.bodyMed, fontSize: "13px", lineHeight: 1.6 }}>
                  Ngāi Te Rangi<br />
                  Tauranga Moana
                </p>
              </div>
            </motion.div>

            {/* Right — quote + story */}
            <motion.div {...fadeUpView(0.2)} style={{ flex: 1, minWidth: "280px" }}>
              <blockquote
                style={{
                  borderLeft: `3px solid ${C.pounamu}`,
                  paddingLeft: "28px",
                  marginBottom: "32px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "clamp(20px, 2.5vw, 28px)",
                    lineHeight: 1.5,
                    color: C.gold,
                    fontStyle: "italic",
                    marginBottom: "16px",
                  }}
                >
                  "I built Assembl because I couldn't find a single tool that understood NZ law,
                  NZ culture, and NZ business at the same time. So I made it."
                </p>
                <footer style={{ ...T.mono, color: C.white40 }}>— Kate Hudson, Founder</footer>
              </blockquote>

              <p style={{ ...T.body, marginBottom: "20px" }}>
                Kate built Assembl from a Māori worldview — one that sees intelligence as relational,
                not transactional. Where tools should serve people, not replace them. Where data
                has whakapapa and decisions have consequences for whānau.
              </p>
              <p style={{ ...T.body }}>
                That kaupapa runs through every agent, every prompt, every line of code.
                Assembl isn't just software. It's a commitment — to NZ business owners who
                deserve tools as smart as they are.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. THE NAME ─────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeUpView()}>
          <p style={T.eyebrow}>The Name</p>
          <h2 style={{ ...T.h2, marginTop: "16px", marginBottom: "24px" }}>
            What does Assembl mean?
          </h2>
        </motion.div>

        <motion.div {...fadeUpView(0.1)}>
          <p style={{ ...T.body, fontSize: "20px", lineHeight: 1.8, marginBottom: "24px" }}>
            To <span style={{ color: C.gold }}>assemble</span> — your team, your intelligence, your tools.
          </p>
          <p style={{ ...T.body, marginBottom: "24px" }}>
            Assembl is not a replacement for your people. It's an assembly of specialists
            working alongside you — 43 agents that know NZ law, understand your industry,
            and help you make better decisions, faster.
          </p>
          <p style={{ ...T.body }}>
            The missing 'e' is deliberate. We don't do unnecessary complexity.
            We strip back to what matters — pure, purposeful intelligence for NZ business.
          </p>
        </motion.div>

        <motion.div
          {...fadeUpView(0.2)}
          style={{
            display: "flex",
            gap: "1px",
            marginTop: "56px",
            justifyContent: "center",
          }}
        >
          {["A", "S", "S", "E", "M", "B", "L"].map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: "52px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 900,
                fontSize: "22px",
                color: i === 0 ? C.gold : C.white60,
                background: i === 0 ? `${C.gold}10` : C.surface,
                border: `1px solid ${i === 0 ? C.borderGold : C.border}`,
                borderRadius: "8px",
              }}
            >
              {letter}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 5. THE FOUR POU ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <motion.div {...fadeUpView()} style={{ marginBottom: "56px" }}>
            <p style={T.eyebrow}>Our Governance</p>
            <h2 style={{ ...T.h2, marginTop: "16px", maxWidth: "560px" }}>
              The Four Pou
            </h2>
            <p style={{ ...T.body, maxWidth: "560px", marginTop: "16px" }}>
              Every decision at Assembl is guided by four governance pillars drawn from
              te ao Māori — our framework for doing business well, with integrity.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <PouCard
              title="Rangatiratanga"
              subtitle="Self-determination"
              body="Your data, your rules. You retain full ownership and control over your business information. Assembl never sells, shares, or trains on your data without explicit consent."
              delay={0}
            />
            <PouCard
              title="Kaitiakitanga"
              subtitle="Stewardship"
              body="We care for the tools, the whenua, and the digital ecosystem. Building AI that serves people without depleting them — sustainable intelligence for long-term benefit."
              delay={0.1}
            />
            <PouCard
              title="Manaakitanga"
              subtitle="Care & Respect"
              body="We look after our customers like whānau. When you bring your business challenges to Assembl, you're met with genuine care, not a chatbot. Real support from real people."
              delay={0.2}
            />
            <PouCard
              title="Whanaungatanga"
              subtitle="Connection"
              body="Intelligence built on relationship, not extraction. Assembl is designed to deepen connections within your team and between your business and its community — not replace human judgment."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── 6. THE VISION ───────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div {...fadeUpView()} style={{ marginBottom: "64px" }}>
          <p style={T.eyebrow}>The Vision</p>
          <h2 style={{ ...T.h2, marginTop: "16px", marginBottom: "20px", maxWidth: "640px" }}>
            43 specialist agents. 16 industries. One platform.
          </h2>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(18px, 2.5vw, 26px)",
              color: C.pounamu,
              letterSpacing: "0.3px",
            }}
          >
            Built on NZ law.
          </p>
          <p style={{ ...T.body, maxWidth: "600px", marginTop: "20px" }}>
            From hospitality compliance to maritime regulations, from construction contracts
            to property law — Assembl is the intelligence layer NZ business has been waiting for.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div {...fadeUpView(0.2)}>
          <div
            style={{
              position: "relative",
              padding: "40px 24px 48px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            {/* Connecting line */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "54px",
                left: "12.5%",
                right: "12.5%",
                height: "1px",
                background: `linear-gradient(90deg, ${C.pounamu}50, ${C.gold}80, ${C.pounamu}50)`,
              }}
            />

            <div style={{ display: "flex", gap: "8px", position: "relative" }}>
              <TimelineItem year="2024" label="Founded in Auckland" />
              <TimelineItem year="2025" label="First 20 agents launched" />
              <TimelineItem year="2026" label="Full platform — 43 agents" active />
              <TimelineItem year="2027" label="Enterprise & API" />
            </div>
          </div>
        </motion.div>

        {/* Industry grid */}
        <motion.div
          {...fadeUpView(0.3)}
          style={{ marginTop: "48px" }}
        >
          <p style={{ ...T.mono, color: C.white40, marginBottom: "20px", textAlign: "center" }}>
            16 industries covered
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {[
              "Hospitality", "Construction", "Property", "Automotive", "Finance",
              "Maritime", "Agriculture", "Healthcare", "Retail", "Legal",
              "Education", "Tourism", "Manufacturing", "Technology", "Trades", "Media",
            ].map((industry, i) => (
              <motion.span
                key={industry}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                style={{
                  ...T.mono,
                  padding: "7px 14px",
                  borderRadius: "6px",
                  background: i < 6 ? `${C.gold}08` : C.surface,
                  border: `1px solid ${i < 6 ? C.borderGold : C.border}`,
                  color: i < 6 ? C.gold : C.white40,
                  fontSize: "11px",
                }}
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 7. CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px 120px" }}>
        <motion.div
          {...fadeUpView()}
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            textAlign: "center",
            padding: "72px 40px",
            background: `linear-gradient(135deg, ${C.gold}06 0%, ${C.pounamu}04 100%)`,
            border: `1px solid ${C.borderGold}`,
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow accent */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-80px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              height: "200px",
              background: `radial-gradient(ellipse at top, ${C.gold}10, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <ConstellationMark size={44} />
            </div>
            <p style={T.eyebrow}>Ready to begin?</p>
            <h2
              style={{
                ...T.h2,
                marginTop: "16px",
                marginBottom: "16px",
              }}
            >
              Join the Assembl whānau
            </h2>
            <p style={{ ...T.body, maxWidth: "440px", margin: "0 auto 36px" }}>
              Start free. No credit card required. Access 3 messages per tool
              across all 43 specialist agents, instantly.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/signup"
                style={{
                  display: "inline-block",
                  padding: "15px 40px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${C.gold} 0%, #B8912A 100%)`,
                  color: "#0A0A0F",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: "0.3px",
                  textDecoration: "none",
                  boxShadow: `0 0 40px ${C.gold}35`,
                  transition: "opacity 0.2s",
                }}
              >
                Get started free
              </Link>
              <Link
                to="/pricing"
                style={{
                  display: "inline-block",
                  padding: "15px 40px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: C.white60,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "15px",
                  textDecoration: "none",
                  border: `1px solid ${C.border}`,
                }}
              >
                View plans
              </Link>
            </div>

            <p style={{ ...T.mono, color: C.white40, marginTop: "24px", fontSize: "11px" }}>
              From NZ$750/mo · Book a Launch Sprint to get started
            </p>
          </div>
        </motion.div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default BrandStoryPage;
