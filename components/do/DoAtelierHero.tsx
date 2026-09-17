'use client';

/**
 * Compact DO landing hero on the shared Auckland atelier / WorldScene stage.
 * Same asset stack as the homepage — no second 3D pipeline.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import {
  WorldAtelierStage,
  useAtelierMotionGate,
  useAtelierVisibility,
} from '@/components/site/assembl-the-work/WorldAtelierStage';
import styles from './do-atelier-hero.module.css';

export function DoAtelierHero() {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, setSceneReady] = useState(false);
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
      if (!el || paused || reduced) {
        progress.current = reduced ? 0.52 : progress.current;
        return;
      }
      // Shorter rail — ease into the DO chapter frame (Identity D).
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      const t = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      progress.current = 0.35 + t * 0.4;
    };
    scroll();
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => {
      removeEventListener('scroll', scroll);
      removeEventListener('resize', scroll);
    };
  }, [paused, reduced]);

  return (
    <section
      ref={rail}
      className={styles.rail}
      aria-labelledby="do-atelier-title"
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
          <span className={styles.product}>/ DO</span>
          <nav aria-label="DO">
            <Link href="/do/meetings">Meeting DO</Link>
            <Link href="/do/household">Household DO</Link>
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
          <p className={styles.overline}>PUBLIC DO · AUCKLAND ATELIER</p>
          <h1 id="do-atelier-title">
            Prepare useful work
            <br />
            in the studio.
          </h1>
          <p className={styles.body}>
            Meeting notes or a household board — same architectural door as home.
            Nothing is sent until you review it.
          </p>
          <div className={styles.actions}>
            <a className={styles.pill} href="#your-dos">
              Meet your DOs <ArrowRight size={18} />
            </a>
            <Link className={styles.link} href="/preview/do-world">
              Walk the full atelier
            </Link>
          </div>
        </div>
        <p className={styles.honesty}>
          {failed ? 'Still view. ' : reduced ? '' : 'Scroll to move through the atelier. '}
          Imagined Waitematā studio — not live agent activity.
        </p>
      </div>
    </section>
  );
}
