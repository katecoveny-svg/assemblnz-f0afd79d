import { Card, PageHeading, SectionLabel } from '@/components/bills/kit';
import { ProviderGrid } from '@/components/bills/ProviderGrid';
import { PROVIDER_PRICING_DISCLAIMER } from '@/lib/bills/data';
import { Info } from 'lucide-react';

export default function ProvidersPage() {
  return (
    <div>
      <PageHeading title="Provider DB" lead="The NZ provider list Assembl Bills reasons over — 14 plans across electricity, broadband and insurance, with features and direct links." />

      <Card className="mb-4 !py-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--b-muted)' }}>
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--b-teal-deep)' }} />
          {PROVIDER_PRICING_DISCLAIMER}
        </p>
      </Card>

      <Card>
        <SectionLabel>Plans · 14</SectionLabel>
        <ProviderGrid />
      </Card>
    </div>
  );
}
