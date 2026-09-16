import Link from 'next/link';
import { Download } from 'lucide-react';
import styles from './do-download-ctas.module.css';

type Variant = 'hero' | 'sheet' | 'compact' | 'banner';

export function DoDownloadCtas({
  variant = 'hero',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={`${styles.wrap} ${styles[variant]} ${className}`.trim()}>
      {variant === 'banner' ? (
        <p className={styles.bannerLabel}>Take DO with you</p>
      ) : null}
      <a
        className={styles.primary}
        href="/api/do/download?format=extension"
        download="assembl-do-extension-1.5.0.zip"
      >
        <Download size={16} aria-hidden />
        Download Chrome DO
      </a>
      <a
        className={styles.secondary}
        href="/api/do/download?format=mac"
        download="DO-mac-companion.zip"
      >
        <Download size={16} aria-hidden />
        Download Mac DO
      </a>
      <Link className={styles.guide} href="/do/install">
        Install guide
      </Link>
    </div>
  );
}
