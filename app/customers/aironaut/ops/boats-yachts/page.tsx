import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { ConsignmentsTable } from '@/components/ops/aironaut/ConsignmentsTable';
import { AironautDraftOnlyBanner } from '@/components/ops/aironaut/DraftOnlyBanner';
import {
  aironautBoatConsignments,
  aironautComms,
} from '@/lib/customers/aironaut/demo-data';

/**
 * AIRONAUT · Boat & Yacht Transport — marine transport worldwide. Family
 * pilot, draft-only.
 */
export default function AironautBoatsYachtsPage() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const line = config.serviceLines?.find((s) => s.id === 'boats-yachts');

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <header className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="text-2xl font-semibold text-[color:var(--brand-ink)]">
          {line?.label ?? 'Boat & Yacht Transport'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
          {line?.blurb}
        </p>
      </header>
      <ConsignmentsTable
        title="Marine consignments"
        rows={aironautBoatConsignments}
      />
      <AironautDraftOnlyBanner />
      <CommsDrafts drafts={aironautComms} />
    </div>
  );
}
