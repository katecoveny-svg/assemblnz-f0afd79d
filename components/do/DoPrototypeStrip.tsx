'use client';

import Link from 'next/link';
import { DoMark } from '@/components/do/DoMark';
import '@/app/do/do-craft.css';
import styles from './do-prototype-strip.module.css';

/** Compact strip for /do/widget and portable surfaces. */
export function DoPrototypeStrip() {
  return (
    <section className={`do-craft ${styles.strip}`} aria-label="DO prototypes">
      <div className={styles.brand}>
        <span className={`do-craft-orb ${styles.orb}`} aria-hidden>
          <DoMark />
        </span>
        <div>
          <p className={styles.eyebrow}>assembl · DO prototypes</p>
          <p className={styles.copy}>Sponsored Journeys + Browser Runtime — demo stubs, Permit + Receipt</p>
        </div>
      </div>
      <div className={styles.links}>
        <Link href="/do/sponsored" target="_blank" rel="noopener">
          Sponsored Journeys ↗
        </Link>
        <Link href="/do/browser" target="_blank" rel="noopener">
          Browser Runtime ↗
        </Link>
      </div>
      <p className={styles.note}>
        Not OpenAI Sponsored Agents. Not a page-summarising sidebar. No Firefox Smart Window claim.
      </p>
    </section>
  );
}
