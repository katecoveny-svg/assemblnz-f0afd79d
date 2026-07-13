import type { Metadata } from 'next';
import { GenomeDomeExperience } from '@/components/genome-dome/GenomeDomeExperience';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';

// The dome's drawer reads the genome live — same ripple as every surface.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'the business genome — one source of truth, everything connected · assembl',
  description:
    'The Business Genome as a liquid glass dome: every surface of the business orbits one source of truth. Click a gold node to see exactly which facts it reads — live.',
  alternates: { canonical: '/genome' },
};

export default async function GenomePage() {
  const { facts, live } = await getLiveGenomeFacts();
  return <GenomeDomeExperience facts={facts} live={live} />;
}
