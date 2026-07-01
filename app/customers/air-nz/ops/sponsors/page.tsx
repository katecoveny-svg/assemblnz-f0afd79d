import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { SponsorsBoard } from '@/components/customers/air-nz/SponsorsBoard';

export default function SponsorsPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Sponsors" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The brands buying wait-state moments — their tier, budget, creative
          assets, campaign window and targeting. Platinum, gold and silver tiers
          carry different attribution and CPM floors. Manage a sponsor to see its
          onboarding state, perks and active campaigns.
        </p>
        <SponsorsBoard />
      </div>
    </>
  );
}
