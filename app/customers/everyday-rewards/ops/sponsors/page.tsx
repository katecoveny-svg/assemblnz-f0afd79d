import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { OpsSponsorsBoard } from '@/components/customers/everyday-rewards/OpsSponsorsBoard';

export default function SponsorsPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Sponsors" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Brands buying wait-moment attribution — the same partner model ASB
          already sits in on the shopper side. Onboard, set the tier and window,
          track creative approval and spend. Filter by status; nothing goes live
          until Fair Trading + ASA review passes.
        </p>
        <OpsSponsorsBoard />
      </div>
    </>
  );
}
