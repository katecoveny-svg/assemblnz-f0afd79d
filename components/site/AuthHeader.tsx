import Link from 'next/link';
import styles from './authChrome.module.css';

/**
 * Canon header for signed-out auth surfaces (/login, /start/signup, /auth/*).
 *
 * Lowercase Cormorant `assembl` wordmark + canary pill-dash on the left (always
 * a link to `/` so a signed-out visitor can always get back to the homepage),
 * glass-pill nav on the right. Mirrors the homepage canon nav. The global
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
          <Link href="/agents">Agents</Link>
          <Link href="/agents/pricing">Pricing</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link href="/agents" className={styles.cta}>
          Browse agents
        </Link>
      </div>
    </header>
  );
}
