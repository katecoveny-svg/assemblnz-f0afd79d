'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ParticulateLandscape } from '@assembl/canvas';
import styles from './home.module.css';

const ParticulateScene = dynamic(() => import('./ParticulateScene'), { ssr: false });

/**
 * The homepage hero art: the signed-off poster paints first everywhere, and
 * on motion-allowed screens the live 3D particulate field mounts over it —
 * pointer parallax, breathing drift, scroll dissolve.
 *
 * prefers-reduced-motion → poster + still SVG landscape only (no canvas).
 * No WebGL → the Canvas falls back to the still SVG.
 */

// Te reo visual-metaphor labels — locked direction: these live ONLY on the
// landscape art, as poetic naming of the visual scene, never as UI labels.
const METAPHORS = [
  { reo: 'matariki', tag: 'guiding intelligence across systems', top: '9%', right: '5%' },
  { reo: 'papatūānuku', tag: 'grounded in data, rooted in purpose', bottom: '19%', left: '43%' },
  // nudged below the tui splat's turntable sweep so wings never cover the text
  { reo: 'moana', tag: 'flowing connections, endless potential', top: '62%', right: '9%' },
] as const;

export function Hero3D() {
  const reduced = useReducedMotion();

  return (
    <div className={styles.heroArt} aria-hidden>
      <div className={styles.heroArtInner}>
        <picture>
          <source media="(max-width: 899px)" srcSet="/brand/v2/hero-landscape-mobile.jpg" />
          <img
            src="/brand/v2/hero-landscape.jpg"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              opacity: 0.9,
            }}
          />
        </picture>
        {reduced ? (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            <ParticulateLandscape />
          </div>
        ) : (
          <ParticulateScene
            fallback={
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
                <ParticulateLandscape />
              </div>
            }
          />
        )}
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
