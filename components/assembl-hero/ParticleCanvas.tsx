'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  FORMATIONS,
  HOLD_SECONDS,
  MORPH_SECONDS,
  type FormationName,
} from '@/components/v2/home/hero-particles/config';
import styles from './assembl-hero.module.css';

const KineticHero = dynamic(
  () => import('@/components/v2/home/hero-particles/KineticHero').then((m) => m.KineticHero),
  { ssr: false, loading: () => <HeroFallback /> },
);

/** Caption copy for each formation of the kinetic sculpture. */
const FORMATION_LABELS: Record<FormationName, string> = {
  wing: 'collective knowledge',
  school: 'coordinated movement',
  matariki: 'patterns become visible',
  rivers: 'work begins to flow',
  genome: 'your living business genome',
};

function supportsWebgl() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function HeroFallback() {
  return (
    <div className={styles.fallback}>
      <Image
        src="/brand/genome/assembl-pale-hero-dome.png"
        alt="A pale glass Business Genome containing a connected Auckland business map"
        fill
        priority
        sizes="(max-width: 760px) 100vw, 62vw"
      />
    </div>
  );
}

export function ParticleCanvas() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stage, setStage] = useState<FormationName>(FORMATIONS[0]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    queueMicrotask(() => {
      setWebgl(supportsWebgl());
      update();
    });
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // The caption announces the incoming formation the moment its morph starts,
  // mirroring the sculpture's hold/morph rhythm.
  useEffect(() => {
    if (reducedMotion) {
      queueMicrotask(() => setStage(FORMATIONS[0]));
      return undefined;
    }
    const cycleMs = (HOLD_SECONDS + MORPH_SECONDS) * 1000;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const index = Math.floor((elapsed + MORPH_SECONDS * 1000) / cycleMs) % FORMATIONS.length;
      setStage(FORMATIONS[index]);
    }, 250);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <figure className={styles.canvasFrame} aria-label="The living Business Genome forming from connected signals">
      {webgl === false ? <HeroFallback /> : null}
      {webgl === null ? <HeroFallback /> : null}
      {webgl ? <KineticHero /> : null}
      <figcaption className={styles.canvasCaption}>
        <span className={styles.liveDot} aria-hidden />
        {FORMATION_LABELS[stage]}
      </figcaption>
      <span className={styles.placeLabel}>Tāmaki Makaurau · Aotearoa</span>
    </figure>
  );
}
