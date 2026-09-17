import type { Metadata } from 'next';
import Link from 'next/link';
import { DoWorkspace } from '../DoWorkspace';
import { DoMark } from '@/components/do/DoMark';
import { DoPortableStarters } from '@/components/do/DoPortableStarters';
import { DoPrototypeStrip } from '@/components/do/DoPrototypeStrip';
import { DoTaskStrip } from '@/components/do/DoTaskStrip';
import { DoWorkspaceLinks } from '@/components/do/DoWorkspaceLinks';
import styles from './widget.module.css';
import '../do.css';

export const metadata: Metadata = {
  title: { absolute: 'DO workspace · assembl' },
  robots: { index: false, follow: false },
};

export default function DoWidgetPage() {
  return <div className="do-widget-page">
    <header className={styles.header}>
      <Link href="/do/widget" target="_blank" rel="noopener" className={styles.brand}>
        <span aria-hidden="true"><DoMark /></span>Full DO workspace ↗
      </Link>
      <DoWorkspaceLinks />
    </header>
    <DoPrototypeStrip />
    <div className={styles.starters}>
      <DoPortableStarters showDownloads />
    </div>
    <DoTaskStrip boardId="portable-widget" label="This DO · next tasks" />
    <DoWorkspace embedded />
  </div>;
}
