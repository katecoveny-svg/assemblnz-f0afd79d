'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import styles from './do-portable.module.css';

type Props = {
  compact?: boolean;
  className?: string;
};

/**
 * Chrome ZIP + Mac companion entry — visible on /do and portable surfaces.
 * Mac is an honest development-source zip (no signed installer claim).
 */
export function DoDownloadsStrip({ compact = false, className }: Props) {
  return (
    <section
      className={[styles.downloads, className].filter(Boolean).join(' ')}
      aria-label="Downloads"
    >
      <div className={styles.downloadsHead}>
        <strong>Take DO with you</strong>
        <span>Chrome · Mac</span>
      </div>
      <div className={styles.downloadRow}>
        <a
          className={styles.downloadLink}
          href="/api/do/download?format=extension"
          download="assembl-do-extension-1.5.2.zip"
        >
          <Download size={14} aria-hidden />
          Download Chrome DO
        </a>
        <a
          className={styles.downloadLinkSecondary}
          href="/api/do/download?format=mac"
          download="DO-mac-companion.zip"
        >
          <Download size={14} aria-hidden />
          Download Mac DO
        </a>
        <Link className={styles.downloadGuide} href="/do/install">
          Install guide
        </Link>
      </div>
      {!compact ? (
        <p className={styles.downloadsNote}>
          Chrome: unzip → Load unpacked. Mac: source zip · build on a Mac · no
          notarised public installer yet.
        </p>
      ) : null}
    </section>
  );
}
