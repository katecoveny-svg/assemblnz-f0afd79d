import { HomePortal } from '@/components/site/HomePortal';
import { KETES } from '@/lib/kete';
import { getPearlLiveStats } from '@/lib/pearl-live';
import { getRegulatoryPulse } from '@/lib/regulatory-pulse';

export const revalidate = 30;

export default async function HomePage() {
  const [pearlLive, regulatoryPulse] = await Promise.all([
    getPearlLiveStats(),
    getRegulatoryPulse(),
  ]);

  return (
    <HomePortal
      ketes={KETES}
      pearlLive={pearlLive}
      regulatoryPulse={regulatoryPulse}
    />
  );
}
