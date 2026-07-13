import { notFound } from 'next/navigation';
import { MarketingStudio } from '@/components/living-site/MarketingStudio';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { verticalBySlug } from '@/lib/living-site/verticals';

export const dynamic = 'force-dynamic';

export default async function LivingSiteStudioPage({ params }: { params: Promise<{ vertical: string }> }) {
  const v = verticalBySlug((await params).vertical);
  if (!v) notFound();
  const { facts } = await getGenomeFactsFor(v.tenant, v.fallbackFacts);
  const services = facts.filter((item) => item.section === 'services');
  const voice = facts.find((item) => item.id === 'g-voice')?.value ?? v.tagline;
  return (
    <OwnerToolShell v={v} current="studio" title="Marketing & social studio">
      <MarketingStudio v={v} services={services} voice={voice} />
    </OwnerToolShell>
  );
}
