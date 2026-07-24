import type { StatusTreatment } from '@/lib/journey/types';
import { statusMeta, type StatusTone } from '@/lib/journey/status';
import styles from './journey.module.css';

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: styles.chipNeutral,
  info: styles.chipInfo,
  positive: styles.chipPositive,
  caution: styles.chipCaution,
};

/** Honest status treatment — one shared vocabulary across every surface. */
export function StatusChip({ status, title }: { status: StatusTreatment; title?: string }) {
  const meta = statusMeta(status);
  return (
    <span className={`${styles.chip} ${TONE_CLASS[meta.tone]}`} title={title ?? meta.description}>
      <span className={styles.chipDot} aria-hidden />
      {meta.label}
    </span>
  );
}
