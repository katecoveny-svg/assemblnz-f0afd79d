import type { Metadata } from 'next';
import { WaitEarnHome } from '@/components/site/WaitEarnHome';
import './wait-earn-home.css';

export const metadata: Metadata = {
  title: 'the wait is the earn event',
  description:
    'assembl turns real customer waits into permissioned earn moments — NZ-first loyalty where the wait is the earn event.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'assembl · the wait is the earn event',
    description:
      'While a real process runs, the customer earns value for one useful action — with proof that locks last.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl · the wait is the earn event',
    description:
      'While a real process runs, the customer earns value for one useful action — with proof that locks last.',
  },
};

export default function HomePage() {
  return <WaitEarnHome />;
}
