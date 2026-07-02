'use client';

import { Constellation, ParticulateLandscape } from '@assembl/canvas';

/**
 * The right-half hero art from DIRECTION-LOCKED-2026-07-01: the silvery-gold
 * particulate mountain-and-wave landscape with a gold constellation cluster
 * in the top corner. Motion (60s drift, 1.5s pulse) comes from the canvas
 * package and holds still under prefers-reduced-motion.
 */
export function HeroArt({
  seed,
  constellation = true,
  className,
}: {
  seed?: number;
  constellation?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* feather the art into the paper on the left so the copy stays quiet */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 22%, black 55%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 22%, black 55%)',
        }}
      >
        <ParticulateLandscape seed={seed} />
      </div>
      {constellation ? (
        <Constellation
          size={150}
          style={{ position: 'absolute', top: '6%', right: '7%', opacity: 0.9 }}
        />
      ) : null}
    </div>
  );
}

/** Full-bleed backdrop variant — the landscape behind floating cards. */
export function LandscapeBackdrop({ seed, opacity = 1 }: { seed?: number; opacity?: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      <ParticulateLandscape seed={seed} />
    </div>
  );
}
