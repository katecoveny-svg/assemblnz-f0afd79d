import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketplaceAgentBySlug, toPublicAgent } from '@/lib/marketplace/agents';
import { AgentChat } from './AgentChat';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: `Chat with ${agent.name} — assembl`,
    description: agent.description,
  };
}

export default async function AgentChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) notFound();

  // Only the client-safe projection crosses to the browser — the locked system
  // prompt stays server-side (it is applied in the API route).
  return <AgentChat agent={toPublicAgent(agent)} />;
}
