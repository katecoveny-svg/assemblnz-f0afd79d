'use client';

/** One public front door over the shared Blender atelier / WorldScene stage. */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { HERO } from './copy';
import {
  WorldAtelierStage,
  useAtelierMotionGate,
  useAtelierVisibility,
} from './WorldAtelierStage';
import styles from './assembl-world-hero.module.css';

const chapters = [
  { product: 'Pursuit', verb: 'find it.', input: 'A signal. A source. A question.', output: 'An opportunity worth reviewing.', href: 'https://assembl-pursuit.katecoveny.chatgpt.site', action: 'Open Pursuit hub' },
  { product: 'DO', verb: 'DO it.', input: 'Context, tools and permissions for bounded work.', output: 'Prepared work with evidence — when DO is open for you.', href: '/do', action: 'About DO' },
  { product: 'Studio', verb: 'show it.', input: 'A brief. An idea. A piece of work.', output: 'Something people can see and try.', href: '/creative-studio', action: 'See the possibility' },
] as const;

export function AssemblWorldHero({ preview = false }: { preview?: boolean }) {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const reduced = useAtelierMotionGate();
  const visible = useAtelierVisibility(rail);
  const onFailure = useCallback(() => {
    setSceneReady(false);
    setFailed(true);
  }, []);

  useEffect(() => {
    if (!visible) setSceneReady(false);
  }, [visible]);

  useEffect(() => {
    const scroll = () => {
      const el = rail.current;
      if (!el || paused) return;
      if (reduced) {
        progress.current = 0;
        setChapter(0);
        return;
      }
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      progress.current = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      setChapter(Math.min(2, Math.floor(progress.current * 3)));
    };
    scroll();
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => {
      removeEventListener('scroll', scroll);
      removeEventListener('resize', scroll);
    };
  }, [paused, reduced]);

  const current = chapters[chapter];
  return (
    <section
      ref={rail}
      className={styles.rail}
      aria-labelledby="atw-hero-title"
      data-preview={preview || undefined}
      data-static={reduced || failed || undefined}
    >
      <div className={styles.frame}>
        <WorldAtelierStage
          progress={progress}
          paused={paused}
          reduced={reduced}
          visible={visible}
          failed={failed}
          onReady={setSceneReady}
          onFailure={onFailure}
          priority
        />
        <div className={styles.scrim} aria-hidden="true" />
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
            onClick={() => setPaused((v) => !v)}
            disabled={reduced || failed}
            aria-pressed={paused}
          >
            {paused || reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            {reduced || failed ? 'Still view' : paused ? 'Resume' : 'Pause'}
          </button>
        </header>
        <div className={styles.copy}>
          <p className={styles.overline}>GOOD WORK COMES TOGETHER.</p>
          <h1 id="atw-hero-title">
            {HERO.headline.split(' ').map((word, index) => (
              <span key={`${word}-${index}`}>
                {index === 1 ? <br /> : index > 1 ? ' ' : ''}
                {word}
                {index === 0 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p className={styles.sub}>{HERO.subhead}</p>
          <p className={styles.body}>{HERO.body}</p>
          <div className={styles.actions}>
            <a className={styles.pill} href="#products">
              See the whole system <ArrowRight size={20} />
            </a>
            <a className={styles.link} href="/pursuit">
              Open Pursuit <ArrowDown size={16} />
            </a>
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
                <Link key={item.product} href={item.href} aria-label={`Open ${item.product}`} data-active={chapter === index}>
                  {String(index + 1).padStart(2, '0')}
                  <span>{item.product}</span>
                </Link>
              ),
            )}
          </div>
          <div className={styles.chapterBody}>
            <span className={styles.chapterLabel}>{current.product}</span>
            <h2>{current.verb}</h2>
            <p>
              {current.input}
              <br />
              <strong>{current.output}</strong>
            </p>
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
        <div className={styles.job} id="do-input">
          <p className={styles.jobNote}>
            DO sits where you already work. Start with Pursuit or Studio — or{' '}
            <Link href="/contact?product=do">talk to us about DO</Link>.
          </p>
        </div>
        <p className={styles.honesty}>
          {failed ? 'Still view. ' : reduced ? '' : 'Scroll to move through the atelier. '}
          An imagined workspace, not live agent activity.
        </p>
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
