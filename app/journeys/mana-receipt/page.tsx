import type { Metadata } from 'next';
import { ManaReceiptPort2faDemo } from '@/components/loyalty/ManaReceiptPort2faDemo';
import { MANA_RECEIPT_DEMO_DISCLAIMER } from '@/lib/loyalty/mana-receipt-demo';

export const metadata: Metadata = {
  title: 'PREVIEW · Mana Receipt DEMO — port_2fa | assembl',
  description:
    'DEMO Mana Receipt for wait_type=port_2fa. Sample wait→earn evidence only — not live credit, not a carrier affiliation.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/mana-receipt' },
  openGraph: {
    title: 'assembl · Mana Receipt DEMO — port_2fa',
    description: MANA_RECEIPT_DEMO_DISCLAIMER,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/journeys/mana-receipt',
    siteName: 'assembl',
  },
};

export default function ManaReceiptDemoPage() {
  return <ManaReceiptPort2faDemo />;
}
