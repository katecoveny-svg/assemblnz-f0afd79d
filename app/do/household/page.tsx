import type { Metadata } from 'next';

import { PersonalDo } from '../personal/PersonalDo';

import { HouseholdFloorClient } from './HouseholdFloorClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Household · DO · assembl' },
  description:
    'Plan household next steps with DO. Write, talk or add a document, then review the draft.',
  alternates: { canonical: '/do/household' },
  robots: { index: false, follow: false },
};

export default async function HouseholdFloorPage({
  searchParams,
}: {
  searchParams?: Promise<{ install?: string; view?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const initialPrivate = params.install === 'owner-private' || params.install === 'private';
  // Preserve explicit old installation links without making the sample the default.
  if (params.view === 'sample' || params.install !== undefined) {
    return <HouseholdFloorClient initialPrivate={initialPrivate} />;
  }
  return <PersonalDo context="household" />;
}
