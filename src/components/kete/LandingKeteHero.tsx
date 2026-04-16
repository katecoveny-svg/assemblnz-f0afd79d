import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

const GlassKeteSphere = lazy(() => import("@/components/kete/GlassKeteSphere"));

// Kept for backwards compatibility — every kete now uses the same glass-sphere visual,
// only tinted by accentColor. The `model` prop is accepted but ignored.
export type IndustryModel = "wine-glass" | "hard-hat" | "palette" | "car" | "container";

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight: string;
  model?: IndustryModel;
  size?: number;
}

export default function LandingKeteHero({
  accentColor,
  accentLight,
  size = 220,
}: LandingKeteHeroProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center mb-10"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          background: `radial-gradient(circle, ${accentColor}22 0%, ${accentColor}0A 40%, transparent 70%)`,
          filter: "blur(32px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{ width: size, height: size, background: `${accentColor}10` }}
          />
        }
      >
        <GlassKeteSphere accentColor={accentColor} accentLight={accentLight} size={size} />
      </Suspense>
    </motion.div>
  );
}
