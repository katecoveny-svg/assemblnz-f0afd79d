import { DoMark } from './DoMark';
import styles from './do-presence.module.css';

/** The canonical DO identity, rendered in CSS so it also works without WebGL. Decorative, never a connection indicator. */
export function DoPresence({ size = 'medium', working = false, className = '' }: {
  size?: 'small' | 'medium' | 'large'; working?: boolean; className?: string;
}) {
  return <div className={styles.presence + ' ' + className} data-size={size} data-working={working || undefined} aria-hidden="true">
    <span className={styles.light} />
    <span className={styles.orbit} />
    <span className={styles.shadow} />
    <div className={styles.sculpture}>
      <span className={styles.edge} />
      <span className={styles.face}><DoMark /><span className={styles.reflection} /></span>
    </div>
    <span className={styles.glint} />
  </div>;
}
