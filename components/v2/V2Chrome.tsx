import Link from 'next/link';
import { motto } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { PUBLIC_NAV_LINKS } from '@/lib/public-site';
import styles from './v2.module.css';

/** Public studio chrome. Server-safe: pure links, motion lives in CSS. */

export function V2Nav({ current }: { current?: string }) {
  return (
    <nav className={styles.nav} aria-label="Primary" data-global-chrome>
      {/* Lato, not the Cormorant cut — the serif wordmark on a cream bar was
          the old branding, and it read as a different company's header sitting
          on top of every navy page. Matches the cinematic nav lockup exactly. */}
      <Link href="/" aria-label="assembl — home" className={styles.navWordmark}>
        <span className={styles.navWordmarkText}>assembl</span>
        <span className={styles.navTag}>intuitive agentic customer journeys</span>
      </Link>
      <div className={styles.navLinks}>
        {PUBLIC_NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? 'page' : undefined}
            className={styles.navLink}
            /* was palette.ink — dark ink on the navy bar made the current
               page's own link the one you could not read */
            style={current === l.href ? { color: '#D4A843' } : undefined}
          >
            {l.label}
            {current === l.href ? (
              <span aria-hidden style={{ color: '#D4A843' }}>
                {' '}
                •
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <div className={styles.navUtilities}>
        <Link href="/login" className={`${styles.navLink} ${styles.navSignIn}`}>
          sign in
        </Link>
        {/* The old /a builder is superseded by the cinematic /build-an-agent. */}
        <Link href="/build-an-agent" className={styles.navCta}>
          assemble an agent
          <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
            ↗
          </span>
        </Link>
      </div>
    </nav>
  );
}

/** The locked motto strip — ADAPTIVE. CONNECTED. PURPOSE-BUILT. */
export function MottoStrip() {
  return (
    <div className={styles.motto}>
      <MicroLabel>{motto}</MicroLabel>
      <span aria-hidden style={{ color: '#8e928f', fontSize: 12, lineHeight: 1 }}>
        •
      </span>
    </div>
  );
}
