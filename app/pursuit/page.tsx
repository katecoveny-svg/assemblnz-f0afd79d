import type { Metadata } from 'next';
import { PursuitLanding } from '@/components/site/pursuit/PursuitLanding';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit · find it. · assembl' },
  description:
    'Research the opportunity, develop a credible idea and prepare the next conversation with assembl Pursuit. Machine-readable docs for agents; private hub for client work.',
  alternates: { canonical: '/pursuit' },
};

/** Lean www Pursuit — Find the opening. No playground / NZ-tool demo. */
export default function PursuitPage() {
  return <PursuitLanding />;
}
