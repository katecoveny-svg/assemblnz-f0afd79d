'use client';

/**
 * Shared Auckland atelier stage — one WorldScene / atelier.glb stack.
 * Used by the homepage AssemblWorldHero and other public landings that
 * should aspire to the same architectural fly-through quality.
 */
import Image from 'next/image';
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react';
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
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function WorldAtelierStage({
  progress,
  paused,
  reduced,
  visible,
  failed,
  onReady,
  onFailure,
  priority = false,
}: {
  progress: RefObject<number>;
  paused: boolean;
  reduced: boolean;
  visible: boolean;
  failed: boolean;
  onReady: (ready: boolean) => void;
  onFailure: () => void;
  priority?: boolean;
}) {
  const [Scene, setScene] = useState<ComponentType<WorldSceneProps> | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  const markReady = useCallback(
    (ready: boolean) => {
      setSceneReady(ready);
      onReady(ready);
    },
    [onReady],
  );

  useEffect(() => {
    if (reduced || failed) return;
    let cancelled = false;
    // Locked pipeline: Blender atelier → Draco GLB → WorldScene (no second stack).
    import('@/app/preview/do-world/WorldScene')
      .then((mod) => {
        if (!cancelled) setScene(() => mod.default);
      })
      .catch((error: unknown) => {
        console.error('The atelier scene could not load.', error);
        if (!cancelled) onFailure();
      });
    return () => {
      cancelled = true;
    };
  }, [onFailure, reduced, failed]);

  const live = Boolean(Scene && !failed && !reduced && visible);

  return (
    <div className={styles.stage} aria-hidden="true">
      <Image
        src="/do/world/atelier-poster.png"
        alt=""
        fill
        sizes="100vw"
        quality={75}
        priority={priority}
        unoptimized
        className={`${styles.poster}${sceneReady && live ? ` ${styles.posterDimmed}` : ''}`}
      />
      {/* Native fallback if the optimized pipeline ever blanks the still. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/do/world/atelier-poster.png"
        alt=""
        className={`${styles.posterNative}${sceneReady && live ? ` ${styles.posterDimmed}` : ''}`}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <Boundary onFailure={onFailure}>
        {live && Scene ? (
          <Scene
            progress={progress}
            paused={paused}
            onReady={markReady}
            onFailure={onFailure}
          />
        ) : null}
      </Boundary>
    </div>
  );
}

/** Shared reduced-motion + compact viewport gate for atelier landings. */
export function useAtelierMotionGate() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const compactQuery = matchMedia('(max-width: 650px)');
    const motion = () => setReduced(motionQuery.matches || compactQuery.matches);
    motion();
    motionQuery.addEventListener('change', motion);
    compactQuery.addEventListener('change', motion);
    return () => {
      motionQuery.removeEventListener('change', motion);
      compactQuery.removeEventListener('change', motion);
    };
  }, []);
  return reduced;
}

/** Offscreen / tab-hidden unmount so demand-mode WebGL does not run cold. */
export function useAtelierVisibility(target: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let intersects = true;
    const update = () => {
      const shown = intersects && document.visibilityState !== 'hidden';
      setVisible(shown);
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [target]);
  return visible;
}
