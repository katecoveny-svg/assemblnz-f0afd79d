'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { StaticFallback } from '@/components/ops/hero3d/StaticFallback';
import { TickerText } from '@/lib/motion/primitives';

/**
 * Brand3DHero — lazily loads @react-three/fiber and the appropriate scene.
 * Server-side rendering is disabled (WebGL needs a real DOM). If the user
 * prefers reduced motion, we skip the 3D layer entirely and show a static SVG.
 *
 * The Aironaut hero additionally renders a DOM overlay below the R3F canvas:
 *   1. an Orbitron caption that tickers through the four service-line labels
 *   2. a decorative Burnt Orange "REQUEST A QUOTE" CTA button
 * These overlays live outside <Canvas> because R3F cannot render DOM elements.
 */
const R3FCanvas = dynamic(() => import('./Brand3DCanvas').then((m) => m.Brand3DCanvas), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[240px] w-full animate-pulse rounded-2xl bg-[color:var(--brand-surface)]/60" />
  ),
});

export function Brand3DHero({ config }: { config: BrandConfig }) {
  const reduce = useReducedMotion();
  if (reduce) return <StaticFallback config={config} />;

  // Aironaut editorial hero: R3F cargo orbit + Orbitron ticker + CTA button.
  if (config.hero3D === 'aironaut') {
    const labels = (config.serviceLines ?? []).map((s) => s.label);
    const primaryTagline = config.taglines?.primary ?? config.voice.greeting;
    return (
      <div
        className="flex flex-col gap-4 rounded-2xl p-4"
        data-brand-hero={config.hero3D}
        style={{ background: 'var(--brand-bg)' }}
      >
        <div className="h-64 w-full overflow-hidden rounded-xl">
          <R3FCanvas hero={config.hero3D} />
        </div>
        <div className="flex flex-col items-center gap-3 pb-2">
          <span
            className="font-[family-name:var(--font-brand-display)] text-xs uppercase tracking-[0.28em]"
            style={{ color: 'var(--brand-surface)' }}
          >
            {labels.length > 0 ? (
              <TickerText labels={labels} intervalMs={4000} durationMs={400} />
            ) : (
              primaryTagline
            )}
          </span>
          {config.ctaLabel ? (
            <button
              type="button"
              // Decorative on the hero — no action wired yet.
              disabled
              aria-disabled
              className="font-[family-name:var(--font-brand-display)] rounded-md px-4 py-2 text-xs uppercase tracking-[0.24em]"
              style={{
                background: 'var(--brand-accent)',
                color: '#FFFFFF',
                cursor: 'default',
              }}
            >
              {config.ctaLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-64 w-full overflow-hidden rounded-2xl"
      data-brand-hero={config.hero3D}
      // Warm-white paper background — critical for Happy Tails so studio
      // photography sits on paper, not a coloured surface. Falls back to the
      // brand's own bg CSS variable for the other five brands.
      style={{ background: 'var(--brand-bg)' }}
    >
      <R3FCanvas hero={config.hero3D} />
    </div>
  );
}
