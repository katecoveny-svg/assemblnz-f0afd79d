import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { OpsCommsDrafter } from '@/components/customers/everyday-rewards/OpsCommsDrafter';

export default function CommsPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Comms drafting" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Draft the comms the partnership generates — a sponsor account-manager
          performance note, a shopper newsletter mention, an Everyday Rewards blog
          post about “new ways to earn”, and a board snippet. Starting points only;
          edit before sending.
        </p>
        <OpsCommsDrafter />
      </div>
    </>
  );
}
