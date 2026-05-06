/**
 * KeteIllustration — per-industry SVG kete.
 *
 * Each kete shares the same silhouette (pear/lantern with twin handles
 * and lattice rings) but carries an industry-specific motif at its base
 * so each one reads as visually distinct, not just a colour-tinted card.
 *
 * Use:
 *   <KeteIllustration slug="waihanga" accent="#2B6B57" className="h-32 w-auto" />
 */

import type { KeteSlug } from '@/lib/kete';

type Props = {
  slug?: KeteSlug;
  accent?: string;
  className?: string;
  decorative?: boolean;
};

const DEFAULT_ACCENT = '#D4A853';

export function KeteIllustration({
  slug,
  accent = DEFAULT_ACCENT,
  className,
  decorative = true,
}: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
    >
      {/* Subtle radial backdrop — soft warmth behind the kete */}
      <defs>
        <radialGradient id={`kete-glow-${slug ?? 'default'}`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.04" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="130" r="95" fill={`url(#kete-glow-${slug ?? 'default'})`} />

      {/* Shared silhouette — pear/lantern body + twin braided handles */}
      <g stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Twin handle arches */}
        <path d="M70 50 Q70 14 100 14 Q130 14 130 50" opacity="0.85" />
        {/* Body — pear silhouette, narrow at top/bottom, bulge mid */}
        <path
          d="M55 60
             Q40 130 90 222
             L110 222
             Q160 130 145 60"
          opacity="0.95"
        />
        {/* Top opening */}
        <ellipse cx="100" cy="55" rx="44" ry="6" opacity="0.7" />

        {/* Lattice rings — horizontal */}
        <ellipse cx="100" cy="85" rx="50" ry="5" opacity="0.6" />
        <ellipse cx="100" cy="120" rx="56" ry="6" opacity="0.6" />
        <ellipse cx="100" cy="155" rx="52" ry="6" opacity="0.6" />
        <ellipse cx="100" cy="190" rx="40" ry="5" opacity="0.55" />

        {/* Diagonal weave hints */}
        <path d="M58 75 L142 200" opacity="0.25" strokeWidth="0.9" />
        <path d="M142 75 L58 200" opacity="0.25" strokeWidth="0.9" />
        <path d="M70 60 L130 220" opacity="0.18" strokeWidth="0.9" />
        <path d="M130 60 L70 220" opacity="0.18" strokeWidth="0.9" />

        {/* Bead nodes — at lattice intersections */}
        {[
          [60, 85], [80, 85], [100, 85], [120, 85], [140, 85],
          [55, 120], [78, 120], [100, 120], [122, 120], [145, 120],
          [60, 155], [82, 155], [100, 155], [118, 155], [140, 155],
          [72, 190], [100, 190], [128, 190],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" fill={accent} stroke="none" opacity="0.9" />
        ))}
      </g>

      {/* Per-industry motif — sits inside the lower body of the kete */}
      {slug && <KeteMotif slug={slug} accent={accent} />}
    </svg>
  );
}

function KeteMotif({ slug, accent }: { slug: KeteSlug; accent: string }) {
  const props = {
    stroke: accent,
    strokeWidth: 1.1,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (slug) {
    case 'waihanga':
      // Construction — small scaffolding cross + hard-hat outline
      return (
        <g {...props}>
          {/* Hard hat */}
          <path d="M86 142 Q100 132 114 142 L114 148 L86 148 Z" />
          <line x1="92" y1="140" x2="108" y2="140" />
          <line x1="100" y1="132" x2="100" y2="142" />
          {/* I-beam scaffold */}
          <line x1="84" y1="170" x2="116" y2="170" />
          <line x1="100" y1="170" x2="100" y2="194" />
          <line x1="84" y1="194" x2="116" y2="194" />
          <line x1="92" y1="170" x2="92" y2="194" opacity="0.5" />
          <line x1="108" y1="170" x2="108" y2="194" opacity="0.5" />
        </g>
      );

    case 'pikau':
      // Freight & Customs — shipping container with corner reinforcements
      return (
        <g {...props}>
          <rect x="74" y="148" width="52" height="30" rx="1" />
          {/* Corner reinforcements */}
          <line x1="78" y1="152" x2="78" y2="174" />
          <line x1="122" y1="152" x2="122" y2="174" />
          {/* Mid divider lines */}
          <line x1="100" y1="148" x2="100" y2="178" opacity="0.45" />
          <line x1="86" y1="148" x2="86" y2="178" opacity="0.3" />
          <line x1="114" y1="148" x2="114" y2="178" opacity="0.3" />
          {/* Anchor fluke below */}
          <path d="M96 188 L100 194 L104 188 M100 188 L100 200 M94 198 Q100 204 106 198" />
        </g>
      );

    case 'manaaki':
      // Hospitality — wine glass + fork crossing
      return (
        <g {...props}>
          {/* Wine glass */}
          <path d="M84 142 L86 162 L94 162 L96 142 Z" />
          <line x1="90" y1="162" x2="90" y2="180" />
          <line x1="84" y1="180" x2="96" y2="180" />
          {/* Fork */}
          <line x1="105" y1="142" x2="105" y2="172" />
          <line x1="105" y1="172" x2="105" y2="180" strokeWidth="1.4" />
          <line x1="100" y1="142" x2="100" y2="152" />
          <line x1="110" y1="142" x2="110" y2="152" />
          <line x1="115" y1="142" x2="115" y2="152" />
        </g>
      );

    case 'arataki':
      // Automotive — small car silhouette
      return (
        <g {...props}>
          {/* Car body */}
          <path d="M72 178 L80 162 L120 162 L128 178 L124 184 L76 184 Z" />
          {/* Windows */}
          <path d="M86 162 L92 168 L108 168 L114 162" opacity="0.55" />
          {/* Wheels */}
          <circle cx="86" cy="186" r="4" />
          <circle cx="114" cy="186" r="4" />
          <circle cx="86" cy="186" r="1.5" fill={accent} stroke="none" />
          <circle cx="114" cy="186" r="1.5" fill={accent} stroke="none" />
        </g>
      );

    case 'auaha':
      // Creative — brush + palette
      return (
        <g {...props}>
          {/* Palette */}
          <path d="M78 168 Q72 152 88 148 Q108 144 120 156 Q126 172 110 178 Q92 182 78 168 Z" />
          {/* Paint dots on palette */}
          <circle cx="90" cy="160" r="2" fill={accent} stroke="none" />
          <circle cx="100" cy="156" r="2" fill={accent} stroke="none" opacity="0.7" />
          <circle cx="110" cy="162" r="2" fill={accent} stroke="none" opacity="0.4" />
          {/* Brush */}
          <line x1="118" y1="156" x2="130" y2="138" />
          <path d="M115 159 L120 152 L122 154 L117 161 Z" fill={accent} stroke="none" opacity="0.8" />
        </g>
      );

    case 'hoko':
      // Retail — shopping bag with handles
      return (
        <g {...props}>
          {/* Handles */}
          <path d="M85 148 Q85 138 92 138 Q99 138 99 148" />
          <path d="M101 148 Q101 138 108 138 Q115 138 115 148" />
          {/* Bag body */}
          <path d="M78 148 L78 182 Q78 186 82 186 L118 186 Q122 186 122 182 L122 148 Z" />
          {/* Tag */}
          <path d="M105 165 L113 165 L116 168 L113 171 L105 171 Z" />
          <circle cx="107" cy="168" r="0.8" fill={accent} stroke="none" />
        </g>
      );

    case 'ako':
      // Early Childhood — alphabet block "Aa"
      return (
        <g {...props}>
          {/* Two stacked blocks */}
          <rect x="78" y="152" width="22" height="22" rx="2" />
          <rect x="100" y="152" width="22" height="22" rx="2" />
          {/* "A" character on left block */}
          <path d="M83 170 L89 156 L95 170 M85 165 L93 165" strokeWidth="1.2" />
          {/* "a" loop on right block */}
          <circle cx="111" cy="166" r="4.5" />
          <line x1="115" y1="162" x2="115" y2="170" strokeWidth="1.2" />
          {/* Smile detail below — hand-drawn feeling */}
          <path d="M88 184 Q100 192 112 184" opacity="0.6" />
        </g>
      );

    case 'toro':
      // Whānau — small house with chimney
      return (
        <g {...props}>
          {/* House silhouette */}
          <path d="M82 184 L82 158 L100 142 L118 158 L118 184 Z" />
          {/* Roof line emphasis */}
          <line x1="82" y1="158" x2="100" y2="142" strokeWidth="1.3" />
          <line x1="100" y1="142" x2="118" y2="158" strokeWidth="1.3" />
          {/* Chimney */}
          <rect x="110" y="148" width="4" height="6" />
          {/* Door */}
          <path d="M94 184 L94 170 Q94 167 97 167 L103 167 Q106 167 106 170 L106 184" />
          {/* Windows */}
          <rect x="86" y="164" width="5" height="5" />
          <rect x="109" y="164" width="5" height="5" />
        </g>
      );

    default:
      return null;
  }
}
