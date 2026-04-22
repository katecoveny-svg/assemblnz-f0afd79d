import { motion } from "framer-motion";
import keteSmall from "@/assets/kete-master/kete-256.png";

/**
 * Nav3DKeteLogo — canonical static feather kete shown in the header on every page.
 * LOCKED 2026-04-22: per Brand Guidelines v1.0 the nav mark must be visually
 * identical in silhouette to every kete tile on the site. Renders the master
 * kete PNG directly (eager load, no Suspense gap) so the brand mark always
 * paints on first frame at nav scale.
 */
export default function Nav3DKeteLogo({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      aria-label="Assembl"
    >
      <img
        src={keteSmall}
        alt="Assembl"
        width={size}
        height={size}
        decoding="async"
        loading="eager"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          userSelect: "none",
          filter: "drop-shadow(0 4px 10px rgba(58,125,110,0.18))",
        }}
      />
    </motion.div>
  );
}
