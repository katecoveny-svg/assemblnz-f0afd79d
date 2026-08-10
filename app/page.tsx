import type { Metadata } from 'next';
import { ActiveJourneyHome } from '@/components/site/ActiveJourneyHome';
import './active-journey-home.css';

export const metadata: Metadata = {
  title: 'active customer journeys',
  description:
    'assembl helps organisations turn necessary customer waiting into useful, permissioned preparation—with a named person in control and evidence of what happened.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'assembl | active customer journeys',
    description:
      'assembl helps organisations turn necessary customer waiting into useful, permissioned preparation—with a named person in control and evidence of what happened.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl | active customer journeys',
    description:
      'assembl helps organisations turn necessary customer waiting into useful, permissioned preparation—with a named person in control and evidence of what happened.',
  },
};

export default function HomePage() {
  return <ActiveJourneyHome />;
}
