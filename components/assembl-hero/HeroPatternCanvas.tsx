'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { HERO_CAPTIONS } from '@/lib/copy/homepage';
import styles from './assembl-hero.module.css';

const PatternStudio = dynamic(
  () => import('@/components/pattern-studio/AssemblPatternStudioComponent'),
  { ssr: false },
);

/** Resolve an --a-* token to a concrete colour (canvas can't read CSS vars). */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Homepage hero visual — the Pattern Studio assembling the wordmark, replacing
 * the kōtuku sculpture (Kate's call). particleText, wordmark only (no te reo as
 * decoration), on the --a-* tokens: Ming teal + gold on pearl, never the studio
 * demo's orange. Count drops on small viewports (the engine doesn't auto-scale).
 */
export function HeroPatternCanvas() {
  const [colors, setColors] = useState({
    background: '#ffffff',
    foreground: '#3f7373',
    accent: '#b8964f',
  });
  const [count, setCount] = useState(1400);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    queueMicrotask(() => {
      setColors({
        background: token('--a-paper', '#ffffff'),
        foreground: token('--a-accent', '#3f7373'),
        accent: token('--a-gold', '#b8964f'),
      });
      setCount(mobile ? 520 : 1400);
    });
  }, []);

  return (
    <figure className={styles.canvasFrame} aria-label="The assembl wordmark assembling from connected signals">
      <PatternStudio
        mode="particleText"
        words={['assembl']}
        count={count}
        particleShape="circle"
        glow={false}
        turbulence={12}
        speed={1.1}
        holdSeconds={3.6}
        mouseInteractive
        mouseMode="repel"
        backgroundColor={colors.background}
        foregroundColor={colors.foreground}
        accentColor={colors.accent}
        lazyMount={false}
      />
      <figcaption className={styles.canvasCaption}>
        <span className={styles.liveDot} aria-hidden />
        {HERO_CAPTIONS.genome}
      </figcaption>
      <span className={styles.placeLabel}>{HERO_CAPTIONS.place}</span>
    </figure>
  );
}
