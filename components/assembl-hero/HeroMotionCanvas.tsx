'use client';

import dynamic from 'next/dynamic';
import { HERO_CAPTIONS } from '@/lib/copy/homepage';
import styles from './assembl-hero.module.css';

const MotionCanvas = dynamic(
  () => import('@/components/motion/MotionCanvas').then((m) => ({ default: m.MotionCanvas })),
  { ssr: false },
);

/**
 * Homepage hero visual — the Living Interface particle sculpture (the
 * kōtuku-wing sweep assembling from metallic silver points), replacing the
 * Pattern Studio wordmark inside the same frame. The figcaption strings
 * come from the copy manifest; the canvas itself is decorative and the
 * parent frame reserves the box, so mounting never shifts layout.
 */
export function HeroMotionCanvas() {
  return (
    <figure className={styles.canvasFrame}>
      <MotionCanvas />
      <figcaption className={styles.canvasCaption}>
        <span className={styles.liveDot} aria-hidden />
        {HERO_CAPTIONS.genome}
      </figcaption>
      <span className={styles.placeLabel}>{HERO_CAPTIONS.place}</span>
    </figure>
  );
}
