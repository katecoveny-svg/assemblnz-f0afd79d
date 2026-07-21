import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketplaceAgentBySlug, toPublicAgent } from '@/lib/marketplace/agents';
import { AgentChat } from './AgentChat';
import Link from 'next/link';
import { KAUMATUA_HELD_SLUGS, KAUMATUA_HOLD_MESSAGE } from '@/lib/agents/knowledge-map';

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

  if (KAUMATUA_HELD_SLUGS.has(slug)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ec] px-6 text-[#252b2e]">
        <section className="w-full max-w-xl border border-black/15 bg-[#faf9f5] p-8 md:p-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Agent review boundary</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{agent.name} is paused.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#5e6260]">{KAUMATUA_HOLD_MESSAGE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/agents/keeper" className="bg-[#111412] px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-white">
              Meet Keeper
            </Link>
            <Link href={`/agents/${slug}`} className="border border-black/20 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em]">
              Back to agent
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Only the client-safe projection crosses to the browser — the locked system
  // prompt stays server-side (it is applied in the API route).
  return <AgentChat agent={toPublicAgent(agent)} />;
}
