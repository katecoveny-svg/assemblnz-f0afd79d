'use client';

import Image from 'next/image';
import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * Rendered in place of the 3D hero when the user prefers reduced motion or the
 * WebGL context can't initialise.
 *
 * For Happy Tails specifically we render Franklin's studio portrait centred
 * over a CSS-tiled tails-and-paws pattern on a warm-white base — same editorial
 * treatment as the 3D scene, minus the motion. No colour overlay.
 *
 * For other brands: a simple brand-tinted SVG (unchanged from before).
 */
export function StaticFallback({ config }: { config: BrandConfig }) {
  const { accent, canary, ink } = config.colours;

  // Happy Tails editorial path: Franklin over tiled pattern on warm white.
  if (
    config.slug === 'happy-tails' &&
    config.photography?.anchor &&
    config.patterns?.primary
  ) {
    return (
      <div
        aria-hidden
        className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl"
        style={{
          backgroundColor: config.colours.bg,
          backgroundImage: `url(${config.patterns.primary})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px auto',
        }}
      >
        {/* Warm-white scrim so pattern reads at ~35% opacity, no colour overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: config.colours.bg, opacity: 0.65 }}
        />
        <div className="relative flex h-full items-center justify-center py-4">
          <Image
            src={config.photography.anchor}
            alt={config.mascot?.alt ?? 'Franklin'}
            width={180}
            height={270}
            className="h-full max-h-56 w-auto object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // Auckland Zoo editorial path: giraffe portrait centred over the CSS-tiled
  // safari pattern on the warm safari-orange bg. Never composites the portrait
  // onto anything but the safari-orange field, ink, or off-white. The taonga
  // species (kiwi, kākāpō, tuatara, tūī) are intentionally absent.
  if (
    config.slug === 'auckland-zoo' &&
    config.photography?.anchor &&
    config.patterns?.primary
  ) {
    return (
      <div
        aria-hidden
        className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl"
        style={{
          backgroundColor: config.colours.bg,
          backgroundImage: `url(${config.patterns.primary})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px auto',
        }}
      >
        {/* Safari-orange scrim so the ink line pattern reads at low opacity —
            NEVER colour-fills the line art. */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: config.colours.bg, opacity: 0.6 }}
        />
        <div className="relative flex h-full items-center justify-center py-4">
          <Image
            src={config.photography.anchor}
            alt="Auckland Zoo — giraffe portrait"
            width={180}
            height={243}
            className="h-full max-h-56 w-auto object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // AIRONAUT reduced-motion fallback: 2x2 grid of the four cargo silhouettes
  // (freight container, exotic car, yacht hull, wine crate) drawn as thin
  // wireframes in the accent orange on the deep-navy field. Matches the same
  // editorial engineering-blueprint feel as the 3D scene, minus the orbit.
  if (config.slug === 'aironaut') {
    const stroke = accent;
    return (
      <div
        aria-hidden
        className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: config.colours.bg }}
      >
        <svg viewBox="0 0 400 240" className="h-full w-full max-w-[560px]">
          {/* subtle central blueprint grid */}
          <g stroke={stroke} strokeOpacity="0.12" strokeWidth="1">
            {[40, 80, 120, 160, 200].map((y) => (
              <line key={`h${y}`} x1="20" x2="380" y1={y} y2={y} />
            ))}
            {[60, 120, 180, 240, 300, 340].map((x) => (
              <line key={`v${x}`} x1={x} x2={x} y1="20" y2="220" />
            ))}
          </g>
          <g fill="none" stroke={stroke} strokeWidth="1.5">
            {/* freight container (top-left) */}
            <g transform="translate(100 70)">
              <rect x="-40" y="-16" width="80" height="32" />
              <line x1="-40" y1="-16" x2="-32" y2="-24" />
              <line x1="40" y1="-16" x2="48" y2="-24" />
              <line x1="40" y1="16" x2="48" y2="8" />
              <line x1="-32" y1="-24" x2="48" y2="-24" />
              <line x1="48" y1="-24" x2="48" y2="8" />
            </g>
            {/* exotic car (top-right) */}
            <g transform="translate(300 76)">
              <path d="M-50 6 L-38 -6 L-14 -12 L14 -12 L34 -4 L50 6 L50 12 L-50 12 Z" />
              <circle cx="-24" cy="14" r="6" />
              <circle cx="26" cy="14" r="6" />
              <line x1="-14" y1="-12" x2="-8" y2="-2" />
              <line x1="14" y1="-12" x2="20" y2="-2" />
            </g>
            {/* yacht hull (bottom-left) */}
            <g transform="translate(100 170)">
              <path d="M-52 6 L52 6 L38 16 L-38 16 Z" />
              <line x1="0" y1="-32" x2="0" y2="6" />
              <path d="M0 -30 L28 4 L0 4 Z" />
            </g>
            {/* wine crate (bottom-right) */}
            <g transform="translate(300 170)">
              <rect x="-26" y="-16" width="52" height="32" />
              <line x1="-26" y1="0" x2="26" y2="0" />
              <line x1="0" y1="-16" x2="0" y2="16" />
            </g>
          </g>
        </svg>
      </div>
    );
  }

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
