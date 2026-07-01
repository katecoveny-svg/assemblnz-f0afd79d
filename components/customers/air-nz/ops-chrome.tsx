'use client';

/**
 * Air New Zealand × Dash — Partner Operations console chrome (back-of-house).
 * Desktop sidebar + sticky topbar. Air NZ brand; team-facing operator surface.
 * concept · demo pending — no live Air NZ partnership.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/customers/air-nz/ops/ops.module.css';
import { KoruMark } from './KoruMark';

const OPS = '/customers/air-nz/ops';

const NAV = [
  { href: OPS, label: 'Overview', key: 'overview' },
  { href: `${OPS}/sponsors`, label: 'Sponsors', key: 'sponsors' },
  { href: `${OPS}/campaigns`, label: 'Campaigns', key: 'campaigns' },
  { href: `${OPS}/revenue`, label: 'Revenue split', key: 'revenue' },
  { href: `${OPS}/analytics`, label: 'Segment analytics', key: 'analytics' },
  { href: `${OPS}/compliance`, label: 'Compliance', key: 'compliance' },
  { href: `${OPS}/comms`, label: 'Comms drafting', key: 'comms' },
  { href: `${OPS}/loyalty`, label: 'Koru reconciliation', key: 'loyalty' },
  { href: `${OPS}/brief`, label: 'CDO daily brief', key: 'brief' },
];

export function OpsSidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <KoruMark size={22} />
        <div>
          <div className={styles.brandText}>Air New Zealand</div>
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
        concept · demo pending
        <br />
        <Link href="/customers/air-nz/dash">← passenger demo</Link>
        <br />
        <span className={styles.assemblMark}>assembl</span> × Koru
      </div>
    </aside>
  );
}

export function OpsTopbar({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={styles.topbar}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.title}>{title}</div>
      </div>
      <span className={styles.conceptPill}>
        <span
          style={{ width: 6, height: 6, borderRadius: 999, background: '#00b0b9' }}
          aria-hidden
        />
        concept · assembl × Air New Zealand
      </span>
    </div>
  );
}
