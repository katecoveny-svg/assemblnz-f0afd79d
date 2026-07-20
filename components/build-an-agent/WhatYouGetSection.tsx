'use client';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import { useReveal } from './useReveal';
import styles from './what-you-get-section.module.css';

/**
 * The platform promise — the agent the visitor just built is one part;
 * this is the operating system it deploys into. Seven surfaces, business
 * language only, each linked to a live demo where one exists publicly.
 * Cards without a link are labelled honestly as pilot-workspace surfaces
 * (canon: never claim a simulated thing is live).
 */
export function WhatYouGetSection() {
  const copy = BUILD_AN_AGENT.whatYouGet;
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section
      id="what-you-get"
      ref={ref}
      className={`${styles.root} reveal ${shown ? 'revealShown' : ''}`}
      aria-label="What you get with assembl"
    >
      <div className="chromeField" aria-hidden />
      <header className={`${styles.banner} glowSoft`} data-parallax="0.05">
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <ul className={styles.grid}>
        {copy.cards.map((card) => (
          <li key={card.id} className={`${styles.card} revealChild liftCard glassPanel`}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardBody}>{card.body}</p>
            {card.href && card.cta ? (
              <a className={styles.cardLink} href={card.href}>
                {card.cta}
                <span aria-hidden className={styles.cardArrow}>→</span>
              </a>
            ) : (
              <span className={styles.cardNote}>{copy.unlinkedNote}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
