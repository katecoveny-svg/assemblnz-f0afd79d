import { HomePortal } from '@/components/site/HomePortal';
import { KETES } from '@/lib/kete';

export const revalidate = 30;

export default function HomePage() {
  return <HomePortal ketes={KETES} />;
}
