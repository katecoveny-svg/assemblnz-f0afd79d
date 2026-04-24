import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, User } from "lucide-react";

const EmbedDemoSection = () => (
  <section className="relative z-10 pt-[100px] pb-[100px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p
          className="uppercase mb-3"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            letterSpacing: "4px",
            color: "#4AA5A8",
          }}
        >
          Try it now
        </p>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: "2rem",
            color: "#1A1D29",
            marginBottom: "0.75rem",
          }}
        >
          Try it. Right now. No signup.
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "15px",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Ask a real compliance question. See how NZ legislation turns into a straight answer.
        </p>
      </motion.div>

      {/* Chat mockup */}
      <motion.div
        className="rounded-xl overflow-hidden mx-auto max-w-[700px]"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(74,165,168,0.15)" }}
          >
            <Bot size={14} style={{ color: "#4AA5A8" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "12px", color: "#1A1D29", letterSpacing: "2px" }}>
              AURA
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
              Accommodation & Hospitality Orchestrator
            </p>
          </div>
          <span
            className="ml-auto px-2 py-0.5 rounded-full text-[9px]"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: "rgba(58,125,110,0.15)",
              color: "#3A7D6E",
              letterSpacing: "1px",
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Messages */}
        <div className="px-5 py-5 space-y-4">
          {/* User message */}
          <div className="flex items-start gap-3 justify-end">
            <div
              className="rounded-xl px-4 py-3 max-w-[80%]"
              style={{
                background: "rgba(74,165,168,0.1)",
                border: "1px solid rgba(74,165,168,0.15)",
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#1A1D29" }}>
                Do I need a food control plan for my cafe?
              </p>
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}
            >
              <User size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>

          {/* AURA response */}
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(74,165,168,0.15)" }}
            >
              <Bot size={12} style={{ color: "#4AA5A8" }} />
            </div>
            <div
              className="rounded-xl px-4 py-3 max-w-[85%]"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Yes — under the <span style={{ color: "#4AA5A8" }}>Food Act 2014</span>, all food businesses in NZ must operate under either a Food Control Plan (FCP) or a National Programme. A cafe that prepares and serves food on-site would typically require a <span style={{ color: "#4AA5A8" }}>template Food Control Plan</span>, registered with your local council...
              </p>
              <p
                className="mt-2"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                Source: Food Act 2014, s 37–40
              </p>
            </div>
          </div>
        </div>

        {/* CTA — Kowhai Gold solid */}
        <div className="px-5 pb-5">
          <Link
            to="/chat/hospitality"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              background: "#4AA5A8",
              color: "#3D3428",
              border: "1px solid #4AA5A8",
              boxShadow: "0 0 20px rgba(74,165,168,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 35px rgba(74,165,168,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(74,165,168,0.2)";
            }}
          >
            Try it live <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default EmbedDemoSection;
