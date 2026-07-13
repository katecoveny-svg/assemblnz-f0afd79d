import { notFound } from 'next/navigation';
import { CustomerDesk } from '@/components/living-site/CustomerDesk';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getRecentEnquiries } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { getRecentBookings } from '@/lib/living-site/booking-store';
import { getInstall } from '@/lib/living-site/install-store';

export const dynamic = 'force-dynamic';

export default async function InstallCrmPage({ params }: { params: Promise<{ id: string }> }) {
  const install = await getInstall((await params).id);
  if (!install) notFound();
  const [enquiries, bookings] = await Promise.all([
    getRecentEnquiries(30, install.tenant),
    getRecentBookings(install.tenant, 30),
  ]);
  const root = `/living-site/install/${install.id}/os`;
  const site = `/living-site/install/${install.id}`;
  return (
    <OwnerToolShell v={install.v} current="crm" title="CRM & bookings" rootHref={root} siteHref={site} stripText={`${install.v.businessName} · generated install · owner tools are live`}>
      <CustomerDesk v={install.v} tenant={install.tenant} enquiries={enquiries} bookings={bookings} siteHref={site} />
    </OwnerToolShell>
  );
}
