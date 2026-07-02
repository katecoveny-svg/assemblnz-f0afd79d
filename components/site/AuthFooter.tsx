import Link from 'next/link';
import styles from './authChrome.module.css';

/**
 * Canon footer for signed-out auth surfaces. Replaces the global SiteFooter
 * (which carries the old Mārama Whenua kete-cutout mark) with a clean line:
 * the lowercase `assembl` wordmark + gold pill-dash, and a Space Mono note.
 */
export function AuthFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link href="/" aria-label="assembl — home" className={styles.footerBrand}>
          <span className={styles.brandWord}>assembl</span>
          <span className={styles.pillDash} aria-hidden />
        </Link>
        <p className={styles.footerNote}>© {year} assembl · Built in Aotearoa</p>
      </div>
    </footer>
  );
}
