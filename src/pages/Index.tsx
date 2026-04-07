import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  manaakiMark,
  hangaMark,
  auahaMark,
  pakihiMark,
  hangarauMark,
  ihoIcon,
  kanohiIcon,
  maharaIcon,
  manaIcon,
  teKahuiReoMark,
} from "@/assets/brand";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import StarConstellationHero from "@/components/landing/StarConstellationHero";

/* ── Shared micro-components ── */
const Eyebrow = ({ children }: { children: string }) => (
  <p
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "10px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#CBAE6D",
      marginBottom: "14px",
    }}
  >
    {children}
  </p>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: "'Lato', sans-serif",
      fontWeight: 300,
      fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
      lineHeight: 1.2,
      color: "#FFFFFF",
      marginBottom: "16px",
    }}
  >
    {children}
  </h2>
);

const Body = ({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <p
    className={className}
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: "15px",
      lineHeight: 1.75,
      color: "rgba(255,255,255,0.52)",
      ...style,
    }}
  >
    {children}
  </p>
);

/* ── Layout constants ── */
const SECTION = "px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";

/* ── Shared fade preset ── */
const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.55 },
};

/* ── Data ── */
const PROOF_ITEMS = [
  "Built for NZ workflows",
  "Human approvals built in",
  "SMS-first for teams on the move",
  "Audit trail on material actions",
];

const PACKS = [
  {
    name: "Manaaki",
    sub: "Hospitality & Tourism",
    mark: manaakiMark,
    desc: "Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.",
    to: "/manaaki",
    accent: "#CBAE6D",
    accentRgb: "203,174,109",
    agents: 9,
  },
  {
    name: "Hanga",
    sub: "Construction",
    mark: hangaMark,
    desc: "Safety signals, schedule visibility, approvals, and site-admin follow-through — without the spreadsheet maze.",
    to: "/hanga",
    accent: "#2FCB89",
    accentRgb: "47,203,137",
    agents: 9,
  },
  {
    name: "Auaha",
    sub: "Creative & Media",
    mark: auahaMark,
    desc: "Brief to published with fewer handoffs. Content that stays on-brand and on-deadline.",
    to: "/auaha",
    accent: "#B388FF",
    accentRgb: "179,136,255",
    agents: 9,
  },
  {
    name: "Pakihi",
    sub: "Business & Commerce",
    mark: pakihiMark,
    desc: "Less admin, earlier exceptions, clearer approvals — across accounting, retail, trade, and property.",
    to: "/pakihi",
    accent: "#6B8FA3",
    accentRgb: "107,143,163",
    agents: 11,
  },
  {
    name: "Hangarau",
    sub: "Technology",
    mark: hangarauMark,
    desc: "Surface issues before they escalate. Security, ops, and infrastructure checks that run in the background.",
    to: "/hangarau",
    accent: "#5AADA0",
    accentRgb: "90,173,160",
    agents: 12,
  },
];

const DIFFS = [
  {
    icon: ihoIcon,
    title: "Built for NZ",
    body: "Grounded in Aotearoa regulation, culture, and market reality — not adapted from overseas defaults.",
  },
  {
    icon: kanohiIcon,
    title: "Supports your team",
    body: "Handles repetitive checks, reminders, approvals, and follow-through — so your people focus on the work that matters.",
  },
  {
    icon: maharaIcon,
    title: "Auditable by design",
    body: "Every material action is policy-gated, explainable, and logged. No black boxes.",
  },
  {
    icon: manaIcon,
    title: "One pilot at a time",
    body: "We deploy tightly focused workflows, test them in simulation, then widen. No big-bang rollouts.",
  },
];

const PRICING = [
  {
    tier: "Starter",
    price: "$89",
    features: ["1 industry pack", "Core agent suite", "Up to 3 users", "Email support"],
    highlight: false,
  },
  {
    tier: "Pro",
    price: "$299",
    features: ["3 industry packs", "Full agent suite", "Up to 10 users", "Priority support"],
    highlight: true,
  },
  {
    tier: "Business",
    price: "$599",
    features: ["All 5 industry packs", "Custom workflows", "Unlimited users", "Dedicated onboarding"],
    highlight: false,
  },
  {
    tier: "Industry Suite",
    price: "$1,499",
    features: ["All packs + Te Kāhui Reo", "Multi-site support", "SLA guarantee", "Quarterly review"],
    highlight: false,
  },
];

const POU = [
  {
    icon: ihoIcon,
    name: "Iho",
    desc: "The cultural core. Foundational values and tikanga that guide every output.",
  },
  {
    icon: kanohiIcon,
    name: "Kanohi",
    desc: "Language presence. Reo quality, authenticity, and appropriate use.",
  },
  {
    icon: maharaIcon,
    name: "Mahara",
    desc: "Shared memory. Institutional knowledge carried forward, not reset.",
  },
  {
    icon: manaIcon,
    name: "Mana",
    desc: "Authority and trust. Earned through consistency and cultural grounding.",
  },
];

/* ── Page ── */
const Index = () => {
  const [pilotName, setPilotName] = useState("");
  const [pilotEmail, setPilotEmail] = useState("");
  const [pilotBiz, setPilotBiz] = useState("");

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
      toast.success("Application received. We will be in touch within 24 hours.");
      setPilotName("");
      setPilotEmail("");
      setPilotBiz("");
      supabase.functions
        .invoke("send-contact-email", { body: { name: pilotName, email: pilotEmail, message: msg } })
        .catch(console.error);
      if (inserted?.id)
        supabase.functions
          .invoke("qualify-lead", { body: { submissionId: inserted.id } })
          .catch(console.error);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ background: "#09161A", color: "#FFFFFF", minHeight: "100vh" }}>
      <SEO
        title="Assembl — Operational Intelligence for Aotearoa Businesses"
        description="Assembl connects to the signals your business already produces — then helps your team sort, check, escalate, and act with more confidence."
      />
      <BrandNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative px-6 sm:px-8 pt-28 sm:pt-36 pb-16 text-center overflow-hidden" style={{ minHeight: "520px" }}>
        <StarConstellationHero />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: "#FFFFFF",
              margin: 0,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Operational intelligence for{" "}
            <span style={{ color: "#CBAE6D" }}>Aotearoa businesses.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-lg mx-auto"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.58)",
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Assembl connects to the signals your business already produces —
            messages, documents, calendars, systems, and records — then helps
            your team sort, check, escalate, and act with more confidence.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <a
              href="#pilots"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "100px",
                background: "#2FCB89",
                color: "#FFFFFF",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                letterSpacing: "0.03em",
                textDecoration: "none",
              }}
            >
              Start a pilot <ArrowRight size={15} />
            </a>
            <a
              href="#packs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.65)",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                letterSpacing: "0.03em",
                textDecoration: "none",
              }}
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. PROOF BAR ═══ */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "13px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0 8px",
          }}
        >
          {PROOF_ITEMS.map((item, i) => (
            <Fragment key={item}>
              {i > 0 && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.15)",
                    fontSize: "12px",
                    userSelect: "none",
                  }}
                >
                  &bull;
                </span>
              )}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.42)",
                  letterSpacing: "0.04em",
                  padding: "2px 6px",
                }}
              >
                {item}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* ═══ 3. HUMAN SECTION ═══ */}
      <section className={SECTION}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>YOUR TEAM</Eyebrow>
            <SectionHeading>
              Built to support your people — not replace them.
            </SectionHeading>
            <Body className="max-w-2xl">
              Assembl handles repetitive checks, reminders, follow-through, and
              workflow prep so your team can focus on judgment, service,
              delivery, and growth.
            </Body>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              marginTop: "40px",
            }}
          >
            {[
              { stat: "605,000", label: "NZ businesses" },
              { stat: "97%", label: "are small enterprises" },
              { stat: "9", label: "industry workflows, one pilot at a time" },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "28px",
                    color: "#D4A843",
                    marginBottom: "4px",
                  }}
                >
                  {c.stat}
                </p>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  {c.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. OUTCOMES — Signal Node Cards ═══ */}
      <section
        className={SECTION}
        style={{ borderTop: "1px solid rgba(47,203,137,0.08)" }}
      >
        <div className={`${INNER} text-center`}>
          <motion.div {...fade}>
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              Reduce admin.{" "}
              <span style={{ color: "#CBAE6D" }}>Surface issues earlier.</span>{" "}
              Keep people in control.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "48px",
              textAlign: "left",
            }}
          >
            {[
              {
                heading: "Reduce admin",
                accent: "#CBAE6D",
                accentRgb: "203,174,109",
                motif: "koru",
                body: "Repetitive checks, reminders, and data entry handled automatically — so your team spends time on the work that earns revenue.",
              },
              {
                heading: "Surface issues earlier",
                accent: "#2FCB89",
                accentRgb: "47,203,137",
                motif: "taniko",
                body: "Compliance gaps, schedule risks, and approval bottlenecks flagged before they become problems — not after.",
              },
              {
                heading: "Keep people in control",
                accent: "#6B8FA3",
                accentRgb: "107,143,163",
                motif: "mauao",
                body: "Every action is policy-gated, explainable, and auditable. Your team sees what matters now — no black boxes, no sci-fi dashboards.",
              },
            ].map((o, i) => (
              <motion.div
                key={o.heading}
                style={{
                  borderRadius: "16px",
                  padding: "32px 28px",
                  background: `linear-gradient(145deg, rgba(15,15,26,0.7) 0%, rgba(${o.accentRgb},0.04) 100%)`,
                  border: `1px solid rgba(${o.accentRgb},0.15)`,
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ borderColor: `rgba(${o.accentRgb},0.35)`, y: -2 }}
              >
                {/* Corner glow */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(${o.accentRgb},0.12) 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                {/* Signal node dot */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: o.accent,
                    boxShadow: `0 0 12px rgba(${o.accentRgb},0.4)`,
                    marginBottom: "20px",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "22px",
                    color: "#FFFFFF",
                    marginBottom: "12px",
                  }}
                >
                  {o.heading}
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color: "rgba(234,241,239,0.5)",
                  }}
                >
                  {o.body}
                </p>
                {/* Bottom signal line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "28px",
                    right: "28px",
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, rgba(${o.accentRgb},0.2), transparent)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. PACKS — Glass Kete Cards ═══ */}
      <section
        id="packs"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className={INNER}>
          <motion.div {...fade} style={{ marginBottom: "48px", textAlign: "center" }}>
            <Eyebrow>INDUSTRY KETE</Eyebrow>
            <SectionHeading>
              Specialist workflows, industry by industry.
            </SectionHeading>
            <Body className="max-w-xl mx-auto">
              Each kete is a focused set of workflows for a specific industry —
              built to support the teams already doing the work.
            </Body>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {PACKS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link
                  to={p.to}
                  className="group"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "20px",
                    padding: "32px 20px 24px",
                    background: `linear-gradient(165deg, rgba(${p.accentRgb},0.06) 0%, rgba(15,15,26,0.7) 50%, rgba(${p.accentRgb},0.03) 100%)`,
                    border: `1px solid rgba(${p.accentRgb},0.18)`,
                    backdropFilter: "blur(12px)",
                    textDecoration: "none",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `rgba(${p.accentRgb},0.4)`;
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = `0 8px 40px rgba(${p.accentRgb},0.15), inset 0 1px 0 rgba(255,255,255,0.08)`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `rgba(${p.accentRgb},0.18)`;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Top corner glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-30px",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(${p.accentRgb},0.1) 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Glowing globe icon */}
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "18px",
                      position: "relative",
                      background: `radial-gradient(circle at 35% 35%, rgba(${p.accentRgb},0.2) 0%, rgba(${p.accentRgb},0.05) 60%, transparent 100%)`,
                      border: `1px solid rgba(${p.accentRgb},0.25)`,
                      boxShadow: `0 0 24px rgba(${p.accentRgb},0.12), inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  >
                    {/* Globe wireframe SVG */}
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="14" stroke={p.accent} strokeWidth="0.7" opacity="0.5" />
                      <ellipse cx="18" cy="18" rx="9" ry="14" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
                      <ellipse cx="18" cy="18" rx="14" ry="5" stroke={p.accent} strokeWidth="0.5" opacity="0.35" />
                      <line x1="4" y1="12" x2="32" y2="12" stroke={p.accent} strokeWidth="0.4" opacity="0.25" />
                      <line x1="4" y1="24" x2="32" y2="24" stroke={p.accent} strokeWidth="0.4" opacity="0.25" />
                      <line x1="18" y1="4" x2="18" y2="32" stroke={p.accent} strokeWidth="0.4" opacity="0.25" />
                    </svg>
                    {/* Inner glow */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "4px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  {/* Name */}
                  <p
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 400,
                      fontSize: "16px",
                      color: p.accent,
                      marginBottom: "4px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.name}
                  </p>

                  {/* Subtitle */}
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: "12px",
                    }}
                  >
                    {p.sub}
                  </p>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "12px",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: "16px",
                      flex: 1,
                    }}
                  >
                    {p.desc}
                  </p>

                  {/* Agent count badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 14px",
                      borderRadius: "100px",
                      border: `1px solid rgba(${p.accentRgb},0.25)`,
                      background: `rgba(${p.accentRgb},0.06)`,
                    }}
                  >
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: p.accent,
                        boxShadow: `0 0 6px rgba(${p.accentRgb},0.5)`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: `rgba(${p.accentRgb},0.8)`,
                      }}
                    >
                      {p.agents} agents
                    </span>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "20%",
                      right: "20%",
                      height: "1px",
                      background: `linear-gradient(90deg, transparent, rgba(${p.accentRgb},0.3), transparent)`,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="why-assembl"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className={INNER}>
          <motion.div {...fade} style={{ marginBottom: "40px" }}>
            <Eyebrow>WHY ASSEMBL</Eyebrow>
            <SectionHeading>
              Built for Aotearoa, not adapted as an afterthought.
            </SectionHeading>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "10px",
            }}
          >
            {DIFFS.map((d, i) => (
              <motion.div
                key={d.title}
                style={{
                  borderRadius: "12px",
                  padding: "28px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <img
                  src={d.icon}
                  alt=""
                  style={{ width: "24px", height: "24px", opacity: 0.55, marginBottom: "18px" }}
                />
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: "15px",
                    color: "#FFFFFF",
                    marginBottom: "8px",
                  }}
                >
                  {d.title}
                </h3>
                <Body>{d.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. PRICING ═══ */}
      <section
        id="pricing"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className={INNER}>
          <motion.div {...fade} style={{ marginBottom: "40px", textAlign: "center" }}>
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Straightforward pricing. No lock-in.</SectionHeading>
            <Body>All plans billed monthly. NZD + GST.</Body>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {PRICING.map((p, i) => (
              <motion.div
                key={p.tier}
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  background: p.highlight
                    ? "rgba(58,125,110,0.07)"
                    : "rgba(255,255,255,0.02)",
                  border: p.highlight
                    ? "1px solid rgba(58,125,110,0.28)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: p.highlight ? "#3A7D6E" : "rgba(255,255,255,0.35)",
                    marginBottom: "10px",
                  }}
                >
                  {p.tier}
                </p>
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "34px",
                    color: "#FFFFFF",
                    marginBottom: "2px",
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                </p>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.28)",
                    marginBottom: "20px",
                  }}
                >
                  per month NZD + GST
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.52)",
                        lineHeight: 1.5,
                        marginBottom: "7px",
                      }}
                    >
                      <span style={{ color: "#D4A843", marginTop: "1px", flexShrink: 0 }}>
                        —
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#pilots"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "100px",
                    marginTop: "20px",
                    border: p.highlight
                      ? "1px solid #3A7D6E"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: p.highlight ? "#3A7D6E" : "rgba(255,255,255,0.55)",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: "13px",
                    textDecoration: "none",
                    letterSpacing: "0.03em",
                  }}
                >
                  Get started
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. PILOTS CTA ═══ */}
      <section
        id="pilots"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fade}>
            <Eyebrow>HANGA — CONSTRUCTION PILOT</Eyebrow>
            <SectionHeading>Start with one project. See the difference in 30 days.</SectionHeading>
            <Body style={{ marginBottom: "36px" } as React.CSSProperties}>
              Hanga helps construction teams spot issues earlier, keep approvals
              moving, and reduce admin — without taking decisions away from the
              people responsible. One project or one contained workflow. 30 days.
              Observe and approval mode first.
            </Body>
          </motion.div>

          <motion.form
            onSubmit={handlePilot}
            style={{
              borderRadius: "14px",
              padding: "32px",
              textAlign: "left",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {[
              { value: pilotName, setter: setPilotName, placeholder: "Your name", type: "text" },
              { value: pilotEmail, setter: setPilotEmail, placeholder: "Email address", type: "email" },
              { value: pilotBiz, setter: setPilotBiz, placeholder: "Business name and industry", type: "text" },
            ].map((field) => (
              <input
                key={field.placeholder}
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#FFFFFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ))}
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "14px",
                borderRadius: "100px",
                background: "#3A7D6E",
                color: "#FFFFFF",
                border: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                letterSpacing: "0.03em",
                cursor: "pointer",
                marginTop: "4px",
              }}
            >
              Start a pilot <ArrowRight size={15} />
            </button>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "11px",
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
              }}
            >
              We review applications and respond within two business days.
            </p>
          </motion.form>
        </div>
      </section>

      {/* ═══ 9. TRUST — Te Kāhui Reo ═══ */}
      <section
        id="te-kahui-reo"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className={INNER}>
          <motion.div {...fade} style={{ textAlign: "center", marginBottom: "40px" }}>
            <img
              src={teKahuiReoMark}
              alt="Te Kāhui Reo"
              style={{ width: "44px", height: "44px", margin: "0 auto 20px", opacity: 0.65 }}
            />
            <Eyebrow>TE KĀHUI REO</Eyebrow>
            <SectionHeading>The trust layer built into Assembl.</SectionHeading>
            <Body style={{ maxWidth: "520px", margin: "0 auto" } as React.CSSProperties}>
              Te Kāhui Reo is a cross-platform cultural and language layer woven
              through the platform — not added on top. It supports stronger reo
              quality, tikanga alignment, and cultural grounding in every output.
            </Body>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {POU.map((pou, i) => (
              <motion.div
                key={pou.name}
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <img
                  src={pou.icon}
                  alt=""
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 14px",
                    opacity: 0.55,
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: "13px",
                    color: "#D4A843",
                    marginBottom: "8px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {pou.name}
                </p>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.42)",
                  }}
                >
                  {pou.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. FOOTER — Tōroa + copyright ═══ */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            Also from Assembl:{" "}
            <Link
              to="/toroa"
              style={{ color: "#D4A843", textDecoration: "none" }}
            >
              Tōroa
            </Link>
            {" "}— SMS-first navigation for whānau and everyday life. $29/month.
          </p>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.04em",
            }}
          >
            &copy; {new Date().getFullYear()} Assembl Limited. Built in Aotearoa New Zealand.
          </p>
        </div>
      </div>

      <BrandFooter />
    </div>
  );
};

export default Index;
