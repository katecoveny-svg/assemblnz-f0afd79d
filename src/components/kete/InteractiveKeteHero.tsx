import { useRef, useState, useMemo, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import keteMaster from "@/assets/kete-white-master.png";

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
 * dresses every kete in its own subtle wash.
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
  className = "",
  alt = "Assembl master kete",
}: InteractiveKeteHeroProps) {
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

  // Mouse-tracked tilt — perspective transform
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 18 });
  const lift = useSpring(0, { stiffness: 200, damping: 22 });
  const haloX = useSpring(useTransform(mx, [-0.5, 0.5], [-30, 30]), { stiffness: 90, damping: 20 });
  const haloY = useSpring(useTransform(my, [-0.5, 0.5], [-20, 20]), { stiffness: 90, damping: 20 });

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
    lift.set(-8);
  };

  const handleLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
    lift.set(0);
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
      {/* Cinematic backdrop wash — luminous cream/ivory atmosphere */}
      {isCinematic && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 50% 45%, ${accent}10 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 50% 100%, rgba(255,250,240,0.45) 0%, transparent 70%)
            `,
          }}
        />
      )}

      {/* Cursor-tracking glow halo (parallaxes against mouse) */}
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
          animate={
            reduced
              ? {}
              : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Sparkle particle field — soft drifting stars */}
      {sparkles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: "radial-gradient(circle, rgba(255,250,240,1) 0%, rgba(255,240,210,0.6) 60%, transparent 100%)",
                boxShadow: `0 0 ${p.size * 4}px rgba(255,245,220,0.6)`,
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
        </div>
      )}

      {/* The interactive 3D kete */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          rotateX,
          rotateY,
          y: lift,
          transformStyle: "preserve-3d",
        }}
        animate={
          reduced
            ? {}
            : { y: [0, -6, 0, 4, 0] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
          <img
            src={keteMaster}
            alt=""
            aria-hidden
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter,
            }}
          />
        </div>

        {/* The kete itself */}
        <motion.img
          src={keteMaster}
          alt={alt}
          draggable={false}
          loading="eager"
          style={{
            width: isCinematic ? `min(${size}px, 70vmin)` : size,
            height: "auto",
            objectFit: "contain",
            filter: `${filter} drop-shadow(0 24px 48px ${accent}33) drop-shadow(0 8px 16px rgba(120,140,160,0.18))`,
            userSelect: "none",
            WebkitUserDrag: "none",
          } as React.CSSProperties}
          animate={
            hovered && !reduced
              ? { scale: 1.04 }
              : { scale: 1 }
          }
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        />

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
