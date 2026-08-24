'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PitchDemo } from '@/lib/pitch-demos';
import styles from './pitch.module.css';

type Props = { demo: PitchDemo };

export function PitchDemoView({ demo }: Props) {
  const [choice, setChoice] = useState<number | null>(null);
  const [mode, setMode] = useState<'customer' | 'buyer'>('customer');
  const [approved, setApproved] = useState(false);

  const isKeepWaiting = choice === demo.choices.length - 1;
  const prepared = useMemo(() => {
    if (choice === null || isKeepWaiting) return demo.preparedBefore;
    return demo.preparedAfter;
  }, [choice, isKeepWaiting, demo]);

  return (
    <main className={styles.page} style={{ '--client': demo.accent } as CSSProperties}>
      <header className={styles.nav}>
        <a href="/" className={styles.wordmark}>assembl</a>
        <div className={styles.brandlock}><span>{demo.company}</span><i>×</i><span>assembl</span></div>
        <div className={styles.switcher} aria-label="Demo view">
          <button className={mode === 'customer' ? styles.active : ''} onClick={() => setMode('customer')}>customer</button>
          <button className={mode === 'buyer' ? styles.active : ''} onClick={() => setMode('buyer')}>buyer case</button>
        </div>
      </header>

      {mode === 'customer' ? (
        <>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{demo.eyebrow}</p>
              <h1>{demo.headline}</h1>
              <p className={styles.lede}>{demo.support}</p>
              <div className={styles.sequence} aria-label="assembl journey sequence">
                <span>TRIGGER</span><b>→</b><span>PERMISSION</span><b>→</b><span>PREPARATION</span><b>→</b><span>REVIEW</span><b>→</b><span>PROOF</span>
              </div>
            </div>

            <div className={styles.stage}>
              <div className={styles.parts} aria-hidden="true">
                <span className={styles.partOne} />
                <span className={styles.partTwo} />
                <span className={styles.partThree} />
                <span className={styles.thread} />
              </div>
              <div className={styles.phone}>
                <div className={styles.phoneTop}><span>PROPOSED / SIMULATED</span><span>09:41</span></div>
                <div className={styles.phoneHead}>
                  <span className={styles.stateDot} />
                  <div><small>current state</small><strong>{demo.state}</strong></div>
                </div>
                <div className={styles.waitCard}>
                  <p>{demo.offer}</p>
                  <div className={styles.choices}>
                    {demo.choices.map((item, index) => (
                      <button
                        key={item}
                        className={choice === index ? styles.choiceActive : ''}
                        onClick={() => { setChoice(index); setApproved(false); }}
                      >
                        <span>{index === demo.choices.length - 1 ? '○' : '→'}</span>{item}
                      </button>
                    ))}
                  </div>
                  <p className={styles.permission}>Optional. Your primary service continues if you skip.</p>
                </div>
                <div className={styles.outputCard}>
                  <div className={styles.outputHead}><small>prepared output</small><strong>{demo.preparedTitle}</strong></div>
                  <ul>{prepared.map(item => <li key={item}>{item}</li>)}</ul>
                  {choice !== null && !isKeepWaiting && (
                    <button className={styles.reviewButton} onClick={() => setApproved(v => !v)}>
                      {approved ? '✓ ready for reviewer' : 'review what will be shared'}
                    </button>
                  )}
                </div>
                <div className={styles.handoff}>
                  <span>named reviewer</span>
                  <strong>{demo.reviewer}</strong>
                  <small>{approved ? 'Prepared brief ready. No customer action has been taken automatically.' : 'Nothing is sent until the defined review path is met.'}</small>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.explain}>
            <div>
              <p className={styles.kicker}>WHAT CHANGED?</p>
              <h2>The customer’s answer changes the prepared next step.</h2>
            </div>
            <div className={styles.explainGrid}>
              <article><span>01</span><h3>A real process is already running.</h3><p>The wait is not invented to create an interaction.</p></article>
              <article><span>02</span><h3>One optional input earns its place.</h3><p>If the answer does not change the checklist, brief or handoff, assembl should not ask it.</p></article>
              <article><span>03</span><h3>The next person starts prepared.</h3><p>Sources, permissions, customer changes and the reviewer are recorded with the handoff.</p></article>
            </div>
          </section>
        </>
      ) : (
        <section className={styles.buyer}>
          <div className={styles.buyerHero}>
            <p className={styles.kicker}>{demo.sector.toUpperCase()} · FIRST PILOT</p>
            <h1>One wait. One prepared output. One team still responsible.</h1>
            <p>{demo.pilot}</p>
          </div>

          <div className={styles.journey}>
            {demo.journey.map((step, i) => (
              <article key={step.label}><span>0{i + 1}</span><strong>{step.label}</strong><p>{step.detail}</p></article>
            ))}
          </div>

          <div className={styles.buyerGrid}>
            <article className={styles.boundary}><p className={styles.kicker}>BOUNDARY</p><h2>What assembl does not decide.</h2><p>{demo.boundary}</p></article>
            <article className={styles.measure}><p className={styles.kicker}>MEASURE BEFORE CLAIMING</p><h2>What the pilot should prove.</h2><ul>{demo.measures.map(item => <li key={item}>{item}</li>)}</ul></article>
          </div>

          <div className={styles.source}>
            <div><span>SOURCE BASIS</span><p>{demo.source}</p></div>
            <a href={demo.sourceHref} target="_blank" rel="noreferrer">open source ↗</a>
          </div>

          <div className={styles.close}>
            <p className={styles.kicker}>ASSEMBL · ACTIVE CUSTOMER JOURNEYS</p>
            <h2>Where are your customers waiting today?</h2>
            <a href="/contact">Discuss one customer wait →</a>
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <span>Independent concept. Not commissioned by or affiliated with {demo.company}.</span>
        <span>Mahi that earns its proof.</span>
      </footer>
    </main>
  );
}
