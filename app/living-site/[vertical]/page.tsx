import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SampleSite } from '@/components/living-site/SampleSite';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { verticalBySlug } from '@/lib/living-site/verticals';

// Every fact on these pages reads from the Business Genome on each request —
// edit the genome and the website updates. That's the Living Site.
export const dynamic = 'force-dynamic';

type Params = { vertical: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const v = verticalBySlug((await params).vertical);
  if (!v) return {};
  return {
    title: `${v.businessName} — a living site by assembl (sample)`,
    description: `${v.heroLede} A fictional sample ${v.industryLabel} business generated from a Business Genome.`,
    // Fictional sample businesses — never in real search results.
    robots: { index: false, follow: false },
  };
}

export default async function SampleVerticalPage({ params }: { params: Promise<Params> }) {
  const v = verticalBySlug((await params).vertical);
  if (!v) notFound();

  const { facts, live } = await getGenomeFactsFor(v.tenant, v.fallbackFacts);
  return <SampleSite v={v} facts={facts} live={live} />;
}
