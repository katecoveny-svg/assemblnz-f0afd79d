import type { Metadata } from 'next';
import { GenomeShowcase } from '@/components/business-genome/GenomeShowcase';
import { getGenomeFactsFor, getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { ASSEMBL_TENANT, ASSEMBL_GENOME_FACTS } from '@/lib/customers/assembl/genome';

// assembl's OWN genome first — live from the database, the same rows the ad
// studio and operating loop read. The fictional sample sandbox is one tap
// away. Both reads are live-per-request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'assembl runs on its own genome — live Business Genome · assembl',
  description:
    'The owner-confirmed facts this business runs on, live from the database — the same Business Genome architecture every assembl install gets. Try a safe sandbox on a fictional sample business.',
  alternates: { canonical: '/genome' },
};

export default async function GenomePage() {
  const [assembl, sample] = await Promise.all([
    getGenomeFactsFor(ASSEMBL_TENANT, ASSEMBL_GENOME_FACTS),
    getLiveGenomeFacts(),
  ]);
  return (
    <GenomeShowcase
      assemblFacts={assembl.facts}
      assemblLive={assembl.live}
      sampleFacts={sample.facts}
      sampleLive={sample.live}
    />
  );
}
