'use client';

import { useEffect, useRef } from 'react';
import { BRAND, BUILD_SCRIPT } from '@/lib/copy/homepage';
import styles from './build-scroll.module.css';

/**
 * Conversational build scroll (Prompt 3). The build talks: it opens "Kia ora."
 * (Kate's decision, 2026-07-14), asks what you do, invites what you've got,
 * the sources you can drop assemble into a small genome orbit, and it lands on
 * "Done." Scroll-revealed — motion assembles, nothing pops.
 *
 * Every string comes from the copy manifest (BUILD_SCRIPT, BRAND.genomeName);
 * nothing is authored inline. Reveal is a single IntersectionObserver toggling
 * data-visible; reduced motion is handled by the global stylesheet.
 */
export function BuildScroll() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [line1, line2] = BRAND.genomeName.split(' ');
  const chipCount = BUILD_SCRIPT.chips.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => (el.dataset.visible = 'true'));
      return;
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
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={rootRef} aria-label="How your business gets built">
      <div className={styles.thread}>
        {BUILD_SCRIPT.lines.map((line, i) => (
          <p
            key={line}
            className={styles.line}
            data-reveal
            style={{ ['--k' as string]: i }}
          >
            {line}
          </p>
        ))}
      </div>

      <div className={styles.assemble} data-reveal>
        <div className={styles.miniOrbit}>
          {BUILD_SCRIPT.chips.map((chip, i) => (
            <span
              key={chip}
              className={styles.chip}
              style={{
                ['--a' as string]: `${(i * 360) / chipCount}deg`,
                ['--k' as string]: i,
              }}
            >
              {chip}
            </span>
          ))}
          <span className={styles.core}>
            <span className={styles.coreMark} aria-hidden>
              a
            </span>
            <strong>
              {line1}
              <br />
              {line2}
            </strong>
          </span>
        </div>
      </div>

      <p className={styles.done} data-reveal>
        {BUILD_SCRIPT.done}
      </p>
    </section>
  );
}
