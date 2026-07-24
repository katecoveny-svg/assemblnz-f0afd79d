import type { Metadata } from 'next';
import { CinematicConcepts } from '@/components/site/cinematic/CinematicConcepts';
import '../cine.css';

/**
 * /concepts — the public, client-name-free walkthrough of the five journeys.
 * Answers the question the agent builder kept surfacing about assembl's own
 * site: whether any of this works outside groceries.
 */

export const metadata: Metadata = {
  title: 'concepts — assembl',
  description:
    'Five industries, one architecture: grocery and loyalty, airline and travel, energy, retirement living and care, trades and professional services. The same customer journey, configured differently.',
  alternates: { canonical: '/concepts' },
};

export default function ConceptsPage() {
  return <CinematicConcepts />;
}
