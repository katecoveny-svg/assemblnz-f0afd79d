'use client';

import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from './home.module.css';

/**
 * A 3D tilt-on-hover card: the surface leans toward the pointer (up to ~9°)
 * with a lift + deepened shadow, and a soft champagne sheen follows the
 * cursor. Implemented with direct style writes + CSS transitions (no
 * animation library in the hot path) so the transform is applied on every
 * pointer frame. Disabled under reduced-motion and for touch pointers —
 * the card is then a plain block, still fully clickable and focusable.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  function set(rx: number, ry: number, gx: number, gy: number, hovered: boolean) {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${hovered ? -5 : 0}px) scale(${hovered ? 1.02 : 1})`;
    el.style.boxShadow = hovered
      ? '0 26px 52px rgba(26, 25, 24, 0.14)'
      : '0 6px 18px rgba(26, 25, 24, 0.04)';
    el.style.setProperty('--sheen-x', `${gx.toFixed(1)}%`);
    el.style.setProperty('--sheen-y', `${gy.toFixed(1)}%`);
    el.style.setProperty('--sheen-o', hovered ? '1' : '0');
  }

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    set((0.5 - py) * 14, (px - 0.5) * 18, px * 100, py * 100, true);
  }

  function reset() {
    set(0, 0, 50, 50, false);
  }

  return (
    <div
      ref={ref}
      className={`${styles.tilt} ${className ?? ''}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
      <div className={styles.tiltSheen} aria-hidden />
    </div>
  );
}
