import type { Metadata } from 'next';
import Link from 'next/link';
import { DoWorkspace } from '../DoWorkspace';
import { DoMark } from '@/components/do/DoMark';
import styles from './widget.module.css';
import '../do.css';

export const metadata: Metadata = {
  title: { absolute: 'DO workspace · assembl' },
  robots: { index: false, follow: false },
};

export default function DoWidgetPage() {
  return <div className="do-widget-page">
    <header className={styles.header}>
      <Link href="/do" target="_blank" rel="noopener" className={styles.brand}>
        <span aria-hidden="true"><DoMark /></span>Your DOs
      </Link>
      <nav aria-label="DO tools — open in a new tab">
        <Link href="/do/meetings" target="_blank" rel="noopener">Meeting DO ↗</Link>
        <Link href="/login?redirect=%2Fdo%2Fmeetings" target="_blank" rel="noopener">Sign in ↗</Link>
        <Link href="/do/connections" target="_blank" rel="noopener">Connections ↗</Link>
        <Link href="/do/office" target="_blank" rel="noopener">Office ↗</Link>
        <Link href="/do/builder" target="_blank" rel="noopener">Builder DO ↗</Link>
      </nav>
      <p>Meeting DO and sign-in open in a full tab so login and recording can finish. Drafts stay here.</p>
    </header>
    <DoWorkspace embedded />
  </div>;
}
