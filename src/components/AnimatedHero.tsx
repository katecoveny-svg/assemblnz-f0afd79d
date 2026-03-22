import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import AgentShowcase from "@/components/AgentShowcase";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";

const NexusHero3D = lazy(() =>
  import("@/components/NexusHero3D").catch(() => {
    return { default: () => null };
  })
);

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const FloatingOrb = ({ size, x, y, delay, hue }: { size: number; x: string; y: string; delay: number; hue: string }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{ width: size, height: size, background: hue, left: x, top: y }}
    animate={{
      x: [0, 30, -20, 0],
      y: [0, -40, 20, 0],
      scale: [1, 1.15, 0.95, 1],
      opacity: [0.04, 0.08, 0.03, 0.04],
    }}
    transition={{ duration: 10 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const StatCounter = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="text-xl sm:text-2xl font-syne font-extrabold text-foreground">
      {value}
    </div>
    <div className="text-[11px] font-jakarta mt-0.5 text-muted-foreground">{label}</div>
  </motion.div>
);

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Premium ambient orbs — warm gold + cool blue */}
      <FloatingOrb size={500} x="5%" y="-10%" delay={0} hue="hsla(38, 65%, 58%, 0.06)" />
      <FloatingOrb size={400} x="65%" y="15%" delay={2} hue="hsla(220, 60%, 75%, 0.05)" />
      <FloatingOrb size={350} x="35%" y="55%" delay={4} hue="hsla(280, 50%, 72%, 0.04)" />

      {/* Subtle premium grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(hsla(220, 15%, 50%, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, hsla(220, 15%, 50%, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-syne font-extrabold mb-5 leading-tight text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Built for <span className="text-gradient-hero">NZ Business</span>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-base sm:text-lg max-w-2xl mx-auto mb-6 font-jakarta text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          42 AI agents trained on NZ legislation, compliance, and industry best practice.
        </motion.p>

        {/* 3D Nexus Robot */}
        <Suspense fallback={
          <div className="w-full h-[340px] sm:h-[420px] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-border border-t-foreground/40 animate-spin" />
          </div>
        }>
          <NexusHero3D />
        </Suspense>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button
            onClick={onScrollToGrid}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-syne font-bold overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsla(38, 65%, 58%, 0.15), hsla(220, 60%, 75%, 0.1))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsla(38, 65%, 58%, 0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-2">Browse agents <ArrowDown size={16} /></span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-syne font-bold transition-all duration-300 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            >
              See pricing
            </Link>
          </motion.div>
        </motion.div>

        {/* Agent Showcase Carousel */}
        <AgentShowcase />

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            { value: "42", label: "Agents" },
            { value: "20+", label: "NZ Industries" },
            { value: "50+", label: "Acts Referenced" },
            { value: "24/7", label: "Always On" },
          ].map((stat, i) => (
            <StatCounter key={stat.label} {...stat} delay={0.7 + i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero;
