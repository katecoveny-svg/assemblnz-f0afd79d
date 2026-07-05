import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { MoanaDashboard } from '@/components/ops/moana/MoanaDashboard';

/**
 * MOANA — concept ops landing, the reference glass-bento dashboard.
 *
 * A real WebGL 3D ocean hero (React Three Fiber) over a framer-motion bento
 * grid: the LIVE Tide & Weather chat as one cell, plus sample sea/tide/catch
 * cards — every figure tagged SAMPLE with the official-source link, so nothing
 * fabricates live conditions. This is the template the other pilots follow.
 */
export default function MoanaOpsHome() {
  const config = getBrandConfig('moana');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <MoanaDashboard />
    </div>
  );
}
