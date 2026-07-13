import { notFound } from 'next/navigation';
import { CustomerDesk } from '@/components/living-site/CustomerDesk';
import { OwnerToolShell } from '@/components/living-site/OwnerToolShell';
import { getRecentEnquiries } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { getRecentBookings } from '@/lib/living-site/booking-store';
import { verticalBySlug } from '@/lib/living-site/verticals';

export const dynamic = 'force-dynamic';

export default async function LivingSiteCrmPage({ params }: { params: Promise<{ vertical: string }> }) {
  const v = verticalBySlug((await params).vertical);
  if (!v) notFound();
  const [enquiries, bookings] = await Promise.all([
    getRecentEnquiries(30, v.tenant),
    getRecentBookings(v.tenant, 30),
  ]);
  return (
    <OwnerToolShell v={v} current="crm" title="CRM & bookings">
      <CustomerDesk v={v} enquiries={enquiries} bookings={bookings} />
    </OwnerToolShell>
  );
}
