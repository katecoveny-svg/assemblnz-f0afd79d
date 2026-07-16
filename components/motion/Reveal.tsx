'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './reveal.module.css';

type RevealProps = {
  children: ReactNode;
  /** Reveal delay in ms (use for staggering a list). */
  delay?: number;
  /** Travel distance in px before settling. Default 22. */
  y?: number;
  className?: string;
  style?: CSSProperties;
  /** Fraction of the element visible before it reveals. Default 0.18. */
  threshold?: number;
};

/**
 * Scroll-reveal: content rises and fades in as it enters the viewport, once.
 * The site's motion vocabulary — it assembles, it doesn't pop. Reduced motion
 * and no-IntersectionObserver both fall back to fully visible (see the module).
 */
export function Reveal({ children, delay = 0, y = 22, className, style, threshold = 0.18 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.visible = 'true';
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      style={{ ...style, ['--reveal-delay' as string]: `${delay}ms`, ['--reveal-y' as string]: `${y}px` }}
    >
      {children}
    </div>
  );
}
