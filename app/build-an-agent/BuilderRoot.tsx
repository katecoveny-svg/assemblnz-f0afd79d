'use client';

import { AskSection } from '@/components/build-an-agent/AskSection';
import { BuilderScene } from '@/components/build-an-agent/BuilderScene';
import { useParallax } from '@/components/build-an-agent/hooks/useParallax';
import { ConfigureSection } from '@/components/build-an-agent/ConfigureSection';
import { IntakeSection } from '@/components/build-an-agent/IntakeSection';
import { ShareSection } from '@/components/build-an-agent/ShareSection';
import { WhatYouGetSection } from '@/components/build-an-agent/WhatYouGetSection';
import { BuilderProvider, useBuilder } from '@/lib/build-an-agent/store';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './build-an-agent.module.css';
// Side-effect import: publishes the shared :global life classes (btn3d,
// reveal, glowSoft, liftCard) that every section on this page composes.
import './life.module.css';


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
    state: { parts, docked, speaking },
    movePart,
    setDocked,
  } = useBuilder();
  const dockedCount = Object.values(docked).filter(Boolean).length;

  // Drives every [data-parallax] element on the page.
  useParallax();

  return (
    <main className={styles.root}>
      {/* ── SECTION 1 · IMMERSIVE 3D HERO — a single-screen builder canvas ── */}
      <section id="build" className={styles.hero} aria-label="Build your agent">
        <div className={styles.canvas}>
          <BuilderScene
            onPartMove={movePart}
            onPartDock={setDocked}
            corePosition={parts.model}
            speaking={speaking}
          />
        </div>

        <div className={styles.heroOverlayTop}>
          <a href="/" className={styles.wordmark} aria-label="assembl home">
            assembl
          </a>
          <p className={styles.eyebrow}>{BUILD_AN_AGENT.hero.eyebrow}</p>
        </div>

        <div className={styles.heroCopyScrim} aria-hidden />

        <div className={styles.heroCopy}>
          <h1 className={styles.headline}>
            <span>{BUILD_AN_AGENT.hero.headline.line1}</span>
            <span>{BUILD_AN_AGENT.hero.headline.line2}</span>
          </h1>
          <p className={styles.lede}>{BUILD_AN_AGENT.hero.lede}</p>
          <div className={styles.ctaRow}>
            <button
              type="button"
              className="btn3d"
              onClick={() => scrollToId('intake')}
            >
              {BUILD_AN_AGENT.hero.startAction}
            </button>
            <a href={BUILD_AN_AGENT.hero.secondaryHref} className="btn3d btn3dGhost">
              {BUILD_AN_AGENT.hero.secondaryAction}
            </a>
          </div>
          <ul className={styles.chipRow} aria-label="The parts of an assembled agent">
            {BUILD_AN_AGENT.hero.chips.map((chip) => (
              <li key={chip} className={styles.chip}>
                {chip}
              </li>
            ))}
          </ul>
          <span className={styles.hint} aria-live="polite">
            <span className={styles.hintDot} aria-hidden />
            {BUILD_AN_AGENT.scene.dragHint} · {dockedCount} {BUILD_AN_AGENT.scene.connectedLabel}
          </span>
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

      {/* ── THE PLATFORM PROMISE — the agent is one part; here's the OS ── */}
      <WhatYouGetSection />

      {/* ── SECTION 5 · SHARE — copy link, save PNG, hold-by-email ── */}
      <ShareSection />

      {/* ── THE ASK — the finale, not a numbered step ── */}
      <section id="hand-off" className={styles.closingSection} aria-label="Build it for real">
        <div className={`${styles.closingCard} glowSoft`}>
          <p className={styles.sectionEyebrow}>{BUILD_AN_AGENT.closing.eyebrow}</p>
          <h2 className={styles.closingHeading}>{BUILD_AN_AGENT.closing.heading}</h2>
          <p className={styles.closingBody}>{BUILD_AN_AGENT.closing.body}</p>

          <div className={styles.closingActions}>
            <a
              className="btn3d"
              href={`mailto:${BUILD_AN_AGENT.closing.email}?subject=${encodeURIComponent(
                BUILD_AN_AGENT.closing.emailSubject,
              )}`}
            >
              {BUILD_AN_AGENT.closing.cta}
              <span aria-hidden>→</span>
            </a>
            <a className="btn3d btn3dGhost" href={BUILD_AN_AGENT.closing.ctaSecondaryHref}>
              {BUILD_AN_AGENT.closing.ctaSecondary}
            </a>
          </div>

          <p className={styles.closingMailto}>
            <a
              href={`mailto:${BUILD_AN_AGENT.closing.email}?subject=${encodeURIComponent(
                BUILD_AN_AGENT.closing.emailSubject,
              )}`}
            >
              {BUILD_AN_AGENT.closing.email}
            </a>
            <span className={styles.closingMailNote}>{BUILD_AN_AGENT.closing.emailNote}</span>
          </p>
          <p className={styles.closingFinePrint}>{BUILD_AN_AGENT.closing.finePrint}</p>
        </div>
      </section>
    </main>
  );
}
