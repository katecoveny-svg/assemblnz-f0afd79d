import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { ConsignmentsTable } from '@/components/ops/aironaut/ConsignmentsTable';
import { AironautDraftOnlyBanner } from '@/components/ops/aironaut/DraftOnlyBanner';
import {
  aironautWineConsignments,
  aironautComms,
} from '@/lib/customers/aironaut/demo-data';

/**
 * AIRONAUT · Wine Import & Export — NZ partner of Global Wine Logistics.
 * Family pilot, draft-only.
 */
export default function AironautWinePage() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const line = config.serviceLines?.find((s) => s.id === 'wine');

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <header className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="text-2xl font-semibold text-[color:var(--brand-ink)]">
          {line?.label ?? 'Wine Import & Export'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
          {line?.blurb}
        </p>
        <p className="mt-2 text-xs text-[color:var(--brand-muted)]">
          NZ partner of Global Wine Logistics.
        </p>
      </header>
      <ConsignmentsTable
        title="Wine consignments"
        rows={aironautWineConsignments}
      />
      <AironautDraftOnlyBanner />
      <CommsDrafts drafts={aironautComms} />
    </div>
  );
}
