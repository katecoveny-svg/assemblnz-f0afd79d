import Link from 'next/link';
import { Download } from 'lucide-react';
import styles from './do-download-ctas.module.css';

type Variant = 'hero' | 'sheet' | 'compact';

export function DoDownloadCtas({
  variant = 'hero',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={`${styles.wrap} ${styles[variant]} ${className}`.trim()}>
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
        href="/api/do/download?format=macos"
        download="assembl-do-macos-1.5.0.zip"
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
