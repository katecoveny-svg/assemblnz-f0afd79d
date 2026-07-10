import type { Metadata } from 'next';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { InstallerFlow } from '@/components/v2/install/InstallerFlow';
import styles from '@/components/v2/home/home.module.css';

export const metadata: Metadata = {
  title: 'install a business — choose an industry, answer ten questions · assembl',
  description:
    'The Living Site installer: choose an industry template, answer ten questions, and a whole business operating system assembles itself — website, CRM, bookings, knowledge, agents.',
  alternates: { canonical: '/install' },
};

export default function InstallPage() {
  return (
    <div style={{ background: palette.paper }}>
      <section className={styles.section}>
        <div className={styles.inner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
            <MicroLabel as="h2">the installer · demo</MicroLabel>
          </div>
        </div>
        <InstallerFlow />
      </section>
    </div>
  );
}
