'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { DoEntryDisclosure } from './DoEntryDisclosure';
import { DO_TOOL_LINKS } from '@/apps/do/shared/entry-capabilities';
import styles from './do-secondary-navigation.module.css';

/** Navigation only: opening a disclosure never changes a mounted editor or call. */
export function DoSecondaryNavigation({ embedded = false, children }: { embedded?: boolean; children?: ReactNode }) {
  const linkProps = embedded ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <DoEntryDisclosure className={styles.menu}>
    <summary>More <span aria-hidden="true">＋</span></summary>
    <nav data-do-overlay-panel="360" className={styles.panel} aria-label="More DO tools">
      <p className={styles.title}>Your DO workspace</p>
      <Link href="/do" {...linkProps}>My DO</Link>
      <Link href="/do/widget" {...linkProps}>Open capture workspace</Link>
      <Link href="/do/memory" {...linkProps}>What DO remembers</Link>
      <details className={styles.tools}>
        <summary>Tools &amp; examples <span aria-hidden="true">＋</span></summary>
        <p>Each tool states what works and what needs a connection.</p>
        {DO_TOOL_LINKS.map(item => <Link key={item.href} href={item.href} {...linkProps}>{item.label}<small>{item.limit}</small></Link>)}
      </details>
      {children}
      <Link href="/do/install" {...linkProps}>Install DO</Link>
      <Link href="/legal/privacy" {...linkProps}>Privacy</Link>
    </nav>
  </DoEntryDisclosure>;
}
