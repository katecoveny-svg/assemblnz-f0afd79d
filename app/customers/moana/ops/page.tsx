import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { MoanaDashboard } from '@/components/ops/moana/MoanaDashboard';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';

/**
 * MOANA — concept ops landing. Layout already carries swell pattern + ambient
 * field; EtherHero (R3F) inside the dashboard is the 3D wow. Scroll-reveal
 * wraps the dashboard for entrance motion.
 */
export default function MoanaOpsHome() {
  const config = getBrandConfig('moana');
  if (!config) notFound();

  return (
    <div className="relative flex flex-col gap-6">
      <DemoRibbon />
      <OsScrollReveal>
        <MoanaDashboard />
      </OsScrollReveal>
    </div>
  );
}
