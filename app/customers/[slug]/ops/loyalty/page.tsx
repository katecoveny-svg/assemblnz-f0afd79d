import { LoyaltyPanel } from '@/components/ops/widgets/LoyaltyPanel';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function LoyaltyPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <LoyaltyPanel state={{ points: 0, tier: 'Regular', nextTierAt: 1000, demo: true }} />
    </div>
  );
}
