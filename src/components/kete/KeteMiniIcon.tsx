import React from "react";

/**
 * KeteMiniIcon — A template system for small woven kete-style icons.
 *
 * Each glyph is rendered inside a miniature harakeke basket silhouette
 * with woven strands and constellation nodes, replacing generic Lucide icons
 * with brand-aligned visual markers.
 *
 * Usage:
 *   <KeteMiniIcon glyph="shield" color="#3A7D6E" size={28} />
 */

export type KeteGlyph =
  | "shield"      // governance, rules
  | "globe"       // NZ-ready, locale
  | "bolt"        // speed, practical outcomes
  | "layers"      // start small, scalable
  | "file"        // documents, workflow
  | "people"      // role-based, teams
  | "check"       // approvals, compliance
  | "gear"        // configuration
  | "headset"     // support, onboarding
  | "refresh"     // refinement, iteration
  | "clock"       // turnaround, speed
  | "chart"       // visibility, analytics
  | "clipboard"   // process discipline
  | "book"        // onboarding, learning
  | "thumbs"      // confidence
  | "eye";        // visibility, oversight

interface KeteMiniIconProps {
  glyph: KeteGlyph;
  color?: string;
  size?: number;
  animated?: boolean;
  className?: string;
}

/* ── Glyph paths (drawn at centre of 200×220 viewBox, ~40px region) ── */
const GLYPH_PATHS: Record<KeteGlyph, React.ReactNode> = {
  shield: (
    <path d="M100 100 L88 108 L88 120 Q88 130 100 136 Q112 130 112 120 L112 108 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  globe: (
    <>
      <circle cx="100" cy="118" r="14" strokeWidth="1.8" fill="none" />
      <ellipse cx="100" cy="118" rx="7" ry="14" strokeWidth="1.2" fill="none" />
      <line x1="86" y1="118" x2="114" y2="118" strokeWidth="1" />
    </>
  ),
  bolt: (
    <path d="M100 100 L94 118 L102 118 L96 136 L110 112 L102 112 L106 100 Z" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
  ),
  layers: (
    <>
      <path d="M100 106 L85 114 L100 122 L115 114 Z" strokeWidth="1.5" fill="none" />
      <path d="M85 120 L100 128 L115 120" strokeWidth="1.5" fill="none" />
      <path d="M85 126 L100 134 L115 126" strokeWidth="1.5" fill="none" />
    </>
  ),
  file: (
    <>
      <rect x="90" y="102" width="20" height="26" rx="2" strokeWidth="1.5" fill="none" />
      <line x1="94" y1="112" x2="106" y2="112" strokeWidth="1" />
      <line x1="94" y1="117" x2="106" y2="117" strokeWidth="1" />
      <line x1="94" y1="122" x2="102" y2="122" strokeWidth="1" />
    </>
  ),
  people: (
    <>
      <circle cx="95" cy="108" r="5" strokeWidth="1.5" fill="none" />
      <path d="M86 124 Q86 118 95 118 Q104 118 104 124" strokeWidth="1.5" fill="none" />
      <circle cx="110" cy="110" r="4" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M103 124 Q103 119 110 119 Q117 119 117 124" strokeWidth="1.2" fill="none" opacity="0.6" />
    </>
  ),
  check: (
    <>
      <circle cx="100" cy="118" r="14" strokeWidth="1.8" fill="none" />
      <path d="M92 118 L98 124 L110 112" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  gear: (
    <>
      <circle cx="100" cy="118" r="6" strokeWidth="1.5" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r1 = 10, r2 = 14;
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={100 + r1 * Math.cos(rad)} y1={118 + r1 * Math.sin(rad)} x2={100 + r2 * Math.cos(rad)} y2={118 + r2 * Math.sin(rad)} strokeWidth="2" strokeLinecap="round" />;
      })}
    </>
  ),
  headset: (
    <>
      <path d="M88 120 Q88 106 100 106 Q112 106 112 120" strokeWidth="1.8" fill="none" />
      <rect x="84" y="118" width="6" height="10" rx="2" strokeWidth="1.5" fill="none" />
      <rect x="110" y="118" width="6" height="10" rx="2" strokeWidth="1.5" fill="none" />
      <path d="M112 128 Q112 134 106 134" strokeWidth="1.2" fill="none" />
    </>
  ),
  refresh: (
    <>
      <path d="M92 110 A12 12 0 0 1 112 114" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M108 126 A12 12 0 0 1 88 122" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M112 108 L112 116 L104 114" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 128 L88 120 L96 122" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="100" cy="118" r="14" strokeWidth="1.8" fill="none" />
      <line x1="100" y1="118" x2="100" y2="110" strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="118" x2="108" y2="120" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <line x1="88" y1="132" x2="112" y2="132" strokeWidth="1.5" />
      <rect x="90" y="118" width="5" height="14" rx="1" strokeWidth="1.2" fill="none" />
      <rect x="98" y="108" width="5" height="24" rx="1" strokeWidth="1.2" fill="none" />
      <rect x="106" y="114" width="5" height="18" rx="1" strokeWidth="1.2" fill="none" />
    </>
  ),
  clipboard: (
    <>
      <rect x="90" y="106" width="20" height="26" rx="2" strokeWidth="1.5" fill="none" />
      <rect x="96" y="102" width="8" height="6" rx="1" strokeWidth="1.2" fill="none" />
      <path d="M94 116 L98 120 L106 112" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="94" y1="126" x2="106" y2="126" strokeWidth="1" opacity="0.5" />
    </>
  ),
  book: (
    <>
      <path d="M88 108 Q100 104 100 104 L100 132 Q100 132 88 128 Z" strokeWidth="1.5" fill="none" />
      <path d="M112 108 Q100 104 100 104 L100 132 Q100 132 112 128 Z" strokeWidth="1.5" fill="none" />
    </>
  ),
  thumbs: (
    <>
      <path d="M96 124 L96 114 L100 106 L104 106 L102 114 L110 114 L110 128 L96 128 Z" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <rect x="88" y="114" width="8" height="14" rx="1" strokeWidth="1.2" fill="none" />
    </>
  ),
  eye: (
    <>
      <path d="M84 118 Q100 104 116 118 Q100 132 84 118 Z" strokeWidth="1.8" fill="none" />
      <circle cx="100" cy="118" r="5" strokeWidth="1.5" fill="none" />
      <circle cx="100" cy="118" r="2" fill="currentColor" opacity="0.6" />
    </>
  ),
};

const KeteMiniIcon: React.FC<KeteMiniIconProps> = ({
  glyph,
  color = "#3A7D6E",
  size = 28,
  animated = false,
  className = "",
}) => {
  const lightColor = `${color}99`;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="60 80 80 80"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label={`${glyph} icon`}
      >
        {/* Mini basket silhouette */}
        <path
          d="M72 90 Q72 142 100 148 Q128 142 128 90"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Two horizontal weave strands */}
        <line x1="74" y1="108" x2="126" y2="108" stroke={color} strokeWidth="0.8" opacity="0.2" />
        <line x1="76" y1="128" x2="124" y2="128" stroke={color} strokeWidth="0.8" opacity="0.2" />

        {/* Constellation dots at weave intersections */}
        <circle cx="80" cy="108" r="1.2" fill={color} opacity="0.25" />
        <circle cx="100" cy="108" r="1.2" fill={color} opacity="0.25" />
        <circle cx="120" cy="108" r="1.2" fill={color} opacity="0.25" />
        <circle cx="84" cy="128" r="1.2" fill={color} opacity="0.2" />
        <circle cx="116" cy="128" r="1.2" fill={color} opacity="0.2" />

        {/* Glyph overlay */}
        <g
          stroke={color}
          fill="none"
          style={{ color }}
          className={animated ? "kete-glow-dot" : ""}
        >
          {GLYPH_PATHS[glyph]}
        </g>
      </svg>
    </div>
  );
};

export default KeteMiniIcon;

/**
 * Preset mapping from concept to glyph — for quick lookups.
 */
export const CONCEPT_GLYPH: Record<string, KeteGlyph> = {
  control: "shield",
  rules: "shield",
  governance: "shield",
  nz: "globe",
  locale: "globe",
  speed: "bolt",
  outcomes: "bolt",
  scale: "layers",
  "start-small": "layers",
  workflow: "file",
  document: "file",
  roles: "people",
  team: "people",
  approval: "check",
  compliance: "check",
  config: "gear",
  support: "headset",
  onboarding: "headset",
  refine: "refresh",
  iterate: "refresh",
  turnaround: "clock",
  visibility: "chart",
  analytics: "chart",
  process: "clipboard",
  discipline: "clipboard",
  learning: "book",
  confidence: "thumbs",
  oversight: "eye",
};
