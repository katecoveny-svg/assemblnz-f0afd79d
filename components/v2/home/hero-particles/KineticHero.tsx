'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  FORMATIONS,
  heroParticleConfig,
  type FormationName,
  type HeroBreakpoint,
  type HeroParticleSettings,
} from './config';
import { ParticleField } from './ParticleField';
import { DevPanel } from './DevPanel';

/**
 * The hero sculpture — a kinetic drawing suspended in white space.
 * The canvas occupies only the sculpture's region (never full-bleed noise
 * behind the copy); the white page stays the dominant element. No bloom,
 * no additive blending, no post-processing.
 */

let cachedWebgl: boolean | null = null;
function detectWebgl(): boolean | null {
  if (cachedWebgl === null) {
    try {
      const c = document.createElement('canvas');
      cachedWebgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      cachedWebgl = false;
    }
  }
  return cachedWebgl;
}

function breakpointFor(width: number): HeroBreakpoint {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/** #formation=wing etc. isolates one state (works in prod too — handy for
 *  design review; the dev panel is development-only). */
function hashFormation(): FormationName | null {
  if (typeof window === 'undefined') return null;
  const m = /formation=([a-z]+)/.exec(window.location.hash);
  const name = m?.[1] as FormationName | undefined;
  return name && (FORMATIONS as readonly string[]).includes(name) ? name : null;
}

export function KineticHero() {
  const webgl = React.useSyncExternalStore(
    () => () => {},
    detectWebgl,
    () => null,
  );
  const reducedMotion = React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );

  const [bp, setBp] = React.useState<HeroBreakpoint>('desktop');
  React.useEffect(() => {
    const onResize = () => setBp(breakpointFor(window.innerWidth));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [locked, setLocked] = React.useState<FormationName | null>(null);
  React.useEffect(() => {
    const read = () => setLocked(hashFormation());
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  // Dev-panel overrides (development builds only render the panel).
  const [overrides, setOverrides] = React.useState<Partial<HeroParticleSettings>>({});
  const [devFormation, setDevFormation] = React.useState<FormationName | null>(null);
  const [devProgress, setDevProgress] = React.useState<number>(NaN);

  const cfg: HeroParticleSettings = React.useMemo(
    () => ({ ...heroParticleConfig[bp], ...overrides }),
    [bp, overrides],
  );

  if (webgl === false) return null; // the white page carries the hero
  if (webgl === null) return null;

  const lockedFormation = devFormation ?? locked;

  return (
    <>
      <Canvas
        dpr={[1, 2]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        camera={{ position: [0, 0, cfg.cameraZ], fov: cfg.fov }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ParticleField
          cfg={cfg}
          lockedFormation={lockedFormation}
          reducedMotion={reducedMotion}
          externalProgress={devProgress}
        />
      </Canvas>
      {process.env.NODE_ENV === 'development' ? (
        <DevPanel
          cfg={cfg}
          overrides={overrides}
          onOverrides={setOverrides}
          formation={devFormation}
          onFormation={setDevFormation}
          progress={devProgress}
          onProgress={setDevProgress}
        />
      ) : null}
    </>
  );
}
