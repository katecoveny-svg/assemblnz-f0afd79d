import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { journeyRepository } from '@/lib/journey/repository';
import { EVERYDAY_ASSEMBLED_ID } from '@/lib/journey/journeys/everyday-assembled';
import { JourneyExperience } from '../journeys/[journeyId]/JourneyExperience';
import { loadJourneyRunAction } from '../journeys/[journeyId]/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The assembl experience — everyday, assembled',
  description:
    'Enter a real sandbox agentic customer journey: understand intent, gather only useful context, assemble an approval-ready plan, and prove the result. Everything simulated and clearly labelled.',
  robots: { index: false, follow: false },
};

/**
 * Canonical public experience route. Presents the `everyday, assembled`
 * reference journey using real journey state and runtime events — not a linear
 * animation. Resumes a persisted run via `?run=<id>`.
 */
export default async function ExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const journey = await journeyRepository.findJourneyPublic(EVERYDAY_ASSEMBLED_ID);
  if (!journey) notFound();
  const { run: runId } = await searchParams;
  const initialRun = runId ? await loadJourneyRunAction(journey.tenantId, runId) : null;
  return <JourneyExperience journey={journey} initialRun={initialRun} />;
}
