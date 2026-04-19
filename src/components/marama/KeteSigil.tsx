import React from "react";

/**
 * KeteSigil — 3D woven kete (basket) marker, one per industry kete.
 *
 * Each sigil renders a dimensional harakeke (flax) kete with:
 *   • woven body (whatu / raranga cross-weave)
 *   • carry handle (kawe)
 *   • soft shadow + interior depth
 *   • a small kete-specific emblem resting inside the basket mouth
 *
 * No icons-in-blobs. Always reads as "a kete."
 */

type Kete =
  | "manaaki"   // hospitality
  | "waihanga"  // construction
  | "auaha"     // creative
  | "arataki"   // automotive
  | "toro"      // family
  | "pikau"     // freight / ops
  | "te-kahui-reo" // Māori BI
  | "auraki"    // generic fallback
  ;

interface Props {
  kete: Kete;
  size?: number;
  accent?: string;
  accentLight?: string;
  className?: string;
  animated?: boolean;
}

const ACCENTS: Record<Kete, { base: string; light: string; dark: string }> = {
  manaaki:        { base: "#E8A948", light: "#F4C880", dark: "#A06B1F" },
  waihanga:       { base: "#C8B27A", light: "#E2D4A8", dark: "#8A7541" },
  auaha:          { base: "#9B8FBF", light: "#C8BFE0", dark: "#6A5E91" },
  arataki:        { base: "#5A7A9C", light: "#8FA9C5", dark: "#314D6E" },
  toro:           { base: "#D4824A", light: "#EAB089", dark: "#945022" },
  pikau:          { base: "#7ECFC2", light: "#A8E6DA", dark: "#3F8C81" },
  "te-kahui-reo": { base: "#3A7D6E", light: "#6BB39E", dark: "#1F4F44" },
  auraki:         { base: "#4AA5A8", light: "#7BC1C3", dark: "#1F6F71" },
};

const KeteSigil: React.FC<Props> = ({
  kete, size = 56, accent, accentLight, className, animated = true,
}) => {
  const a = ACCENTS[kete] || ACCENTS.auraki;
  const c1 = accent || a.base;
  const c2 = accentLight || a.light;
  const c3 = a.dark;
  const id = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${kete} kete`}
      style={{ filter: `drop-shadow(0 6px 14px ${c3}55)` }}
    >
      <defs>
        {/* Body gradient — top-lit weave */}
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c2} />
          <stop offset="55%" stopColor={c1} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        {/* Interior shadow */}
        <radialGradient id={`mouth-${id}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={c3} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1A1D29" stopOpacity="0.8" />
        </radialGradient>
        {/* Handle gradient */}
        <linearGradient id={`handle-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
        {/* Specular */}
        <linearGradient id={`spec-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Cross-weave pattern (whatu) */}
        <pattern id={`weave-${id}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={c3} strokeWidth="0.5" opacity="0.55" />
          <line x1="2" y1="0" x2="2" y2="4" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.35" />
        </pattern>
        {/* Soft drop on glyph */}
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Carry handle (kawe) ─────────────────────────────── */}
      <path
        d="M18 26 Q18 8 32 8 Q46 8 46 26"
        fill="none"
        stroke={`url(#handle-${id})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M18 26 Q18 8 32 8 Q46 8 46 26"
        fill="none"
        stroke={c3}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── Kete body — slightly tapered basket ─────────────── */}
      {/* back rim shadow */}
      <ellipse cx="32" cy="26" rx="22" ry="4" fill={c3} opacity="0.45" />
      {/* main body */}
      <path
        d="M11 26 Q11 26 14 26 L50 26 Q53 26 53 26 L48 54 Q47 58 43 58 L21 58 Q17 58 16 54 Z"
        fill={`url(#body-${id})`}
      />
      {/* woven texture overlay */}
      <path
        d="M11 26 L53 26 L48 54 Q47 58 43 58 L21 58 Q17 58 16 54 Z"
        fill={`url(#weave-${id})`}
        opacity="0.7"
      />
      {/* horizontal weave bands (aho) */}
      {[33, 40, 47, 53].map((y, i) => (
        <path
          key={i}
          d={`M${13 + i * 0.8} ${y} Q32 ${y + 1.4} ${51 - i * 0.8} ${y}`}
          fill="none"
          stroke={c3}
          strokeWidth="0.7"
          opacity="0.55"
        />
      ))}
      {[33, 40, 47, 53].map((y, i) => (
        <path
          key={`h-${i}`}
          d={`M${13 + i * 0.8} ${y - 0.6} Q32 ${y + 0.4} ${51 - i * 0.8} ${y - 0.6}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.4"
          opacity="0.35"
        />
      ))}

      {/* Specular sheen on left flank */}
      <path
        d="M14 28 Q12 40 18 56 L22 56 Q18 40 20 28 Z"
        fill={`url(#spec-${id})`}
        opacity="0.7"
      />

      {/* Mouth opening (interior) */}
      <ellipse cx="32" cy="26" rx="20.5" ry="3.4" fill={`url(#mouth-${id})`} />
      <ellipse cx="32" cy="25.4" rx="20.5" ry="3.4" fill="none" stroke={c3} strokeWidth="0.7" opacity="0.7" />
      {/* Top rim highlight */}
      <ellipse cx="32" cy="25.2" rx="20" ry="3" fill="none" stroke={c2} strokeWidth="0.6" opacity="0.85" />

      {/* ── Per-kete emblem resting inside the kete ─────────── */}
      <g
        filter={`url(#glow-${id})`}
        fill="none"
        stroke={c2}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0,-1)"
      >
        {kete === "manaaki" && (
          /* koru — manaakitanga */
          <path d="M24 24 Q24 16 32 16 Q40 16 40 22 Q40 27 35 27 Q31 27 31 23" />
        )}
        {kete === "waihanga" && (
          /* tukutuku diamond stack */
          <g>
            <path d="M32 14 L40 22 L32 30 L24 22 Z" />
            <path d="M32 20 L36 24 L32 28 L28 24 Z" fill={c2} stroke="none" opacity="0.7" />
          </g>
        )}
        {kete === "auaha" && (
          /* creative spark — 4-point star */
          <g>
            <path d="M32 14 L34 21 L41 22 L34 24 L32 31 L30 24 L23 22 L30 21 Z" fill={c2} stroke={c2} strokeWidth="0.6" />
          </g>
        )}
        {kete === "arataki" && (
          /* compass needle + ring */
          <g>
            <circle cx="32" cy="22" r="7" />
            <path d="M32 16 L34 22 L32 28 L30 22 Z" fill={c2} stroke="none" />
          </g>
        )}
        {kete === "toro" && (
          /* three orbs — whānau */
          <g fill={c2} stroke="none">
            <circle cx="24" cy="22" r="2.6" />
            <circle cx="32" cy="20" r="3" />
            <circle cx="40" cy="22" r="2.6" />
            <path d="M24 22 Q32 26 40 22" fill="none" stroke={c2} strokeWidth="0.9" opacity="0.6" />
          </g>
        )}
        {kete === "pikau" && (
          /* waka prow + waypoint dots */
          <g>
            <path d="M22 24 Q32 14 42 24" />
            <circle cx="22" cy="24" r="1.4" fill={c2} stroke="none" />
            <circle cx="32" cy="17" r="1.4" fill={c2} stroke="none" />
            <circle cx="42" cy="24" r="1.4" fill={c2} stroke="none" />
          </g>
        )}
        {kete === "te-kahui-reo" && (
          /* eight-point woven star — mātauranga */
          <path d="M32 14 L34 20 L40 20 L35 24 L37 30 L32 26 L27 30 L29 24 L24 20 L30 20 Z" fill={c2} stroke={c2} strokeWidth="0.6" />
        )}
        {kete === "auraki" && (
          /* pounamu drop */
          <path d="M32 14 Q39 22 32 30 Q25 22 32 14 Z" fill={c2} stroke={c2} strokeWidth="0.6" />
        )}
      </g>

      {/* ── Ground shadow ───────────────────────────────────── */}
      <ellipse cx="32" cy="60" rx="18" ry="1.6" fill="#1A1D29" opacity="0.18" />

      {/* Animated breathing ring */}
      {animated && (
        <ellipse cx="32" cy="42" rx="24" ry="20" fill="none" stroke={c2} strokeWidth="0.4" opacity="0.25">
          <animate attributeName="rx" values="24;25.2;24" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.08;0.25" dur="4s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
};

export default KeteSigil;
