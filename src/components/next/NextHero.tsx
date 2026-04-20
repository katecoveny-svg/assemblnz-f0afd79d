import { lazy, Suspense, ReactNode } from "react";
import { motion } from "framer-motion";
import HeroShader from "./HeroShader";

const HeroGlassBlob = lazy(() => import("@/components/HeroGlassBlob"));

interface NextHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** "shader" full-bleed caustics, "layered" with light glass orb, "soft" lower-intensity for inner pages */
  variant?: "shader" | "layered" | "soft";
  minHeight?: string;
}

/**
 * Reusable cinematic hero shell.
 * Locked palette: primary teal #3A7D6E, charcoal text #3D4250, ice bg #FAFBFC.
 */
export default function NextHero({
  eyebrow,
  title,
  subtitle,
  actions,
  variant = "layered",
  minHeight = "82vh",
}: NextHeroProps) {
  const intensity = variant === "soft" ? 0.55 : variant === "layered" ? 0.85 : 1.1;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight, background: "#FAFBFC" }}
    >
      <div className="absolute inset-0">
        <HeroShader intensity={intensity} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.6) 65%, rgba(250,251,252,0.96) 100%)",
          }}
        />
      </div>

      {variant === "layered" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: "50%",
            right: "-8%",
            transform: "translateY(-50%)",
            width: "min(46vw,520px)",
            height: "min(46vw,520px)",
            opacity: 0.3,
            filter: "blur(0.5px) saturate(0.55) brightness(1.2)",
            mixBlendMode: "screen",
          }}
        >
          <Suspense fallback={null}>
            <HeroGlassBlob />
          </Suspense>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 40%, rgba(248,252,253,0.95) 82%)",
            }}
          />
        </motion.div>
      )}

      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-[1100px] mx-auto"
        style={{ minHeight }}
      >
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="uppercase mb-6"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "#3A7D6E",
            }}
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(40px, 7.5vw, 104px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            color: "#3D4250",
            maxWidth: "16ch",
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="max-w-[56ch] mt-8"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 17,
              lineHeight: 1.55,
              color: "#3D4250B3",
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            className="mt-10 flex items-center gap-4 flex-wrap justify-center"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </section>
  );
}
