import { motion } from "framer-motion";
import ResponsiveKeteImage from "@/components/kete/ResponsiveKeteImage";

/**
 * Nav3DKeteLogo — clean transparent master kete shown in the header on every page.
 * Uses the same master image as the cinematic hero, just at nav scale, with NO
 * halo / reflection / sparkle layers (those would render as a visible blob at 38px).
 * The PNG is already alpha-transparent, so this sits cleanly on any nav background.
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
      <ResponsiveKeteImage
        displayWidth={size}
        alt="Assembl"
        loading="eager"
        fetchPriority="high"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // subtle drop shadow only — no background, no halo
          filter: "drop-shadow(0 2px 4px rgba(31,77,71,0.18))",
        }}
      />
    </motion.div>
  );
}
