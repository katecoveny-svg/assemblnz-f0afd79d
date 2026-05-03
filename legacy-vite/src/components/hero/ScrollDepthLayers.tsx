import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

/**
 * ScrollDepthLayers — wraps page content and applies 3 depth
 * presets as the user scrolls: surface (bright), mid-depth
 * (slight blue-shift + blur), deep (cooler tone).
 * 
 * Children render normally; the effect is applied via overlays.
 */

export default function ScrollDepthLayers({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Depth overlay opacity — fades in as user scrolls
  const depthOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.02, 0.04, 0.06]);
  // Slight blue tint as user goes deeper
  const blueShift = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.015, 0.03]);
  // Blur on fixed background elements
  const bgBlur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 2]);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {/* Depth overlay — subtle blue-green tint that deepens on scroll */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "linear-gradient(180deg, transparent 0%, rgba(74,165,168,0.02) 50%, rgba(58,100,120,0.04) 100%)",
          opacity: depthOpacity,
        }}
        aria-hidden="true"
      />

      {/* Vignette that intensifies with scroll depth */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(58,100,120,0.03) 100%)",
          opacity: useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.3, 0.6]),
        }}
        aria-hidden="true"
      />
    </div>
  );
}
