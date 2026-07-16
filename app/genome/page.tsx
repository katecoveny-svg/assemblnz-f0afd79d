import type { Metadata } from 'next';
import { PublicGenomeDemo } from '@/components/business-genome/PublicGenomeDemo';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';

// The public demonstration reads the same live Genome as every connected
// sample-business surface. All edits are session-only sandbox scenarios.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'live Business Genome demo — one source of truth, governed agents · assembl',
  description:
    'Try a real assembl Business Genome on a fictional Auckland business. Change one fact, see every connected surface respond, then run a governed agent with sources and human approval visible.',
  alternates: { canonical: '/genome' },
};

export default async function GenomePage() {
  const { facts, live } = await getLiveGenomeFacts();
  return <PublicGenomeDemo facts={facts} live={live} />;
}
