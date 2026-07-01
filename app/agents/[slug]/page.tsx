import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { agentBySlug } from '@/lib/agents';
import { getKete } from '@/lib/kete';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { MarketplaceAgentDetail } from './MarketplaceAgentDetail';
import { FleetAgentDetail } from './FleetAgentDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, agentProductNode, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const marketplace = marketplaceAgentBySlug(slug);
  if (marketplace) {
    const url = `${SITE_URL}/agents/${marketplace.slug}`;
    const title = `${marketplace.name} — assembl agent`;
    return {
      title,
      description: marketplace.description,
      alternates: { canonical: `/agents/${marketplace.slug}` },
      openGraph: {
        title,
        description: marketplace.description,
        url,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: marketplace.description,
      },
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
    // Product + Offer + Breadcrumb schema so answer engines can cite
    // "what does {agent} do" with the real price and category.
    const agentGraph = graph(
      agentProductNode({
        slug: marketplace.slug,
        name: marketplace.name,
        description: marketplace.description,
        priceNzd: marketplace.priceNzd,
        category: marketplace.category,
      }),
      breadcrumbNode([
        { name: 'assembl', path: '/' },
        { name: 'Agents', path: '/agents' },
        { name: marketplace.name, path: `/agents/${marketplace.slug}` },
      ]),
    );
    return (
      <>
        <JsonLd data={agentGraph} />
        <MarketplaceAgentDetail agent={marketplace} />
      </>
    );
  }

  // Fall back to the original kete-fleet detail so existing deep links keep
  // working (command palette, /app/chat, dev launch-readiness, etc.).
  const fleet = agentBySlug(slug);
  if (!fleet) notFound();

  return <FleetAgentDetail agent={fleet} workflowParam={sp.workflow} />;
}
