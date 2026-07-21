import Link from 'next/link';

import { AgentGalleryRoom } from './AgentGalleryRoom';
import styles from './gallery-hero.module.css';

export function EditorialHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <header className={styles.nav}>
        <Link href="/" className={styles.wordmark} aria-label="assembl home">
          assembl
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <a href="#gallery">the agent gallery</a>
          <a href="#how-it-works">how it works</a>
          <Link href="/pricing">pricing</Link>
        </nav>

        <Link href="/build-an-agent" className={styles.navAction}>
          build an agent <span aria-hidden>↗</span>
        </Link>
      </header>

      <div id="gallery" className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>your business, intelligently assembled</p>
          <h1 id="home-heading" className={styles.heading}>
            <span>build intelligence</span>
            <em>you can understand.</em>
          </h1>
          <p className={styles.lede}>
            Build a useful agent from six visible parts. It knows your business, works inside
            clear boundaries and brings every important action back for your yes.
          </p>
          <div className={styles.heroActions}>
            <Link href="/build-an-agent" className={styles.primaryAction}>
              assemble your agent <span aria-hidden>→</span>
            </Link>
            <a href="#gallery" className={styles.textAction}>
              explore the six parts
            </a>
          </div>
          <div className={styles.proof} aria-label="assembl promises">
            <span>made in Aotearoa</span>
            <span>visible by design</span>
            <span>nothing sends without you</span>
          </div>
        </div>
        <AgentGalleryRoom />
      </div>
    </section>
  );
}
