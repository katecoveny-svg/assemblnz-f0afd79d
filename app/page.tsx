import type { Metadata } from 'next';
import styles from './splash.module.css';

export const metadata: Metadata = {
  title: 'assembl — a new site. very soon.',
  description: 'read signals · route work · move to proof. built in aotearoa by assembl.',
  alternates: { canonical: '/' },
};

/**
 * Coming-soon splash — Kate's call, 2026-07-02.
 *
 * The root is a single quiet card while the fresh marketing site is built in
 * its own repo (~/Desktop/assembl-marketing → staging.assembl.co.nz). Every
 * other route on this app stays exactly as it is so existing links keep
 * working; only `/` is the splash. No nav, no cards, no footer — the global
 * chrome suppresses itself on "/".
 */
export default function SplashPage() {
  return (
    <main className={styles.splash}>
      <h1 className={styles.wordmark}>
        assembl
        <span aria-hidden style={{ color: '#BFA37A' }}>
          .
        </span>
      </h1>
      <p className={styles.line}>a new site. very soon.</p>
      <p className={styles.micro}>read signals · route work · move to proof</p>
      <p className={styles.mail}>
        <a href="mailto:hello@assembl.co.nz">hello@assembl.co.nz</a>
      </p>
    </main>
  );
}
