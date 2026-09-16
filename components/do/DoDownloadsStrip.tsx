'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import styles from './do-portable.module.css';
import { DoInstallPwaCta } from './DoInstallPwaCta';

type Props = {
  compact?: boolean;
  className?: string;
  /** Hide Install CTA (rare — default clusters Install with downloads). */
  hideInstall?: boolean;
};

/**
 * Get DO on this device — Install PWA + Chrome ZIP + Mac companion in one cluster.
 * Mac remains an honest development-source zip (no signed installer claim).
 */
export function DoDownloadsStrip({ compact = false, className, hideInstall = false }: Props) {
  return (
    <section
      className={[styles.downloads, className].filter(Boolean).join(' ')}
      aria-label="Get DO on this device"
    >
      <div className={styles.downloadsHead}>
        <strong>Get DO on this device</strong>
        <span>PWA · Chrome · Mac</span>
      </div>

      {!hideInstall ? (
        <div className={styles.installCluster}>
          <DoInstallPwaCta prominent={!compact} compact={compact} />
        </div>
      ) : null}

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
          Phone: Install DO / Add to Home Screen. Chrome: unzip → Load unpacked. Mac: source zip ·
          build on a Mac · no notarised public installer yet. App Store / Play wrappers are planned;
          not listed live.
        </p>
      ) : null}
    </section>
  );
}
