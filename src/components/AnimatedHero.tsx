import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ConstellationHero from "@/components/ConstellationHero";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const STAT_PILLS = [
  { value: "44", label: "specialist tools", color: "#D4A843" },
  { value: "50+", label: "NZ Acts", color: "#3A7D6E" },
  { value: "16", label: "industries", color: "#D4A843" },
  { value: "$89", label: "/mo NZD", color: "#3A7D6E" },
  { value: "Built in", label: "Aotearoa", color: "#D4A843" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden flex flex-col" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      {/* Full-bleed starfield background */}
      <ConstellationHero fullBleed />

      {/* Hero video background */}
      <motion.div
        className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <video
          src="/videos/hero-toroa.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Gradient overlay to keep text readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, #09090F 75%), " +
              "linear-gradient(to bottom, transparent 40%, #09090F 95%)",
          }}
        />
      </motion.div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(212,168,67,0.06) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 40% at 50% 60%, rgba(58,125,110,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8">

        {/* ASSEMBL wordmark */}
        <motion.h2
          className="uppercase text-foreground"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: isMobile ? "2rem" : "3.5rem",
            letterSpacing: isMobile ? "0.35em" : "0.5em",
            lineHeight: 1,
            marginBottom: isMobile ? "1rem" : "1.5rem",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Assembl
        </motion.h2>

        {/* Eyebrow */}
        <motion.p
          className="uppercase mb-4"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "4px",
            color: "#D4A843",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Business intelligence · Aotearoa
        </motion.p>

        {/* Main headline */}
        <motion.h1
          className="max-w-2xl mx-auto"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: isMobile ? "1.6rem" : "2.75rem",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            marginBottom: "1.25rem",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          Your business runs on NZ law.
          <br />
          <span style={{ color: "#D4A843" }}>Your tools should too.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.65)",
            maxWidth: "600px",
            marginBottom: "1.5rem",
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          44 specialist tools trained on New Zealand legislation, built with tikanga Māori at the core.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {STAT_PILLS.map((s) => (
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
              <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>{" "}
              {s.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={onScrollToGrid}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.1))",
              border: "1px solid rgba(212,168,67,0.4)",
              color: "#D4A843",
              boxShadow: "0 0 20px rgba(212,168,67,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 35px rgba(212,168,67,0.2)";
              e.currentTarget.style.borderColor = "rgba(212,168,67,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(212,168,67,0.1)";
              e.currentTarget.style.borderColor = "rgba(212,168,67,0.4)";
            }}
          >
            Browse all tools <ArrowRight size={16} />
          </button>
          <Link
            to="/content-hub"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              background: "transparent",
              border: "1px solid rgba(58,125,110,0.4)",
              color: "#3A7D6E",
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
            Explore the platform →
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollToGrid}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 transition-colors"
        style={{ color: "rgba(255,255,255,0.35)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default AnimatedHero;
