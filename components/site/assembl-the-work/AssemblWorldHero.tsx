'use client';

/**
 * Homepage hero — reuses the PR #1311 DO World cinematic stack
 * (WorldScene + public/do/world/atelier.glb). Do not invent a second 3D path.
 */
import Image from 'next/image';
import Link from 'next/link';
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { DoIntentInput } from './DoIntentInput';
import { HERO } from './copy';
import styles from './assembl-world-hero.module.css';

type SceneProps = {
  progress: React.RefObject<number>;
  paused: boolean;
  reduced?: boolean;
  onReady?: (ready: boolean) => void;
};

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className={styles.fallback}>
        The 3D office view is unavailable. You can still explore assembl below.
      </p>
    ) : (
      this.props.children
    );
  }
}

export function AssemblWorldHero({ preview = false }: { preview?: boolean }) {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('@/app/preview/do-world/WorldScene')
      .then((mod) => {
        if (!cancelled) setScene(() => mod.default);
      })
      .catch((error: unknown) => {
        console.error('WorldScene failed to load on homepage hero', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(query.matches);
    const scroll = () => {
      const el = rail.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      const scrolled = Math.min(travel, Math.max(0, -rect.top));
      progress.current = scrolled / travel;
    };
    motion();
    scroll();
    query.addEventListener('change', motion);
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => {
      query.removeEventListener('change', motion);
      removeEventListener('scroll', scroll);
      removeEventListener('resize', scroll);
    };
  }, []);

  return (
    <section
      ref={rail}
      className={styles.rail}
      aria-labelledby="atw-hero-title"
      data-preview={preview || undefined}
    >
      <div className={styles.stage} aria-hidden="true">
        <Image
          src="/do/world/atelier-poster.png"
          alt=""
          fill
          sizes="100vw"
          quality={75}
          className={`${styles.poster}${sceneReady ? ` ${styles.posterDimmed}` : ''}`}
          priority
        />
        <Boundary>
          {Scene ? (
            <Scene
              progress={progress}
              paused={paused || reduced}
              reduced={reduced}
              onReady={setSceneReady}
            />
          ) : null}
        </Boundary>
      </div>

      <header className={styles.nav}>
        <Link className={styles.wordmark} href="/" aria-label="assembl home">
          assembl
        </Link>
        <nav aria-label="Primary">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/do">DO</Link>
          <Link href="/creative-studio">Studio</Link>
        </nav>
        <button
          type="button"
          className={styles.motion}
          onClick={() => setPaused((value) => !value)}
          disabled={reduced}
        >
          {reduced ? 'Reduced motion' : paused ? 'Resume' : 'Pause'}
        </button>
      </header>

      <div className={styles.copy}>
        <p className={styles.overline}>GOOD WORK COMES TOGETHER.</p>
        <h1 id="atw-hero-title">
          assembl
          <br />
          the work.
        </h1>
        <p className={styles.sub}>find it. DO it. show it.</p>
        <p className={styles.body}>{HERO.subhead}</p>
        <div className={styles.actions}>
          <a
            className={styles.pill}
            href="#do-input"
            onClick={() => document.getElementById('atw-do-intent')?.focus()}
          >
            Give DO a job <ArrowRight size={21} />
          </a>
          <a className={styles.link} href="#products">
            Explore assembl <ArrowDown size={17} />
          </a>
        </div>
      </div>

      <div className={styles.job} id="do-input">
        <DoIntentInput compact />
      </div>

      <p className={styles.honesty}>
        Scroll to walk the office. Imagined workspace — not live agent activity.
      </p>
    </section>
  );
}
