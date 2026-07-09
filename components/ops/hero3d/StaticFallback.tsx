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

  // Auckland Dog Trainer — editorial still + training-field line art.
  if (config.slug === 'auckland-dog-trainer') {
    const photo = config.photography?.anchor;
    const pattern = config.patterns?.primary;
    return (
      <div
        aria-hidden
        className="relative flex h-full min-h-[240px] w-full items-end overflow-hidden rounded-2xl"
        style={{ backgroundColor: config.colours.ink }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {pattern ? (
          <div
            className="absolute inset-0 opacity-20 mix-blend-soft-light"
            style={{
              backgroundImage: `url(${pattern})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '280px auto',
            }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, ${config.colours.ink}dd 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-[1] p-5">
          <span
            className="text-sm font-medium tracking-[0.12em] uppercase"
            style={{ color: '#F7EEF1', fontFamily: 'var(--font-brand-display, Georgia, serif)' }}
          >
            Learn To Talk Dog
          </span>
        </div>
      </div>
    );
  }

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

  // AIRONAUT reduced-motion fallback: 2x2 grid of the four hero photos
  // (cargo-plane, packaging-suite, yacht-hull, wine-shipment) on the Deep
  // Navy bg. Below the grid, the primary tagline frozen in Orbitron uppercase
  // over Warm Stone. No colour overlays — photos read as-shot.
  if (config.slug === 'aironaut') {
    const tiles = [
      { src: '/brand/aironaut/hero-cargo-plane.png', alt: 'Air cargo' },
      { src: '/brand/aironaut/packaging-suite.png', alt: 'Customs and packaging' },
      { src: '/brand/aironaut/hero-yacht-hull.png', alt: 'Yacht transport' },
      { src: '/brand/aironaut/wine-shipment.png', alt: 'Wine logistics' },
    ];
    const tagline =
      config.taglines?.primary ?? 'GLOBAL TRADE. MADE SIMPLE.';
    return (
      <div
        aria-hidden
        className="relative flex h-full min-h-[240px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-3"
        style={{ backgroundColor: config.colours.bg }}
      >
        <div className="grid w-full max-w-[560px] flex-1 grid-cols-2 grid-rows-2 gap-2">
          {tiles.map((t) => (
            <div
              key={t.src}
              className="relative overflow-hidden rounded-md"
              style={{ backgroundColor: config.colours.surface }}
            >
              <Image
                src={t.src}
                alt={t.alt}
                fill
                sizes="(max-width: 640px) 45vw, 280px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <span
          className="mt-3 font-[family-name:var(--font-brand-display)] text-xs uppercase tracking-[0.28em]"
          style={{ color: config.colours.surface }}
        >
          {tagline}
        </span>
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
