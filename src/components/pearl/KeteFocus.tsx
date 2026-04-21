import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import keteHero from "@/assets/kete-white-master.png";

/**
 * KeteFocus — the centerpiece of the page.
 *
 * A photoreal 3D woven kete with feathery plumes rising out of it,
 * surrounded by sparkly fairy-light "data nodes" — hot white cores with
 * soft starburst rays, radiating halos, and irregular twinkling so the
 * blinks feel alive (not robotic). This replaces the cumulus-cloud hero.
 */

interface KeteFocusProps {
  size?: number;          // visual width in px
  sparkles?: number;      // number of fairy-light data nodes (ambient ring)
  rimSparkles?: number;   // extra sparkles hugging the woven flax rim & handles
  className?: string;
  priority?: boolean;     // skip lazy loading for above-the-fold hero
  /** soft cream-pink underglow (true) vs neutral icy halo (false) */
  warmGlow?: boolean;
}

interface Spark {
  x: number;          // % from left
  y: number;          // % from top
  size: number;       // base radius px
  delay: number;      // s
  duration: number;   // s — irregular per node
  rays: number;       // 4 or 6
  rayLen: number;     // px
}

function buildSparks(count: number, seed = 1): Spark[] {
  // Deterministic PRNG so sparkles don't reshuffle on every render
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: Spark[] = [];
  for (let i = 0; i < count; i++) {
    // Distribute mostly around the kete in an oval ring, with a few stragglers
    // that drift closer to the basket itself — feels like data flowing toward it.
    const angle = rand() * Math.PI * 2;
    const radius = 22 + rand() * 38;          // 22–60% — some nearer the kete
    const xOff = Math.cos(angle) * radius * 1.20;
    const yOff = Math.sin(angle) * radius * 0.90 - 8; // bias upward
    out.push({
      x: 50 + xOff,
      y: 50 + yOff,
      size: 2 + rand() * 5,                   // slightly larger cores
      delay: rand() * 5,
      duration: 1.8 + rand() * 3.2,           // irregular: 1.8s–5.0s — livelier
      rays: rand() > 0.5 ? 6 : 4,
      rayLen: 10 + rand() * 18,               // longer rays for more twinkle
    });
  }
  return out;
}

/**
 * Sparkles that hug the woven flax rim and the two handles of the kete.
 * The kete artwork sits in roughly the lower 55% of the frame; the rim
 * arcs across the upper edge of the basket and the handles loop above.
 */
function buildRimSparks(count: number, seed = 11): Spark[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: Spark[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    let x: number;
    let y: number;
    if (r < 0.55) {
      // Along the rim — wide ellipse arc across the top of the basket
      const t = rand() * Math.PI;                // 0..π across the top arc
      x = 50 + Math.cos(t + Math.PI) * 30;       // -30..+30 % horizontally
      y = 70 + Math.sin(t) * -6 + (rand() - 0.5) * 3; // hug the rim line
    } else if (r < 0.78) {
      // Left handle loop
      const t = rand() * Math.PI;
      x = 30 + Math.cos(t + Math.PI / 2) * 6 + (rand() - 0.5) * 2;
      y = 60 - Math.sin(t) * 14 + (rand() - 0.5) * 2;
    } else {
      // Right handle loop
      const t = rand() * Math.PI;
      x = 70 + Math.cos(t - Math.PI / 2) * 6 + (rand() - 0.5) * 2;
      y = 60 - Math.sin(t) * 14 + (rand() - 0.5) * 2;
    }
    out.push({
      x,
      y,
      size: 1.6 + rand() * 3.2,                 // smaller, jewel-like
      delay: rand() * 4,
      duration: 1.4 + rand() * 2.6,             // quicker twinkle on the weave
      rays: rand() > 0.5 ? 6 : 4,
      rayLen: 6 + rand() * 12,
    });
  }
  return out;
}

const KeteFocus = forwardRef<HTMLDivElement, KeteFocusProps>(function KeteFocus({
  size = 520,
  sparkles = 26,
  rimSparkles = 0,
  className = "",
  priority = false,
  warmGlow = true,
}, forwardedRef) {
  const ref = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => outerRef.current as HTMLDivElement);
  const sparks = useMemo(() => buildSparks(sparkles, 7), [sparkles]);
  const rimSparks = useMemo(() => buildRimSparks(rimSparkles, 11), [rimSparkles]);

  // Gentle bob/sway for the kete itself
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const phase = Math.random() * 1000;
    let raf = 0;
    const tick = () => {
      const t = performance.now() + phase;
      const y = Math.sin((t / 5200) * Math.PI * 2) * 4;
      const x = Math.sin((t / 7100) * Math.PI * 2 + 0.4) * 2;
      const r = Math.sin((t / 9400) * Math.PI * 2) * 0.6;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const halo = warmGlow
    ? "radial-gradient(circle at 50% 55%, rgba(255,236,210,0.55) 0%, rgba(255,236,210,0.18) 32%, transparent 65%)"
    : "radial-gradient(circle at 50% 55%, rgba(228,238,236,0.55) 0%, rgba(228,238,236,0.18) 32%, transparent 65%)";

  return (
    <div
      ref={outerRef}
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.05 }}
      aria-hidden="true"
    >
      {/* Soft warm halo behind the kete */}
      <div
        className="absolute"
        style={{
          inset: "-12%",
          background: halo,
          filter: "blur(28px)",
        }}
      />

      {/* Sparkly fairy-light data nodes */}
      {sparks.map((sp, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${sp.x}%`,
            top: `${sp.y}%`,
            width: sp.size * 2,
            height: sp.size * 2,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Soft outer halo */}
          <div
            style={{
              position: "absolute",
              inset: `-${sp.rayLen}px`,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,250,235,0.65) 0%, rgba(255,240,200,0.2) 35%, transparent 70%)",
              filter: "blur(2px)",
              animation: `kete-pulse ${sp.duration}s ease-in-out ${sp.delay}s infinite`,
            }}
          />
          {/* Starburst rays */}
          <svg
            width={sp.rayLen * 2 + sp.size * 2}
            height={sp.rayLen * 2 + sp.size * 2}
            viewBox={`-${sp.rayLen + sp.size} -${sp.rayLen + sp.size} ${(sp.rayLen + sp.size) * 2} ${(sp.rayLen + sp.size) * 2}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animation: `kete-twinkle ${sp.duration}s ease-in-out ${sp.delay + 0.2}s infinite, kete-rotate ${sp.duration * 4}s linear infinite`,
              transformOrigin: "center",
            }}
          >
            {Array.from({ length: sp.rays }).map((_, r) => {
              const ang = (r / sp.rays) * Math.PI * 2;
              const x = Math.cos(ang) * sp.rayLen;
              const y = Math.sin(ang) * sp.rayLen;
              return (
                <line
                  key={r}
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,247,225,0.85)"
                  strokeWidth={0.7}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Hot white core */}
            <circle r={sp.size} fill="#FFFEF5" />
            <circle r={sp.size * 0.55} fill="#FFFFFF" />
          </svg>
        </div>
      ))}

      {/* The 3D kete itself, with gentle sway */}
      <div
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          willChange: "transform",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <img
          src={keteHero}
          alt=""
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          width={1024}
          height={1024}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 1,
            filter:
              "drop-shadow(0 30px 44px rgba(80,55,30,0.22)) drop-shadow(0 12px 22px rgba(80,55,30,0.12))",
            userSelect: "none",
          }}
        />
      </div>

      <style>{`
        @keyframes kete-pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          40%      { opacity: 0.95; transform: scale(1.25); }
          50%      { opacity: 0.25; transform: scale(0.9); }
          60%      { opacity: 1;    transform: scale(1.35); }
          80%      { opacity: 0.4;  transform: scale(1.0); }
        }
        @keyframes kete-twinkle {
          0%, 100% { opacity: 0.15; }
          18%      { opacity: 1; }
          22%      { opacity: 0.2; }
          38%      { opacity: 0.95; }
          44%      { opacity: 0.3; }
          62%      { opacity: 1; }
          70%      { opacity: 0.35; }
          85%      { opacity: 0.85; }
        }
        @keyframes kete-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .kete-spark { animation: none !important; }
        }
      `}</style>
    </div>
  );
});

export default KeteFocus;
