'use client';

import type { PointerEvent } from 'react';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import styles from './do-glass-hero.module.css';

/** Exact cutout artwork; the tilt is decorative, never agent activity. */
export function DoGlassHero({ embedded }: { embedded: boolean }) {
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--do-tilt-x', `${(0.5 - (event.clientY - box.top) / box.height) * 6}deg`);
    event.currentTarget.style.setProperty('--do-tilt-y', `${((event.clientX - box.left) / box.width - 0.5) * 8}deg`);
  }
  function settle(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty('--do-tilt-x');
    event.currentTarget.style.removeProperty('--do-tilt-y');
  }
  return <div className={styles.hero} data-do-widget-identity="glass-cutout" data-embedded={embedded || undefined} aria-hidden="true" onPointerMove={tilt} onPointerLeave={settle}>
    <GlassIdentity kind="do" size={170} />
  </div>;
}
