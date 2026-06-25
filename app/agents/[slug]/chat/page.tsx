import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketplaceAgentBySlug, toPublicAgent } from '@/lib/marketplace/agents';
import { canAccessHiddenAgent } from '@/lib/marketplace/private-access';
import { AgentChat } from './AgentChat';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: `Chat with ${agent.name} — assembl`,
    description: agent.description,
    manifest: `/agents/${slug}/manifest.json`,
    appleWebApp: { capable: true, title: agent.name, statusBarStyle: 'default' },
    icons: { apple: `/agents/${slug}/icon?size=180` },
  };
}

export default async function AgentChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) notFound();

  // Private agents (e.g. Echo) are owner-only — treat as not-found for anyone else.
  if (agent.hidden && !(await canAccessHiddenAgent())) notFound();

  // Only the client-safe projection crosses to the browser — the locked system
  // prompt stays server-side (it is applied in the API route).
  return <AgentChat agent={toPublicAgent(agent)} />;
}
