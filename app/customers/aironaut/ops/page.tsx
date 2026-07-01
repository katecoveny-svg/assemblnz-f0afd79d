import Image from 'next/image';
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
 * verticals; each card renders as a small hero tile with the service line's
 * photo, title (Orbitron), blurb, and a demo consignment count.
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
  const primaryTagline = config.taglines?.primary ?? config.voice.greeting;

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />

      {/* Family-pilot banner — Warm Stone bg + Burnt Orange left rule +
          Charcoal body text. Matches the real brand palette. */}
      <div
        className="rounded-md border border-black/5 p-4 text-sm"
        style={{
          backgroundColor: 'var(--brand-surface)',
          color: 'var(--brand-ink)',
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

      {/* Primary tagline as Orbitron uppercase headline over the service
          lines. Uses the display font var wired for aironaut. */}
      <h2
        className="font-[family-name:var(--font-brand-display)] text-center text-2xl uppercase tracking-[0.24em] md:text-3xl"
        style={{ color: 'var(--brand-surface)' }}
      >
        {primaryTagline}
      </h2>

      <section className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-[family-name:var(--font-brand-display)] text-lg font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-ink)]">
            Service lines
          </h3>
          <span className="text-xs text-[color:var(--brand-muted)]">
            four verticals · demo consignments only
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {serviceLines.map((s) => (
            <Link
              key={s.id}
              href={`/customers/aironaut/ops/${s.href}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition hover:border-[color:var(--brand-accent)]/40"
            >
              {s.heroImage ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[color:var(--brand-bg)]">
                  <Image
                    src={s.heroImage}
                    alt={s.label}
                    fill
                    sizes="(max-width: 768px) 90vw, 320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-[family-name:var(--font-brand-display)] text-base font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
                    {s.label}
                  </h4>
                  <span className="text-xs text-[color:var(--brand-muted)]">
                    <TickerNumber value={DEMO_COUNTS[s.id] ?? 0} /> demo
                  </span>
                </div>
                <p className="text-sm text-[color:var(--brand-muted)]">
                  {s.blurb}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
