import { useRef, useState, useMemo, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import ResponsiveKeteImage from "./ResponsiveKeteImage";
// Industry-specific photoreal kete artwork (Kate's uploads).
import keteManaaki from "@/assets/kete-feather-manaaki.png";
import keteWaihanga from "@/assets/kete-feather-waihanga.png";
import keteAuaha from "@/assets/kete-feather-auaha.png";
import keteArataki from "@/assets/kete-feather-arataki.png";
import ketePikau from "@/assets/kete-feather-pikau.png";
import keteToro from "@/assets/kete-feather-toro.png";

const INDUSTRY_KETE: Record<string, string> = {
  manaaki: keteManaaki,
  waihanga: keteWaihanga,
  auaha: keteAuaha,
  arataki: keteArataki,
  pikau: ketePikau,
  toro: keteToro,
};

/**
 * InteractiveKeteHero — the master Assembl kete rendered as a true
 * interactive 3D hero. Mouse-tracked tilt (perspective transform),
 * cursor-following glow, ambient float, sparkle particle field, and
 * a soft reflection on the ground plane.
 *
 * Used as:
 *   - Cinematic full-bleed hero on landing pages
 *   - Floating centerpiece on dashboards
 *
 * Per-industry tint via `tintHue` / `accent` so a single master image
 * dresses every kete in its own subtle wash. When `industry` is provided
 * (e.g. "manaaki"), the photoreal industry artwork replaces the master
 * image entirely — blended into the page via radial mask.
 */
export interface InteractiveKeteHeroProps {
  /** Display size in px (image will scale responsively in cinematic mode). */
  size?: number;
  /** Accent colour for halo + sparkles (kete tint). */
  accent?: string;
  /** Hue rotation in degrees applied to the kete image (0 = base ivory). */
  tintHue?: number;
  /** Saturation of the tint (1 = neutral). */
  tintSaturate?: number;
  /** "cinematic" — full-bleed dramatic hero. "centerpiece" — floating dashboard hero. */
  variant?: "cinematic" | "centerpiece";
  /** Show sparkle particle field around the kete. */
  sparkles?: boolean;
  /** Number of sparkle particles. */
  sparkleCount?: number;
  /** Optional industry slug — when set, swaps the master kete for the industry artwork. */
  industry?: "manaaki" | "waihanga" | "auaha" | "arataki" | "pikau" | "toro";
  className?: string;
  alt?: string;
}

export default function InteractiveKeteHero({
  size = 480,
  accent = "#1F4D47",
  tintHue = 0,
  tintSaturate = 1,
  variant = "centerpiece",
  sparkles = true,
  sparkleCount = 28,
  industry,
  className = "",
  alt = "Assembl master kete",
}: InteractiveKeteHeroProps) {
  const industryImage = industry ? INDUSTRY_KETE[industry] : null;
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Cursor-tracked tilt + halo with LONG lag (300–500ms feel) per Brand Bible v2.0.
  // We use very low stiffness + high damping so the kete trails the cursor like silk.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // ~350ms perceptual lag for tilt
  const TILT_SPRING = { stiffness: 35, damping: 22, mass: 1.1 };
  // ~450ms perceptual lag for halo (slower than tilt so light feels heavier than form)
  const HALO_SPRING = { stiffness: 22, damping: 24, mass: 1.3 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), TILT_SPRING);
  const lift = useSpring(0, { stiffness: 60, damping: 22 });
  const haloX = useSpring(useTransform(mx, [-0.5, 0.5], [-34, 34]), HALO_SPRING);
  const haloY = useSpring(useTransform(my, [-0.5, 0.5], [-22, 22]), HALO_SPRING);
  // Hover sparkle/glow intensity — only lights up while pointer is in the kete area.
  const glow = useSpring(0, { stiffness: 40, damping: 22 });

  // Scroll parallax — kete drifts gently as the page scrolls, cloud drifts slower.
  const { scrollY } = useScroll();
  const keteParallax = useTransform(scrollY, [0, 800], [0, -60]);
  const cloudParallax = useTransform(scrollY, [0, 800], [0, -28]);
  const keteParallaxSmooth = useSpring(keteParallax, { stiffness: 40, damping: 28, mass: 1 });
  const cloudParallaxSmooth = useSpring(cloudParallax, { stiffness: 30, damping: 28, mass: 1 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px);
    my.set(py);
  };

  const handleEnter = () => {
    setHovered(true);
    lift.set(-6);
    glow.set(1);
  };

  const handleLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
    lift.set(0);
    glow.set(0);
  };

  // Pre-computed sparkle particle field
  const particles = useMemo(() => {
    if (!sparkles) return [];
    return Array.from({ length: sparkleCount }, (_, i) => {
      // distribute around the kete in a soft ring + halo
      const ringAngle = (i / sparkleCount) * Math.PI * 2 + Math.random() * 0.4;
      const ringRadius = 0.55 + Math.random() * 0.55;
      return {
        id: i,
        x: 50 + Math.cos(ringAngle) * ringRadius * 50,
        y: 50 + Math.sin(ringAngle) * ringRadius * 50,
        size: 1 + Math.random() * 3.5,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 5,
        opacity: 0.35 + Math.random() * 0.55,
      };
    });
  }, [sparkles, sparkleCount]);

  const filter = `hue-rotate(${tintHue}deg) saturate(${tintSaturate})`;
  const isCinematic = variant === "cinematic";

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative ${className}`}
      style={{
        width: isCinematic ? "100%" : size,
        height: isCinematic ? "min(72vh, 720px)" : size,
        perspective: 1400,
        cursor: reduced ? "default" : "grab",
        userSelect: "none",
      }}
      aria-label={alt}
      role="img"
    >
      {/* Cinematic backdrop wash — luminous cream/ivory atmosphere with cloud breathing 12–18s */}
      {isCinematic && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 50% 45%, ${accent}10 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 50% 100%, rgba(255,250,240,0.45) 0%, transparent 70%)
            `,
            y: cloudParallaxSmooth,
          }}
          animate={
            reduced
              ? {}
              : { opacity: [0.85, 1, 0.85], scale: [1, 1.015, 1] }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Cursor-tracking glow halo (parallaxes against mouse with long lag) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: haloX, y: haloY }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 1.6,
            height: size * 1.6,
            x: "-50%",
            y: "-50%",
            background: `radial-gradient(circle, ${accent}28 0%, ${accent}12 35%, transparent 65%)`,
            filter: "blur(36px)",
          }}
          // Cloud breathing — 12–18s slow inhale/exhale per Brand Bible v2.0
          animate={
            reduced
              ? {}
              : { scale: [1, 1.08, 1], opacity: [0.6, 0.95, 0.6] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Hover-only sparkle GLOW — only ignites when cursor is in the kete area */}
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 1.1,
            height: size * 1.1,
            x: "-50%",
            y: "-50%",
            background: `radial-gradient(circle, rgba(217,188,122,0.45) 0%, rgba(217,188,122,0.18) 40%, transparent 70%)`,
            filter: "blur(28px)",
            opacity: glow,
            mixBlendMode: "screen",
          }}
        />
      </motion.div>

      {/* Sparkle particle field — Soft Gold stars; intensity tied to hover */}
      {sparkles && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ opacity: useTransform(glow, [0, 1], [0.35, 1]) }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: "radial-gradient(circle, rgba(255,250,240,1) 0%, rgba(217,188,122,0.7) 55%, transparent 100%)",
                boxShadow: `0 0 ${p.size * 4}px rgba(217,188,122,0.55)`,
              }}
              animate={
                reduced
                  ? { opacity: p.opacity * 0.6 }
                  : {
                      opacity: [0, p.opacity, 0],
                      scale: [0.4, 1, 0.4],
                      y: [0, -10, 0],
                    }
              }
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}

      {/* The interactive 3D kete (with scroll parallax + slow ambient float) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          rotateX,
          rotateY,
          y: useTransform([lift, keteParallaxSmooth] as never, ([l, p]: number[]) => l + p),
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner wrapper: slow ambient float — independent of cursor + scroll y */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={reduced ? {} : { y: [0, -5, 0, 4, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
        {/* Soft ground reflection */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: isCinematic ? "8%" : "4%",
            left: "50%",
            transform: "translateX(-50%) scaleY(-1)",
            width: size * 0.85,
            height: size * 0.35,
            opacity: 0.18,
            filter: "blur(8px)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
          }}
        >
          {industryImage ? (
            <img
              src={industryImage}
              alt=""
              draggable={false}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter,
                maskImage: "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, transparent 92%)",
                WebkitMaskImage: "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, transparent 92%)",
              }}
            />
          ) : (
            <ResponsiveKeteImage
              displayWidth={Math.round(size * 0.85)}
              alt=""
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter,
              }}
            />
          )}
        </div>

        {/* The kete itself */}
        <motion.div
          style={{
            width: isCinematic ? `min(${size}px, 70vmin)` : size,
            height: "auto",
            filter: `${filter} drop-shadow(0 24px 48px ${accent}33) drop-shadow(0 8px 16px rgba(120,140,160,0.18))`,
            userSelect: "none",
          }}
          animate={
            hovered && !reduced
              ? { scale: 1.04 }
              : { scale: 1 }
          }
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          {industryImage ? (
            <img
              src={industryImage}
              alt={alt}
              draggable={false}
              loading="eager"
              // @ts-expect-error fetchpriority is valid HTML
              fetchpriority={isCinematic ? "high" : "auto"}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                // Soft mask so the kete photo's cream background dissolves into the page —
                // no boxed edge, no copy-paste look.
                maskImage:
                  "radial-gradient(ellipse 62% 72% at 50% 55%, black 48%, rgba(0,0,0,0.7) 70%, transparent 92%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 62% 72% at 50% 55%, black 48%, rgba(0,0,0,0.7) 70%, transparent 92%)",
              }}
            />
          ) : (
            <ResponsiveKeteImage
              displayWidth={isCinematic ? Math.min(size, 900) : size}
              alt={alt}
              loading="eager"
              fetchPriority={isCinematic ? "high" : "auto"}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          )}
        </motion.div>

        {/* Subtle highlight rim that follows cursor (depth illusion) */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: size * 0.9,
            height: size * 0.9,
            background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 55%)`,
            mixBlendMode: "screen",
            x: haloX,
            y: haloY,
          }}
        />
      </motion.div>
    </div>
  );
}
