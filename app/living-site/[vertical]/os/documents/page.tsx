import { notFound } from 'next/navigation';
import { DocumentStudio } from '@/components/living-site/DocumentStudio';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { getRecentDocuments } from '@/lib/living-site/document-store';
import { verticalBySlug } from '@/lib/living-site/verticals';

export const dynamic = 'force-dynamic';

export default async function LivingSiteDocumentsPage({ params }: { params: Promise<{ vertical: string }> }) {
  const v = verticalBySlug((await params).vertical);
  if (!v) notFound();
  const { facts } = await getGenomeFactsFor(v.tenant, v.fallbackFacts);
  const services = facts.filter((item) => item.section === 'services');
  const documents = await getRecentDocuments(v.tenant);
  const now = new Date();
  const issueDate = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const issueYear = Number(new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric' }).format(now));
  return (
    <OwnerToolShell v={v} current="documents" title="Proposals & invoices">
      <DocumentStudio v={v} tenant={v.tenant} services={services} issueDate={issueDate} issueYear={issueYear} initialDocuments={documents} />
    </OwnerToolShell>
  );
}
