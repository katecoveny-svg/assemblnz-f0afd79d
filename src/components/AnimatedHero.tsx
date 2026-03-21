import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import AgentShowcase from "@/components/AgentShowcase";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";

const NexusHero3D = lazy(() =>
  import("@/components/NexusHero3D").catch(() => {
    window.location.reload();
    return import("@/components/NexusHero3D");
  })
);

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const FloatingOrb = ({ size, x, y, delay }: { size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{ width: size, height: size, background: 'rgba(255,255,255,0.03)', left: x, top: y }}
    animate={{
      x: [0, 30, -20, 0],
      y: [0, -40, 20, 0],
      scale: [1, 1.2, 0.9, 1],
      opacity: [0.03, 0.06, 0.02, 0.03],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const StatCounter = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="text-xl sm:text-2xl font-syne font-extrabold" style={{ color: '#E4E4EC' }}>
      {value}
    </div>
    <div className="text-[11px] font-jakarta mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
  </motion.div>
);

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Very subtle ambient orbs */}
      <FloatingOrb size={500} x="10%" y="-10%" delay={0} />
      <FloatingOrb size={400} x="60%" y="20%" delay={2} />
      <FloatingOrb size={350} x="30%" y="50%" delay={4} />

      {/* Very subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-syne font-extrabold mb-5 leading-tight"
            style={{ color: '#E4E4EC' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your AI <span className="text-gradient-hero">workforce</span>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-base sm:text-lg max-w-2xl mx-auto mb-6 font-jakarta"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          41 expert agents trained on NZ legislation. Try any agent free.
        </motion.p>

        {/* 3D Nexus Robot */}
        <Suspense fallback={
          <div className="w-full h-[340px] sm:h-[420px] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
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
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-syne font-bold overflow-hidden transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#E4E4EC',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            <span className="relative z-10 flex items-center gap-2">Browse agents <ArrowDown size={16} /></span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-syne font-bold transition-all duration-300"
              style={{
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              See pricing
            </Link>
          </motion.div>
        </motion.div>

        {/* Agent Showcase Carousel */}
        <AgentShowcase />

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            { value: "41", label: "Agents" },
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