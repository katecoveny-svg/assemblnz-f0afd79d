import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ConstellationHero from "@/components/ConstellationHero";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col">
      {/* ── Full-bleed starfield background ── */}
      <ConstellationHero fullBleed />

      {/* Radial glow — kōwhai/pounamu centre wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 55%, hsla(var(--kowhai), 0.06) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 40% at 50% 60%, hsla(var(--pounamu), 0.05) 0%, transparent 60%)",
        }}
      />

      {/* ── Content layer ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8 pb-24">


        {/* Eyebrow */}
        <motion.p
          className="font-display uppercase tracking-[0.35em] text-[10px] sm:text-[11px] text-muted-foreground mb-6"
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Business intelligence · Aotearoa
        </motion.p>

        {/* ASSEMBL wordmark */}
        <motion.h2
          className="font-display uppercase text-foreground mb-8"
          style={{
            fontWeight: 300,
            fontSize: isMobile ? "2.2rem" : "4rem",
            letterSpacing: isMobile ? "0.35em" : "0.5em",
            lineHeight: 1,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Assembl
        </motion.h2>

        {/* Main headline */}
        <motion.h1
          className="font-display max-w-2xl mx-auto mb-5"
          style={{
            fontWeight: 300,
            fontSize: isMobile ? "1.5rem" : "2.5rem",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "hsl(var(--foreground))",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Your business runs on NZ law.{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary via-primary to-pounamu bg-clip-text text-transparent">
            Your tools should too.
          </span>
        </motion.h1>

        {/* Sub copy */}
        <motion.p
          className="font-body text-sm sm:text-[15px] leading-relaxed max-w-lg mx-auto text-muted-foreground mb-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          44 specialist tools trained on New Zealand legislation, built with
          tikanga Māori at the core.
        </motion.p>

        {/* Stat line */}
        <motion.div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <span><span className="text-primary">44</span> tools</span>
          <span><span className="text-pounamu-light">50+</span> NZ Acts</span>
          <span><span className="text-primary">16</span> industries</span>
          <span>From <span className="text-primary">$89</span>/mo NZD</span>
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
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full"
          >
            Browse all tools <ArrowRight size={16} />
          </button>
          <Link
            to="/content-hub"
            className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full"
          >
            Explore the platform →
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollToGrid}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground hover:text-foreground transition-colors"
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
