'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { MagneticButton } from '@/components/site/MagneticButton';
import { CountUp } from '@/components/site/CountUp';
import { Hero3D } from './Hero3D';
import styles from './home.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Word-by-word rise for the two locked headline lines. The champagne full
 *  stop rides INSIDE the last word's inline-block so it can never wrap alone. */
function HeadlineLine({
  words,
  offset,
  withDot = false,
}: {
  words: string[];
  offset: number;
  withDot?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <span style={{ display: 'block' }}>
      {words.map((word, i) => {
        const last = i === words.length - 1;
        return (
          <span
            key={`${word}-${i}`}
            style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
          >
            <motion.span
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
              initial={reduced ? false : { y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.12 + (offset + i) * 0.09, duration: 0.9, ease: EASE }}
            >
              {word}
              {last && withDot ? (
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              ) : null}
              {!last ? ' ' : ''}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

export function HomeHero({
  agentsLive,
  collections,
  freeTools,
}: {
  agentsLive: number;
  collections: number;
  freeTools: number;
}) {
  const reduced = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.9, ease: EASE },
  });

  return (
    <header className={styles.hero}>
      <Hero3D />

      <div className={styles.heroCopy}>
        <motion.div {...fade(0.05)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
            •
          </span>
          <MicroLabel>built in aotearoa</MicroLabel>
        </motion.div>

        <h1 className={styles.h1} style={{ marginTop: 22 }}>
          <HeadlineLine words={['assembl', 'grows', 'your']} offset={0} />
          <HeadlineLine words={['business', 'while', 'you', 'run', 'it.']} offset={3} />
          <HeadlineLine words={['less', 'admin.', 'more', 'mahi']} offset={8} withDot />
        </h1>

        <motion.p {...fade(0.55)} className={styles.lede}>
          One Living Site — website, CRM, bookings, knowledge, and agents on a single source of
          truth. It learns your business every day and suggests one improvement every morning. You
          say yes.
        </motion.p>

        <motion.div {...fade(0.7)} className={styles.ctaRow}>
          <MagneticButton>
            <Link href="#living-site" className={styles.ctaPrimary}>
              watch a business come alive
              <span aria-hidden style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}>
                •
              </span>
            </Link>
          </MagneticButton>
          <Link href="/how-it-works" className={styles.ctaGhost}>
            how it works
          </Link>
        </motion.div>

        {/* real numbers only — never invented (locked canon) */}
        <motion.div {...fade(0.85)} className={styles.pulseStrip}>
          <span className={styles.pulseItem}>
            <span className={styles.pulseValue}>
              <CountUp value={agentsLive} />
            </span>
            agents live
          </span>
          <span aria-hidden style={{ color: palette.hairline }}>
            |
          </span>
          <span className={styles.pulseItem}>
            <span className={styles.pulseValue}>
              <CountUp value={collections} />
            </span>
            collections
          </span>
          <span aria-hidden style={{ color: palette.hairline }}>
            |
          </span>
          <span className={styles.pulseItem}>
            <span className={styles.pulseValue}>
              <CountUp value={freeTools} />
            </span>
            free tools
          </span>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollHint}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        aria-hidden
      >
        <MicroLabel style={{ fontSize: 9 }}>scroll</MicroLabel>
        <motion.span
          className={styles.scrollHintLine}
          animate={reduced ? undefined : { scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </header>
  );
}
