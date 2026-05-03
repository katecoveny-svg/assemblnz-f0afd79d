import { motion } from "framer-motion";
import FeatherKete, { type KeteVariant } from "@/components/pearl/FeatherKete";

/**
 * KeteWispBreak — small, non-interactive decorative kete cloud wisp used
 * between homepage section breaks. Renders 2–3 tiny feather kete drifting
 * gently across a Mist/Cloud/Sand wash, joined by a Soft Gold (#D9BC7A)
 * fairy-light strand of pinpoint sparkles.
 *
 * Brand Bible v2.0:
 *   • Palette — Mist #ECEFF3, Cloud #F4F6F8, Sand #E8E3DA, Soft Gold #D9BC7A.
 *   • Spacing — vertical rhythm 96–128px; this break consumes ~120px tall.
 *   • Motion  — slow drift only; no cursor tracking, no hover, no parallax.
 *   • Reduced-motion users get a static composition (framer-motion respects
 *     prefers-reduced-motion automatically via `useReducedMotion`).
 */

interface KeteWispBreakProps {
  /** Which kete variants to feature (left → right). 2 or 3 entries. */
  variants?: KeteVariant[];
  /** Override the diameter base in px. Wisps stay non-interactive regardless. */
  size?: number;
  /** Optional className — keep additive only (no overrides of pointer-events). */
  className?: string;
}

const DEFAULT_VARIANTS: KeteVariant[] = ["manaaki", "auaha", "pikau"];

export default function KeteWispBreak({
  variants = DEFAULT_VARIANTS,
  size = 92,
  className = "",
}: KeteWispBreakProps) {
  // Limit to 2–3 wisps per spec.
  const wisps = variants.slice(0, 3);

  // Horizontal positions (% of container width) for 2 vs 3 wisps.
  const positions = wisps.length === 2 ? [32, 68] : [22, 50, 78];
  // Subtle scale variation so the trio feels organic, not stamped.
  const scales = [0.92, 1, 0.86];
  // Stagger the drift so they don't bob in lock-step.
  const drifts = [0, 1.4, 2.6];

  return (
    <div
      aria-hidden
      className={`relative w-full pointer-events-none select-none my-16 sm:my-20 ${className}`}
      style={{ height: size + 36 }}
    >
      {/* Soft palette wash: Mist → Cloud → Sand, fading at the edges. */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] mx-auto max-w-[720px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(217,188,122,0.0) 8%, rgba(217,188,122,0.55) 50%, rgba(217,188,122,0.0) 92%, transparent 100%)",
        }}
      />

      {/* Soft Gold fairy-light strand: pinpoint sparkles along the gold line. */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-[720px]">
        {[12, 26, 40, 50, 60, 74, 88].map((leftPct, i) => (
          <motion.span
            key={leftPct}
            className="absolute block rounded-full"
            style={{
              left: `${leftPct}%`,
              top: "-1px",
              width: 3,
              height: 3,
              background: "#D9BC7A",
              boxShadow:
                "0 0 6px rgba(217,188,122,0.85), 0 0 12px rgba(217,188,122,0.45)",
            }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
            transition={{
              duration: 3.4 + (i % 3) * 0.6,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Cloud wisps — 2-3 small feather kete drifting along the strand. */}
      {wisps.map((variant, i) => {
        const px = Math.round(size * scales[i]);
        return (
          <motion.div
            key={`${variant}-${i}`}
            className="absolute top-1/2"
            style={{
              left: `${positions[i]}%`,
              transform: "translate(-50%, -50%)",
              width: px,
              height: px,
              filter: "drop-shadow(0 8px 18px rgba(150,170,190,0.18))",
            }}
            animate={{ y: [-3, 3, -3] }}
            transition={{
              duration: 6 + drifts[i],
              repeat: Infinity,
              ease: "easeInOut",
              delay: drifts[i] * 0.4,
            }}
          >
            {/* Soft cloud halo behind each wisp — Mist/Cloud blend. */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(244,246,248,0.85) 0%, rgba(236,239,243,0.45) 45%, rgba(232,227,218,0) 75%)",
                transform: "scale(1.55)",
              }}
            />
            <FeatherKete variant={variant} size={px} drift="slow" />
          </motion.div>
        );
      })}
    </div>
  );
}
