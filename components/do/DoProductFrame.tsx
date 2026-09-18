'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { DoMark } from './DoMark';
import { DoInstallPwaCta } from './DoInstallPwaCta';
import styles from './do-product-focus.module.css';

/** Shared task chrome. Secondary tools do not compete with the task in front of you. */
export function DoProductFrame({ product, children, board = 'portable-widget' }: {
  product: string; children: ReactNode; board?: string;
}) {
  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link href="/do/widget" className={styles.brand} aria-label="DO workspace">
        <span className={styles.mark}><DoMark /></span><span>DO <small>/ {product}</small></span>
      </Link>
      <details className={styles.menu}>
        <summary aria-label="More DO tools">More <span aria-hidden="true">＋</span></summary>
        <div className={styles.menuPanel}>
          <p className={styles.kicker}>YOUR WORKSPACE</p>
          <Link href="/do/widget">Writing, voice &amp; vision</Link>
          <Link href="/do/meetings">Meeting notes</Link>
          <Link href="/do/office">Office</Link>
          <Link href={`/do/tasks?board=${encodeURIComponent(board)}`}>Saved tasks</Link>
          <Link href="/do/connections">Connections</Link>
          <Link href="/do/typesafe">TypeSafe pilot</Link>
          <Link href="/do/install">Install DO</Link>
          <DoInstallPwaCta compact />
        </div>
      </details>
    </header>
    {children}
    <footer className={styles.footer}><Link href="/">by assembl</Link><span>your context. your call.</span></footer>
  </main>;
}
