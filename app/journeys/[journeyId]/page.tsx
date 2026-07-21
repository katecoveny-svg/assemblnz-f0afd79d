import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { journeyRepository } from '@/lib/journey/repository';
import { JourneyExperience } from './JourneyExperience';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}): Promise<Metadata> {
  const { journeyId } = await params;
  const journey = await journeyRepository.findJourneyPublic(journeyId);
  if (!journey) return { title: 'Journey not found · assembl' };
  return {
    title: `${journey.name} · an agentic customer journey · assembl`,
    description: journey.description,
    robots: { index: false, follow: false },
  };
}

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  const journey = await journeyRepository.findJourneyPublic(journeyId);
  if (!journey) notFound();
  return <JourneyExperience journey={journey} />;
}
