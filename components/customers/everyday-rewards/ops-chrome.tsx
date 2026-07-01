'use client';

/**
 * Everyday Rewards × Dash — Partner Operations console chrome (back-of-house).
 * Desktop sidebar + sticky topbar. Everyday Rewards brand; team-facing operator
 * surface. concept · pending — no live Everyday Rewards partnership.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/customers/everyday-rewards/ops/ops.module.css';
import { RLeafMark } from './marks';

const OPS = '/customers/everyday-rewards/ops';

const NAV = [
  { href: OPS, label: 'Overview', key: 'overview' },
  { href: `${OPS}/sponsors`, label: 'Sponsors', key: 'sponsors' },
  { href: `${OPS}/tiers`, label: 'Tiers & incentives', key: 'tiers' },
  { href: `${OPS}/campaigns`, label: 'Earn scheduling', key: 'campaigns' },
  { href: `${OPS}/reconciliation`, label: 'Reconciliation', key: 'reconciliation' },
  { href: `${OPS}/liability`, label: 'Points liability', key: 'liability' },
  { href: `${OPS}/analytics`, label: 'Segment analytics', key: 'analytics' },
  { href: `${OPS}/compliance`, label: 'Compliance', key: 'compliance' },
  { href: `${OPS}/comms`, label: 'Comms drafting', key: 'comms' },
  { href: `${OPS}/brief`, label: 'CDMO daily brief', key: 'brief' },
];

export function OpsSidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <RLeafMark size={26} />
        <div>
          <div className={styles.brandText}>Everyday Rewards</div>
          <div className={styles.brandSub}>Partner Ops · Dash</div>
        </div>
      </div>
      {NAV.map((n) => {
        const active = n.href === OPS ? pathname === OPS : pathname.startsWith(n.href);
        return (
          <Link
            key={n.key}
            href={n.href}
            className={`${styles.navItem} ${active ? styles.active : ''}`}
          >
            <span className={styles.navDot} aria-hidden />
            {n.label}
          </Link>
        );
      })}
      <div className={styles.sidebarFoot}>
        concept · pending
        <br />
        <Link href="/customers/everyday-rewards/dash">← shopper demo</Link>
        <br />
        <span className={styles.assemblMark}>assembl</span> × everyday rewards
      </div>
    </aside>
  );
}

export function OpsTopbar({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={styles.topbar}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.title}>{title}</div>
      </div>
      <span className={styles.conceptPill}>
        <span
          style={{ width: 6, height: 6, borderRadius: 999, background: '#fd6400' }}
          aria-hidden
        />
        concept · assembl × everyday rewards
      </span>
    </div>
  );
}
