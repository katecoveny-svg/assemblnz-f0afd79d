import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PITCH_DEMOS, PITCH_SLUGS, type PitchDemo } from '@/lib/pitch-demos';
import { PitchDemoView } from './PitchDemo';

type Params = { slug: string };

export function generateStaticParams() {
  return PITCH_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const demo = PITCH_DEMOS[slug as PitchDemo['slug']];
  if (!demo) return {};
  return {
    title: `${demo.company} concept · assembl`,
    description: demo.support,
    robots: { index: false, follow: false },
  };
}

export default async function PitchPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const demo = PITCH_DEMOS[slug as PitchDemo['slug']];
  if (!demo) notFound();
  return <PitchDemoView demo={demo} />;
}
