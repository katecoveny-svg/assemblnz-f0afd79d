import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

// Kept for backwards compatibility — every kete now uses the photoreal feather-kete visual,
// tinted per industry. The `model` prop is accepted but ignored.
export type IndustryModel = "wine-glass" | "hard-hat" | "palette" | "car" | "container";

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight: string;
  model?: IndustryModel;
  size?: number;
  variant?: KeteVariant;
}

// Map accent hex → kete variant when no explicit variant is passed.
function variantFromAccent(accent: string): KeteVariant {
  const a = accent.toUpperCase();
  if (a.startsWith("#3A7D6E") || a.startsWith("#7ECFC2")) return "waihanga";
  if (a.startsWith("#4AA5A8")) return "manaaki";
  if (a.startsWith("#A8DDDB") || a.startsWith("#9B8EC4") || a.startsWith("#E8702A")) return "auaha";
  if (a.startsWith("#7A9ABC") || a.startsWith("#4A6FA5")) return "arataki";
  if (a.startsWith("#5AADA0")) return "pikau";
  return "base";
}

export default function LandingKeteHero({
  accentColor,
  size = 220,
  variant,
}: LandingKeteHeroProps) {
  const resolvedVariant = variant ?? variantFromAccent(accentColor);

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
        <FeatherKete variant={resolvedVariant} size={size} drift="slow" />
      </Suspense>
    </motion.div>
  );
}
