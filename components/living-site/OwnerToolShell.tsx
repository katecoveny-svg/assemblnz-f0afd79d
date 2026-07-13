import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

export function OwnerToolShell({
  v,
  current,
  title,
  rootHref,
  siteHref,
  stripText,
  children,
}: {
  v: SampleVertical;
  current: 'crm' | 'documents' | 'studio';
  title: string;
  rootHref?: string;
  siteHref?: string;
  stripText?: string;
  children: ReactNode;
}) {
  const root = rootHref ?? `/living-site/${v.slug}/os`;
  const site = siteHref ?? `/living-site/${v.slug}`;
  const variables = {
    '--tool-ink': v.palette.ink,
    '--tool-accent': v.palette.accent,
    '--tool-bg': v.palette.bg,
    '--tool-card': v.palette.card,
    '--tool-muted': v.palette.muted,
  } as CSSProperties;
  return (
    <div className={styles.toolShell} style={variables}>
      <div className={styles.demoStrip}>
        <span>{stripText ?? `${v.businessName} · fictional sample data · owner tools are live`}</span>
        <Link href={site}>open customer site →</Link>
      </div>
      <header className={styles.toolHeader}>
        <div><p className={styles.eyebrow}>{v.industryLabel} · owner workspace</p><h1>{title}</h1></div>
        <Link href={root}>← today&apos;s overview</Link>
      </header>
      <nav className={styles.toolNav} aria-label="Owner tools">
        <Link href={root}>Today</Link>
        <Link href={`${root}/crm`} aria-current={current === 'crm' ? 'page' : undefined}>CRM & bookings</Link>
        <Link href={`${root}/documents`} aria-current={current === 'documents' ? 'page' : undefined}>Proposals & invoices</Link>
        <Link href={`${root}/studio`} aria-current={current === 'studio' ? 'page' : undefined}>Marketing studio</Link>
        <Link href={site}>Customer site</Link>
      </nav>
      <main className={styles.toolMain}>{children}</main>
    </div>
  );
}
