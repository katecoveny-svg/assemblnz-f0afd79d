'use client';

import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { evidencePackContents } from '@/lib/site-config';
import styles from './home.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "Not an output. A record." — the four evidence-pack reveals as a scroll
 * story. A mock pack sits sticky on the left and assembles itself layer by
 * layer (blank → attribution → citations → sealed) as the reader scrolls the
 * four stages on the right. Reduced motion → the finished pack, all stages
 * visible at once.
 */

function Layer({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PackVisual({ stage }: { stage: number }) {
  return (
    <div className={styles.packCard}>
      {/* letterhead — always there (stage 01, "Blank") */}
      <div className={styles.packLetterhead}>
        <span
          style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: 19,
            color: palette.ink,
          }}
        >
          your letterhead
        </span>
        <MicroLabel style={{ color: stage >= 3 ? palette.gold : '#C9C5BA' }}>
          {stage >= 3 ? 'sealed' : 'draft'}
        </MicroLabel>
      </div>
      <div className={styles.packRule} style={{ width: '82%' }} />
      <div className={styles.packRule} style={{ width: '64%' }} />
      <div className={styles.packRule} style={{ width: '74%' }} />

      <Layer show={stage >= 1}>
        <div className={styles.packMeta}>
          <span>drafted by · whakaaē — building consents</span>
          <span>reviewer · a named person on your team</span>
          <span>model + prompt · recorded in full</span>
        </div>
      </Layer>

      <Layer show={stage >= 2}>
        <div className={styles.packCitations}>
          <span className={styles.packCitation}>building act 2004 · s 14B</span>
          <span className={styles.packCitation}>nzs 3910:2013</span>
          <span className={styles.packCitation}>council doc · version-stamped</span>
        </div>
      </Layer>

      <Layer show={stage >= 3}>
        <div className={styles.packSealRow}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
            <circle cx="17" cy="17" r="15.5" stroke={palette.gold} strokeWidth="1" />
            <circle cx="17" cy="17" r="10.5" stroke={palette.goldSoft} strokeWidth="0.7" />
            <circle cx="17" cy="17" r="2.4" fill={palette.gold} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (Math.PI * 2 * i) / 6;
              return (
                <circle
                  key={i}
                  cx={17 + 6.4 * Math.cos(a)}
                  cy={17 + 6.4 * Math.sin(a)}
                  r="1.1"
                  fill={palette.goldSoft}
                />
              );
            })}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <MicroLabel style={{ color: palette.bronze }}>sha-256 · tamper-evident</MicroLabel>
            <span className={styles.packHash}>
              9f2b4e7c1a8d3f60b5e2c794a1d8f36e0c7b2a95d4e1f8c3
            </span>
          </div>
        </div>
      </Layer>
    </div>
  );
}

export function EvidenceStory() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.62', 'end 0.72'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setStage(Math.min(3, Math.floor(v * 4)));
  });

  const active = reduced ? 3 : stage;

  return (
    <div ref={ref} className={styles.evidenceLayout}>
      <div className={styles.evidenceSticky}>
        <PackVisual stage={active} />
      </div>
      <div className={styles.evidenceStages}>
        {evidencePackContents.map((reveal, i) => (
          <motion.div
            key={reveal.id}
            className={styles.evidenceStage}
            animate={reduced ? undefined : { opacity: active === i ? 1 : 0.38 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span className={styles.stageNumber}>{reveal.number}</span>
              <h3 className={styles.stageTitle}>{reveal.title}</h3>
            </div>
            <p className={styles.stageBody}>{reveal.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
