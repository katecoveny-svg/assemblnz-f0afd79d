import type { Metadata } from 'next';
import { ActiveJourneyHome } from '@/components/site/ActiveJourneyHome';
import './active-journey-home.css';

export const metadata: Metadata = {
  title: 'active customer journeys',
  description:
    'assembl turns necessary customer waiting into useful, permissioned preparation, with a person in control and proof of what happened.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <ActiveJourneyHome />;
}
