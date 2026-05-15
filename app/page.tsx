import { HomePortal } from '@/components/site/HomePortal';
import { KETES } from '@/lib/kete';
import { ketes as keteImagery } from '@/lib/site-config';
import { getPearlLiveStats } from '@/lib/pearl-live';

export const revalidate = 30;

export default async function HomePage() {
  const pearlLive = await getPearlLiveStats();

  return (
    <HomePortal
      ketes={KETES}
      keteImagery={keteImagery}
      pearlLive={pearlLive}
    />
  );
}
