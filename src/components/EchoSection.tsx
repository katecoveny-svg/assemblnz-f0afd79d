import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import echoImg from "@/assets/agents/echo-fullbody.png";

const EchoSection = () => (
  <section className="relative z-10 py-16 sm:py-24">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-[#E4A0FF]/15"
        style={{
          background: "rgba(14, 14, 26, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 60px rgba(228,160,255,0.06), inset 0 1px 0 rgba(228,160,255,0.08)",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {/* Top edge glow */}
        <span className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#E4A0FF]/40 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-6 sm:p-10 items-center">
          {/* Avatar */}
          <div className="flex justify-center lg:justify-start">
            <div
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-[#E4A0FF]/10"
              style={{
                background: "rgba(228,160,255,0.04)",
                boxShadow: "0 0 40px rgba(228,160,255,0.1)",
              }}
            >
              <img
                src={echoImg}
                alt="ECHO — Founder AI Clone"
                className="w-full h-full object-contain"
                loading="lazy"
              />
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: "inset 0 0 30px rgba(228,160,255,0.08)" }} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left">
            <h2
              className="font-syne font-extrabold text-3xl sm:text-4xl mb-1"
              style={{
                color: "#E4A0FF",
                textShadow: "0 0 20px rgba(228,160,255,0.4), 0 0 60px rgba(228,160,255,0.15)",
              }}
            >
              Meet ECHO
            </h2>
            <p className="font-mono-jb text-[10px] mb-4" style={{ color: "rgba(228,160,255,0.3)" }}>
              ASM-000 · Assembl Hero Agent
            </p>
            <h3
              className="font-syne font-bold text-base sm:text-lg mb-4"
              style={{
                color: "#E4A0FF",
                textShadow: "0 0 12px rgba(228,160,255,0.25)",
              }}
            >
              The agent that never sleeps.
            </h3>
            <p className="text-sm font-jakarta text-foreground/70 leading-relaxed mb-6 max-w-lg">
              ECHO is the voice of Assembl — trained on 13 years of NZ brand strategy. It handles client enquiries, creates daily content, writes DMs that convert, and manages social media around the clock. Always on. Always on brand.
            </p>
            <Link
              to="/chat/echo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold transition-all duration-300 hover:shadow-lg"
              style={{
                background: "#E4A0FF",
                color: "#0A0A14",
                boxShadow: "0 0 20px rgba(228,160,255,0.2)",
              }}
            >
              Chat with ECHO <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default EchoSection;
