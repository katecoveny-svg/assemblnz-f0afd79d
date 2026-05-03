import { ReactNode } from "react";
import { motion } from "framer-motion";

interface HeroBackdropNextProps {
  /** Existing hero markup (3D model, headline, status strip, CTAs) */
  children: ReactNode;
  /** Kept for backwards-compat. All variants now render the warm-pearl world. */
  variant?: "shader" | "layered" | "soft";
  /** Min-height of the backdrop section */
  minHeight?: string;
  /** Tailwind padding utility for the inner content wrapper */
  paddingClass?: string;
  /** Optional accent tint for a faint section-specific halo (rgba string). */
  accentTint?: string;
}

/**
 * Warm Pearl hero backdrop — the canonical Assembl atmosphere.
 *
 * - Canvas: Warm Pearl (#FAF6EF). Never #FAFBFC, never near-black.
 * - Atmosphere: a soft Opal Shimmer wash + Pounamu radial halo —
 *   the same "kete in mist" feel as the homepage hero, restrained.
 * - Sparkle: a small cluster of candle-warm (#F8E9C4) fairy lights
 *   off-axis, slow twinkle, never cool blue-white.
 *
 * Replaces the legacy cool-teal shader + glass-orb world.
 */
export default function HeroBackdropNext({
  children,
  minHeight = "auto",
  paddingClass = "",
  accentTint,
}: HeroBackdropNextProps) {
  // Six fairy-light pinpoints, distributed off-axis. Each twinkles
  // independently every 2–6s — never in unison.
  const sparkles = [
    { x: "12%", y: "22%", size: 4, delay: 0.0, dur: 4.2 },
    { x: "82%", y: "18%", size: 3, delay: 1.4, dur: 3.6 },
    { x: "18%", y: "72%", size: 3.5, delay: 0.8, dur: 5.1 },
    { x: "88%", y: "64%", size: 4, delay: 2.2, dur: 4.8 },
    { x: "64%", y: "84%", size: 2.5, delay: 0.4, dur: 5.6 },
    { x: "46%", y: "12%", size: 2.5, delay: 3.0, dur: 3.9 },
  ];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight, background: "#FAF6EF" }}
    >
      {/* Atmosphere layer — soft pearl scrim + pounamu halo. Never a shader. */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Opal Shimmer outer wash — gives the page subtle depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(232,238,236,0.55) 0%, rgba(244,239,230,0.0) 55%, rgba(250,246,239,0.0) 100%)",
          }}
        />
        {/* Pounamu inner glow — faint golden-hour-through-mist warmth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(31,77,71,0.05) 0%, transparent 70%)",
          }}
        />
        {accentTint && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${accentTint} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Candle-warm fairy lights — #F8E9C4, never cool blue-white. */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              background:
                "radial-gradient(circle, #FFFEF5 0%, #F8E9C4 45%, rgba(248,233,196,0) 75%)",
              boxShadow: "0 0 12px rgba(248,233,196,0.55)",
              transform: "translate(-50%, -50%)",
              mixBlendMode: "multiply",
            }}
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.2, 0.85] }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Children render on top, untouched */}
      <div className={`relative z-10 ${paddingClass}`}>{children}</div>
    </section>
  );
}
