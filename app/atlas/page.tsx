import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketplaceAgentBySlug, toPublicAgent } from '@/lib/marketplace/agents';
import { AtlasExperience } from './AtlasExperience';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Atlas — the free AI coach · assembl',
  description:
    'Atlas is assembl’s free AI literacy coach. Tell it about your week and it points you to the agents that fit — and is honest about where AI will not help. Voice-enabled. No message cap.',
};

export default function AtlasPage() {
  // Atlas lives in the marketplace registry; the standalone surface reuses the
  // same locked prompt (applied server-side in /api/atlas/chat). Only the
  // client-safe projection crosses to the browser.
  const agent = marketplaceAgentBySlug('atlas');
  if (!agent) notFound();

  return <AtlasExperience agent={toPublicAgent(agent)} />;
}
