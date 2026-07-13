'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ParticleCanvas } from './ParticleCanvas';
import { HERO } from '@/lib/copy/homepage';
import styles from './assembl-hero.module.css';

const OVERTURE_KEY = 'assembl-overture-seen';
/** Long enough for the wing to assemble and breathe once, never longer. */
const OVERTURE_MS = 3600;

export function AssemblHero() {
  // The overture: first visit lands on a pure white viewport with only the
  // sculpture forming; the page then becomes assembl. Any interaction skips
  // it, reduced-motion and return visits within the session never see it.
  const [overture, setOverture] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(OVERTURE_KEY) === '1';
    } catch {
      seen = true;
    }
    if (reduced || seen) {
      queueMicrotask(() => setOverture(false));
      return undefined;
    }
    const done = () => {
      try {
        window.sessionStorage.setItem(OVERTURE_KEY, '1');
      } catch {
        /* private mode — the timer alone carries the skip */
      }
      setOverture(false);
    };
    const timer = window.setTimeout(done, OVERTURE_MS);
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    events.forEach((name) => window.addEventListener(name, done, { once: true, passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, done));
    };
  }, []);

  return (
    <header className={overture ? `${styles.hero} ${styles.overture}` : styles.hero}>
      <div className={styles.signalRail} aria-label="assembl operating principles">
        <span>{HERO.signalRail[0]}</span>
        <span>{HERO.signalRail[1]}</span>
        <span><i aria-hidden /> {HERO.signalRail[2]}</span>
      </div>

      <div className={styles.heroCanvas}>
        <ParticleCanvas />
      </div>

      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{HERO.eyebrow}</p>
        <h1>
          {HERO.headline.line1}
          <span>{HERO.headline.line2}</span>
        </h1>
        <p className={styles.lede}>{HERO.lede}</p>
        <div className={styles.actions}>
          <Link href="/pilot-sprint">
            {HERO.actions.primary} <ArrowRight aria-hidden />
          </Link>
          <Link href="#business-genome" className={styles.secondaryAction}>
            {HERO.actions.secondary} <ArrowDown aria-hidden />
          </Link>
        </div>
        <div className={styles.proofLine}>
          <span><CheckCircle2 aria-hidden /> {HERO.proofLine[0]}</span>
          <span><CheckCircle2 aria-hidden /> {HERO.proofLine[1]}</span>
          <span><CheckCircle2 aria-hidden /> {HERO.proofLine[2]}</span>
        </div>
      </div>
    </header>
  );
}
