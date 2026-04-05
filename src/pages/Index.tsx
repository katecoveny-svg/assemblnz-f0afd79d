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

/* ── Shared micro-components ── */
const Eyebrow = ({ children }: { children: string }) => (
  <p
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "10px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#D4A843",
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
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={className}
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: "15px",
      lineHeight: 1.75,
      color: "rgba(255,255,255,0.52)",
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
  "42 specialist agents",
  "5 industry packs",
  "Built in Aotearoa",
  "From $89/month NZD",
  "SMS-ready",
];

const PACKS = [
  {
    name: "Manaaki",
    sub: "Hospitality & Tourism",
    mark: manaakiMark,
    desc: "Food safety, liquor licensing, guest experience, luxury lodging, adventure tourism.",
    to: "/manaaki",
  },
  {
    name: "Hanga",
    sub: "Construction",
    mark: hangaMark,
    desc: "Site to sign-off. Safety, BIM, consenting, project management, tenders.",
    to: "/hanga",
  },
  {
    name: "Auaha",
    sub: "Creative & Media",
    mark: auahaMark,
    desc: "Brief to published. Copy, image, video, podcast, ads, analytics.",
    to: "/auaha",
  },
  {
    name: "Pakihi",
    sub: "Business & Commerce",
    mark: pakihiMark,
    desc: "Accounting, insurance, retail, trade, agriculture, real estate.",
    to: "/pakihi",
  },
  {
    name: "Hangarau",
    sub: "Technology",
    mark: hangarauMark,
    desc: "Security, DevOps, infrastructure, monitoring, manufacturing, IP.",
    to: "/hangarau",
  },
];

const DIFFS = [
  {
    icon: ihoIcon,
    title: "NZ context",
    body: "Built around Aotearoa business reality — regulation, culture, market, and language — not adapted from overseas defaults.",
  },
  {
    icon: kanohiIcon,
    title: "Specialist intelligence",
    body: "Purpose-built capability for each industry, not a single generic assistant stretched across five different domains.",
  },
  {
    icon: maharaIcon,
    title: "Shared memory",
    body: "Work compounds over time. Context carries forward instead of resetting every session.",
  },
  {
    icon: manaIcon,
    title: "Cultural intelligence",
    body: "Te Kāhui Reo is woven through the platform — not layered on top — supporting tikanga alignment in every output.",
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
    <div style={{ background: "#09090F", color: "#FFFFFF", minHeight: "100vh" }}>
      <SEO
        title="Assembl — The Operating System for NZ Business"
        description="42 specialist agents across 5 industry packs. One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa."
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
            The operating system for{" "}
            <span style={{ color: "#D4A843" }}>NZ business.</span>
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
            One intelligence layer for quoting, payroll, planning, marketing,
            compliance and execution.
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
                background: "#3A7D6E",
                color: "#FFFFFF",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                letterSpacing: "0.03em",
                textDecoration: "none",
              }}
            >
              Apply for the pilot programme <ArrowRight size={15} />
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
              Explore industry packs
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

      {/* ═══ 3. PROBLEM ═══ */}
      <section className={SECTION}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>THE CHALLENGE</Eyebrow>
            <SectionHeading>
              Enterprise work, small-team resources.
            </SectionHeading>
            <Body className="max-w-2xl">
              Most owner-led businesses in Aotearoa carry too much operational
              complexity across too many disconnected tools — quoting, admin,
              compliance, planning, people, reporting. They cannot justify a
              stack of consultants, agencies, and enterprise software.
            </Body>
            <Body className="max-w-2xl" style={{ marginTop: "16px" } as React.CSSProperties}>
              Assembl replaces the fragmentation. One platform, built for the
              realities of NZ business.
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
              { stat: "$4.2B", label: "professional services spend annually" },
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

      {/* ═══ 4. OUTCOMES ═══ */}
      <section
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
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
              Win work.{" "}
              <span style={{ color: "#D4A843" }}>Run work.</span>{" "}
              Stay sharp.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginTop: "48px",
              textAlign: "left",
            }}
          >
            {[
              {
                heading: "Win work",
                accent: "#D4A843",
                body: "Better proposals start with speed. Assembl reduces busywork so your team pitches more, quotes tighter, and closes harder.",
              },
              {
                heading: "Run work",
                accent: "#3A7D6E",
                body: "Every NZ business juggles payroll, tax, compliance, and schedules. Assembl handles the operational load so your team focuses on delivery.",
              },
              {
                heading: "Stay sharp",
                accent: "rgba(255,255,255,0.5)",
                body: "NZ compliance and market conditions change constantly. Assembl surfaces what matters — regulation, deadlines, opportunities — before they become problems.",
              },
            ].map((o, i) => (
              <motion.div
                key={o.heading}
                style={{
                  borderRadius: "12px",
                  padding: "28px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "1px",
                    background: o.accent,
                    marginBottom: "20px",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "20px",
                    color: "#FFFFFF",
                    marginBottom: "10px",
                  }}
                >
                  {o.heading}
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  {o.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. PACKS ═══ */}
      <section
        id="packs"
        className={SECTION}
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className={INNER}>
          <motion.div {...fade} style={{ marginBottom: "40px" }}>
            <Eyebrow>INDUSTRY PACKS</Eyebrow>
            <SectionHeading>
              Five specialist packs for NZ industries.
            </SectionHeading>
            <Body className="max-w-xl">
              Each pack carries the knowledge, agents, and workflows your
              industry requires — woven together in one platform.
            </Body>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {PACKS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <Link
                  to={p.to}
                  style={{
                    display: "block",
                    borderRadius: "12px",
                    padding: "22px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    textDecoration: "none",
                    height: "100%",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.14)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.07)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    <img
                      src={p.mark}
                      alt=""
                      style={{ width: "32px", height: "32px", opacity: 0.75 }}
                    />
                    <div>
                      <p
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                          color: "#FFFFFF",
                          marginBottom: "2px",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "9px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {p.sub}
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.42)",
                    }}
                  >
                    {p.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. DIFFERENCE ═══ */}
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
            <Eyebrow>FOUNDING PILOTS</Eyebrow>
            <SectionHeading>Apply for the founding pilot programme.</SectionHeading>
            <Body style={{ marginBottom: "36px" } as React.CSSProperties}>
              We are accepting a limited number of NZ businesses for our
              founding pilot cohort. Direct access to the team, input into the
              product, and founding-member pricing.
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
              Submit application <ArrowRight size={15} />
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
