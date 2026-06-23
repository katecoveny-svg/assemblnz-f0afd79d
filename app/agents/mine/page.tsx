import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Plus, Compass } from 'lucide-react';
import { MarketplaceHeader, MarketplaceFooter } from '@/components/marketplace/MarketplaceChrome';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { PALETTE, PUBLIC_MARKETPLACE_AGENTS, priceLabel } from '@/lib/marketplace/agents';
import { createClient } from '@/lib/supabase/server';
import { listDrafts, getOwner, type StoredDraft } from '@/lib/pilot/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My agents · assembl',
  description: 'Your installed agents and the drafts you have built with Pilot.',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'In review',
  published: 'Published',
  archived: 'Archived',
};

async function installedSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('agent_installs').select('agent_slug');
  return (data ?? []).map((r) => r.agent_slug as string);
}

export default async function MyAgentsPage() {
  const owner = await getOwner();
  if (!owner) redirect(`/login?redirectTo=${encodeURIComponent('/agents/mine')}`);

  const [drafts, slugs] = await Promise.all([listDrafts(), installedSlugs()]);
  const installed = PUBLIC_MARKETPLACE_AGENTS.filter((a) => slugs.includes(a.slug));

  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <section className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mk-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: PALETTE.gold }}>
              Your shelf
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl" style={{ color: PALETTE.ink, fontWeight: 900 }}>
              My agents
            </h1>
          </div>
          <Link
            href="/pilot"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
            style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
          >
            <Plus size={16} /> Build a new agent
          </Link>
        </div>

        {/* Drafts built with Pilot */}
        <div className="mt-10">
          <h2 className="text-xl" style={{ color: PALETTE.ink, fontWeight: 900 }}>
            Built with Pilot
          </h2>
          {drafts.length === 0 ? (
            <EmptyDrafts />
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {drafts.map((d) => (
                <DraftCard key={d.id} draft={d} />
              ))}
            </div>
          )}
        </div>

        {/* Installed marketplace agents */}
        <div className="mt-12">
          <h2 className="text-xl" style={{ color: PALETTE.ink, fontWeight: 900 }}>
            Installed from the marketplace
          </h2>
          {installed.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: PALETTE.muted }}>
              Nothing installed yet.{' '}
              <Link href="/agents" className="underline" style={{ color: PALETTE.ink, fontWeight: 700 }}>
                Browse the marketplace
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {installed.map((a) => (
                <Link
                  key={a.slug}
                  href={`/agents/${a.slug}/chat`}
                  className="flex items-center gap-3 rounded-[20px] border bg-white p-4 transition hover:-translate-y-0.5"
                  style={{ borderColor: PALETTE.hairline }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${a.accent}55` }}>
                    <AgentIcon name={a.icon} className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm" style={{ color: PALETTE.ink, fontWeight: 900 }}>
                      {a.name}
                    </span>
                    <span className="mk-mono block text-[10px] uppercase tracking-[0.14em]" style={{ color: PALETTE.muted }}>
                      {priceLabel(a)}
                    </span>
                  </span>
                  <ArrowRight size={15} style={{ color: PALETTE.muted }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <MarketplaceFooter />
    </div>
  );
}

function DraftCard({ draft }: { draft: StoredDraft }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border bg-white p-4" style={{ borderColor: PALETTE.hairline }}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${draft.accent}55` }}>
        <AgentIcon name={draft.icon} className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm" style={{ color: PALETTE.ink, fontWeight: 900 }}>
            {draft.name || 'Untitled'}{' '}
            {draft.teReo && <span className="mk-mono text-[11px]" style={{ color: PALETTE.muted }}>· {draft.teReo}</span>}
          </span>
          <span
            className="mk-mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]"
            style={{ backgroundColor: PALETTE.cream, color: PALETTE.gold, border: `1px solid ${PALETTE.hairline}` }}
          >
            {STATUS_LABEL[draft.status] ?? draft.status}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs" style={{ color: PALETTE.body }}>
          {draft.description || 'No description yet.'}
        </p>
        <p className="mk-mono mt-2 text-[10px] uppercase tracking-[0.14em]" style={{ color: PALETTE.muted }}>
          {draft.tools.length} tools · {draft.compliance.length} NZ rules
        </p>
      </div>
    </div>
  );
}

function EmptyDrafts() {
  return (
    <div className="mt-4 flex flex-col items-start gap-3 rounded-[22px] border border-dashed p-6" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${PALETTE.canary}55` }}>
        <Compass className="h-6 w-6" style={{ color: PALETTE.ink }} />
      </span>
      <p className="text-base" style={{ color: PALETTE.ink, fontWeight: 700 }}>
        You haven&apos;t built an agent yet.
      </p>
      <p className="text-sm" style={{ color: PALETTE.body }}>
        Pilot walks you through it, one step at a time. Your first one is free.
      </p>
      <Link
        href="/pilot"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
        style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
      >
        Build your first agent <ArrowRight size={15} />
      </Link>
    </div>
  );
}
