'use client';

import * as React from 'react';
import { PearlWave } from './PearlWave';
import styles from './home.module.css';

/**
 * The homepage hero art, pearl direction: a slow particle wave — pearl grey
 * to champagne gold on warm paper — behind the headline. Canvas 2D, so it
 * paints instantly on every device; prefers-reduced-motion gets a still of
 * the same wave (handled inside PearlWave). Just the wave: no labels on the
 * art (Kate's call, 2026-07-11 — the reo metaphor overlays are gone).
 */
export function Hero3D() {
  return (
    <div className={styles.heroArt} aria-hidden>
      <div className={styles.heroArtInner}>
        <PearlWave />
      </div>
    </div>
  );
}
