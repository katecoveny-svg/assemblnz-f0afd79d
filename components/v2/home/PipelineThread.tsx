'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { pipelineStages } from '@/lib/site-config';
import { Reveal } from '@/components/site/Reveal';
import styles from './home.module.css';

/**
 * The five canon stages (Kahu → Iho → Tā → Mahara → Mana) on a gold thread
 * that draws itself as you scroll. The thread is decorative; every stage is
 * plain readable content underneath, so nothing depends on JS to be legible.
 */
export function PipelineThread() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.78', 'end 0.55'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });

  return (
    <div ref={ref} className={styles.pipeline}>
      <div className={styles.threadTrack} aria-hidden>
        <motion.div className={styles.threadFill} style={{ scaleY: reduced ? 1 : scaleY }} />
      </div>
      {pipelineStages.map((stage, i) => (
        <Reveal key={stage.id} delay={i * 0.05}>
          <div className={styles.stage}>
            <span className={styles.stageDot} aria-hidden />
            <div className={styles.stageTitleRow}>
              <span className={styles.stageNumber}>{stage.number}</span>
              <h3 className={styles.stageTitle}>{stage.title}</h3>
              <span className={styles.stageSubtitle}>{stage.subtitle}</span>
            </div>
            <p className={styles.stageBody}>{stage.body}</p>
            <span className={styles.stageExample}>
              <span aria-hidden style={{ color: '#BFA37A' }}>
                →
              </span>
              {stage.example}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
