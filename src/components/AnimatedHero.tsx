import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import ConstellationHero from "@/components/ConstellationHero";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const STAT_PILLS = [
  { label: "44 specialist tools" },
  { label: "50+ NZ Acts" },
  { label: "16 industries" },
  { label: "From $89/mo NZD" },
  { label: "Built in Aotearoa" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden" style={{ minHeight: isMobile ? "100vh" : "92vh" }}>

      {/* ── Full-bleed cosmic starfield background ── */}
      <div className="absolute inset-0 z-0">
        <ConstellationHero size={0} fullBleed />
      </div>

      {/* ── Mauao mountain — bottom ── */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", zIndex: 2, pointerEvents: "none" }}
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="mf-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D1015" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#09090F" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="mf-rim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0" />
            <stop offset="30%" stopColor="#FFD860" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#D4A843" stopOpacity="1" />
            <stop offset="70%" stopColor="#3A7D6E" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,220 Q150,200 300,175 Q450,145 550,115 Q620,90 650,75 Q680,90 750,115 Q850,145 1000,175 Q1100,195 1200,210 L1200,220 Z" fill="url(#mf-fill)" />
        <path d="M0,220 Q150,200 300,175 Q450,145 550,115 Q620,90 650,75 Q680,90 750,115 Q850,145 1000,175 Q1100,195 1200,210" fill="none" stroke="url(#mf-rim)" strokeWidth="28" opacity="0.25" />
        <path d="M0,220 Q150,200 300,175 Q450,145 550,115 Q620,90 650,75 Q680,90 750,115 Q850,145 1000,175 Q1100,195 1200,210" fill="none" stroke="url(#mf-rim)" strokeWidth="10" opacity="0.55" />
        <path d="M0,220 Q150,200 300,175 Q450,145 550,115 Q620,90 650,75 Q680,90 750,115 Q850,145 1000,175 Q1100,195 1200,210" fill="none" stroke="url(#mf-rim)" strokeWidth="2.5" opacity="0.95" />
        <circle cx="650" cy="75" r="18" fill="#D4A843" opacity="0.18" />
        <circle cx="650" cy="75" r="8" fill="#FFD860" opacity="0.35" />
        <circle cx="650" cy="75" r="3" fill="white" opacity="0.5" />
        <g opacity="0.18" fill="#D4A843">
          <polygon points="80,210 88,198 96,210" /><polygon points="160,210 168,198 176,210" />
          <polygon points="240,210 248,198 256,210" /><polygon points="320,210 328,198 336,210" />
        </g>
        <g opacity="0.15" fill="#3A7D6E">
          <polygon points="580,212 588,200 596,212" /><polygon points="660,212 668,200 676,212" />
          <polygon points="740,212 748,200 756,212" /><polygon points="840,212 848,200 856,212" />
        </g>
      </svg>

      {/* ── Hero content — centred ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6" style={{ minHeight: isMobile ? "100vh" : "92vh", paddingBottom: "120px" }}>

        {/* Constellation lockup — mark + wordmark stacked */}
        <motion.div
          className="flex flex-col items-center mb-8 sm:mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Orbital mark */}
          <div className="relative flex items-center justify-center mb-6 sm:mb-8">
            {/* Orbit rings */}
            <motion.div
              style={{ position: "absolute", width: isMobile ? 130 : 200, height: isMobile ? 130 : 200, borderRadius: "50%", border: "1px solid rgba(212,168,67,0.25)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              style={{ position: "absolute", width: isMobile ? 100 : 155, height: isMobile ? 100 : 155, borderRadius: "50%", border: "1px solid rgba(58,125,110,0.18)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            />
            {/* Gold centre glow */}
            <motion.div
              style={{ position: "absolute", width: isMobile ? 60 : 90, height: isMobile ? 60 : 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,67,0.2) 0%, rgba(58,125,110,0.08) 60%, transparent 100%)", filter: "blur(18px)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* SVG mark */}
            <motion.svg
              width={isMobile ? 56 : 80}
              height={isMobile ? 56 : 80}
              viewBox="0 0 36 36"
              fill="none"
              style={{ position: "relative", zIndex: 10 }}
              animate={{
                scale: [1, 1.06, 1],
                filter: [
                  "drop-shadow(0 0 10px rgba(212,168,67,.9)) drop-shadow(0 0 30px rgba(212,168,67,.55)) drop-shadow(0 0 60px rgba(212,168,67,.2))",
                  "drop-shadow(0 0 22px rgba(255,220,80,1)) drop-shadow(0 0 60px rgba(212,168,67,.85)) drop-shadow(0 0 120px rgba(212,168,67,.45))",
                  "drop-shadow(0 0 10px rgba(212,168,67,.9)) drop-shadow(0 0 30px rgba(212,168,67,.55)) drop-shadow(0 0 60px rgba(212,168,67,.2))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <defs>
                <radialGradient id="h-g" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#F0D078"/><stop offset="50%" stopColor="#D4A843"/><stop offset="100%" stopColor="#8B6020"/></radialGradient>
                <radialGradient id="h-p" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#7ACFC2"/><stop offset="50%" stopColor="#3A7D6E"/><stop offset="100%" stopColor="#1E5044"/></radialGradient>
                <radialGradient id="h-pl" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#5AADA0"/><stop offset="50%" stopColor="#2E6B5E"/><stop offset="100%" stopColor="#153D35"/></radialGradient>
                <radialGradient id="h-hi" cx="35%" cy="30%" r="28%"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
                <linearGradient id="h-l" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D4A843" stopOpacity="0.7"/><stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.65"/></linearGradient>
              </defs>
              <motion.line x1="18" y1="8" x2="8" y2="26" stroke="url(#h-l)" strokeWidth="1.3" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
              <motion.line x1="18" y1="8" x2="28" y2="26" stroke="url(#h-l)" strokeWidth="1.3" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }} />
              <motion.line x1="8" y1="26" x2="28" y2="26" stroke="url(#h-l)" strokeWidth="1.3" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} />
              <circle cx="18" cy="8" r="4.8" fill="url(#h-g)"/><circle cx="18" cy="8" r="4.8" fill="url(#h-hi)"/>
              <circle cx="8" cy="26" r="4.8" fill="url(#h-p)"/><circle cx="8" cy="26" r="4.8" fill="url(#h-hi)"/>
              <circle cx="28" cy="26" r="4.8" fill="url(#h-pl)"/><circle cx="28" cy="26" r="4.8" fill="url(#h-hi)"/>
            </motion.svg>
          </div>

          {/* ASSEMBL wordmark */}
          <motion.span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: isMobile ? "1.6rem" : "2.6rem",
              letterSpacing: isMobile ? "0.45em" : "0.55em",
              textTransform: "uppercase" as const,
              background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #D4A843 72%, #3A7D6E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "block",
            }}
            animate={{
              filter: [
                "drop-shadow(0 0 16px rgba(212,168,67,.65)) drop-shadow(0 0 48px rgba(212,168,67,.3))",
                "drop-shadow(0 0 32px rgba(255,220,80,1)) drop-shadow(0 0 80px rgba(212,168,67,.7)) drop-shadow(0 0 140px rgba(212,168,67,.35))",
                "drop-shadow(0 0 16px rgba(212,168,67,.65)) drop-shadow(0 0 48px rgba(212,168,67,.3))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ASSEMBL
          </motion.span>

          {/* Tagline */}
          <motion.p
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: isMobile ? "9px" : "10px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(58,125,110,0.65)", marginTop: "8px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Business Intelligence · NZ
          </motion.p>
        </motion.div>

        {/* Main heading */}
        <motion.div
          className="max-w-3xl mx-auto mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h1
            className="text-[1.65rem] sm:text-5xl lg:text-[3.5rem] font-display font-extrabold mb-2 leading-[1.1] text-foreground"
            style={{ letterSpacing: "-0.03em" }}
          >
            Your business runs on NZ law.
          </h1>
          <p
            className="text-xl sm:text-4xl lg:text-[3rem] font-display font-extrabold leading-[1.15] text-gradient-hero pb-2"
            style={{ letterSpacing: "-0.02em" }}
          >
            Your tools should too.
          </p>
        </motion.div>

        {/* Subheading */}
        <motion.p
          className="text-xs sm:text-[15px] font-body font-normal leading-relaxed max-w-[600px] mx-auto mb-6"
          style={{ color: "rgba(255,255,255,0.55)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          44 specialist tools trained on New Zealand legislation, built with tikanga Māori at the core, covering every industry from tourism and hospitality, construction to maritime. The compliance, operations, and strategy platform Aotearoa's been missing.
        </motion.p>

        {/* Pounamu divider */}
        <motion.div
          className="w-full max-w-xs mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,67,.4), rgba(58,125,110,.4), transparent)" }}
        />

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {STAT_PILLS.map((pill) => (
            <span
              key={pill.label}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "6px 14px", borderRadius: "9999px" }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <button onClick={onScrollToGrid} className="cta-glass-green inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm">
            Browse All Agents <ArrowRight size={16} />
          </button>
          <Link to="/content-hub" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm">
            Explore the platform →
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default AnimatedHero;
