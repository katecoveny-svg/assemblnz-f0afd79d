import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

const InteractiveKeteHero = lazy(() => import("@/components/kete/InteractiveKeteHero"));

/**
 * Nav3DKeteLogo — small interactive master kete shown in the header on every page.
 * Uses the same master image as the cinematic hero, just at nav scale, so the
 * brand mark and the hero are visually unified.
 */
export default function Nav3DKeteLogo({ size = 38 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{ width: size, height: size, background: "rgba(31,77,71,0.08)" }}
          />
        }
      >
        <InteractiveKeteHero
          size={size}
          variant="centerpiece"
          accent="#1F4D47"
          sparkles={false}
          alt="Assembl"
        />
      </Suspense>
    </motion.div>
  );
}
