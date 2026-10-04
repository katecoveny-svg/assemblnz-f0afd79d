import type { Metadata } from 'next';

import { HouseholdFloorClient } from './HouseholdFloorClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Household Floor · DO · assembl' },
  description:
    'Sample family DO with nine seats, evening board and drafts-only gates. Fictional household — nothing is sent for you.',
  alternates: { canonical: '/do/household' },
  robots: { index: false, follow: false },
};

export default async function HouseholdFloorPage({
  searchParams,
}: {
  searchParams?: Promise<{ install?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const initialPrivate = params.install === 'owner-private' || params.install === 'private';
  return <HouseholdFloorClient initialPrivate={initialPrivate} />;
}
