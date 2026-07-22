import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { journeyRepository } from '@/lib/journey/repository';
import { JourneyExperience } from './JourneyExperience';
import { loadJourneyRunAction } from './actions';

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
  searchParams,
}: {
  params: Promise<{ journeyId: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const { journeyId } = await params;
  const journey = await journeyRepository.findJourneyPublic(journeyId);
  if (!journey) notFound();

  // Resume a persisted run when ?run=<id> is present (scoped to this tenant).
  const { run: runId } = await searchParams;
  const initialRun = runId ? await loadJourneyRunAction(journey.tenantId, runId) : null;

  return <JourneyExperience journey={journey} initialRun={initialRun} />;
}
