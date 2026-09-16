import type { Metadata } from 'next';
import Link from 'next/link';
import { DoWorkspace } from '../DoWorkspace';
import { DoMark } from '@/components/do/DoMark';
import { DoPortableStarters } from '@/components/do/DoPortableStarters';
import { DoPrototypeStrip } from '@/components/do/DoPrototypeStrip';
import { DoTaskStrip } from '@/components/do/DoTaskStrip';
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
        <Link href="/do/meetings" target="_blank" rel="noopener">Meeting notes ↗</Link>
        <Link href="/login?redirect=%2Fdo%2Fmeetings" target="_blank" rel="noopener">Sign in ↗</Link>
        <Link href="/do/connections" target="_blank" rel="noopener">Connections ↗</Link>
        <Link href="/do/office" target="_blank" rel="noopener">Office ↗</Link>
        <Link href="/do/sponsored" target="_blank" rel="noopener">Sponsored ↗</Link>
        <Link href="/do/browser" target="_blank" rel="noopener">Browser ↗</Link>
        <Link href="/do/builder" target="_blank" rel="noopener">Builder DO ↗</Link>
        <Link href="/do/tasks?board=portable-widget" target="_blank" rel="noopener">Tasks ↗</Link>
      </nav>
      <p>Meeting notes open the recording-first Meeting DO in a full tab. Sign-in is only for transcription. Drafts stay here.</p>
    </header>
    <DoPrototypeStrip />
    <div className={styles.starters}>
      <DoPortableStarters showDownloads />
    </div>
    <DoTaskStrip boardId="portable-widget" label="This DO · next tasks" />
    <DoWorkspace embedded />
  </div>;
}
