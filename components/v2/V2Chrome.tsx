import Link from 'next/link';
import { palette, motto } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import { PUBLIC_NAV_LINKS } from '@/lib/public-site';
import styles from './v2.module.css';

/** Public studio chrome. Server-safe: pure links, motion lives in CSS. */

export function V2Nav({ current }: { current?: string }) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <Link
        href="/"
        aria-label="assembl — home"
        style={{ textDecoration: 'none', color: palette.ink }}
      >
        <AssemblWordmark
          className="text-[26px] leading-none"
          style={{ letterSpacing: '0.14em' }}
        />
      </Link>
      <div className={styles.navLinks}>
        {PUBLIC_NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? 'page' : undefined}
            className={styles.navLink}
            style={current === l.href ? { color: palette.ink } : undefined}
          >
            {l.label}
            {current === l.href ? (
              <span aria-hidden style={{ color: '#8e928f' }}>
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
        <Link href="/a" className={styles.navCta}>
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
