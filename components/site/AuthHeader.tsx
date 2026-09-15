import Link from 'next/link';
import styles from './authChrome.module.css';

/**
 * Canon header for signed-out auth surfaces (/login, /start/signup, /auth/*).
 *
 * Uses the current assembl company frame: lowercase wordmark, Instrument Sans,
 * plum/rose/paper palette and restrained translucent navigation. The global
 * SiteHeader is suppressed on these routes (see site-header.tsx → isAuthSurface)
 * so this is the single header rendered.
 */
export function AuthHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" aria-label="assembl — home" className={styles.brand}>
          <span className={styles.brandWord}>assembl</span>
          <span className={styles.pillDash} aria-hidden />
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link href="/genome" className={styles.cta}>
          Try the demo
        </Link>
      </div>
    </header>
  );
}
