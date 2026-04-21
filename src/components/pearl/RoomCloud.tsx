import { useEffect, useRef, useState } from "react";
import cloudImg from "@/assets/hero-cloud-photoreal.png";

/**
 * RoomCloud — a photoreal cumulus cloud floating inside a soft "studio room".
 *
 * The page section becomes a calm interior:
 *   • subtle floor-to-ceiling pearl gradient (the "room")
 *   • faint horizon line where wall meets floor
 *   • gentle vignette in the corners
 *   • the cloud floats centrally and reacts to the cursor with parallax,
 *     a slow ambient bob, and warm sparkles drifting through it.
 *
 * Pure DOM + CSS + a small rAF loop. No WebGL, no SVG silhouettes —
 * the cloud is the photoreal asset itself.
 */

interface Sparkle {
  /** % across the cloud */
  x: number;
  /** % down the cloud */
  y: number;
  /** size in px */
  size: number;
  /** twinkle period (ms) */
  period: number;
  /** phase offset (ms) */
  offset: number;
  /** depth 0..1 — affects opacity & blur */
  depth: number;
}

const CANDLE_WARM = "#F8E9C4";

function makeSparkles(count: number, seed = 7): Sparkle[] {
  // tiny seeded RNG so positions are stable across renders
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => {
    const depth = rand();
    return {
      x: 8 + rand() * 84,
      y: 22 + rand() * 70, // bias to lower 3/4 of cloud
      size: 1.4 + rand() * 2.6,
      period: 2200 + rand() * 3800,
      offset: rand() * 4000,
      depth,
    };
  });
}

interface RoomCloudProps {
  height?: number;
  className?: string;
}

export default function RoomCloud({ height = 640, className = "" }: RoomCloudProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

  const [sparkles] = useState(() => makeSparkles(28));

  // pointer + scroll state for rAF
  const target = useRef({ px: 0, py: 0, scroll: 0 });
  const current = useRef({ px: 0, py: 0, scroll: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      // -1..1 from centre of the wrap
      target.current.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.current.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onScroll = () => {
      target.current.scroll = window.scrollY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const tick = () => {
      // ease toward target (slow, calm — ~350ms)
      const k = 0.06;
      current.current.px += (target.current.px - current.current.px) * k;
      current.current.py += (target.current.py - current.current.py) * k;
      current.current.scroll += (target.current.scroll - current.current.scroll) * 0.1;

      const t = performance.now();
      // ambient bob — 14s vertical, 18s horizontal, very gentle
      const bobY = Math.sin(t / 14000 * Math.PI * 2) * 8;
      const bobX = Math.sin(t / 18000 * Math.PI * 2 + 1.3) * 6;
      // breathing scale — 12s
      const breathe = 1 + Math.sin(t / 12000 * Math.PI * 2) * 0.012;

      const cloud = cloudRef.current;
      if (cloud) {
        const px = current.current.px;
        const py = current.current.py;
        // cursor parallax — feels like the cloud notices you
        const tx = px * 22 + bobX;
        const ty = py * 14 + bobY - current.current.scroll * 0.18;
        // very subtle 3D tilt
        const rx = -py * 3.5;
        const ry = px * 4.5;
        cloud.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${breathe})`;
      }

      const sparkleEl = sparklesRef.current;
      if (sparkleEl) {
        // sparkles share the same parallax so they feel embedded in the cloud
        const px = current.current.px;
        const py = current.current.py;
        const tx = px * 22 + bobX;
        const ty = py * 14 + bobY - current.current.scroll * 0.18;
        sparkleEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${breathe})`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{
        height,
        perspective: "1400px",
        perspectiveOrigin: "50% 35%",
      }}
    >
      {/* ── The room ── soft floor-to-ceiling gradient with horizon */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(120% 80% at 50% 0%, rgba(255,250,240,1) 0%, rgba(250,246,239,1) 45%, rgba(244,239,230,1) 100%),
            linear-gradient(to bottom, rgba(255,253,247,0) 55%, rgba(232,224,210,0.55) 100%)
          `,
        }}
      />

      {/* faint horizon line — wall meets floor */}
      <div
        aria-hidden
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "72%",
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(31,77,71,0.10) 30%, rgba(31,77,71,0.10) 70%, transparent)",
          filter: "blur(0.5px)",
        }}
      />

      {/* corner vignette so the cloud feels enclosed in a calm space */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(120% 90% at 50% 50%, transparent 50%, rgba(232,224,210,0.55) 100%)",
        }}
      />

      {/* warm light shaft from upper-right — matches the cloud's baked lighting */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-5%",
          width: "70%",
          height: "85%",
          background: "radial-gradient(ellipse at 80% 10%, rgba(248,233,196,0.45) 0%, rgba(248,233,196,0) 60%)",
          mixBlendMode: "screen",
        }}
      />

      {/* soft floor shadow under the cloud — anchors it in the room */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "12%",
          right: "12%",
          top: "70%",
          height: 70,
          background: "radial-gradient(ellipse at center, rgba(31,77,71,0.16) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* ── The cloud ── photoreal asset, parallax-driven */}
      <div
        ref={cloudRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          transition: "filter 600ms ease",
        }}
      >
        <img
          src={cloudImg}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            width: "min(98%, 1100px)",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 30px 60px rgba(31,77,71,0.18))",
            userSelect: "none",
          }}
          draggable={false}
        />
      </div>

      {/* ── Sparkles — warm fairy lights inside/around the cloud ── */}
      <div
        ref={sparklesRef}
        className="absolute inset-0 pointer-events-none"
        style={{ willChange: "transform" }}
      >
        {sparkles.map((s, i) => {
          // map cloud-local % to wrap %
          const left = 8 + s.x * 0.84; // cloud spans roughly 8%-92%
          const top = 12 + s.y * 0.6; // cloud spans roughly 12%-72% of wrap
          const ringSize = s.size * 6;
          const baseOpacity = 0.35 + s.depth * 0.55;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: ringSize,
                height: ringSize,
                marginLeft: -ringSize / 2,
                marginTop: -ringSize / 2,
                pointerEvents: "none",
              }}
            >
              {/* soft halo */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${CANDLE_WARM} 0%, rgba(248,233,196,0) 65%)`,
                  filter: `blur(${1 + (1 - s.depth) * 2}px)`,
                  animation: `roomSparkle ${s.period}ms ease-in-out infinite`,
                  animationDelay: `-${s.offset}ms`,
                  opacity: baseOpacity,
                }}
              />
              {/* bright pinpoint */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: s.size,
                  height: s.size,
                  marginLeft: -s.size / 2,
                  marginTop: -s.size / 2,
                  borderRadius: "50%",
                  background: CANDLE_WARM,
                  boxShadow: `0 0 ${s.size * 3}px ${CANDLE_WARM}`,
                  animation: `roomSparklePoint ${s.period}ms ease-in-out infinite`,
                  animationDelay: `-${s.offset}ms`,
                  opacity: 0.9,
                }}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes roomSparkle {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50%      { opacity: 0.85; transform: scale(1.15); }
        }
        @keyframes roomSparklePoint {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
