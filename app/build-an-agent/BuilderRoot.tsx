'use client';

import { useState } from 'react';

import { BuilderScene } from '@/components/build-an-agent/BuilderScene';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './build-an-agent.module.css';

export function BuilderRoot() {
  const [parts, setParts] = useState<Record<string, [number, number, number]>>({
    model: [0, 0.6, 0],
  });

  return (
    <main className={styles.root}>
      <div className={styles.canvas}>
        <BuilderScene
          onPartMove={(id, position) =>
            setParts((prev) => ({ ...prev, [id]: position }))
          }
        />
      </div>

      <div className={styles.overlayTop}>
        <a href="/" className={styles.wordmark} aria-label="assembl home">
          assembl
        </a>
        <p className={styles.eyebrow}>{BUILD_AN_AGENT.hero.eyebrow}</p>
      </div>

      <div className={styles.overlayBottom}>
        <div className={styles.hint}>
          <span className={styles.hintDot} aria-hidden />
          {BUILD_AN_AGENT.scene.dragHint}
        </div>
        <div className={styles.debug} aria-hidden>
          model · {parts.model[0].toFixed(1)}, {parts.model[2].toFixed(1)}
        </div>
      </div>
    </main>
  );
}
