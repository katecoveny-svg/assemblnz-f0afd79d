import React from "react";

export type KeteGlyph =
  | "shield" | "globe" | "bolt" | "layers" | "file" | "people"
  | "check" | "gear" | "headset" | "refresh" | "clock" | "chart"
  | "clipboard" | "book" | "thumbs" | "eye";

interface KeteMiniIconProps {
  glyph: KeteGlyph;
  color?: string;
  size?: number;
  animated?: boolean;
  className?: string;
}

const GLYPH_PATHS: Record<KeteGlyph, React.ReactNode> = {
  shield: (
    <path d="M100 98 L86 107 L86 121 Q86 133 100 140 Q114 133 114 121 L114 107 Z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  globe: (
    <>
      <circle cx="100" cy="118" r="16" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="118" rx="8" ry="16" strokeWidth="1.5" fill="none" />
      <line x1="84" y1="118" x2="116" y2="118" strokeWidth="1.2" />
      <line x1="86" y1="110" x2="114" y2="110" strokeWidth="0.8" opacity="0.5" />
      <line x1="86" y1="126" x2="114" y2="126" strokeWidth="0.8" opacity="0.5" />
    </>
  ),
  bolt: (
    <path d="M102 96 L92 118 L101 118 L94 140 L114 112 L104 112 L108 96 Z" strokeWidth="2" strokeLinejoin="round" fill="none" />
  ),
  layers: (
    <>
      <path d="M100 104 L82 113 L100 122 L118 113 Z" strokeWidth="2" fill="none" />
      <path d="M82 120 L100 129 L118 120" strokeWidth="2" fill="none" />
      <path d="M82 127 L100 136 L118 127" strokeWidth="2" fill="none" />
    </>
  ),
  file: (
    <>
      <rect x="87" y="98" width="26" height="34" rx="3" strokeWidth="2" fill="none" />
      <line x1="93" y1="110" x2="107" y2="110" strokeWidth="1.5" />
      <line x1="93" y1="117" x2="107" y2="117" strokeWidth="1.5" />
      <line x1="93" y1="124" x2="102" y2="124" strokeWidth="1.5" />
    </>
  ),
  people: (
    <>
      <circle cx="93" cy="106" r="7" strokeWidth="2" fill="none" />
      <path d="M82 126 Q82 118 93 118 Q104 118 104 126" strokeWidth="2" fill="none" />
      <circle cx="112" cy="108" r="5.5" strokeWidth="1.5" fill="none" opacity="0.65" />
      <path d="M104 126 Q104 120 112 120 Q120 120 120 126" strokeWidth="1.5" fill="none" opacity="0.65" />
    </>
  ),
  check: (
    <>
      <circle cx="100" cy="118" r="16" strokeWidth="2" fill="none" />
      <path d="M90 118 L97 126 L112 110" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  gear: (
    <>
      <circle cx="100" cy="118" r="7" strokeWidth="2" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={100 + 11 * Math.cos(rad)} y1={118 + 11 * Math.sin(rad)} x2={100 + 16 * Math.cos(rad)} y2={118 + 16 * Math.sin(rad)} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </>
  ),
  headset: (
    <>
      <path d="M86 120 Q86 104 100 104 Q114 104 114 120" strokeWidth="2" fill="none" />
      <rect x="81" y="117" width="8" height="13" rx="3" strokeWidth="2" fill="none" />
      <rect x="111" y="117" width="8" height="13" rx="3" strokeWidth="2" fill="none" />
      <path d="M114 130 Q114 137 106 137" strokeWidth="1.5" fill="none" />
    </>
  ),
  refresh: (
    <>
      <path d="M90 108 A14 14 0 0 1 114 114" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M110 128 A14 14 0 0 1 86 122" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M114 106 L114 116 L104 113" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 130 L86 120 L96 123" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="100" cy="118" r="16" strokeWidth="2" fill="none" />
      <line x1="100" y1="118" x2="100" y2="108" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="118" x2="110" y2="121" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <line x1="84" y1="136" x2="116" y2="136" strokeWidth="2" />
      <rect x="86" y="118" width="7" height="18" rx="2" strokeWidth="1.8" fill="none" />
      <rect x="97" y="104" width="7" height="32" rx="2" strokeWidth="1.8" fill="none" />
      <rect x="108" y="112" width="7" height="24" rx="2" strokeWidth="1.8" fill="none" />
    </>
  ),
  clipboard: (
    <>
      <rect x="87" y="104" width="26" height="32" rx="3" strokeWidth="2" fill="none" />
      <rect x="95" y="99" width="10" height="7" rx="2" strokeWidth="1.5" fill="none" />
      <path d="M93 118 L98 124 L108 112" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="93" y1="130" x2="107" y2="130" strokeWidth="1.2" opacity="0.5" />
    </>
  ),
  book: (
    <>
      <path d="M85 105 Q100 100 100 100 L100 136 Q100 136 85 131 Z" strokeWidth="2" fill="none" />
      <path d="M115 105 Q100 100 100 100 L100 136 Q100 136 115 131 Z" strokeWidth="2" fill="none" />
    </>
  ),
  thumbs: (
    <>
      <path d="M96 126 L96 114 L100 104 L106 104 L103 114 L112 114 L112 130 L96 130 Z" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <rect x="86" y="114" width="10" height="16" rx="2" strokeWidth="1.8" fill="none" />
    </>
  ),
  eye: (
    <>
      <path d="M80 118 Q100 100 120 118 Q100 136 80 118 Z" strokeWidth="2" fill="none" />
      <circle cx="100" cy="118" r="6" strokeWidth="1.8" fill="none" />
      <circle cx="100" cy="118" r="2.5" fill="currentColor" opacity="0.7" />
    </>
  ),
};

const KeteMiniIcon: React.FC<KeteMiniIconProps> = ({
  glyph,
  color = "#3A7D6E",
  size = 36,
  animated = false,
  className = "",
}) => {
  const id = `kmi-${glyph}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="60 76 80 88"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label={`${glyph} icon`}
      >
        <defs>
          {/* Radial glow behind the glyph */}
          <radialGradient id={`${id}-glow`} cx="50%" cy="55%" r="45%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          {/* Linear gradient for the basket shell — creates 3D depth */}
          <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0.12" />
          </linearGradient>
          {/* Glyph stroke gradient — bright top to dim bottom */}
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
          {/* Drop-shadow filter for depth */}
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ambient glow disc */}
        <ellipse cx="100" cy="120" rx="28" ry="30" fill={`url(#${id}-glow)`} />

        {/* Basket silhouette with gradient stroke */}
        <path
          d="M72 88 Q72 144 100 150 Q128 144 128 88"
          fill="none"
          stroke={`url(#${id}-shell)`}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Diagonal weave strands — harakeke */}
        <line x1="78" y1="94" x2="108" y2="140" stroke={color} strokeWidth="0.7" opacity="0.12" />
        <line x1="92" y1="88" x2="122" y2="134" stroke={color} strokeWidth="0.7" opacity="0.12" />
        <line x1="122" y1="94" x2="92" y2="140" stroke={color} strokeWidth="0.7" opacity="0.12" />
        <line x1="108" y1="88" x2="78" y2="134" stroke={color} strokeWidth="0.7" opacity="0.12" />

        {/* Horizontal weave bands */}
        <line x1="74" y1="108" x2="126" y2="108" stroke={color} strokeWidth="0.8" opacity="0.15" />
        <line x1="76" y1="128" x2="124" y2="128" stroke={color} strokeWidth="0.8" opacity="0.1" />

        {/* Constellation nodes at intersections — glowing */}
        {[[80, 108], [100, 108], [120, 108], [86, 128], [100, 128], [114, 128]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2" fill={color} opacity="0.08" />
            <circle cx={cx} cy={cy} r="1.2" fill={color} opacity="0.3" />
          </g>
        ))}

        {/* Glyph — with gradient stroke and drop shadow */}
        <g
          stroke={`url(#${id}-stroke)`}
          fill="none"
          style={{ color }}
          filter={`url(#${id}-shadow)`}
          className={animated ? "kete-glow-dot" : ""}
        >
          {GLYPH_PATHS[glyph]}
        </g>
      </svg>
    </div>
  );
};

export default KeteMiniIcon;

export const CONCEPT_GLYPH: Record<string, KeteGlyph> = {
  control: "shield", rules: "shield", governance: "shield",
  nz: "globe", locale: "globe",
  speed: "bolt", outcomes: "bolt",
  scale: "layers", "start-small": "layers",
  workflow: "file", document: "file",
  roles: "people", team: "people",
  approval: "check", compliance: "check",
  config: "gear",
  support: "headset", onboarding: "headset",
  refine: "refresh", iterate: "refresh",
  turnaround: "clock",
  visibility: "chart", analytics: "chart",
  process: "clipboard", discipline: "clipboard",
  learning: "book",
  confidence: "thumbs",
  oversight: "eye",
};
