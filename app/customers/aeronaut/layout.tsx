import type { Metadata } from 'next';
import { AironautGate } from './AironautGate';
import { AironautShell } from '@/components/customs/AironautShell';
import { hasAccess } from './access';

export const metadata: Metadata = {
  title: {
    default: 'Aironaut × Pīkau — customs workspace',
    template: '%s · Aironaut',
  },
  description:
    'Aironaut Customs Brokers operations workspace — a concept pilot by assembl. Draft-only customs entries, HS classification, importer CRM and compliance.',
  robots: { index: false, follow: false },
};

export default async function AironautLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAccess())) {
    return <AironautGate />;
  }
  return <AironautShell>{children}</AironautShell>;
}
