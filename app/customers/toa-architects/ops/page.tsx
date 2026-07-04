import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { ArcHeroBand } from '@/components/ops/toa/ArcHeroBand';
import { MondayStrip } from '@/components/ops/toa/MondayStrip';
import { CapabilityGrid } from '@/components/ops/toa/CapabilityGrid';
import { IntegrationsOrbit } from '@/components/ops/toa/IntegrationsOrbit';
import { Flagship16A } from '@/components/ops/toa/Flagship16A';
import {
  toa16A,
  toaClientUpdates,
  toaConsents,
  toaConsultants,
  toaFeeProposal,
  toaMondayQueue,
  toaOrbitTools,
  toaProducerStatements,
  toaSiteVisit,
} from '@/lib/customers/toa-architects/demo-data';

/**
 * TOA ARCHITECTS × ARC — concept ops landing (Tier 1 Full OS framing).
 *
 * Story order, visual first: who ARC is (hero band) → what it plugs into
 * (integrations orbit — hero-level, so Nick SEES the OS story before reading
 * anything) → what it did overnight (Monday strip) → the six jobs, each shown
 * as its actual output (capability grid).
 *
 * TOA is a target, not a partner. The hero band and ribbon carry the concept
 * framing; nothing claims affiliation. All data is fictional and draft-only.
 */
export default function ToaArchitectsOpsHome() {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <ArcHeroBand config={config} waiting={toaMondayQueue.length} />
      <Flagship16A />
      <IntegrationsOrbit tools={toaOrbitTools} />
      <MondayStrip queue={toaMondayQueue} />
      <CapabilityGrid
        consents={toaConsents}
        update={toaClientUpdates[0]}
        updatePhotos={[...toa16A.images.renders, toa16A.images.massing]}
        consultants={toaConsultants}
        proposal={toaFeeProposal}
        statements={toaProducerStatements}
        visit={toaSiteVisit}
      />
    </div>
  );
}
