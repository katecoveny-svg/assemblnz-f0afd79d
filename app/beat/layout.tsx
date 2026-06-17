import type { ReactNode } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import styles from './beat.module.css';

/**
 * Beat by assembl microsite shell. Self-contained chrome (its own nav + footer)
 * ported from beat-by-assembl-share.html — the global SiteHeader/SiteFooter are
 * suppressed on /beat routes (see components/site/site-header + site-footer).
 *
 * Type system is scoped to this subtree: Cormorant Garamond (display) is loaded
 * NORMAL-weight only — never italic — plus Inter (body) and JetBrains Mono
 * (labels/code). Exposed as --beat-display / --beat-body / --beat-mono and read
 * by beat.module.css.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal'],
  variable: '--beat-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--beat-body',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--beat-mono',
  display: 'swap',
});

export default function BeatLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.beat} ${cormorant.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <div className={styles.wrap}>
        <nav className={styles.navTop}>
          <Link href="/beat" className={styles.brandLink} aria-label="Beat by assembl — home">
            <span className={styles.wordmark}>
              <span className="b">Beat</span>
              <span className="by">BY</span>
              <span className="a">assembl</span>
            </span>
          </Link>
          <Link href="/beat#contact" className={styles.navCta}>
            Become a publisher
          </Link>
        </nav>

        {children}

        <footer className={styles.foot}>
          <p>© 2026 ASSEMBL NZ LIMITED · Beat by assembl is an assembl venture</p>
          <p className={styles.small}>
            Built in Aotearoa · Privacy Act 2020 native · NZ-only inventory
          </p>
          <p className={styles.footLinks}>
            <Link href="/beat/terms">Terms</Link>
            <Link href="/beat/privacy">Privacy</Link>
            <Link href="/beat/copyright">Copyright</Link>
            <a href="https://assembl.co.nz">assembl.co.nz</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
