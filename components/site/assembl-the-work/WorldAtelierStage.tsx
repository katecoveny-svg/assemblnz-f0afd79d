'use client';

/** Shared public architectural stage. A new scene is explicit, never a global swap. */
import Image from 'next/image';
import { Component, useCallback, useEffect, useState, type ComponentType, type ReactNode, type RefObject } from 'react';
import { FRANKLIN_ASSETS } from '@/lib/design/franklin-scene';
import styles from './world-atelier-stage.module.css';

export type WorldSceneProps = {
  progress: RefObject<number>;
  paused: boolean;
  reduced?: boolean;
  onReady?: (ready: boolean) => void;
  onFailure?: () => void;
};
class Boundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function WorldAtelierStage({ progress, paused, reduced, visible, failed, onReady, onFailure, priority=false, variant='atelier' }: {
  progress: RefObject<number>;
  paused: boolean;
  reduced: boolean;
  visible: boolean;
  failed: boolean;
  onReady: (ready: boolean) => void;
  onFailure: () => void;
  priority?: boolean;
  variant?: 'atelier' | 'franklin';
}) {
  const [Scene, setScene] = useState<ComponentType<WorldSceneProps> | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const markReady = useCallback((ready: boolean) => { setSceneReady(ready); onReady(ready); }, [onReady]);
  useEffect(() => {
    if (reduced || failed) return;
    let cancelled = false;
    const load = variant === 'franklin' ? import('@/app/preview/do-world/FranklinOfficeScene') : import('@/app/preview/do-world/WorldScene');
    load.then(mod => { if (!cancelled) setScene(() => mod.default); }).catch((error: unknown) => {
      console.error('The architectural scene could not load.', error);
      if (!cancelled) onFailure();
    });
    return () => { cancelled = true; };
  }, [onFailure, reduced, failed, variant]);
  const live = Boolean(Scene && !failed && !reduced && visible);
  const dimmed = sceneReady && live;
  return <div className={styles.stage} aria-hidden="true" data-world={variant} data-scene-ready={dimmed ? 'true' : 'false'}>
    {variant === 'franklin' ? <picture>
      <source media="(max-width: 650px)" srcSet={FRANKLIN_ASSETS.mobilePoster} />
      {/* A native picture keeps the correct real-render fallback even with JavaScript off. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FRANKLIN_ASSETS.poster} alt="" className={`${styles.posterNative}${dimmed ? ` ${styles.posterDimmed}` : ''}`} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />
    </picture> : <>
      <Image src="/do/world/atelier-poster.png" alt="" fill sizes="100vw" quality={75} priority={priority} unoptimized className={`${styles.poster}${dimmed ? ` ${styles.posterDimmed}` : ''}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/do/world/atelier-poster.png" alt="" className={`${styles.posterNative}${dimmed ? ` ${styles.posterDimmed}` : ''}`} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />
    </>}
    <Boundary key={variant} onFailure={onFailure}>
      {live && Scene ? <Scene progress={progress} paused={paused} onReady={markReady} onFailure={onFailure} /> : null}
    </Boundary>
  </div>;
}
/** A phone is not a request for reduced motion. */
export function useAtelierMotionGate() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return reduced;
}
/** Expensive scenes unmount offscreen and when the tab is hidden. */
export function useAtelierVisibility(target: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let intersects = true;
    const update = () => setVisible(intersects && document.visibilityState !== 'hidden');
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); });
    observer.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [target]);
  return visible;
}
