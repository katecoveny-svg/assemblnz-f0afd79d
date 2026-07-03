'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TickerNumber } from '@/lib/motion';
import styles from '@/app/customers/contact-energy/contact.module.css';
import { useCredits } from './CreditsProvider';

/**
 * Chrome for the Contact Energy × Assembling pitch concept: Contact's own
 * brand (verified red, Montserrat, pill buttons) is primary; the assembl earn
 * layer carries champagne gold only. Concept demo — not a live Contact asset.
 */

const NAV = [
  { label: 'Home', href: '/customers/contact-energy' },
  { label: 'Bill', href: '/customers/contact-energy#bill' },
  { label: 'Usage', href: '/customers/contact-energy#usage' },
  { label: 'Plans', href: '/customers/contact-energy#plans' },
  { label: 'Assembling', href: '/customers/contact-energy/assembling' },
  { label: 'Support', href: '/customers/contact-energy#support' },
];

export function ContactSidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <Image
          src="/brand/contact-energy/logo-official.png"
          alt="Contact Energy (pitch concept)"
          width={123}
          height={44}
          priority
        />
      </div>
      <nav className={styles.sidebarNav} aria-label="Demo app navigation">
        {NAV.map((item) => {
          const isLedger = item.href.endsWith('/assembling');
          const active = isLedger
            ? pathname?.startsWith('/customers/contact-energy/assembling')
            : item.label === 'Home' && pathname === '/customers/contact-energy';
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${
                isLedger ? styles.navItemGold : ''
              }`}
            >
              {isLedger ? <span className={styles.goldDot} aria-hidden /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.sidebarFoot}>
        <span className={styles.sidebarFootLine}>earn layer by</span>
        <span className={styles.sidebarFootMark}>assembl</span>
        <span className={styles.sidebarFootMotto}>adaptive · connected · purpose-built</span>
      </div>
    </aside>
  );
}

/** Floating month-to-date credit tally — the gold corner. */
export function CreditsCorner() {
  const { credits, pulseKey } = useCredits();
  return (
    <div className={styles.creditsCorner} role="status" aria-live="polite">
      <span key={pulseKey} className={styles.creditsDot} aria-hidden />
      <span className={styles.creditsAmount}>
        <TickerNumber value={credits} decimals={2} prefix="$" durationMs={700} />
        <span className={styles.creditsLabel}> saved this month · applied to next bill</span>
      </span>
    </div>
  );
}

/** Hairline pitch-concept disclaimer across the top of every screen. */
export function ConceptTop() {
  return (
    <div className={styles.conceptTop}>
      <span className={styles.conceptTopDot} aria-hidden />
      Contact Energy × Assembling — pitch concept. Not a live Contact Energy asset; no partnership exists.
    </div>
  );
}

/** Persistent corner label: demo, illustrative, no real credits. */
export function ConceptCorner() {
  return <div className={styles.conceptCorner}>demo · illustrative figures · not real credits</div>;
}
