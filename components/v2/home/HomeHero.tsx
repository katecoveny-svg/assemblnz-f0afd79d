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

/** Word-by-word rise for the two locked headline lines. */
function HeadlineLine({ words, offset }: { words: string[]; offset: number }) {
  const reduced = useReducedMotion();
  return (
    <span style={{ display: 'block' }}>
      {words.map((word, i) => (
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
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
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
          <HeadlineLine words={['purpose-built', 'agents.']} offset={0} />
          <span style={{ display: 'block' }}>
            <HeadlineLine words={['limitless', 'potential']} offset={2} />
            <motion.span
              aria-hidden
              style={{ color: palette.accentGold, display: 'inline-block' }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              .
            </motion.span>
          </span>
        </h1>

        <motion.p {...fade(0.55)} className={styles.lede}>
          Agents draft the work. Your people approve it. Every output carries the record of how it
          was made.
        </motion.p>

        <motion.div {...fade(0.7)} className={styles.ctaRow}>
          <MagneticButton>
            <Link href="/agents" className={styles.ctaPrimary}>
              browse agents
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
