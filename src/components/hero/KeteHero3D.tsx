// ============================================================================
// KeteHero3D — premium feather-kete hero visual
// ----------------------------------------------------------------------------
// Renders a calm, Aotearoa-inspired vessel with ivory feathers, braided gold
// handles, pearl-gold nodes and faint connecting data lines. Built in pure
// SVG + CSS so it stays light, responsive, and accessible — no WebGL cost
// on mobile. A Spline scene can be plugged in later by swapping the inner
// <KeteSvg/> for <Spline scene={sceneUrl} /> from @splinetool/react-spline.
//
// Motion:
//   • slow autonomous float (CSS keyframes)
//   • gentle parallax that follows the cursor (capped, opt-out on touch)
//   • simplified static fallback for prefers-reduced-motion + small screens
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  /** Optional Spline scene URL — wire @splinetool/react-spline when supplied. */
  sceneUrl?: string;
  className?: string;
}

export default function KeteHero3D({ sceneUrl: _sceneUrl, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();
  const [isCoarse, setIsCoarse] = useState(false);

  // Touch / coarse pointer → skip parallax for performance
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Mouse parallax (capped to ±6deg, only on fine pointers)
  useEffect(() => {
    if (reduceMotion || isCoarse) return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -6, y: px * 6 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el?.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion, isCoarse]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full aspect-square max-w-[560px] mx-auto ${className}`}
      style={{ perspective: 1400 }}
      aria-hidden="true"
    >
      {/* Soft halo behind the kete */}
      <div
        className="absolute inset-0 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(217,188,122,0.35), rgba(217,188,122,0.08) 55%, transparent 75%)",
        }}
      />

      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -10, 0], rotateZ: [-1, 1, -1] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <KeteSvg />
      </motion.div>

      {/* Star points / sparkles */}
      <SparkleField reduceMotion={!!reduceMotion} />
    </div>
  );
}

// ============================================================================
// The kete itself — pure SVG so it scales perfectly and ships under 6KB.
// ============================================================================
function KeteSvg() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="absolute inset-0 w-full h-full drop-shadow-[0_30px_60px_rgba(120,90,40,0.18)]"
    >
      <defs>
        {/* Ivory feather gradient */}
        <linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF6EC" />
          <stop offset="100%" stopColor="#E9DCC4" />
        </linearGradient>
        {/* Braided gold handle */}
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9C988" />
          <stop offset="50%" stopColor="#C9A35E" />
          <stop offset="100%" stopColor="#E9C988" />
        </linearGradient>
        {/* Pearl node */}
        <radialGradient id="pearl" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="60%" stopColor="#F1E2C2" />
          <stop offset="100%" stopColor="#C9A35E" />
        </radialGradient>
        {/* Vessel body — ivory weave */}
        <radialGradient id="vessel" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FCF7EE" />
          <stop offset="65%" stopColor="#EDE0C7" />
          <stop offset="100%" stopColor="#C9B591" />
        </radialGradient>
        {/* Subtle weave pattern */}
        <pattern
          id="weave"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <path d="M0 7 L14 7" stroke="rgba(146,109,55,0.18)" strokeWidth="0.7" />
          <path d="M7 0 L7 14" stroke="rgba(146,109,55,0.10)" strokeWidth="0.7" />
        </pattern>
      </defs>

      {/* Ivory feathers fanning above the vessel */}
      <g opacity="0.95">
        {[-55, -38, -22, -8, 8, 22, 38, 55].map((deg, i) => (
          <g key={i} transform={`translate(300 280) rotate(${deg})`}>
            <path
              d="M0 0 C -10 -90, -8 -170, 0 -230 C 8 -170, 10 -90, 0 0 Z"
              fill="url(#ivory)"
              stroke="rgba(180,150,100,0.35)"
              strokeWidth="0.8"
            />
            <path
              d="M0 -10 L0 -220"
              stroke="rgba(150,115,60,0.4)"
              strokeWidth="0.6"
            />
          </g>
        ))}
      </g>

      {/* Vessel body */}
      <g>
        <ellipse cx="300" cy="380" rx="170" ry="40" fill="rgba(120,90,40,0.18)" />
        <path
          d="M150 300 C 160 460, 440 460, 450 300 Z"
          fill="url(#vessel)"
        />
        <path
          d="M150 300 C 160 460, 440 460, 450 300 Z"
          fill="url(#weave)"
        />
        {/* Vessel rim */}
        <ellipse
          cx="300"
          cy="300"
          rx="150"
          ry="20"
          fill="none"
          stroke="url(#gold)"
          strokeWidth="3"
        />
        <ellipse cx="300" cy="300" rx="150" ry="20" fill="rgba(255,250,235,0.35)" />
      </g>

      {/* Braided gold handle */}
      <g fill="none" stroke="url(#gold)" strokeWidth="4" strokeLinecap="round">
        <path d="M170 300 C 180 200, 420 200, 430 300" />
        <path
          d="M175 295 C 200 220, 400 220, 425 295"
          opacity="0.6"
          strokeDasharray="4 6"
        />
      </g>

      {/* Pearl-gold nodes around the rim with thin connecting data lines */}
      {(() => {
        const nodes = Array.from({ length: 7 }, (_, i) => {
          const t = i / 6;
          const x = 150 + t * 300;
          const y = 300 + Math.sin(t * Math.PI) * 18;
          return { x, y };
        });
        return (
          <g>
            {nodes.map((n, i) =>
              i < nodes.length - 1 ? (
                <line
                  key={`l${i}`}
                  x1={n.x}
                  y1={n.y}
                  x2={nodes[i + 1].x}
                  y2={nodes[i + 1].y}
                  stroke="rgba(201,163,94,0.55)"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
              ) : null,
            )}
            {nodes.map((n, i) => (
              <g key={`n${i}`}>
                <circle cx={n.x} cy={n.y} r="6" fill="url(#pearl)" />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="11"
                  fill="none"
                  stroke="rgba(233,201,136,0.4)"
                />
              </g>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}

// ============================================================================
// SparkleField — tiny twinkling star points (CSS-only, GPU-friendly).
// ============================================================================
function SparkleField({ reduceMotion }: { reduceMotion: boolean }) {
  const sparkles = [
    { top: "12%", left: "18%", delay: 0, size: 3 },
    { top: "22%", left: "78%", delay: 1.4, size: 2 },
    { top: "44%", left: "10%", delay: 2.2, size: 2 },
    { top: "62%", left: "86%", delay: 0.8, size: 3 },
    { top: "78%", left: "26%", delay: 1.9, size: 2 },
    { top: "30%", left: "52%", delay: 3.1, size: 2 },
    { top: "8%", left: "60%", delay: 2.6, size: 2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background:
              "radial-gradient(circle, rgba(255,250,230,1) 0%, rgba(217,188,122,0.7) 40%, transparent 70%)",
            boxShadow: "0 0 8px rgba(217,188,122,0.6)",
            animation: reduceMotion
              ? undefined
              : `kete-twinkle 4.5s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes kete-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50%      { opacity: 1;    transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
