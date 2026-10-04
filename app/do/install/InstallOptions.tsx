'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './install.module.css';

/** Old #chrome/#mac bookmarks open the relevant setup, even while it is secondary. */
export function InstallOptions({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = () => {
      const hash = window.location.hash;
      if (!['#chrome', '#mac', '#keyboard'].includes(hash)) return;
      if (root.current) root.current.open = true;
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
    };
    reveal(); window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  return <details className={styles.developer} ref={root}><summary>Other ways to use DO <span aria-hidden="true">＋</span></summary>{children}</details>;
}
