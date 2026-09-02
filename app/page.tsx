import type { Metadata } from 'next';
import { EarnEventHome } from '@/components/loyalty/EarnEventHome';
import { ASSEMBL_HOME_SPINE, MASTHEAD } from '@/lib/loyalty/one-nz';

export const metadata: Metadata = {
  title: 'the wait is the earn event',
  description: ASSEMBL_HOME_SPINE,
  alternates: { canonical: '/' },
  openGraph: {
    title: `assembl · ${MASTHEAD}`,
    description: ASSEMBL_HOME_SPINE,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: `assembl · ${MASTHEAD}`,
    description: ASSEMBL_HOME_SPINE,
  },
};

export default function HomePage() {
  return <EarnEventHome />;
}
