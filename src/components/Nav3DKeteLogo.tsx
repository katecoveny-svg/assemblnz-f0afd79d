import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

/**
 * Nav3DKeteLogo — canonical static feather kete shown in the header on every page.
 * LOCKED 2026-04-22: per Brand Guidelines v1.0 the nav mark must be visually
 * identical in silhouette to every kete tile on the site. We render the same
 * FeatherKete (variant="base") used in the grid, just at nav scale, with no
 * drift/halo so it reads cleanly at 36px on any background.
 */
export default function Nav3DKeteLogo({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      aria-label="Assembl"
    >
      <Suspense fallback={null}>
        <FeatherKete variant="base" size={size} drift="slow" alt="Assembl" />
      </Suspense>
    </motion.div>
  );
}
