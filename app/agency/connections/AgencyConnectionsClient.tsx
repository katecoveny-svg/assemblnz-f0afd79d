'use client';

import Link from 'next/link';
import { MetaBusinessCard } from '@/components/agency/MetaBusinessCard';
import styles from '@/components/agency/meta-business.module.css';

export function AgencyConnectionsClient() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">assembl</Link>
        <nav aria-label="Connections">
          <Link className={styles.navPill} href="/pursuit">Pursuit</Link>
          <Link className={styles.navPill} href="/do/connections">DO connections</Link>
          <Link className={styles.navPill} href="/legal/privacy">Privacy</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Pursuit · agency desk</p>
          <h1>Connections.</h1>
          <p className={styles.lede}>
            Connect Meta Business once, then pick the Portfolio, Page, Instagram and Ad Account
            Assembl should read. Tokens stay vaulted. Paid activation stays off.
          </p>
        </section>

        <MetaBusinessCard />

        <p className={styles.footnote}>
          Meta is an optional user-connected integration. Assembl does not run Facebook Pixel
          on the public marketing site. See{' '}
          <Link href="/legal/meta-data-deletion">Meta data deletion</Link>
          {' '}and the{' '}
          <Link href="/legal/privacy">privacy policy</Link>.
        </p>
      </main>
    </div>
  );
}
