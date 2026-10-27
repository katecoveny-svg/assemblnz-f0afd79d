import type { ReactNode } from 'react';
import styles from './legal.module.css';

/** Company reading surface; legal wording and service links remain unchanged. */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
