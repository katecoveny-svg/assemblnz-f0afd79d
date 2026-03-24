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
  { label: "42 agents" },
  { label: "50+ NZ Acts" },
  { label: "7 symbiotic workflows" },
  { label: "From $89/mo NZD" },
  { label: "Built in Aotearoa" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();
  const heroSize = isMobile ? 240 : 420;

  return (
    <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[85vh] flex flex-col items-center">
      {/* Cosmic background glow — positioned high */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[900px] h-[500px] sm:h-[900px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsla(189,100%,50%,0.08) 0%, hsla(224,100%,68%,0.06) 25%, hsla(263,100%,76%,0.04) 40%, transparent 65%)",
        }}
      />

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

        {/* Main heading */}
        <motion.div
          className="hero-text-block rounded-2xl px-4 sm:px-6 py-4 sm:py-6 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-2xl sm:text-5xl lg:text-[3.5rem] font-syne font-bold mb-2 leading-tight text-foreground" style={{ letterSpacing: '-0.025em' }}>
            The operating system for NZ business.
          </h1>
          <p className="text-xl sm:text-4xl lg:text-[3rem] font-syne font-bold leading-normal text-gradient-hero pb-2">
            42 AI agents. Infinite leverage.
          </p>
        </motion.div>

        {/* Subheading */}
        <motion.div
          className="hero-text-block rounded-xl px-4 py-2 sm:py-3 mx-auto max-w-[640px] mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p
            className="text-xs sm:text-base font-jakarta leading-relaxed"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Replace six platforms with one intelligence layer. Your agents calculate PAYE, generate tenders, monitor compliance, build apps, and orchestrate marketing — all trained on NZ law, all sharing one brain.
          </p>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10 mt-4 sm:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {STAT_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="font-mono-jb text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#A1A1AA',
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            to="/content-hub"
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold font-jakarta"
          >
            See what they build <ArrowRight size={16} />
          </Link>
          <button
            onClick={onScrollToGrid}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold font-jakarta transition-all duration-200"
            style={{ background: 'transparent', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            Explore all 42 agents →
          </button>
        </motion.div>

        {/* Agent Showcase Carousel */}
        <AgentShowcase />
      </div>
    </section>
  );
};

export default AnimatedHero;
