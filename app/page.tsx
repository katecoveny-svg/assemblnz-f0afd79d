import type { Metadata } from 'next';
import { ActiveJourneyHome } from '@/components/site/ActiveJourneyHome';
import './active-journey-home.css';

export const metadata: Metadata = {
  title: 'agentic customer journeys that make waiting useful',
  description:
    'assembl turns real customer waits into useful, permissioned preparation. Optional rewards and customer-approved knowledge help teams provide more relevant service, with a named person in control.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'assembl | useful agentic customer journeys',
    description:
      'Turn real customer waits into useful preparation, optional value and more relevant service, with the customer and a named person in control.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl | useful agentic customer journeys',
    description:
      'Turn real customer waits into useful preparation, optional value and more relevant service, with the customer and a named person in control.',
  },
};

export default function HomePage() {
  return <ActiveJourneyHome />;
}
