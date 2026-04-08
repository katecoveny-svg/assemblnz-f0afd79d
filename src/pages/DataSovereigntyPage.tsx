import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const COLOURS = {
  bg: "#09090F",
  gold: "#D4A843",
  teal: "#3A7D6E",
  navy: "#1A3A5C",
  navyLight: "#234d7a",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  glass: "rgba(26,58,92,0.18)",
  glassBorder: "rgba(26,58,92,0.45)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const DATA_TABLE = [
  {
    category: "Conversation data",
    storage: "Encrypted at rest (AES-256)",
    retention: "90-day retention",
    control: "Delete anytime from your dashboard",
  },
  {
    category: "Business profile",
    storage: "Isolated per account (RLS enforced)",
    retention: "While account is active",
    control: "Used only to personalise your agents — never sold",
  },
  {
    category: "Usage analytics",
    storage: "Aggregated and anonymised",
    retention: "Rolling 12 months",
    control: "Cannot be attributed to you individually",
  },
  {
    category: "Payment data",
    storage: "Processed by Stripe — PCI DSS",
    retention: "Not stored by Assembl",
    control: "Stripe's privacy policy applies",
  },
];

const NEVER_LIST = [
  "Sell your data to third parties — ever, under any circumstances",
  "Use your conversations to train AI models without your explicit opt-in",
  "Share your data with government agencies without a valid court order",
  "Store any data outside Aotearoa New Zealand",
  "Use your business information for our own marketing or benchmarking",
];

const COMPLIANCE_BADGES = [
  {
    label: "NZ Privacy Act 2020",
    desc: "Full compliance with all 13 Information Privacy Principles",
    status: "Active",
  },
  {
    label: "NZ Data Residency",
    desc: "All data stored in Auckland-region data centres",
    status: "Active",
  },
  {
    label: "NZISM Aligned",
    desc: "NZ Information Security Manual controls applied",
    status: "Active",
  },
  {
    label: "Hardened Hosting",
    desc: "Hosted on Supabase / AWS infrastructure",
    status: "Active",
  },
  {
    label: "GDPR Aware",
    desc: "Extended rights for any EU-resident users",
    status: "Active",
  },
];

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontFamily: "'Lato', sans-serif",
      fontWeight: 700,
      fontSize: "0.7rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: COLOURS.gold,
      marginBottom: "0.75rem",
    }}
  >
    {children}
  </p>
);

const SectionHeading = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <h2
    style={{
      fontFamily: "'Lato', sans-serif",
      fontWeight: 900,
      fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
      color: COLOURS.white,
      lineHeight: 1.15,
      marginBottom: "1rem",
      ...style,
    }}
  >
    {children}
  </h2>
);

const GlassCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: COLOURS.glass,
      border: `1px solid ${COLOURS.glassBorder}`,
      borderRadius: "16px",
      padding: "2rem",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export default function DataSovereigntyPage() {
  return (
    <div
      style={{
        background: COLOURS.bg,
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: COLOURS.white,
      }}
    >
      <BrandNav />

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "7rem 1.5rem 5rem",
          textAlign: "center",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <SectionEyebrow>Data Sovereignty</SectionEyebrow>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            marginBottom: "1.75rem",
            background: `linear-gradient(135deg, ${COLOURS.gold} 0%, #e8c97a 50%, ${COLOURS.gold} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your Data is Taonga
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.72)",
            maxWidth: "660px",
            margin: "0 auto",
          }}
        >
          Taonga are treasures — things of value to be protected, preserved,
          and kept in trust. We treat your business data the same way.
        </motion.p>
      </section>

      {/* ── THE FRAMEWORK ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          style={{ marginBottom: "3rem" }}
        >
          <SectionEyebrow>Our Framework</SectionEyebrow>
          <SectionHeading>Grounded in Te Tiriti</SectionHeading>
          <p
            style={{
              fontWeight: 300,
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: COLOURS.muted,
              maxWidth: "640px",
            }}
          >
            Te Tiriti o Waitangi Article 2 protects Māori taonga. We extend
            this principle to every business that trusts us with their data.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              te_reo: "Ūkaipō",
              english: "Origin / Home",
              body: "Your data never leaves Aotearoa New Zealand. All data is stored and processed in Auckland-region data centres — no offshore transfers, no exceptions.",
              delay: 0,
            },
            {
              te_reo: "Kaitiakitanga",
              english: "Guardianship",
              body: "We are stewards, not owners. You control what we hold, how long we hold it, and when it is destroyed. Our role is to protect — not to exploit.",
              delay: 1,
            },
            {
              te_reo: "Rangatiratanga",
              english: "Self-determination",
              body: "Delete everything, anytime. No waiting period, no questions, no dark patterns. Your sovereignty over your data is absolute and immediate.",
              delay: 2,
            },
          ].map((p) => (
            <motion.div
              key={p.te_reo}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={p.delay}
            >
              <GlassCard
                style={{
                  borderTop: `3px solid ${COLOURS.navy}`,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: `${COLOURS.navy}55`,
                    border: `1px solid ${COLOURS.navyLight}`,
                    borderRadius: "8px",
                    padding: "0.25rem 0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      color: COLOURS.gold,
                    }}
                  >
                    {p.english.toUpperCase()}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 900,
                    fontSize: "1.45rem",
                    color: COLOURS.white,
                    marginBottom: "0.75rem",
                  }}
                >
                  {p.te_reo}
                </h3>
                <p
                  style={{
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    lineHeight: 1.75,
                    color: COLOURS.muted,
                  }}
                >
                  {p.body}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE HOLD ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          style={{ marginBottom: "2.5rem" }}
        >
          <SectionEyebrow>Transparency</SectionEyebrow>
          <SectionHeading>What We Hold</SectionHeading>
          <p
            style={{
              fontWeight: 300,
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: COLOURS.muted,
              maxWidth: "560px",
            }}
          >
            Complete transparency — every category of data, how it is stored,
            and who controls it.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
        >
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1.5fr 1.2fr 1.8fr",
                gap: "1rem",
                padding: "1rem 1.75rem",
                background: `${COLOURS.navy}44`,
                borderBottom: `1px solid ${COLOURS.glassBorder}`,
              }}
            >
              {["Data category", "How it is stored", "Retention", "Your control"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: COLOURS.gold,
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </span>
                )
              )}
            </div>

            {DATA_TABLE.map((row, i) => (
              <div
                key={row.category}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1.5fr 1.2fr 1.8fr",
                  gap: "1rem",
                  padding: "1.25rem 1.75rem",
                  borderBottom:
                    i < DATA_TABLE.length - 1
                      ? `1px solid rgba(26,58,92,0.3)`
                      : "none",
                  background:
                    i % 2 === 1 ? "rgba(26,58,92,0.07)" : "transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 900,
                    fontSize: "0.9rem",
                    color: COLOURS.white,
                  }}
                >
                  {row.category}
                </span>
                <span
                  style={{
                    fontWeight: 300,
                    fontSize: "0.88rem",
                    color: COLOURS.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {row.storage}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8rem",
                    color: COLOURS.teal,
                  }}
                >
                  {row.retention}
                </span>
                <span
                  style={{
                    fontWeight: 300,
                    fontSize: "0.88rem",
                    color: COLOURS.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {row.control}
                </span>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </section>

      {/* ── WHAT WE NEVER DO ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          style={{ marginBottom: "2.5rem" }}
        >
          <SectionEyebrow>Our Commitments</SectionEyebrow>
          <SectionHeading>What We Never Do</SectionHeading>
        </motion.div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {NEVER_LIST.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.5}
            >
              <GlassCard
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.25rem",
                  padding: "1.25rem 1.75rem",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: `${COLOURS.navy}66`,
                    border: `1.5px solid ${COLOURS.navyLight}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "1px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: COLOURS.gold,
                    }}
                  >
                    ✕
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                      color: COLOURS.white,
                      display: "inline",
                    }}
                  >
                    Never.{" "}
                  </span>
                  <span
                    style={{
                      fontWeight: 300,
                      fontSize: "0.9rem",
                      color: COLOURS.muted,
                      lineHeight: 1.65,
                    }}
                  >
                    {item}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMPLIANCE ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          style={{ marginBottom: "2.5rem" }}
        >
          <SectionEyebrow>Compliance</SectionEyebrow>
          <SectionHeading>Standards We Meet</SectionHeading>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {COMPLIANCE_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.5}
            >
              <GlassCard
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.85rem",
                      color: COLOURS.white,
                    }}
                  >
                    {badge.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.6rem",
                      letterSpacing: "0.08em",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "100px",
                      background:
                        badge.status === "Active"
                          ? `${COLOURS.teal}33`
                          : `${COLOURS.navy}66`,
                      border: `1px solid ${
                        badge.status === "Active"
                          ? COLOURS.teal
                          : COLOURS.navyLight
                      }`,
                      color:
                        badge.status === "Active" ? COLOURS.teal : COLOURS.gold,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {badge.status}
                  </span>
                </div>
                <p
                  style={{
                    fontWeight: 300,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    color: COLOURS.muted,
                    margin: 0,
                  }}
                >
                  {badge.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TE TIRITI COMMITMENT ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <GlassCard
            style={{
              borderLeft: `4px solid ${COLOURS.navy}`,
              background: `linear-gradient(135deg, rgba(26,58,92,0.28) 0%, rgba(9,9,15,0.6) 100%)`,
            }}
          >
            <SectionEyebrow>Our Commitment</SectionEyebrow>
            <SectionHeading style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)" }}>
              Te Tiriti o Waitangi
            </SectionHeading>
            <p
              style={{
                fontWeight: 300,
                fontSize: "1.05rem",
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.75)",
                maxWidth: "720px",
              }}
            >
              Assembl is committed to the principles of Te Tiriti o Waitangi.
              We recognise Māori rights to data sovereignty — tino rangatiratanga
              over their taonga — and actively work toward the CARE principles
              for Indigenous data:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginTop: "1.75rem",
              }}
            >
              {[
                {
                  letter: "C",
                  word: "Collective benefit",
                  desc: "Data ecosystems that benefit Indigenous peoples",
                },
                {
                  letter: "A",
                  word: "Authority to control",
                  desc: "Recognising rights to govern data about communities",
                },
                {
                  letter: "R",
                  word: "Responsibility",
                  desc: "Accountable relationships with communities",
                },
                {
                  letter: "E",
                  word: "Ethics",
                  desc: "Minimising harm, maximising benefit",
                },
              ].map((care) => (
                <div
                  key={care.letter}
                  style={{
                    background: "rgba(26,58,92,0.25)",
                    border: `1px solid rgba(26,58,92,0.5)`,
                    borderRadius: "12px",
                    padding: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 900,
                      fontSize: "2rem",
                      color: COLOURS.gold,
                      lineHeight: 1,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {care.letter}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.85rem",
                      color: COLOURS.white,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {care.word}
                  </div>
                  <div
                    style={{
                      fontWeight: 300,
                      fontSize: "0.8rem",
                      lineHeight: 1.55,
                      color: COLOURS.muted,
                    }}
                  >
                    {care.desc}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ── CONTACT ── */}
      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "4rem 1.5rem 6rem",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <GlassCard
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              background: `linear-gradient(135deg, rgba(26,58,92,0.22) 0%, rgba(9,9,15,0.5) 100%)`,
            }}
          >
            <SectionEyebrow>Get in Touch</SectionEyebrow>
            <SectionHeading style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)" }}>
              Questions About Your Data?
            </SectionHeading>
            <p
              style={{
                fontWeight: 300,
                fontSize: "1rem",
                color: COLOURS.muted,
                lineHeight: 1.75,
                marginBottom: "2rem",
              }}
            >
              We welcome any questions about how we handle your taonga. Our
              privacy team responds within one business day.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="mailto:privacy@assembl.co.nz"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "10px",
                  background: COLOURS.navy,
                  border: `1px solid ${COLOURS.navyLight}`,
                  color: COLOURS.white,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                privacy@assembl.co.nz
              </a>
              <Link
                to="/privacy"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "10px",
                  background: "transparent",
                  border: `1px solid ${COLOURS.glassBorder}`,
                  color: COLOURS.muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      <BrandFooter />
    </div>
  );
}
