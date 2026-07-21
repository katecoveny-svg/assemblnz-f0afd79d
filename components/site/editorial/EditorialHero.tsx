import Link from 'next/link';

import styles from './editorial-home.module.css';
import { GenerativeBloom } from './GenerativeBloom';

const systemParts = [
  { label: 'knowledge', className: styles.nodeKnowledge },
  { label: 'abilities', className: styles.nodeAbilities },
  { label: 'approvals', className: styles.nodeApprovals },
  { label: 'connected apps', className: styles.nodeApps },
];

export function EditorialHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <header className={styles.nav}>
        <Link href="/" className={styles.wordmark} aria-label="assembl home">
          assembl
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <a href="#how-it-works">how it works</a>
          <a href="#concepts">live concepts</a>
          <Link href="/pricing">pricing</Link>
        </nav>

        <Link href="/build-an-agent" className={styles.navAction}>
          build an agent <span aria-hidden>↗</span>
        </Link>
      </header>

      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <span aria-hidden /> your business, intelligently assembled
          </p>
          <h1 id="home-heading" className={styles.heroHeading}>
            less admin.
            <em>more mahi.</em>
          </h1>
          <p className={styles.heroLede}>
            assembl turns what your business already knows into a visible team of agents —
            connected to your tools, working inside clear boundaries, and waiting for your yes.
          </p>
          <div className={styles.heroActions}>
            <Link href="/build-an-agent" className={styles.primaryAction}>
              assemble my business <span aria-hidden>→</span>
            </Link>
            <a href="#how-it-works" className={styles.textAction}>
              see the whole system
            </a>
          </div>
          <div className={styles.heroProof} aria-label="Assembl promises">
            <span>made in Aotearoa</span>
            <span>visible by design</span>
            <span>nothing sends without you</span>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="An organic generative form representing a business assembling into a connected agent system">
          <div className={styles.visualPlate}>
            <div className={styles.plateHeader}>
              <span>assembl intelligence · live system</span>
              <span className={styles.liveState}><i aria-hidden /> forming</span>
            </div>

            <div className={styles.assembly}>
              <GenerativeBloom />
              <div className={styles.bloomLabels} aria-hidden>
                {systemParts.map((part, index) => (
                  <div key={part.label} className={`${styles.systemNode} ${part.className}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{part.label}</strong>
                  </div>
                ))}
              </div>
              <p className={styles.bloomCaption}>A business is not a blob of data.<br />It is a living set of relationships.</p>
            </div>

            <div className={styles.activityStrip}>
              <span className={styles.activityIcon} aria-hidden>↓</span>
              <span><strong>scroll to assemble</strong> · knowledge becomes useful work</span>
              <time>01 / 04</time>
            </div>
          </div>
          <p className={styles.figureCaption}>01 · a business you can see into</p>
        </div>
      </div>

      <a href="#how-it-works" className={styles.scrollCue} aria-label="Continue to how it works">
        <span>keep going</span>
        <i aria-hidden />
      </a>
    </section>
  );
}
