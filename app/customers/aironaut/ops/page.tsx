import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { TickerNumber } from '@/lib/motion';
import {
  aironautFreightConsignments,
  aironautExoticVehicleConsignments,
  aironautBoatConsignments,
  aironautWineConsignments,
} from '@/lib/customers/aironaut/demo-data';

/**
 * AIRONAUT ops landing — Kate's dad's family freight-forwarding business.
 * Family pilot, Happy Tails-tier review bar: everything renders draft-only,
 * nothing sends, nothing lodges. The landing fans out to four real service
 * verticals; each card links to its own sub-page.
 *
 * The consignment counts under each card are pulled from the demo data set
 * and clearly labelled `demo`.
 */
const DEMO_COUNTS: Record<string, number> = {
  freight: aironautFreightConsignments.length,
  'exotic-vehicles': aironautExoticVehicleConsignments.length,
  'boats-yachts': aironautBoatConsignments.length,
  wine: aironautWineConsignments.length,
};

export default function AironautOpsHome() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();

  const serviceLines = config.serviceLines ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />

      {/* Family-pilot banner — warm and quiet, not alarmist. Left rule in the
          accent orange. */}
      <div
        className="rounded-md border border-black/5 bg-[color:var(--brand-surface)] p-4 text-sm text-[color:var(--brand-ink)]"
        style={{
          borderLeft: '4px solid var(--brand-accent)',
        }}
      >
        <p>
          <strong>Family pilot — draft only.</strong> Nothing here sends a
          real email, nothing lodges a real customs entry. Kate&apos;s dad
          reviews everything before it leaves the workspace.
        </p>
      </div>

      <Brand3DHero config={config} />

      <section className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">
            Service lines
          </h3>
          <span className="text-xs text-[color:var(--brand-muted)]">
            four verticals · demo consignments only
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {serviceLines.map((s) => (
            <Link
              key={s.id}
              href={`/customers/aironaut/ops/${s.href}`}
              className="group rounded-xl border border-black/5 bg-[color:var(--brand-bg)]/40 p-4 transition hover:border-[color:var(--brand-accent)]/40"
            >
              <div className="mb-1 flex items-baseline justify-between">
                <h4 className="text-base font-semibold text-[color:var(--brand-ink)]">
                  {s.label}
                </h4>
                <span className="text-xs text-[color:var(--brand-muted)]">
                  <TickerNumber value={DEMO_COUNTS[s.id] ?? 0} /> demo
                </span>
              </div>
              <p className="text-sm text-[color:var(--brand-muted)]">
                {s.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
