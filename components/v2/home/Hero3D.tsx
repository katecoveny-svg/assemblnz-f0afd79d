'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PearlWave } from './PearlWave';
import styles from './home.module.css';

/**
 * The homepage hero art, pearl direction: a slow particle wave — pearl grey
 * to champagne gold on warm paper — behind the headline. Canvas 2D, so it
 * paints instantly on every device; prefers-reduced-motion gets a still of
 * the same wave (handled inside PearlWave).
 */

// Te reo visual-metaphor labels — locked direction: these live ONLY on the
// landscape art, as poetic naming of the visual scene, never as UI labels.
const METAPHORS = [
  { reo: 'matariki', tag: 'guiding intelligence across systems', top: '9%', right: '5%' },
  { reo: 'papatūānuku', tag: 'grounded in data, rooted in purpose', bottom: '19%', left: '43%' },
  { reo: 'moana', tag: 'flowing connections, endless potential', top: '62%', right: '9%' },
] as const;

export function Hero3D() {
  const reduced = useReducedMotion();

  return (
    <div className={styles.heroArt} aria-hidden>
      <div className={styles.heroArtInner}>
        <PearlWave />
      </div>

      {METAPHORS.map((m, i) => (
        <motion.div
          key={m.reo}
          className={styles.metaphorLabel}
          style={{
            top: 'top' in m ? m.top : undefined,
            right: 'right' in m ? m.right : undefined,
            bottom: 'bottom' in m ? m.bottom : undefined,
            left: 'left' in m ? m.left : undefined,
          }}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 + i * 0.45, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.metaphorReo}>{m.reo}</span>
          <span className={styles.metaphorTag}>{m.tag}</span>
        </motion.div>
      ))}
    </div>
  );
}
