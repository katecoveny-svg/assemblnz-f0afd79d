import type { Metadata } from 'next';
import { OneNzJourney } from '@/components/loyalty/OneNzJourney';
import { INDEPENDENT_CONCEPT_DISCLAIMER, MASTHEAD } from '@/lib/loyalty/one-nz';

export const metadata: Metadata = {
  title: 'One NZ · agentic loyalty journey',
  description:
    'Independent concept: the wait is the earn event. Phone Dollars stamp into One Wallet while you wait — with Mana Receipts as evidence. Not a current One NZ offer.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/one-nz' },
  openGraph: {
    title: `assembl · ${MASTHEAD}`,
    description: INDEPENDENT_CONCEPT_DISCLAIMER,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/journeys/one-nz',
    siteName: 'assembl',
  },
};

export default function OneNzJourneyPage() {
  return <OneNzJourney />;
}
