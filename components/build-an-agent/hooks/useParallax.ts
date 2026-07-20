'use client';

import { useEffect } from 'react';

/**
 * Scroll-linked parallax for anything marked `data-parallax="<depth>"`.
 *
 * Sets a `--py` custom property (in pixels) on each element; the CSS decides
 * what to do with it. Depth is a multiplier — 0.06 is a whisper, 0.3 is a
 * strong drift.
 *
 * Why one document-level listener rather than a hook per element: the page has
 * a WebGL canvas running a live scene, so anything that adds per-element
 * scroll work competes with it for frame budget. One passive listener, one
 * rAF, writes batched.
 *
 * Elements only get measured while they're on screen (IntersectionObserver
 * gates the set), so a long page doesn't pay for the sections nobody's looking
 * at. Honours prefers-reduced-motion by simply never running.
 */
export function useParallax() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]'),
    );
    if (nodes.length === 0) return;

    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) visible.add(el);
          else {
            visible.delete(el);
            el.style.setProperty('--py', '0px');
          }
        }
      },
      { rootMargin: '20% 0px' },
    );
    nodes.forEach((n) => io.observe(n));

    let frame = 0;
    const apply = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      for (const el of visible) {
        const rect = el.getBoundingClientRect();
        const depth = Number(el.dataset.parallax) || 0.1;
        // Offset from the viewport centre — an element drifts one way above
        // the fold and the other way below it, so the effect reads as depth
        // rather than as a lag.
        const offset = (rect.top + rect.height / 2 - mid) * depth;
        el.style.setProperty('--py', `${offset.toFixed(2)}px`);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
