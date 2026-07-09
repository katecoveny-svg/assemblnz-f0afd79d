import { Card, PageHeading, SectionLabel } from '@/components/bills/kit';
import { ProviderGrid } from '@/components/bills/ProviderGrid';
import { LiveState } from '@/components/bills/LiveState';
import { getPriceBook } from '@/lib/bills/provider-prices';
import { providerPlans, PROVIDER_PRICING_DISCLAIMER } from '@/lib/bills/data';
import { Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

const verifiedFmt = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Fallback: adapt the static seed to the LivePlan shape when the table is empty.
const fallbackPlans = providerPlans.map((p) => ({
  id: p.id,
  category: p.category.toLowerCase(),
  provider: p.provider,
  planName: p.planName.replace(' (current)', ''),
  monthlyCost: Number(p.indicativeMonthly.replace(/[^0-9.]/g, '')) || null,
  features: p.features,
  eligibilityNotes: null,
  sourceUrl: p.link,
  sourceHost: p.linkLabel,
  lastVerified: '2026-07-05T00:00:00Z',
  trustTier: 'A' as const,
  status: 'active',
}));

export default async function ProvidersPage() {
  const book = await getPriceBook();
  const plans = book.live ? book.plans : fallbackPlans;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeading title="Provider DB" lead="The NZ provider price book assembl bills reasons over — each price carries its source and the date it was last verified." />
        <LiveState
          state={book.live ? 'live' : 'sample'}
          note={book.live ? `${plans.length} plans · verified to ${verifiedFmt(book.lastVerified)}` : 'seed data'}
        />
      </div>

      <Card className="mb-4 !py-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--b-muted)' }}>
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--b-teal-deep)' }} />
          {book.live
            ? `Prices are refreshed weekly from each provider's own page (electricity + broadband + insurance) via the refresh-provider-prices function. Every row shows its source and last-verified date. Monthly figures are indicative for this household's usage — always confirm on the provider's site or Powerswitch (Consumer NZ).`
            : PROVIDER_PRICING_DISCLAIMER}
        </p>
      </Card>

      <Card>
        <SectionLabel>Plans · {plans.length}</SectionLabel>
        <ProviderGrid plans={plans} />
      </Card>
    </div>
  );
}
