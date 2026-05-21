import { HomePortal } from '@/components/site/HomePortal';
import { KETES } from '@/lib/kete';
import { getRegulatoryPulse } from '@/lib/regulatory-pulse';

export const revalidate = 30;

export default async function HomePage() {
  const regulatoryPulse = await getRegulatoryPulse();

  return (
    <HomePortal
      ketes={KETES}
      regulatoryPulse={regulatoryPulse}
    />
  );
}
