import type { Metadata } from 'next';
import '@/app/do/do-craft.css';
import { GROCERY_LOYALTY_SPONSORED_DEMO } from '@/lib/do/sponsored-journeys';
import { SponsoredJourneyClient } from './SponsoredJourneyClient';

export const metadata: Metadata = {
  title: { absolute: 'Sponsored Journeys · DO · assembl' },
  description:
    'Assembl Sponsored Journeys prototype on DO — provider-neutral, not OpenAI Sponsored Agents. Demo grocery/loyalty stubs with Permit and Receipt.',
  alternates: { canonical: '/do/sponsored' },
  robots: { index: false, follow: false },
};

export default function SponsoredJourneysPage() {
  return <SponsoredJourneyClient demo={GROCERY_LOYALTY_SPONSORED_DEMO} />;
}
