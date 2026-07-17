'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei/core/AdaptiveDpr';
import { probeQuality, type QualityProfile } from '@/lib/motion/capability';
import { defaultSceneConfig, type SceneConfig } from '@/lib/motion/scene-config';
import { useVisualState } from '@/lib/motion/visual-state';
import { MotionDevPanel } from './MotionDevPanel';
import { ParticleScene } from './ParticleScene';
import { StaticFallback } from './StaticFallback';

/**
 * The Living Interface canvas. Owns device settings and performance
 * plumbing:
 *  - quality tier from real capability probes (never user-agent sniffing);
 *  - static SVG fallback when WebGL context creation fails;
 *  - frameloop 'never' while the tab is hidden (Page Visibility) or the
 *    canvas is offscreen (IntersectionObserver);
 *  - reduced motion renders the completed form once (frameloop 'demand');
 *  - the parent reserves the box (absolute inset 0) so mounting never
 *    shifts layout.
 *
 * On load it drives dormant → gathering (anticipation, then directed
 * assembly); the scene promotes gathering → formed itself.
 */

function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

/** undefined = server/probing, null = no WebGL → static fallback. */
function useQualityProfile(): QualityProfile | null | undefined {
  return React.useSyncExternalStore(
    () => () => {},
    probeQuality, // memoised — stable reference across snapshots
    () => undefined,
  );
}

function usePageVisible(): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      document.addEventListener('visibilitychange', cb);
      return () => document.removeEventListener('visibilitychange', cb);
    },
    () => document.visibilityState === 'visible',
    () => true,
  );
}

/** Dev panel opt-in: development builds only, with ?motion-dev=1. */
function useDevEnabled(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () =>
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).get('motion-dev') === '1',
    () => false,
  );
}

export function MotionCanvas() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const profile = useQualityProfile();
  const pageVisible = usePageVisible();
  const devEnabled = useDevEnabled();

  // Pause when the canvas scrolls offscreen; the observer fires async so
  // the state update never runs synchronously inside the effect body.
  const [onScreen, setOnScreen] = React.useState(true);
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries[0]?.isIntersecting ?? true),
      { threshold: 0.02 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Dev-panel overrides (development builds only render the panel).
  const [overrides, setOverrides] = React.useState<Partial<SceneConfig>>({});
  const config: SceneConfig = React.useMemo(
    () => ({ ...defaultSceneConfig, ...overrides }),
    [overrides],
  );

  // Page-load wiring: anticipation, then the gathering begins. Reduced
  // motion goes straight to the completed form.
  React.useEffect(() => {
    if (!profile) return undefined;
    const store = useVisualState.getState();
    if (reducedMotion) {
      store.setVisualState('formed');
      return undefined;
    }
    const timer = window.setTimeout(() => {
      if (useVisualState.getState().state === 'dormant') {
        store.setVisualState('gathering');
      }
    }, config.anticipationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [profile, reducedMotion, config.anticipationSeconds]);

  const frameloop = reducedMotion
    ? 'demand'
    : pageVisible && onScreen
      ? 'always'
      : 'never';

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* decorative visual only — the surrounding figcaption carries meaning */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {profile === null ? <StaticFallback /> : null}
        {profile ? (
          <Canvas
            dpr={[1, profile.maxDpr]}
            frameloop={frameloop}
            camera={{ position: [0, 0, config.cameraZ], fov: config.fov }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            style={{ background: 'transparent' }}
          >
            <ParticleScene profile={profile} config={config} reducedMotion={reducedMotion} />
            <AdaptiveDpr pixelated />
          </Canvas>
        ) : null}
      </div>
      {process.env.NODE_ENV === 'development' && devEnabled ? (
        <MotionDevPanel
          config={config}
          overrides={overrides}
          onOverrides={setOverrides}
          profile={profile ?? null}
        />
      ) : null}
    </div>
  );
}
