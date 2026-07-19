'use client';

import { useState } from 'react';

import { BuilderScene } from '@/components/build-an-agent/BuilderScene';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { OneMinuteBusiness } from '@/components/one-minute-business/OneMinuteBusiness';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './build-an-agent.module.css';

type PartPositions = Record<string, [number, number, number]>;

const INITIAL_PARTS: PartPositions = {
  model: [0, 0.6, 0],
  memory: [-2.4, 0.55, -0.4],
  tools: [2.4, 0.5, -0.4],
  knowledge: [-1.4, 0.55, 1.6],
  voice: [1.4, 0.55, 1.6],
  guardrails: [0, 0.5, 2.2],
};

const INITIAL_SAVINGS = { people: 3, adminHours: 6, repeatableShare: 35 };

function scrollToId(id: string) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function BuilderRoot() {
  const [parts, setParts] = useState<PartPositions>(INITIAL_PARTS);
  const placedCount = Object.keys(parts).length;

  return (
    <main className={styles.root}>
      {/* ── SECTION 1 · IMMERSIVE 3D HERO — a single-screen builder canvas ── */}
      <section id="build" className={styles.hero} aria-label="Build your agent">
        <div className={styles.canvas}>
          <BuilderScene
            onPartMove={(id, position) =>
              setParts((prev) => ({ ...prev, [id]: position }))
            }
          />
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

      {/* ── SECTION 2 · INTAKE — describe your business, meet your agent ── */}
      <section id="intake" className={styles.intakeSection} aria-label="Describe your business">
        <div className={styles.sectionBanner}>
          <p className={styles.sectionEyebrow}>step two · describe your business</p>
          <h2 className={styles.sectionHeading}>
            Tell your agent what it&rsquo;s working on.
          </h2>
          <p className={styles.sectionLede}>
            One paragraph in your own words. Assembl reads it and gives you a
            first answer you can steal — the repeated job it sees, the agent
            it&rsquo;d build, and what the first week looks like.
          </p>
        </div>
        <OneMinuteBusiness />
      </section>

      {/* ── SECTION 3 · TIME BACK — the estimator, pre-set to a sensible start ── */}
      <section id="time-back" className={styles.savingsSection} aria-label="Time back estimate">
        <div className={styles.sectionBanner}>
          <p className={styles.sectionEyebrow}>step three · time back</p>
          <h2 className={styles.sectionHeading}>How many hours could you get back?</h2>
          <p className={styles.sectionLede}>
            A plain planning estimate — your numbers, no form, no phone call.
          </p>
        </div>
        <TimeSavingsCalculator initialValues={INITIAL_SAVINGS} />
      </section>

      {/* ── SECTION 4 · CLOSING — hand it to us to build for real ── */}
      <section id="hand-off" className={styles.closingSection} aria-label="Hand it to us">
        <div className={styles.closingCard}>
          <p className={styles.sectionEyebrow}>step four · optional</p>
          <h2 className={styles.closingHeading}>Want us to build this properly for your business?</h2>
          <p className={styles.closingBody}>
            The one you just designed is a taste. If it lit up an idea for your team, drop your
            email — Kate at assembl reads them herself and comes back with a plain plan and price.
          </p>
          <p className={styles.closingMailto}>
            <a href="mailto:assembl@assembl.co.nz?subject=I%20built%20an%20agent%20on%20assembl">
              assembl@assembl.co.nz
            </a>
          </p>
          <p className={styles.closingFinePrint}>
            Draft-only. Nothing sends without a human yes. Made in Aotearoa.
          </p>
        </div>
      </section>
    </main>
  );
}
