import { lazy, Suspense, ReactNode } from "react";
import { motion } from "framer-motion";
import HeroShader from "./HeroShader";

const HeroGlassBlob = lazy(() => import("@/components/HeroGlassBlob"));

interface HeroBackdropNextProps {
  /** Existing hero markup (3D model, headline, status strip, CTAs) */
  children: ReactNode;
  /** "shader" full-bleed caustics, "layered" with glass orb, "soft" lower-intensity */
  variant?: "shader" | "layered" | "soft";
  /** Min-height of the backdrop section */
  minHeight?: string;
  /** Tailwind padding utility for the inner content wrapper */
  paddingClass?: string;
  /** Optional extra accent color hue tint mixed into the scrim (rgba string) */
  accentTint?: string;
}

/**
 * Backdrop wrapper for kete heroes — wraps the existing hero block with the
 * locked /next aesthetic: WebGL caustics shader + soft ice scrim + optional
 * light glass orb. Children sit on top, fully untouched.
 *
 * Locked palette: primary teal #3A7D6E, charcoal text #3D4250, ice bg #FAFBFC.
 */
export default function HeroBackdropNext({
  children,
  variant = "layered",
  minHeight = "auto",
  paddingClass = "",
  accentTint,
}: HeroBackdropNextProps) {
  const intensity = variant === "soft" ? 0.55 : variant === "layered" ? 0.85 : 1.05;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight, background: "#FAFBFC" }}
    >
      {/* Shader caustics layer */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroShader intensity={intensity} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 60%, rgba(250,251,252,0.95) 100%)",
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

      {/* Optional light glass orb — off-axis, very subtle */}
      {variant === "layered" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: "55%",
            right: "-10%",
            transform: "translateY(-50%)",
            width: "min(44vw,480px)",
            height: "min(44vw,480px)",
            opacity: 0.22,
            filter: "blur(0.5px) saturate(0.55) brightness(1.2)",
            mixBlendMode: "screen",
          }}
        >
          <Suspense fallback={null}>
            <HeroGlassBlob />
          </Suspense>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 40%, rgba(248,252,253,0.92) 82%)",
            }}
          />
        </motion.div>
      )}

      {/* Children render on top, untouched */}
      <div className={`relative z-10 ${paddingClass}`}>{children}</div>
    </section>
  );
}
