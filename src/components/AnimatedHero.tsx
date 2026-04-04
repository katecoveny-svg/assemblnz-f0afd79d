import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const PROOF_STRIP = [
  { value: "44+", label: "specialist agents", color: "#D4A843" },
  { value: "9", label: "industry kete", color: "#3A7D6E" },
  { value: "NZ", label: "built & hosted", color: "#7B68EE" },
  { value: "SMS", label: "-ready", color: "#89CFF0" },
];

/** Decorative constellation SVG behind the hero text */
const ConstellationMark = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
    style={{ opacity: 0.12 }}
  >
    {/* Large constellation nodes */}
    <circle cx="150" cy="120" r="4" fill="#D4A843" />
    <circle cx="350" cy="80" r="3" fill="#3A7D6E" />
    <circle cx="550" cy="140" r="5" fill="#7B68EE" />
    <circle cx="680" cy="90" r="3" fill="#D4A843" />
    <circle cx="100" cy="350" r="3.5" fill="#89CFF0" />
    <circle cx="250" cy="420" r="4" fill="#C17A3A" />
    <circle cx="500" cy="380" r="3" fill="#3A7D6E" />
    <circle cx="700" cy="350" r="4.5" fill="#D4A843" />
    <circle cx="400" cy="250" r="6" fill="#D4A843" opacity="0.7" />
    <circle cx="200" cy="250" r="2.5" fill="#E8B4B8" />
    <circle cx="600" cy="260" r="3" fill="#90EE90" />

    {/* Connecting lines */}
    <line x1="150" y1="120" x2="350" y2="80" stroke="#D4A843" strokeWidth="0.8" opacity="0.3" />
    <line x1="350" y1="80" x2="550" y2="140" stroke="#3A7D6E" strokeWidth="0.8" opacity="0.25" />
    <line x1="550" y1="140" x2="680" y2="90" stroke="#7B68EE" strokeWidth="0.8" opacity="0.2" />
    <line x1="150" y1="120" x2="200" y2="250" stroke="#D4A843" strokeWidth="0.5" opacity="0.2" />
    <line x1="200" y1="250" x2="400" y2="250" stroke="#E8B4B8" strokeWidth="0.5" opacity="0.15" />
    <line x1="400" y1="250" x2="600" y2="260" stroke="#D4A843" strokeWidth="0.5" opacity="0.2" />
    <line x1="600" y1="260" x2="700" y2="350" stroke="#90EE90" strokeWidth="0.5" opacity="0.15" />
    <line x1="100" y1="350" x2="250" y2="420" stroke="#89CFF0" strokeWidth="0.8" opacity="0.2" />
    <line x1="250" y1="420" x2="500" y2="380" stroke="#C17A3A" strokeWidth="0.5" opacity="0.15" />
    <line x1="500" y1="380" x2="700" y2="350" stroke="#3A7D6E" strokeWidth="0.5" opacity="0.2" />
    <line x1="350" y1="80" x2="400" y2="250" stroke="#3A7D6E" strokeWidth="0.5" opacity="0.1" />
    <line x1="550" y1="140" x2="600" y2="260" stroke="#7B68EE" strokeWidth="0.5" opacity="0.1" />
  </svg>
);

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Dark base */}
      <div className="absolute inset-0 z-0" style={{ background: "#09090F" }} />

      {/* Radial ambient glow — gold + pounamu */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 35% at 50% 40%, rgba(212,168,67,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 30% 60%, rgba(58,125,110,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 70% 55%, rgba(123,104,238,0.03) 0%, transparent 70%)
        `
      }} />

      {/* Constellation SVG */}
      <div className="absolute inset-0 z-[2]">
        <ConstellationMark />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8" style={{ paddingTop: isMobile ? "6rem" : "10rem", paddingBottom: "4rem" }}>
        {/* Supertitle badge */}
        <motion.div
          className="mb-6 px-5 py-2 rounded-full"
          style={{
            background: "rgba(15,15,26,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(212,168,67,0.2)",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-[10px] tracking-[4px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843", fontWeight: 500 }}>
            THE AI OPERATING SYSTEM FOR AOTEAROA
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="max-w-4xl mx-auto mb-6"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: isMobile ? "2rem" : "3.5rem",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          44+ specialist agents.{" "}
          <span className="text-gradient-hero">9 industry kete.</span>
          <br />
          One intelligent brain.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="max-w-[640px] mb-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: isMobile ? "15px" : "17px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.6)",
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          Quoting, payroll, compliance, marketing, construction, hospitality — every workflow connected and automated. Built and hosted in New Zealand.
        </motion.p>

        {/* Pricing hook */}
        <motion.p
          className="mb-6"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            color: "rgba(255,255,255,0.35)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          From $199/mo + GST. 14-day free trial — no credit card required.
        </motion.p>

        {/* Proof strip */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {PROOF_STRIP.map((s) => (
            <span
              key={s.label}
              className="px-4 py-2 rounded-full text-xs"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                background: "rgba(15,15,26,0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>{" "}{s.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <Link
            to="/pricing"
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
          >
            Start free trial <ArrowRight size={16} />
          </Link>
          <button
            onClick={onScrollToGrid}
            className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
          >
            Explore industry packs →
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollToGrid}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-colors"
        style={{ color: "rgba(255,255,255,0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={28} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default AnimatedHero;
