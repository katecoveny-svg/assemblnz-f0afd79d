import type { Metadata } from 'next';
import { EarnEventHome } from '@/components/loyalty/EarnEventHome';
import { MASTHEAD, TWELVE_WORD_ENERGY } from '@/lib/loyalty/one-nz';

export const metadata: Metadata = {
  title: 'the wait is the earn event',
  description: TWELVE_WORD_ENERGY,
  alternates: { canonical: '/' },
  openGraph: {
    title: `assembl · ${MASTHEAD}`,
    description: TWELVE_WORD_ENERGY,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: `assembl · ${MASTHEAD}`,
    description: TWELVE_WORD_ENERGY,
  },
};

export default function HomePage() {
  return <EarnEventHome />;
}
