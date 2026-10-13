'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import styles from './do-secondary-navigation.module.css';

/** Navigation only: opening a disclosure never changes a mounted editor or call. */
export function DoSecondaryNavigation({ embedded = false, children }: { embedded?: boolean; children?: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const linkProps = embedded ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <details ref={menu} className={styles.menu} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation();
    if (menu.current) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); }
  }}>
    <summary>More <span aria-hidden="true">＋</span></summary>
    <nav className={styles.panel} aria-label="More DO tools">
      <Link href="/do" {...linkProps}>My DO</Link>
      <Link href="/do/widget" {...linkProps}>Open capture workspace</Link>
      <details className={styles.tools}>
        <summary>Tools &amp; examples <span aria-hidden="true">＋</span></summary>
        <p>Specialist tools and sample workspaces.</p>
        <Link href="/do/meetings" {...linkProps}>Meeting notes · sign in</Link>
        <Link href="/do/messages" {...linkProps}>Conversations and replies</Link>
        <Link href="/do/bills" {...linkProps}>Bills · examples and CSV</Link>
        <Link href="/do/builder" {...linkProps}>Builder · prepare a plan</Link>
        <Link href="/do/household" {...linkProps}>Household · sample workspace</Link>
        <Link href="/creative-studio/voices" {...linkProps}>Voice studio</Link>
        <Link href="/do/enquiries" {...linkProps}>Enquiry replies · private pilot</Link>
      </details>
      {children}
      <Link href="/do/install" {...linkProps}>Install DO</Link>
      <Link href="/legal/privacy" {...linkProps}>Privacy</Link>
    </nav>
  </details>;
}
