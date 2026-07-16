import Link from 'next/link';
import { palette, motto } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import styles from './v2.module.css';

/**
 * v2 marketing chrome — the glass nav + motto strip from the locked direction,
 * for surfaces that ship their own chrome (/ and /agents suppress the global
 * SiteHeader). Server-safe: pure links, motion lives in CSS.
 */

const NAV_LINKS = [
  { href: '/how-it-works', label: 'how it works' },
  { href: '/living-site', label: 'living site' },
  { href: '/pilot', label: 'build an agent' },
  { href: '/pricing', label: 'pricing' },
  { href: '/about', label: 'about' },
];

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
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? 'page' : undefined}
            className={styles.navLink}
            style={current === l.href ? { color: palette.ink } : undefined}
          >
            {l.label}
            {current === l.href ? (
              <span aria-hidden style={{ color: palette.accentGold }}>
                {' '}
                •
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href="/login" className={styles.navLink}>
          sign in
        </Link>
        <Link href="/pilot" className={styles.navCta}>
          build an agent
          <span aria-hidden style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}>
            •
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
      <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
        •
      </span>
    </div>
  );
}
