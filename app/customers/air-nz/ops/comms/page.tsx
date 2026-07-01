import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { CommsDrafter } from '@/components/customers/air-nz/CommsDrafter';

export default function CommsPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Comms drafting" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Draft the partnership’s recurring comms — the weekly partner update, a
          board-report snippet, and sponsor account-manager notes. In assembl’s
          warm-direct voice, ready to edit and send.
        </p>
        <CommsDrafter />
      </div>
    </>
  );
}
