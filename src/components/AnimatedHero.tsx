import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AgentShowcase from "@/components/AgentShowcase";
import AssemblHeroAgent from "@/components/AssemblHeroAgent";
import AnimatedAssemblLogo from "@/components/AnimatedAssemblLogo";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const STAT_PILLS = [
  { label: "46 specialist tools" },
  { label: "50+ NZ Acts" },
  { label: "16 industries" },
  { label: "From $89/mo NZD" },
  { label: "Built in Aotearoa" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();
  const heroSize = isMobile ? 240 : 420;

  return (
    <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[85vh] flex flex-col items-center">
      {/* Multi-layer ambient aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] sm:w-[1400px] h-[600px] sm:h-[1000px]"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 35% 30%, hsla(263, 80%, 55%, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 65% 40%, hsla(189, 100%, 50%, 0.07) 0%, transparent 55%),
              radial-gradient(ellipse 70% 50% at 50% 50%, hsla(160, 84%, 50%, 0.05) 0%, transparent 65%)
            `,
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px),
              linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-16 text-center relative z-10 flex flex-col items-center">
        {/* Animated Assembl Logo */}
        <motion.div
          className="flex justify-center mb-1 sm:mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <AnimatedAssemblLogo size={isMobile ? 52 : 80} />
        </motion.div>

        {/* Robot Hero */}
        <motion.div
          className="flex justify-center -mb-2 sm:-mb-4"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
        >
          <AssemblHeroAgent size={heroSize} />
        </motion.div>

        {/* Main heading — refined typography */}
        <motion.div
          className="hero-text-block rounded-2xl px-4 sm:px-6 py-4 sm:py-6 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1
            className="text-[1.65rem] sm:text-5xl lg:text-[3.5rem] font-display font-extrabold mb-2 leading-[1.1] text-foreground"
            style={{ letterSpacing: '-0.03em' }}
          >
            Your business runs on NZ law.
          </h1>
          <p
            className="text-xl sm:text-4xl lg:text-[3rem] font-display font-extrabold leading-[1.15] text-gradient-hero pb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Your tools should too.
          </p>
        </motion.div>

        {/* Subheading */}
        <motion.div
          className="hero-text-block rounded-xl px-4 py-2 sm:py-3 mx-auto max-w-[640px] mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-xs sm:text-[15px] font-body font-normal leading-relaxed text-white/65">
            46 specialist tools trained on New Zealand legislation, built with tikanga Māori at the core, covering every industry from tourism and hospitality, construction to maritime. The compliance, operations, and strategy platform Aotearoa's been missing.
          </p>
        </motion.div>

        {/* Stat pills — premium chip style */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-6 sm:mb-10 mt-5 sm:mt-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {STAT_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="font-mono text-[10px] sm:text-[11px] px-3 sm:px-4 py-1.5 rounded-full text-white/35"
              style={{
                background: 'hsl(var(--surface-2) / 0.6)',
                border: '1px solid hsl(var(--border) / 0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs — refined */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={onScrollToGrid}
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm"
          >
            Browse All Agents <ArrowRight size={16} />
          </button>
          <Link
            to="/content-hub"
            className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm"
          >
            Explore the platform →
          </Link>
        </motion.div>

        {/* Agent Showcase Carousel */}
        <AgentShowcase />
      </div>
    </section>
  );
};

export default AnimatedHero;
