'use client';

import Link from 'next/link';
import styles from './do-portable.module.css';

const MAC_SETUP =
  'https://github.com/katecoveny-svg/assemblnz-f0afd79d/tree/main/apps/do/macos';

type Props = {
  compact?: boolean;
  className?: string;
};

/**
 * Chrome ZIP + Mac companion entry — visible on /do and portable surfaces.
 * Mac remains an honest development-build / setup link (no signed installer claim).
 */
export function DoDownloadsStrip({ compact = false, className }: Props) {
  return (
    <section
      className={[styles.downloads, className].filter(Boolean).join(' ')}
      aria-label="Downloads"
    >
      <div className={styles.downloadsHead}>
        <strong>Downloads</strong>
        <span>Chrome · Mac</span>
      </div>
      <div className={styles.downloadRow}>
        <a
          className={styles.downloadLink}
          href="/api/do/download?format=extension"
          download
        >
          Chrome extension
        </a>
        <Link className={styles.downloadLinkSecondary} href={MAC_SETUP} target="_blank" rel="noreferrer">
          Mac companion
        </Link>
      </div>
      {!compact ? (
        <p className={styles.downloadsNote}>
          Chrome: unzip → Load unpacked. Mac: local development build — public signed installer not available yet.
        </p>
      ) : null}
    </section>
  );
}
