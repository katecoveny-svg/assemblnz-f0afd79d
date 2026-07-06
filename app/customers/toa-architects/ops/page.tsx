import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { ArcHeroPanel } from '@/components/ops/toa/ArcHeroPanel';
import { LiveArcChat } from '@/components/ops/toa/LiveArcChat';
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
      <ArcHeroPanel waiting={toaMondayQueue.length} />

      {/* The main event: ARC is live. Ask it anything — it streams a real,
          sourced draft from assembl's consenting agent, nothing sends. */}
      <section className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-stretch">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">
            ask arc — live
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[color:var(--brand-ink)]">
            The practice, drafted overnight.
            <br />
            Ask about any of it.
          </h2>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-[color:var(--brand-muted)]">
            ARC reads your projects, consents and consultants, and answers with its sources.
            It drafts the chase, the pre-check, the client update — you approve before anything
            leaves the studio. This is the real agent, not a script.
          </p>
        </div>
        <LiveArcChat />
      </section>

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
