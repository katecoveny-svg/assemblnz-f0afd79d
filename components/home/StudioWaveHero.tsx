'use client';

import { ChromeCanvas } from '@/components/studios/families/ChromeCanvas';

/**
 * The homepage hero — a LIVE piece from the creative studio, not a video.
 *
 * ART DIRECTION IS KATE'S: this look was built in the playground and
 * exported 2026-07-19 — the iridescent chrome torus-knot, seed 8471.
 * To change it, build a new look at /creative-playground (any family),
 * copy the numbers from the share URL, and paste them here. Keys match
 * the URL one-to-one:
 * ?family=chrome&preset=iridescent-torus&seed=8471&shape=1&palette=0
 *   &ior=1.500&roughness=0.050&dispersion=0.060&wobble=0.000&spin=0.500
 */
const HERO_LOOK = {
  presetId: 'iridescent-torus',
  seed: 8471,
  values: {
    shape: 1,        // torus-knot
    palette: 0,      // chrome
    ior: 1.5,
    roughness: 0.05,
    dispersion: 0.06,
    wobble: 0,
    spin: 0.5,
  },
};

export function StudioWaveHero() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative w-full overflow-hidden"
      style={{
        background: '#FBFAF6',
        // WavesCanvas sizes itself via .ga-canvas, which reads these vars.
        '--ga-aspect': '21 / 9',
        '--ga-max': '100%',
      } as React.CSSProperties}
    >
      <ChromeCanvas
        presetId={HERO_LOOK.presetId}
        values={HERO_LOOK.values}
        seed={HERO_LOOK.seed}
      />
      {/* Fade into the page ground so the band never hard-stops. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{ background: 'linear-gradient(180deg, rgba(251,250,246,0) 0%, #fbfaf6 100%)' }}
      />
    </div>
  );
}
