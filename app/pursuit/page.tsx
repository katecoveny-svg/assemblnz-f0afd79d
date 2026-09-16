import type { Metadata } from 'next';
import { PursuitLanding } from '@/components/site/pursuit/PursuitLanding';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit · find it. · assembl' },
  description: 'Research the opportunity, develop a credible idea and prepare the next conversation with assembl Pursuit.',
  alternates: { canonical: '/pursuit' },
};
export default function PursuitPage() { return <PursuitLanding />; }
