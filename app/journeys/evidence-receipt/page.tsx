import type { Metadata } from 'next';
import { EvidenceReceiptPort2faDemo } from '@/components/loyalty/EvidenceReceiptPort2faDemo';
import { EVIDENCE_RECEIPT_DEMO_DISCLAIMER } from '@/lib/loyalty/evidence-receipt-demo';

export const metadata: Metadata = {
  title: 'PREVIEW · Evidence receipt DEMO — port_2fa | assembl',
  description:
    'DEMO Evidence receipt for wait_type=port_2fa. Sample wait→earn audit proof. Auth path stays clear.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/evidence-receipt' },
  openGraph: {
    title: 'assembl · Evidence receipt DEMO — port_2fa',
    description: EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/journeys/evidence-receipt',
    siteName: 'assembl',
  },
};

export default function EvidenceReceiptDemoPage() {
  return <EvidenceReceiptPort2faDemo />;
}
