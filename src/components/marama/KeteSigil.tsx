import React from "react";

/**
 * KeteSigil — custom 3D-glow SVG marker used per-kete in dashboard headers,
 * cards, and ribbons. NEVER use lucide / emoji for kete identity.
 *
 * Each sigil is a hand-crafted geometric glyph rooted in raranga (weaving)
 * + the kete's domain — refracted through soft gradients, inner glow,
 * specular highlight. Sized to a 56-px hit area by default.
 */

type Kete =
  | "manaaki"   // hospitality — koru spiral
  | "waihanga"  // construction — tukutuku diamond stack
  | "auaha"     // creative — chromatic prism
  | "arataki"   // automotive — compass + path
  | "toro"      // family — three orbits
  | "pikau"     // freight — vessel + waypoints
  | "te-kahui-reo" // Māori BI — woven star
  | "auraki"    // generic fallback — pounamu drop
  ;

interface Props {
  kete: Kete;
  size?: number;
  accent?: string;
  accentLight?: string;
  className?: string;
  animated?: boolean;
}

const ACCENTS: Record<Kete, { base: string; light: string }> = {
  manaaki:        { base: "#E8A948", light: "#F0D078" },
  waihanga:       { base: "#C8B27A", light: "#E2D4A8" },
  auaha:          { base: "#9B8FBF", light: "#C8BFE0" },
  arataki:        { base: "#5A7A9C", light: "#8FA9C5" },
  toro:           { base: "#D4824A", light: "#EAB089" },
  pikau:          { base: "#7ECFC2", light: "#A8E6DA" },
  "te-kahui-reo": { base: "#3A7D6E", light: "#6BB39E" },
  auraki:         { base: "#4AA5A8", light: "#7BC1C3" },
};

const KeteSigil: React.FC<Props> = ({
  kete, size = 56, accent, accentLight, className, animated = true,
}) => {
  const a = ACCENTS[kete] || ACCENTS.auraki;
  const c1 = accent || a.base;
  const c2 = accentLight || a.light;
  const id = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${kete} sigil`}
      style={{ filter: `drop-shadow(0 4px 14px ${c1}55)` }}
    >
      <defs>
        <radialGradient id={`g-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor={c2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c1} stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`r-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ambient halo */}
      <circle cx="32" cy="32" r="29" fill="none" stroke={c1} strokeWidth="0.6" opacity="0.25" />
      {/* Disc base */}
      <circle cx="32" cy="32" r="26" fill={`url(#g-${id})`} />
      {/* Specular crescent */}
      <ellipse cx="26" cy="22" rx="14" ry="6" fill={`url(#r-${id})`} opacity="0.7" />

      {/* Per-kete glyph */}
      <g filter={`url(#glow-${id})`} fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kete === "manaaki" && (
          <path d="M22 42 Q22 22 38 22 Q48 22 48 32 Q48 40 40 40 Q34 40 34 34 Q34 30 38 30" />
        )}
        {kete === "waihanga" && (
          <g>
            <path d="M32 16 L44 28 L32 40 L20 28 Z" />
            <path d="M32 28 L40 36 L32 44 L24 36 Z" opacity="0.65" />
          </g>
        )}
        {kete === "auaha" && (
          <g>
            <path d="M32 18 L46 42 L18 42 Z" />
            <path d="M32 18 L32 42" opacity="0.55" />
            <path d="M25 30 L39 30" opacity="0.45" />
          </g>
        )}
        {kete === "arataki" && (
          <g>
            <circle cx="32" cy="32" r="12" />
            <path d="M32 22 L36 32 L32 42 L28 32 Z" fill="#FFFFFF" stroke="none" opacity="0.85" />
            <path d="M32 22 L32 14 M32 42 L32 50 M22 32 L14 32 M42 32 L50 32" opacity="0.5" />
          </g>
        )}
        {kete === "toro" && (
          <g>
            <ellipse cx="32" cy="32" rx="18" ry="8" />
            <ellipse cx="32" cy="32" rx="8" ry="18" opacity="0.7" />
            <circle cx="32" cy="32" r="3" fill="#FFFFFF" stroke="none" />
          </g>
        )}
        {kete === "pikau" && (
          <g>
            <path d="M16 36 Q32 44 48 36 L44 28 L20 28 Z" />
            <path d="M32 28 L32 18 L40 24" />
            <circle cx="22" cy="20" r="1.2" fill="#FFFFFF" stroke="none" />
            <circle cx="42" cy="18" r="1.2" fill="#FFFFFF" stroke="none" />
          </g>
        )}
        {kete === "te-kahui-reo" && (
          <g>
            <path d="M32 16 L36 28 L48 30 L38 38 L42 50 L32 42 L22 50 L26 38 L16 30 L28 28 Z" />
          </g>
        )}
        {kete === "auraki" && (
          <g>
            <path d="M32 18 Q42 32 32 46 Q22 32 32 18 Z" />
          </g>
        )}
      </g>

      {animated && (
        <circle cx="32" cy="32" r="29" fill="none" stroke={c2} strokeWidth="0.5" opacity="0.4">
          <animate attributeName="r" values="29;31;29" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

export default KeteSigil;
