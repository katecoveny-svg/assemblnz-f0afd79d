'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FORMATION_LABELS, FORMATION_ORDER, type FormationName } from '@/lib/formations/living-genome';
import styles from './assembl-hero.module.css';

const ParticleScene = dynamic(() => import('./ParticleScene'), {
  ssr: false,
  loading: () => <HeroFallback />,
});

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
  const [stage, setStage] = useState<FormationName>('signal');

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

  useEffect(() => {
    if (reducedMotion) {
      queueMicrotask(() => setStage('genome'));
      return undefined;
    }
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const index = Math.min(FORMATION_ORDER.length - 1, Math.floor(Math.max(0, elapsed - 700) / 2050));
      setStage(FORMATION_ORDER[index]);
    }, 180);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <figure className={styles.canvasFrame} aria-label="The living Business Genome forming from connected signals">
      {webgl === false ? <HeroFallback /> : null}
      {webgl === null ? <HeroFallback /> : null}
      {webgl ? <ParticleScene reducedMotion={reducedMotion} /> : null}
      <figcaption className={styles.canvasCaption}>
        <span className={styles.liveDot} aria-hidden />
        {FORMATION_LABELS[stage]}
      </figcaption>
      <span className={styles.placeLabel}>Tāmaki Makaurau · Aotearoa</span>
    </figure>
  );
}
