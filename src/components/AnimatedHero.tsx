import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AgentShowcase from "@/components/AgentShowcase";
import AssemblHeroAgent from "@/components/AssemblHeroAgent";
import AnimatedAssemblLogo from "@/components/AnimatedAssemblLogo";
import { Link } from "react-router-dom";

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
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
        {/* Animated Assembl Logo */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <AnimatedAssemblLogo size={56} />
        </motion.div>

        {/* 3D Robot Hero */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <AssemblHeroAgent size={220} />
        </motion.div>

        {/* Main heading with hover glow region */}
        <motion.div
          className="hero-text-block rounded-2xl px-6 py-8 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-syne font-bold mb-2 leading-tight text-foreground" style={{ letterSpacing: '-0.025em' }}>
            The operating system for NZ business.
          </h1>
          <p className="text-2xl sm:text-4xl lg:text-[3rem] font-syne font-bold leading-tight text-gradient-hero" style={{ WebkitTextFillColor: 'unset', color: 'hsl(var(--primary))' }}>
            42 AI agents. Infinite leverage.
          </p>
        </motion.div>

        {/* Subheading with hover glow */}
        <motion.div
          className="hero-text-block rounded-xl px-4 py-4 mx-auto max-w-[640px] mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p
            className="text-sm sm:text-base font-jakarta leading-relaxed"
            style={{ color: '#71717A' }}
          >
            Replace six platforms with one intelligence layer. Your agents calculate PAYE, generate tenders, monitor compliance, build apps, and orchestrate marketing — all trained on NZ law, all sharing one brain.
          </p>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {STAT_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="font-mono-jb text-xs px-3.5 py-1.5 rounded-md"
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

        {/* CTAs with glass effect */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            to="/content-hub"
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-jakarta"
          >
            See what they build <ArrowRight size={16} />
          </Link>
          <button
            onClick={onScrollToGrid}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-jakarta transition-all duration-200"
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
