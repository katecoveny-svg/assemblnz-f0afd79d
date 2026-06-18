import type { ReactNode } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import styles from './dash.module.css';

/**
 * Dash by assembl microsite shell. Self-contained chrome (its own nav + footer)
 * ported from dash-by-assembl-share.html — the global SiteHeader/SiteFooter are
 * suppressed on /dash routes (see components/site/site-header + site-footer).
 *
 * Type system is scoped to this subtree: Cormorant Garamond (display) is loaded
 * NORMAL-weight only — never italic — plus Inter (body) and JetBrains Mono
 * (labels/code). Exposed as --dash-display / --dash-body / --dash-mono and read
 * by dash.module.css.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal'],
  variable: '--dash-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--dash-body',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--dash-mono',
  display: 'swap',
});

export default function DashLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.dash} ${cormorant.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <div className={styles.wrap}>
        <nav className={styles.navTop}>
          <Link href="/dash" className={styles.brandLink} aria-label="Dash by assembl — home">
            <span className={styles.wordmark}>
              <span className="b">Dash</span>
              <span className="by">BY</span>
              <span className="a">assembl</span>
            </span>
          </Link>
          <Link href="/dash#contact" className={styles.navCta}>
            Become a publisher
          </Link>
        </nav>

        {children}

        <footer className={styles.foot}>
          <p>© 2026 ASSEMBL NZ LIMITED · Dash by assembl is an assembl venture</p>
          <p className={styles.small}>
            Built in Aotearoa · Privacy Act 2020 native · NZ-only inventory
          </p>
          <p className={styles.footLinks}>
            <Link href="/dash/terms">Terms</Link>
            <Link href="/dash/privacy">Privacy</Link>
            <Link href="/dash/copyright">Copyright</Link>
            <a href="https://assembl.co.nz">assembl.co.nz</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
