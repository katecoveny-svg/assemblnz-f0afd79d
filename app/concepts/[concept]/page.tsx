import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getConcept } from '@/lib/concepts/registry';
import { verifyConceptAccess, conceptProtectionConfigured, CONCEPT_COOKIE } from '@/lib/concepts/access';
import { journeyRepository } from '@/lib/journey/repository';
import { ConceptExperience } from '@/components/concepts/ConceptExperience';
import { ConceptGate } from '@/components/concepts/ConceptGate';

export const dynamic = 'force-dynamic';

// Private by default: never indexed, never in the sitemap, no public directory.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ concept: string }>;
}): Promise<Metadata> {
  const { concept } = await params;
  const cfg = getConcept(concept);
  return {
    title: cfg ? `${cfg.programme} × assembl — private concept` : 'Private concept',
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function ConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ concept: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { concept } = await params;
  const cfg = getConcept(concept);
  if (!cfg) notFound();

  // Access: cookie (set by the /enter magic link) or a direct ?k= on first hit.
  const cookieKey = (await cookies()).get(CONCEPT_COOKIE)?.value;
  const { k } = await searchParams;
  const verdict = verifyConceptAccess(concept, cookieKey ?? k);

  if (!verdict.ok) {
    // Fail closed — render the gate only, never concept content.
    return <ConceptGate concept={cfg} configured={conceptProtectionConfigured()} />;
  }

  const journey = await journeyRepository.findJourneyPublic(cfg.journeyId);
  if (!journey) notFound();

  return <ConceptExperience concept={cfg} journey={journey} previewMode={verdict.reason === 'dev'} />;
}
