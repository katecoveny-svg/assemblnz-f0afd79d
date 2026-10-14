'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore, type ReactNode } from 'react';
import { DoSecondaryNavigation } from './DoSecondaryNavigation';
import { DoShareButton } from './DoShareButton';
import { DoBrand } from './DoBrand';
import { DoInstallPwaCta } from './DoInstallPwaCta';
import styles from './do-product-focus.module.css';
import { doReturnPath } from '@/lib/do/navigation';

const subscribe = () => () => {};
const isEmbedded = () => window.self !== window.top;
const currentQuery = () => window.location.search;
/** Same embed rule as the existing DoWorkspaceLinks. No cookie or permission changes. */
export function useDoEmbeddedSurface() {
  return useSyncExternalStore(subscribe, isEmbedded, () => true);
}

/** Shared task chrome. Secondary tools do not compete with the task in front of you. */
export function DoProductFrame({ product, children }: {
  product: string; children: ReactNode; board?: string;
}) {
  const embedded = useDoEmbeddedSurface();
  const pathname = usePathname();
  const query = useSyncExternalStore(subscribe, currentQuery, () => "");
  const linkProps = embedded ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><DoBrand {...linkProps} /><span className={styles.surfaceName}>{product}</span></div>
      <div className={styles.headerActions}><DoShareButton /><DoSecondaryNavigation embedded={embedded}>
        <Link href={`/login?redirect=${encodeURIComponent(doReturnPath(pathname || "/do", query))}`} {...linkProps}>Sign in</Link>
        {!embedded && <DoInstallPwaCta compact />}
      </DoSecondaryNavigation></div>
    </header>
    {children}
    <footer className={styles.footer}><span>DO by assembl</span><Link href="/legal/privacy" {...linkProps}>Privacy</Link></footer>
  </main>;
}
