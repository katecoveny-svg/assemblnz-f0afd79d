import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import AnimatedAssemblLogo from "@/components/AnimatedAssemblLogo";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const FLAGSHIP_AGENTS = [
  { name: "APEX", role: "Construction Compliance", color: "#00FF88", id: "construction" },
  { name: "AURA", role: "Luxury Hospitality", color: "#00FF88", id: "hospitality" },
  { name: "HAVEN", role: "Property Management", color: "#B388FF", id: "property" },
  { name: "LEDGER", role: "Accounting & Tax", color: "#00E5FF", id: "accounting" },
  { name: "ANCHOR", role: "Legal Advisory", color: "#00E5FF", id: "legal" },
];

const ANIMATED_STATS = [
  { value: "42", label: "AI Agents" },
  { value: "16", label: "Industries" },
  { value: "50+", label: "NZ Acts" },
  { value: "24/7", label: "Always On" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % FLAGSHIP_AGENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const agent = FLAGSHIP_AGENTS[activeAgent];

  return (
    <section className="relative overflow-hidden min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center">
      {/* Multi-layered cosmic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1200px] h-[600px] sm:h-[1200px]"
          style={{
            background: "radial-gradient(ellipse at center, hsla(160,84%,39%,0.06) 0%, hsla(189,100%,50%,0.04) 20%, hsla(263,100%,76%,0.03) 40%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px]"
          style={{
            background: "radial-gradient(circle, hsla(160,84%,39%,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[300px] h-[300px]"
          style={{
            background: "radial-gradient(circle, hsla(263,100%,76%,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-4 sm:mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <AnimatedAssemblLogo size={isMobile ? 48 : 72} />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="text-3xl sm:text-6xl lg:text-7xl font-syne font-bold mb-4 leading-[1.1] text-foreground"
          style={{ letterSpacing: "-0.03em" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          The operating system
          <br />
          <span className="text-gradient-hero">for NZ business.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-sm sm:text-lg font-jakarta text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          42 AI agents trained on NZ legislation. Replace six platforms with one intelligence layer.
          PAYE, tenders, compliance, marketing — all sharing one brain.
        </motion.p>

        {/* Animated stat counters */}
        <motion.div
          className="grid grid-cols-4 gap-3 sm:gap-8 mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {ANIMATED_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl sm:text-4xl font-syne font-extrabold text-gradient-hero"
              >
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-jakarta text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            to="/signup"
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold font-jakarta"
          >
            Start free <ArrowRight size={16} />
          </Link>
          <button
            onClick={onScrollToGrid}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold font-jakarta transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "#FAFAFA",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <Play size={14} /> See all 42 agents
          </button>
        </motion.div>

        {/* Rotating agent showcase */}
        <motion.div
          className="relative w-full max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div
            className="rounded-2xl p-4 sm:p-6 border"
            style={{
              background: "rgba(14,14,26,0.6)",
              backdropFilter: "blur(16px)",
              borderColor: agent.color + "20",
              boxShadow: `0 0 60px ${agent.color}08`,
              transition: "border-color 0.5s, box-shadow 0.5s",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] font-mono-jb text-muted-foreground">assembl.nz/chat</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}30`,
                  }}
                >
                  <span className="text-lg sm:text-xl font-syne font-bold" style={{ color: agent.color }}>
                    {agent.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-syne font-bold text-foreground">{agent.name}</span>
                    <span
                      className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
                      style={{ background: `${agent.color}15`, color: agent.color }}
                    >
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-jakarta text-muted-foreground">{agent.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Agent carousel dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {FLAGSHIP_AGENTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveAgent(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === activeAgent ? FLAGSHIP_AGENTS[i].color : "rgba(255,255,255,0.15)",
                    width: i === activeAgent ? "16px" : "6px",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <span className="text-[10px] sm:text-xs font-jakarta text-muted-foreground/60">
            FIRST AI OPERATING SYSTEM BUILT FOR NZ
          </span>
          <div className="hidden sm:flex items-center gap-6">
            {["NZ Legislation", "Privacy Act 2020", "Built in Auckland"].map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-mono-jb px-3 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#71717A",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedHero;
