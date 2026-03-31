import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import toroaIcon from "@/assets/brand/toroa-hero.png";

const TE_KAHUI_REO_AGENTS = [
  { name: "IHO", desc: "Intelligent router & orchestrator" },
  { name: "KANOHI", desc: "Front-of-house interface" },
  { name: "MANA", desc: "Access control & authentication" },
  { name: "MAHARA", desc: "Memory & context engine" },
  { name: "KAHU", desc: "Compliance & privacy guardian" },
  { name: "TĀ", desc: "Audit & billing logger" },
  { name: "PŪNAHA", desc: "System health monitor" },
  { name: "TOHU", desc: "Notification & alert system" },
];

const TeKahuiReoSection = () => (
  <section
    className="relative z-10 py-16 sm:py-24 overflow-hidden"
    style={{
      background: "#0F0F1A",
      borderTop: "1px solid rgba(255,255,255,0.08)",
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="uppercase mb-3"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 900,
            fontSize: "13px",
            letterSpacing: "6px",
            color: "#D4A843",
          }}
        >
          Te Kāhui Reo
        </p>
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "2.25rem",
            color: "#FFFFFF",
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
          }}
        >
          Bilingual. Tikanga-governed. Built to serve whānau, hapū, and Māori enterprise with tools that speak te reo and understand Te Tiriti obligations.
        </p>
      </motion.div>

      {/* 4x2 agent grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {TE_KAHUI_REO_AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="rounded-xl p-4"
            style={{
              background: "rgba(15,15,26,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(212,168,67,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                color: "#FFFFFF",
                letterSpacing: "2px",
                marginBottom: "4px",
              }}
            >
              {agent.name}
            </p>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "11px",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {agent.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA + Tōroa card */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
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
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(58,125,110,0.6)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(58,125,110,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(58,125,110,0.4)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Explore Te Kāhui Reo <ArrowRight size={14} />
        </Link>

        <div
          className="flex-1 rounded-xl px-5 py-4"
          style={{
            background: "rgba(15,15,26,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(212,168,67,0.15)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#D4A843",
                  letterSpacing: "2px",
                }}
              >
                TŌROA
              </span>
              <span
                className="ml-3"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Family AI Navigator · SMS-first · Whānau intelligence · From $14/mo
              </span>
            </div>
            <Link
              to="/chat/toroa"
              className="text-xs transition-colors"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                color: "#D4A843",
              }}
            >
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TeKahuiReoSection;
