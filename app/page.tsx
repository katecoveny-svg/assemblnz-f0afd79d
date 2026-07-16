import type { Metadata } from 'next';
import { AssemblHero } from '@/components/assembl-hero/AssemblHero';
import { BusinessGenomeOrbit } from '@/components/genome-orbit/BusinessGenomeOrbit';
import { BuildScroll } from '@/components/build-scroll/BuildScroll';
import { PatternDivider } from '@/components/pattern-studio/PatternDivider';
import { BusinessGenomeSection } from '@/components/business-genome/BusinessGenomeSection';
import { GENOME_FACTS, GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';

export const metadata: Metadata = {
  title: 'assembl — your living Business Genome',
  description:
    'assembl connects your business knowledge, people, tools and workflows into one living operating system, with specialised agents and human approval kept visible.',
  alternates: { canonical: '/' },
};

/**
 * Dashboard-first front door. The interactive workspace carries the company
 * story; the full interactive Business Genome remains available at /genome.
 */
export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#313c42' }}>
      <AssemblHero />
      <BusinessGenomeOrbit />
      <BuildScroll />
      <PatternDivider />
      <BusinessGenomeSection genomeFacts={GENOME_FACTS.length} surfaces={GENOME_SURFACES.length} />
    </div>
  );
}
