import type { Metadata } from 'next';
import { PublicGenomeDemo } from '@/components/business-genome/PublicGenomeDemo';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';

// The public demonstration reads the same live Genome as every connected
// sample-business surface. All edits are session-only sandbox scenarios.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'live demo — change one fact, see the work update · assembl',
  description:
    'Try assembl on a fictional Auckland business. Change one fact, see the work update, then run an agent that shows its sources.',
  alternates: { canonical: '/genome' },
};

export default async function GenomePage() {
  const { facts, live } = await getLiveGenomeFacts();
  return <PublicGenomeDemo facts={facts} live={live} />;
}
