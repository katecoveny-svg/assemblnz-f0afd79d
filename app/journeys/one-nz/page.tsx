import type { Metadata } from 'next';
import { OneNzJourney } from './OneNzJourney';

export const metadata: Metadata = {
  title: 'One NZ concept journey · Wait → Earn → Phone Dollars',
  description:
    'Independent concept demo: a One NZ plan-change wait that becomes Phone Dollars and locks as a Mana Receipt. Not an official One NZ product.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/journeys/one-nz' },
};

export default function OneNzJourneyPage() {
  return <OneNzJourney />;
}
