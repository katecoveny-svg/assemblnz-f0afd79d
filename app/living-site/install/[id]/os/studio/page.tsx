import { notFound } from 'next/navigation';
import { MarketingStudio } from '@/components/living-site/MarketingStudio';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getInstall } from '@/lib/living-site/install-store';

export const dynamic = 'force-dynamic';

export default async function InstallStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const install = await getInstall((await params).id);
  if (!install) notFound();
  const services = install.facts.filter((item) => item.section === 'services');
  const voice = install.facts.find((item) => item.id === 'g-voice')?.value ?? install.v.tagline;
  const root = `/living-site/install/${install.id}/os`;
  const site = `/living-site/install/${install.id}`;
  return (
    <OwnerToolShell v={install.v} current="studio" title="Marketing & social studio" rootHref={root} siteHref={site} stripText={`${install.v.businessName} · generated install · owner tools are live`}>
      <MarketingStudio v={install.v} services={services} voice={voice} />
    </OwnerToolShell>
  );
}
