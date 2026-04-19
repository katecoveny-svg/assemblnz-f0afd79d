import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, LayoutDashboard, ShieldCheck, Database, Shield, FileText, Activity, Bell } from "lucide-react";
import toroaIcon from "@/assets/brand/toroa-logo.svg";
import { teKahuiReoMark } from "@/assets/brand";

const GOLD = "#D4A843";
const GOLD_STYLE = { color: GOLD, filter: "drop-shadow(0 0 6px rgba(212,168,67,0.5))" };

const TE_KAHUI_REO_AGENTS = [
  { name: "IHO", subtitle: "Intelligence", desc: "Intelligent router & orchestrator", Icon: Layers },
  { name: "KANOHI", subtitle: "Dashboard", desc: "Front-of-house interface", Icon: LayoutDashboard },
  { name: "MANA", subtitle: "Access", desc: "Access control & authentication", Icon: ShieldCheck },
  { name: "MAHARA", subtitle: "Memory", desc: "Memory & context engine", Icon: Database },
  { name: "KAHU", subtitle: "Compliance", desc: "Compliance & privacy guardian", Icon: Shield },
  { name: "TĀ", subtitle: "Audit", desc: "Audit trail & billing logger", Icon: FileText },
  { name: "PŪNAHA", subtitle: "Health", desc: "System health monitor", Icon: Activity },
  { name: "TOHU", subtitle: "Alerts", desc: "Notification & alert system", Icon: Bell },
];

const TeKahuiReoSection = () => (
  <section
    className="relative z-10 pt-[100px] pb-[100px] overflow-hidden"
    style={{
      background: "#FAFBFC",
      borderTop: "1px solid rgba(255,255,255,0.5)",
    }}
  >
    {/* Subtle pounamu nebula orb */}
    <div
      className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
      style={{
        background: "radial-gradient(circle at 80% 20%, rgba(58,125,110,0.08) 0%, transparent 60%)",
      }}
    />

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <img loading="lazy" decoding="async"
            src={teKahuiReoMark}
            alt="Te Kāhui Reo"
            className="w-8 h-8"
            style={{ filter: "drop-shadow(0 0 12px rgba(212,168,67,0.5))" }} />
          <p
            className="uppercase"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 500,
              fontSize: "13px",
              letterSpacing: "6px",
              color: "#D4A843",
            }}
          >
            Te Kāhui Reo
          </p>
        </div>
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "2.25rem",
            color: "#1A1D29",
            marginBottom: "1rem",
          }}
        >
          8 Māori Business Intelligence Agents
        </h2>
        <p
          className="max-w-2xl mx-auto"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            marginBottom: "0.75rem",
          }}
        >
          Bilingual. Aligning with tikanga Māori governance principles. Built to serve whānau, hapū, and Māori enterprise with tools that speak te reo and understand Te Tiriti obligations.
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            color: "#D4A843",
            fontStyle: "italic",
          }}
        >
          The first bilingual AI business intelligence system built in Aotearoa.
        </p>
      </motion.div>

      {/* 4x2 agent grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {TE_KAHUI_REO_AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="rounded-xl p-5"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderLeft: "3px solid rgba(58,125,110,0.4)",
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(212,168,67,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <agent.Icon size={24} style={GOLD_STYLE} className="shrink-0" />
              <div>
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: "13px",
                    color: "#1A1D29",
                    letterSpacing: "2px",
                  }}
                >
                  {agent.name}
                </p>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 400,
                    fontSize: "9px",
                    color: "rgba(212,168,67,0.7)",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {agent.subtitle}
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {agent.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Toro showcase */}
      <motion.div
        className="rounded-xl overflow-hidden mb-8"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(212,168,67,0.2)",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/2 relative">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ minHeight: "220px" }}
            >
              <source src="/videos/toroa-fly.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="sm:w-1/2 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <img loading="lazy" decoding="async" src={toroaIcon} alt="Toro" className="w-12 h-12 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 12px rgba(212,168,67,0.3))" }} />
              <div>
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: "15px",
                    color: "#D4A843",
                    letterSpacing: "3px",
                  }}
                >
                  TORO
                </span>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Family AI Navigator
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              SMS-first whānau intelligence. Meal plans, budgets, school admin, and NZ benefit eligibility — all from a text message. $29/mo.
            </p>
            <Link
              to="/toro"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                color: "#D4A843",
              }}
            >
              Try Toro <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/content-hub"
          className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-xl transition-all duration-300"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            color: "#3A7D6E",
            border: "1px solid rgba(58,125,110,0.4)",
            background: "rgba(58,125,110,0.05)",
          }}
        >
          Explore Te Kāhui Reo <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

export default TeKahuiReoSection;
