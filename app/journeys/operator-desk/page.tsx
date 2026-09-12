import type { Metadata } from 'next';
import { OperatorDeskDemo } from '@/components/loyalty/OperatorDeskDemo';
import { OPERATOR_DESK_PREVIEW } from '@/lib/loyalty/operator-desk-demo';

export const metadata: Metadata = {
  title: OPERATOR_DESK_PREVIEW.metaTitle,
  description: OPERATOR_DESK_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/operator-desk' },
  openGraph: {
    title: OPERATOR_DESK_PREVIEW.metaTitle,
    description: OPERATOR_DESK_PREVIEW.disclaimer,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/journeys/operator-desk',
    siteName: 'assembl',
  },
};

export default function OperatorDeskDemoPage() {
  return <OperatorDeskDemo />;
}
