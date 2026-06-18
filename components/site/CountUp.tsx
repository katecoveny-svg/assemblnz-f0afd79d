'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Counts up from 0 to `value` once it scrolls into view. Respects
 * prefers-reduced-motion (renders the final value immediately) and is purely
 * additive — the resting state is always the true number, so it can never get
 * stuck on a wrong figure.
 */
export function CountUp({
  value,
  durationMs = 1400,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(eased * value));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs, reduce]);

  // Under reduced motion we render the true value immediately; otherwise the
  // animated `display` counts up once in view.
  return (
    <span ref={ref} className={className}>
      {(reduce ? value : display).toLocaleString('en-NZ')}
    </span>
  );
}
