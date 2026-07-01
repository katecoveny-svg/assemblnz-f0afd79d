import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { ConsignmentsTable } from '@/components/ops/aironaut/ConsignmentsTable';
import { AironautDraftOnlyBanner } from '@/components/ops/aironaut/DraftOnlyBanner';
import {
  aironautExoticVehicleConsignments,
  aironautComms,
} from '@/lib/customers/aironaut/demo-data';

/**
 * AIRONAUT · Exotic Motor Vehicle Shipping — high-value cars in and out of
 * NZ. Family pilot, draft-only.
 */
export default function AironautExoticVehiclesPage() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const line = config.serviceLines?.find((s) => s.id === 'exotic-vehicles');

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <header className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="text-2xl font-semibold text-[color:var(--brand-ink)]">
          {line?.label ?? 'Exotic Motor Vehicle Shipping'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
          {line?.blurb}
        </p>
      </header>
      <ConsignmentsTable
        title="Vehicle consignments"
        rows={aironautExoticVehicleConsignments}
      />
      <AironautDraftOnlyBanner />
      <CommsDrafts drafts={aironautComms} />
    </div>
  );
}
