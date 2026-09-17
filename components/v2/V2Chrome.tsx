import Link from 'next/link';
import { PUBLIC_NAV_LINKS } from '@/lib/public-site';
import styles from './v2.module.css';

/** Public studio chrome. Server-safe: Instrument Sans + plum canon. */

function NavItem({
  href,
  label,
  current,
  external,
}: {
  href: string;
  label: string;
  current?: string;
  external?: boolean;
}) {
  const active = !external && current === href;
  const className = styles.navLink;
  const style = active ? { color: '#916A70' } : undefined;
  const mark = active ? (
    <span aria-hidden style={{ color: '#916A70' }}>
      {' '}
      •
    </span>
  ) : null;
  if (external) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        {mark}
      </a>
    );
  }
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={className} style={style}>
      {label}
      {mark}
    </Link>
  );
}

export function V2Nav({ current }: { current?: string }) {
  return (
    <nav className={styles.nav} aria-label="Primary" data-global-chrome>
      <Link href="/" aria-label="assembl — home" className={styles.navWordmark}>
        <span className={styles.navWordmarkText}>assembl</span>
        <span className={styles.navTag}>find it · do it · show it</span>
      </Link>
      <div className={styles.navLinks}>
        {PUBLIC_NAV_LINKS.map((l) => (
          <NavItem
            key={l.href}
            href={l.href}
            label={l.label}
            current={current}
            external={'external' in l ? Boolean(l.external) : false}
          />
        ))}
      </div>
      <div className={styles.navUtilities}>
        <Link href="/login?redirect=%2Fdo%2Fmeetings" className={`${styles.navLink} ${styles.navSignIn}`}>
          sign in
        </Link>
        <Link href="/do" className={styles.navCta}>
          Try DO
          <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
            ↗
          </span>
        </Link>
      </div>
    </nav>
  );
}

/** Quiet evidence strip — mono only for proof/wait labels. */
export function MottoStrip() {
  return (
    <div className={styles.motto}>
      <span className={styles.mottoLabel}>find it · do it · show it</span>
      <span aria-hidden style={{ color: '#916A70', fontSize: 12, lineHeight: 1 }}>
        •
      </span>
    </div>
  );
}
