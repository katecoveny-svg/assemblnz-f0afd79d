import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { agentBySlug } from '@/lib/agents';
import { getKete } from '@/lib/kete';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { MarketplaceAgentDetail } from './MarketplaceAgentDetail';
import { FleetAgentDetail } from './FleetAgentDetail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const marketplace = marketplaceAgentBySlug(slug);
  if (marketplace) {
    return {
      title: `${marketplace.name} — assembl agent`,
      description: marketplace.description,
    };
  }

  const fleet = agentBySlug(slug);
  if (!fleet) return {};
  const kete = getKete(fleet.kete);
  return {
    title: `${fleet.name} — ${kete.name} agent`,
    description: fleet.oneLiner,
  };
}

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ workflow?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  // Marketplace agents take precedence — this is the consumer App Store surface.
  const marketplace = marketplaceAgentBySlug(slug);
  if (marketplace) {
    return <MarketplaceAgentDetail agent={marketplace} />;
  }

  // Fall back to the original kete-fleet detail so existing deep links keep
  // working (command palette, /app/chat, dev launch-readiness, etc.).
  const fleet = agentBySlug(slug);
  if (!fleet) notFound();

  return <FleetAgentDetail agent={fleet} workflowParam={sp.workflow} />;
}
