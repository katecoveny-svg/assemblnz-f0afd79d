import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight: string;
  size?: number;
}

/**
 * Animated 3D kete basket with glow, used as the hero visual on each industry landing page.
 */
export default function LandingKeteHero({
  accentColor,
  accentLight,
  size = 180,
}: LandingKeteHeroProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center mb-10"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}08 40%, transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner glow ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          border: `1px solid ${accentColor}20`,
          boxShadow: `0 0 40px ${accentColor}12, inset 0 0 30px ${accentColor}08`,
        }}
      />
      {/* 3D Kete model */}
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{
              width: size,
              height: size,
              background: `${accentColor}10`,
            }}
          />
        }
      >
        <Kete3DModel
          accentColor={accentColor}
          accentLight={accentLight}
          size={size}
        />
      </Suspense>
    </motion.div>
  );
}
