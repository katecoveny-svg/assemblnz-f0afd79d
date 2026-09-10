import type { Metadata } from 'next';
import { EvidenceReceiptPort2faDemo } from '@/components/loyalty/EvidenceReceiptPort2faDemo';
import { EVIDENCE_RECEIPT_PREVIEW } from '@/lib/loyalty/evidence-receipt-demo';

export const metadata: Metadata = {
  title: EVIDENCE_RECEIPT_PREVIEW.metaTitle,
  description: EVIDENCE_RECEIPT_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/evidence-receipt' },
  openGraph: {
    title: EVIDENCE_RECEIPT_PREVIEW.metaTitle,
    description: EVIDENCE_RECEIPT_PREVIEW.disclaimer,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/journeys/evidence-receipt',
    siteName: 'assembl',
  },
};

export default function EvidenceReceiptDemoPage() {
  return <EvidenceReceiptPort2faDemo />;
}
