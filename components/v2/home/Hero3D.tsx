'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import styles from './home.module.css';

const KineticHero = dynamic(
  () => import('./hero-particles/KineticHero').then((m) => m.KineticHero),
  { ssr: false },
);

/**
 * The homepage hero art: a kinetic particle sculpture — the kōtuku wing and
 * its sibling formations, drawn from thousands of distinct silver points.
 * The canvas occupies only the sculpture's region, centre-right on desktop
 * and above the copy on phones; the white page dominates. No full-bleed
 * canvas, no bloom, no additive blending.
 */
export function Hero3D() {
  return (
    <div className={styles.heroArt} aria-hidden>
      <div className={styles.heroSculpt}>
        <KineticHero />
      </div>
    </div>
  );
}
