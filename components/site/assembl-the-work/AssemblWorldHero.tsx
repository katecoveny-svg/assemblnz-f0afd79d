'use client';

/** One public front door over the existing Blender atelier / WorldScene. */
import Image from 'next/image';
import Link from 'next/link';
import { Component, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { HERO } from './copy';
import styles from './assembl-world-hero.module.css';

type SceneProps = {
  progress: React.RefObject<number>;
  paused: boolean;
  reduced?: boolean;
  onReady?: (ready: boolean) => void;
  onFailure?: () => void;
};

const chapters = [
  { product: 'Pursuit', verb: 'find it.', input: 'A signal. A source. A question.', output: 'An opportunity worth reviewing.', href: 'https://assembl-pursuit.katecoveny.chatgpt.site', action: 'Open Pursuit hub' },
  { product: 'DO', verb: 'DO it.', input: 'A meeting to capture. A household board to run.', output: 'Useful notes or a chores board — ready for your review.', href: '/do', action: 'Open Meeting or Household' },
  { product: 'Studio', verb: 'show it.', input: 'A brief. An idea. A piece of work.', output: 'Something people can see and try.', href: '/creative-studio', action: 'See the possibility' },
] as const;

class Boundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function AssemblWorldHero({ preview = false }: { preview?: boolean }) {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const onFailure = useCallback(() => { setSceneReady(false); setFailed(true); }, []);

  useEffect(() => {
    if (reduced || failed) return;
    let cancelled = false;
    import('@/app/preview/do-world/WorldScene')
      .then((mod) => { if (!cancelled) setScene(() => mod.default); })
      .catch((error: unknown) => {
        console.error('The atelier scene could not load.', error);
        if (!cancelled) onFailure();
      });
    return () => { cancelled = true; };
  }, [onFailure, reduced, failed]);

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

  useEffect(() => {
    const scroll = () => {
      const el = rail.current;
      if (!el || paused) return;
      if (reduced) { progress.current = 0; setChapter(0); return; }
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      progress.current = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      setChapter(Math.min(2, Math.floor(progress.current * 3)));
    };
    scroll();
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => { removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, [paused, reduced]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let intersects = true;
    const update = () => {
      const shown = intersects && document.visibilityState !== 'hidden';
      setVisible(shown);
      if (!shown) setSceneReady(false);
    };
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); });
    observer.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  const current = chapters[chapter];
  return (
    <section ref={rail} className={styles.rail} aria-labelledby="atw-hero-title" data-preview={preview || undefined} data-static={reduced || failed || undefined}>
      <div className={styles.frame}>
        <div className={styles.stage} aria-hidden="true">
          <Image src="/do/world/atelier-poster.png" alt="" fill sizes="100vw" quality={75} className={`${styles.poster}${sceneReady && visible && !reduced && !failed ? ` ${styles.posterDimmed}` : ''}`} priority />
          <Boundary onFailure={onFailure}>
            {Scene && !failed && !reduced && visible ? <Scene progress={progress} paused={paused} onReady={setSceneReady} onFailure={onFailure} /> : null}
          </Boundary>
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <header className={styles.nav}>
          <Link className={styles.wordmark} href="/" aria-label="assembl home">assembl</Link>
          <nav aria-label="Primary"><a href="https://assembl-pursuit.katecoveny.chatgpt.site" target="_blank" rel="noopener noreferrer">Pursuit</a><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link></nav>
          <button type="button" className={styles.motion} onClick={() => setPaused(v => !v)} disabled={reduced || failed} aria-pressed={paused}>
            {paused || reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            {reduced || failed ? 'Still view' : paused ? 'Resume' : 'Pause'}
          </button>
        </header>
        <div className={styles.copy}>
          <p className={styles.overline}>GOOD WORK COMES TOGETHER.</p>
          <h1 id="atw-hero-title">{HERO.headline.split(' ').map((word, index) => <span key={`${word}-${index}`}>{index === 1 ? <br /> : index > 1 ? ' ' : ''}{word}{index === 0 ? ' ' : ''}</span>)}</h1>
          <p className={styles.sub}>{HERO.subhead}</p>
          <p className={styles.body}>{HERO.body}</p>
          <div className={styles.actions}>
            <Link className={styles.pill} href="/do">Open Meeting or Household <ArrowRight size={20} /></Link>
            <a className={styles.link} href="#products">See the whole system <ArrowDown size={16} /></a>
          </div>
        </div>
        <aside className={styles.chapter} aria-label="The work, step by step">
          <div className={styles.chapterSteps} aria-label="Pursuit, DO, Studio">
            {chapters.map((item, index) =>
              item.href.startsWith('http') ? (
                <a
                  key={item.product}
                  href={item.href}
                  aria-label={`Open ${item.product}`}
                  data-active={chapter === index}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {String(index + 1).padStart(2, '0')}
                  <span>{item.product}</span>
                </a>
              ) : (
                <Link
                  key={item.product}
                  href={item.href}
                  aria-label={`Open ${item.product}`}
                  data-active={chapter === index}
                >
                  {String(index + 1).padStart(2, '0')}
                  <span>{item.product}</span>
                </Link>
              ),
            )}
          </div>
          <div className={styles.chapterBody}>
            <span className={styles.chapterLabel}>{current.product}</span>
            <h2>{current.verb}</h2>
            <p>{current.input}<br /><strong>{current.output}</strong></p>
            {current.href.startsWith('http') ? (
              <a href={current.href} target="_blank" rel="noopener noreferrer">
                {current.action}
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link href={current.href}>
                {current.action}
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </aside>
        <p className={styles.honesty}>{failed ? 'Still view. ' : reduced ? '' : 'Scroll to move through the atelier. '}An imagined workspace, not live agent activity.</p>
      </div>
      <div className={styles.stillSummary} aria-label="The complete work loop">
        {chapters.map((item) => (
          <article key={item.product}>
            <span>{item.product}</span>
            <h2>{item.verb}</h2>
            <p>{item.input}</p>
            <p>{item.output}</p>
            {item.href.startsWith('http') ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.action}
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link href={item.href}>
                {item.action}
                <ArrowUpRight size={16} />
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
