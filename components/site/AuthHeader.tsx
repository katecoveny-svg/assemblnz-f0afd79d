import Link from 'next/link';
import { AssemblGlassMark } from './AssemblGlassMark';
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
          <AssemblGlassMark size={30} /><span className={styles.brandWord}>assembl</span>
          <span className={styles.pillDash} aria-hidden />
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link href="/do" className={styles.cta}>
          Open DO
        </Link>
      </div>
    </header>
  );
}
