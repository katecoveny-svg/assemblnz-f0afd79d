'use client';

import { AskSection } from '@/components/build-an-agent/AskSection';
import { BuilderScene } from '@/components/build-an-agent/BuilderScene';
import { ConfigureSection } from '@/components/build-an-agent/ConfigureSection';
import { IntakeSection } from '@/components/build-an-agent/IntakeSection';
import { ShareSection } from '@/components/build-an-agent/ShareSection';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { BuilderProvider, useBuilder } from '@/lib/build-an-agent/store';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './build-an-agent.module.css';

const INITIAL_SAVINGS = { people: 3, adminHours: 6, repeatableShare: 35 };

function scrollToId(id: string) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * The one-page /build-an-agent flow.
 *
 * All six sections share the same <BuilderProvider>: what the visitor drags
 * on the canvas up top, what they configure in the middle, and what the real
 * Claude answer streams from below are the same agent, with the same parts,
 * with the same shared state.
 */
export function BuilderRoot() {
  return (
    <BuilderProvider>
      <BuilderPage />
    </BuilderProvider>
  );
}

function BuilderPage() {
  const {
    state: { parts, speaking },
    movePart,
  } = useBuilder();
  const placedCount = Object.keys(parts).length;

  return (
    <main className={styles.root}>
      {/* ── SECTION 1 · IMMERSIVE 3D HERO — a single-screen builder canvas ── */}
      <section id="build" className={styles.hero} aria-label="Build your agent">
        <div className={styles.canvas}>
          <BuilderScene onPartMove={movePart} speaking={speaking} />
        </div>

        <div className={styles.heroOverlayTop}>
          <a href="/" className={styles.wordmark} aria-label="assembl home">
            assembl
          </a>
          <p className={styles.eyebrow}>{BUILD_AN_AGENT.hero.eyebrow}</p>
        </div>

        <div className={styles.heroCopy}>
          <h1 className={styles.headline}>
            <span>{BUILD_AN_AGENT.hero.headline.line1}</span>
            <span>{BUILD_AN_AGENT.hero.headline.line2}</span>
          </h1>
          <p className={styles.lede}>{BUILD_AN_AGENT.hero.lede}</p>
          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => scrollToId('intake')}
            >
              {BUILD_AN_AGENT.hero.startAction}
            </button>
            <span className={styles.hint} aria-live="polite">
              <span className={styles.hintDot} aria-hidden />
              {BUILD_AN_AGENT.scene.dragHint} · {placedCount} pieces on the table
            </span>
          </div>
        </div>

        <a
          href="#intake"
          className={styles.scrollCue}
          onClick={(e) => {
            e.preventDefault();
            scrollToId('intake');
          }}
          aria-label="Scroll to the next section"
        >
          <span>keep going</span>
          <span aria-hidden className={styles.scrollCueArrow}>↓</span>
        </a>
      </section>

      {/* ── SECTION 2 · INTAKE — warm, first-person, Business Genome-first ── */}
      <IntakeSection />

      {/* ── SECTION 3 · CONFIGURE — chip pickers per placed part ── */}
      <ConfigureSection />

      {/* ── SECTION 4 · ASK — real streaming Claude answer, mesh glows ── */}
      <AskSection />

      {/* ── SECTION 5 · SHARE — copy link, save PNG, hold-by-email ── */}
      <ShareSection />

      {/* ── SECTION 6 · TIME BACK — the estimator ── */}
      <section id="time-back" className={styles.savingsSection} aria-label="Time back estimate">
        <div className={styles.sectionBanner}>
          <p className={styles.sectionEyebrow}>{BUILD_AN_AGENT.savings.eyebrow}</p>
          <h2 className={styles.sectionHeading}>{BUILD_AN_AGENT.savings.heading}</h2>
          <p className={styles.sectionLede}>{BUILD_AN_AGENT.savings.lede}</p>
        </div>
        <TimeSavingsCalculator initialValues={INITIAL_SAVINGS} />
      </section>

      {/* ── SECTION 6 · CLOSING — hand it to us to build for real ── */}
      <section id="hand-off" className={styles.closingSection} aria-label="Hand it to us">
        <div className={styles.closingCard}>
          <p className={styles.sectionEyebrow}>{BUILD_AN_AGENT.closing.eyebrow}</p>
          <h2 className={styles.closingHeading}>{BUILD_AN_AGENT.closing.heading}</h2>
          <p className={styles.closingBody}>{BUILD_AN_AGENT.closing.body}</p>
          <p className={styles.closingMailto}>
            <a href={`mailto:${BUILD_AN_AGENT.closing.email}?subject=I%20built%20an%20agent%20on%20assembl`}>
              {BUILD_AN_AGENT.closing.email}
            </a>
          </p>
          <p className={styles.closingFinePrint}>{BUILD_AN_AGENT.closing.finePrint}</p>
        </div>
      </section>
    </main>
  );
}
