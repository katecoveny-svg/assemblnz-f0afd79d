'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { DoMark } from './DoMark';
import { DoInstallPwaCta } from './DoInstallPwaCta';
import styles from './do-product-focus.module.css';

const subscribe = () => () => {};
const isEmbedded = () => window.self !== window.top;
/** Same embed rule as the existing DoWorkspaceLinks. No cookie or permission changes. */
export function useDoEmbeddedSurface() {
  return useSyncExternalStore(subscribe, isEmbedded, () => true);
}

/** Shared task chrome. Secondary tools do not compete with the task in front of you. */
export function DoProductFrame({ product, children, board = 'portable-widget' }: {
  product: string; children: ReactNode; board?: string;
}) {
  const embedded = useDoEmbeddedSurface();
  const linkProps = embedded ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link href="/do/widget" {...linkProps} className={styles.brand} aria-label="DO workspace">
        <span className={styles.mark}><DoMark /></span><span>DO <small>/ {product}</small></span>
      </Link>
      <details className={styles.menu}>
        <summary aria-label="More DO tools">More <span aria-hidden="true">＋</span></summary>
        <div className={styles.menuPanel}>
          <p className={styles.kicker}>YOUR WORKSPACE</p>
          <Link href="/do/widget" {...linkProps}>Writing, voice &amp; vision</Link>
          <Link href="/do/meetings" {...linkProps}>Meeting notes</Link>
          <Link href="/do/office" {...linkProps}>Office</Link>
          <Link href={`/do/tasks?board=${encodeURIComponent(board)}`} {...linkProps}>Saved tasks</Link>
          <Link href="/do/connections" {...linkProps}>Connections</Link>
          <Link href="/do/typesafe" {...linkProps}>TypeSafe pilot</Link>
          <Link href="/login?redirect=%2Fdo%2Fwidget" {...linkProps}>Sign in</Link>
          <Link href="/do/install" {...linkProps}>Install DO</Link>
          {!embedded && <DoInstallPwaCta compact />}
        </div>
      </details>
    </header>
    {children}
    <footer className={styles.footer}><Link href="/" {...linkProps}>by assembl</Link><span>your context. your call.</span></footer>
  </main>;
}
