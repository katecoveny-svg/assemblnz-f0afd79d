import type { Metadata } from 'next';
import { AgencyConnectionsClient } from './AgencyConnectionsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Agency connections · assembl' },
  description:
    'Connect Meta Business once and select the Portfolio, Page, Instagram and Ad Account Assembl may read for Pursuit.',
  alternates: { canonical: '/agency/connections' },
  robots: { index: false, follow: false },
};

export default function AgencyConnectionsPage() {
  return <AgencyConnectionsClient />;
}
