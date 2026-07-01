'use client';

import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * Rendered in place of the 3D hero when the user prefers reduced motion or the
 * WebGL context can't initialise. A simple brand-tinted SVG — same aspect,
 * same visual weight, no animation.
 */
export function StaticFallback({ config }: { config: BrandConfig }) {
  const { accent, canary, ink } = config.colours;
  return (
    <div
      aria-hidden
      className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${canary}22, transparent 60%), ${config.colours.surface}`,
      }}
    >
      <svg viewBox="0 0 200 200" className="h-40 w-40">
        <circle cx="100" cy="100" r="60" fill={accent} opacity="0.9" />
        <circle cx="100" cy="100" r="90" fill="none" stroke={ink} strokeOpacity="0.15" strokeWidth="2" />
        <text
          x="100"
          y="108"
          fontSize="24"
          fill={ink}
          textAnchor="middle"
          fontFamily="var(--font-brand-display, system-ui)"
        >
          {config.displayName.slice(0, 1).toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
