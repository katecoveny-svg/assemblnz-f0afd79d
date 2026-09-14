/** @assembl/camera-scroll — stub. Scroll chapter camera. */
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface CameraScrollProps {
  children: ReactNode;
  demo?: boolean;
}

/**
 * Reduced-motion: shows content fully assembled (no progressive reveal).
 * Full motion: light opacity assemble on intersect — stub only.
 */
export function CameraScroll({ children, demo = true }: CameraScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) {
      setReady(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setReady(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-assembl-block="camera-scroll"
      data-demo={demo ? 'true' : undefined}
      data-reduced={reduced ? 'true' : undefined}
      style={{
        opacity: ready ? 1 : 0.35,
        transform: ready || reduced ? 'none' : 'translateY(12px)',
        transition: reduced ? 'none' : 'opacity 600ms ease, transform 600ms ease',
      }}
    >
      {children}
    </div>
  );
}

export default CameraScroll;
