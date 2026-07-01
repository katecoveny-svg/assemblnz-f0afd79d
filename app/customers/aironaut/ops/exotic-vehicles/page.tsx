import Image from 'next/image';
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
      {line?.heroImage ? (
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ maxHeight: 280, aspectRatio: '21/9' }}
        >
          <Image
            src={line.heroImage}
            alt={line.label}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
      <header className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2
          className="font-[family-name:var(--font-brand-display)] text-2xl font-semibold uppercase tracking-[0.16em]"
          style={{ color: '#0B1F3A' }}
        >
          {line?.label?.toUpperCase() ?? 'EXOTIC MOTOR VEHICLE SHIPPING'}
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
