import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * WaterCausticBackground — CSS-based animated water-glass effect.
 * Uses layered radial gradients + SVG feTurbulence for distortion.
 * Tints shift to match the current kete page colour.
 */

const KETE_TINTS: Record<string, { color1: string; color2: string }> = {
  "/manaaki": { color1: "rgba(232,160,144,0.06)", color2: "rgba(232,160,144,0.03)" },
  "/waihanga": { color1: "rgba(232,169,72,0.06)", color2: "rgba(232,169,72,0.03)" },
  "/auaha": { color1: "rgba(184,165,208,0.06)", color2: "rgba(184,165,208,0.03)" },
  "/arataki": { color1: "rgba(74,165,168,0.06)", color2: "rgba(74,165,168,0.03)" },
  "/pikau": { color1: "rgba(123,168,140,0.06)", color2: "rgba(123,168,140,0.03)" },
  "/toro": { color1: "rgba(232,169,72,0.05)", color2: "rgba(212,168,67,0.03)" },
};

function getKeteTint(pathname: string) {
  for (const [prefix, tint] of Object.entries(KETE_TINTS)) {
    if (pathname.startsWith(prefix)) return tint;
  }
  return { color1: "rgba(74,165,168,0.04)", color2: "rgba(232,169,72,0.03)" };
}

export default function WaterCausticBackground() {
  const { pathname } = useLocation();
  const tint = getKeteTint(pathname);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* SVG distortion filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="water-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.012"
              numOctaves={3}
              seed={42}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015 0.012;0.018 0.015;0.015 0.012"
                dur="20s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={12}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Layer 1 — large slow drift */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 30% 40%, ${tint.color1}, transparent 70%)`,
          mixBlendMode: "soft-light",
          animation: "waterLayer1 20s ease-in-out infinite",
          filter: "url(#water-distortion)",
          opacity: 0.7,
        }}
      />

      {/* Layer 2 — medium counter-drift */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 70% 30%, ${tint.color2}, transparent 65%)`,
          mixBlendMode: "soft-light",
          animation: "waterLayer2 28s ease-in-out infinite",
          opacity: 0.6,
        }}
      />

      {/* Layer 3 — warm caustic shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 60%, rgba(255,255,248,0.04), transparent 60%)`,
          mixBlendMode: "soft-light",
          animation: "waterLayer3 35s ease-in-out infinite",
          opacity: 0.5,
        }}
      />

      {/* Layer 4 — subtle teal highlights */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 40% 40% at 60% 50%, rgba(74,165,168,0.03), transparent 60%)`,
          mixBlendMode: "soft-light",
          animation: "waterLayer4 42s ease-in-out infinite",
          filter: "url(#water-distortion)",
          opacity: 0.4,
        }}
      />

      <style>{`
        @keyframes waterLayer1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(3%, 2%) rotate(2deg) scale(1.03); }
          50% { transform: translate(-2%, 4%) rotate(-1deg) scale(1.01); }
          75% { transform: translate(1%, -2%) rotate(1deg) scale(1.02); }
        }
        @keyframes waterLayer2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-4%, 3%) rotate(-2deg) scale(1.04); }
          66% { transform: translate(3%, -3%) rotate(1.5deg) scale(1.02); }
        }
        @keyframes waterLayer3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(2%, 3%) scale(1.05); }
        }
        @keyframes waterLayer4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-3%, -2%) rotate(1deg); }
          66% { transform: translate(2%, 2%) rotate(-1.5deg); }
        }
      `}</style>
    </div>
  );
}
