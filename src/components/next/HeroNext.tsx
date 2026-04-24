import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroShader from "./HeroShader";

const HeroGlassBlob = lazy(() => import("@/components/HeroGlassBlob"));

/**
 * Cinematic hero for /next.
 * Two variants:
 *   - "shader"  : full-bleed caustics shader, type centred over it
 *   - "layered" : caustics shader behind the existing glass jack
 */
export default function HeroNext({ variant }: { variant: "shader" | "layered" }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "#FAFBFC" }}
    >
      {/* Shader layer */}
      <div className="absolute inset-0">
        <HeroShader intensity={variant === "layered" ? 0.85 : 1.1} />
        {/* Soft white ice scrim — keeps text legible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 65%, rgba(250,251,252,0.95) 100%)",
          }}
        />
      </div>

      {/* Optional glass orb — refined: off-axis, smaller, softer, behind type */}
      {variant === "layered" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute pointer-events-none hidden md:block"
          style={{
            // anchored to the right, vertically centred-ish, behind the type
            top: "50%",
            right: "-8%",
            transform: "translateY(-50%)",
            width: "min(48vw,560px)",
            height: "min(48vw,560px)",
            opacity: 0.32,
            filter: "blur(0.5px) saturate(0.6) brightness(1.18)",
            mixBlendMode: "screen",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Suspense fallback={null}>
            <HeroGlassBlob />
          </Suspense>
          {/* Soft halo to bleed it into the shader */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 45%, rgba(244,250,252,0.85) 80%)",
            }}
          />
        </motion.div>
      )}

      {/* Type */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6"
           style={{ minHeight: "100vh" }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="uppercase mb-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.32em",
            color: "#3A7D6E",
          }}
        >
          assembl · built in aotearoa
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="max-w-[18ch]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(44px, 8.5vw, 120px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            color: "#2A2F3C",
          }}
        >
          Built for the way{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "#3A7D6E" }}>
            New Zealand actually works.
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          className="max-w-[52ch] mt-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(20px, 2.2vw, 26px)",
            lineHeight: 1.4,
            color: "#3A7D6E",
          }}
        >
          Premium intelligence for real operational work.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="max-w-[60ch] mt-7"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            lineHeight: 1.65,
            color: "#3D4250CC",
          }}
        >
          NZ specialist AI agents and workflows that finish the work and hand back valuable time. Every workflow produces an evidence pack that can be filed, shared, or audited — and stays current as New Zealand law changes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
          className="mt-10 flex items-center gap-4 flex-wrap justify-center"
        >
          <Link
            to="/start"
            data-magnetic
            className="group inline-flex items-center gap-2 px-7 py-4 rounded-full"
            style={{
              background: "#3A7D6E",
              color: "#fff",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              boxShadow: "0 12px 40px -12px rgba(58,125,110,0.55)",
            }}
          >
            See what time back looks like
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/pricing"
            data-magnetic
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(58,125,110,0.25)",
              color: "#3D4250",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            View pricing
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, y: [0, 6, 0] }}
          transition={{ delay: 1.2, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 uppercase"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "#3D4250",
          }}
        >
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
