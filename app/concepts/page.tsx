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
    'Same journey shape across five industries: grocery, airline, energy, retirement living, and trades. A customer wait, work prepared inside it, and a human yes before anything happens.',
  alternates: { canonical: '/concepts' },
};

export default function ConceptsPage() {
  return <CinematicConcepts />;
}
