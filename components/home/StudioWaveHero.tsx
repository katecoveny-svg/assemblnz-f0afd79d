'use client';

import { WavesCanvas } from '@/components/studios/families/WavesCanvas';

/**
 * The homepage hero — a LIVE piece from the creative studio, not a video.
 * Renders the Waves family full-bleed at hero aspect.
 *
 * ART DIRECTION IS YOURS: build the look at /creative-playground
 * (family=waves), then copy the numbers from the share URL into
 * HERO_LOOK below. The slider keys match one-to-one.
 * e.g. ?family=waves&preset=pearl&amp=0.22&freq=1.0&speed=0.24…
 */
const HERO_LOOK = {
  presetId: 'pearl',
  seed: 8471,
  values: {
    amp: 0.22,
    freq: 1.0,
    speed: 0.24,
    tilt: -0.08,
    roughness: 0.42,
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
      <WavesCanvas
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
