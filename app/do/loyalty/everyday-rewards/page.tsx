import type { Metadata } from 'next';
import LoyaltyDo from './LoyaltyDo';

export const metadata: Metadata = {
  title: 'Everyday, a little easier. | Loyalty DO concept by assembl',
  description: 'An independent Assembl proposal for a Woolworths NZ Everyday Rewards loyalty DO. Fictional shopping demonstration; no retailer connection.',
  robots: { index: false, follow: false },
};

export default function Page() { return <LoyaltyDo />; }
