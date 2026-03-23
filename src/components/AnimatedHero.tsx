import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AgentShowcase from "@/components/AgentShowcase";
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-syne font-bold mb-2 leading-tight" style={{ color: '#FAFAFA', letterSpacing: '-0.025em' }}>
            The operating system for NZ business.
          </h1>
          <p className="text-2xl sm:text-4xl lg:text-[3rem] font-syne font-bold leading-tight" style={{ color: '#10B981', letterSpacing: '-0.025em' }}>
            42 AI agents. Infinite leverage.
          </p>
        </motion.div>

        <motion.p
          className="text-sm sm:text-base max-w-[640px] mx-auto mt-6 mb-8 font-jakarta leading-relaxed"
          style={{ color: '#71717A' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Replace six platforms with one intelligence layer. Your agents calculate PAYE, generate tenders, monitor compliance, build apps, and orchestrate marketing — all trained on NZ law, all sharing one brain.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            to="/content-hub"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-jakarta transition-colors duration-200"
            style={{ background: '#10B981', color: '#09090B' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
            onMouseLeave={e => (e.currentTarget.style.background = '#10B981')}
          >
            See what they build <ArrowRight size={16} />
          </Link>
          <button
            onClick={onScrollToGrid}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-jakarta transition-colors duration-200"
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
