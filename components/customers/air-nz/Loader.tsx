'use client';

import styles from '@/app/customers/air-nz/dash/airnz.module.css';
import { KoruMark } from './KoruMark';

/**
 * Wait-state loaders. Per brand-notes v2 §2.6 / §3 we never render a native
 * spinner in an earn moment — we render a koru unfurl, a 787-9 silhouette, a
 * thin progress bar, or Oscar's koru head.
 */
export function Loader({ kind }: { kind: 'koru' | 'plane' | 'progress' | 'oscar' }) {
  if (kind === 'progress') {
    return (
      <div className={styles.loaderWrap}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>
      </div>
    );
  }
  if (kind === 'plane') {
    return (
      <div className={styles.loaderWrap}>
        <svg width="72" height="40" viewBox="0 0 120 60" fill="none" className={styles.spin} style={{ animationDuration: '2.6s' }}>
          {/* stylised 787-9 Black Beauty silhouette — white koru on tail */}
          <path
            d="M6 34l40-4 22-14c3-2 7 0 6 4l-4 12 30 2c4 0 4 4 0 5l-30 3 4 12c1 4-3 6-6 4L46 40 6 36z"
            fill="#231f20"
          />
          <path d="M84 20l6-12c1-2 4-2 5 0l1 12z" fill="#ffffff" />
        </svg>
      </div>
    );
  }
  if (kind === 'oscar') {
    return (
      <div className={styles.loaderWrap}>
        <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#111111" />
          <g className={styles.spin} style={{ transformOrigin: '24px 24px' }}>
            <KoruMark size={26} color="#00b0b9" />
          </g>
        </svg>
      </div>
    );
  }
  // koru unfurl
  return (
    <div className={styles.loaderWrap}>
      <div className={styles.spin}>
        <KoruMark size={40} color="#00b0b9" />
      </div>
    </div>
  );
}
