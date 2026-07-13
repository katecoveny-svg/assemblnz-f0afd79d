import { notFound } from 'next/navigation';
import { DocumentStudio } from '@/components/living-site/DocumentStudio';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getInstall } from '@/lib/living-site/install-store';

export const dynamic = 'force-dynamic';

export default async function InstallDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const install = await getInstall((await params).id);
  if (!install) notFound();
  const services = install.facts.filter((item) => item.section === 'services');
  const now = new Date();
  const issueDate = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const issueYear = Number(new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric' }).format(now));
  const root = `/living-site/install/${install.id}/os`;
  const site = `/living-site/install/${install.id}`;
  return (
    <OwnerToolShell v={install.v} current="documents" title="Proposals & invoices" rootHref={root} siteHref={site} stripText={`${install.v.businessName} · generated install · owner tools are live`}>
      <DocumentStudio v={install.v} services={services} issueDate={issueDate} issueYear={issueYear} />
    </OwnerToolShell>
  );
}
