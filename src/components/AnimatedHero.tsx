import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const FloatingOrb = ({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{ width: size, height: size, background: color, left: x, top: y }}
    animate={{
      x: [0, 30, -20, 0],
      y: [0, -40, 20, 0],
      scale: [1, 1.2, 0.9, 1],
      opacity: [0.12, 0.2, 0.08, 0.12],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const GlowingText = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    className="text-gradient-hero relative"
    animate={{
      textShadow: [
        "0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,229,255,0.2)",
        "0 0 40px rgba(255,45,155,0.3), 0 0 80px rgba(0,255,136,0.2)",
        "0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(255,45,155,0.2)",
        "0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,229,255,0.2)",
      ],
    }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.span>
);

const StatCounter = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <motion.div
      className="text-xl sm:text-2xl font-extrabold text-primary"
      animate={{ textShadow: ["0 0 10px rgba(0,255,136,0.3)", "0 0 20px rgba(0,255,136,0.5)", "0 0 10px rgba(0,255,136,0.3)"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {value}
    </motion.div>
    <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
  </motion.div>
);

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Animated gradient orbs */}
      <FloatingOrb color="hsl(153 100% 50% / 0.15)" size={500} x="10%" y="-10%" delay={0} />
      <FloatingOrb color="hsl(326 100% 59% / 0.12)" size={400} x="60%" y="20%" delay={2} />
      <FloatingOrb color="hsl(189 100% 50% / 0.1)" size={350} x="30%" y="50%" delay={4} />
      <FloatingOrb color="hsl(43 100% 50% / 0.08)" size={300} x="80%" y="-20%" delay={1} />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)" }}
        animate={{ y: ["-100vh", "100vh"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-5 text-foreground leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your AI <GlowingText>workforce</GlowingText>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          37 expert agents trained on NZ legislation. Try any agent free.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button
            onClick={onScrollToGrid}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <span className="relative z-10 flex items-center gap-2">Browse agents <ArrowDown size={16} /></span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border text-foreground hover:border-primary/30 transition-all"
            >
              See pricing
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            { value: "37", label: "Agents" },
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
