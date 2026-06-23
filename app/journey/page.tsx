import type { Metadata } from 'next';
import { JourneyScene } from './JourneyScene';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your journey — learn AI by doing · assembl',
  description:
    'Your AI-literacy journey. Every agent you use is a town on the map, every badge a landmark. Climb from Beginner to Kaitiaki with daily missions and points.',
};

export default function JourneyPage() {
  return <JourneyScene />;
}
