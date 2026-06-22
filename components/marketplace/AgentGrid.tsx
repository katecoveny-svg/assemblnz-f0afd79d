'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import {
  CATEGORIES,
  PALETTE,
  PRICING_TIER_LABELS,
  type MarketplaceCategory,
  type PublicMarketplaceAgent,
} from '@/lib/marketplace/agents';
import { AgentIcon } from './AgentIcon';

type Filter = 'all' | MarketplaceCategory;

export function AgentGrid({ agents }: { agents: PublicMarketplaceAgent[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.teReo.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [agents, query, filter]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          size={18}
          style={{ color: PALETTE.forest, opacity: 0.4 }}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents — fridge, tax, captions, meetings…"
          aria-label="Search agents"
          className="w-full rounded-full border bg-white/70 py-3 pl-11 pr-4 text-base outline-none transition focus:bg-white"
          style={{ borderColor: 'rgba(22,58,35,0.15)', color: PALETTE.forest }}
        />
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
            {c.label}
          </FilterChip>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-16 text-center text-base" style={{ color: PALETTE.forest, opacity: 0.6 }}>
          No agents match that. Try a different word.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 text-sm font-medium transition"
      style={
        active
          ? { backgroundColor: PALETTE.forest, color: PALETTE.cream, borderColor: PALETTE.forest }
          : { backgroundColor: 'transparent', color: PALETTE.forest, borderColor: 'rgba(22,58,35,0.18)' }
      }
    >
      {children}
    </button>
  );
}

function AgentCard({ agent }: { agent: PublicMarketplaceAgent }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl border bg-white/75 p-5 transition hover:bg-white hover:shadow-[0_18px_40px_rgba(22,58,35,0.08)]"
      style={{ borderColor: 'rgba(22,58,35,0.12)' }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${agent.accent}33` }}
        >
          <AgentIcon name={agent.icon} className="h-6 w-6" />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: 'rgba(22,58,35,0.06)', color: PALETTE.forest }}
        >
          {PRICING_TIER_LABELS[agent.pricingTier]}
        </span>
      </div>

      <Link href={`/agents/${agent.slug}`} className="flex-1">
        <h3 className="font-display text-xl leading-tight" style={{ color: PALETTE.forest }}>
          {agent.name}
        </h3>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide" style={{ color: PALETTE.forest, opacity: 0.5 }}>
          {agent.teReo}
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: PALETTE.forest, opacity: 0.8 }}>
          {agent.description}
        </p>
      </Link>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/agents/${agent.slug}/chat`}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ backgroundColor: PALETTE.forest, color: PALETTE.cream }}
        >
          Install
          <ArrowRight size={15} aria-hidden />
        </Link>
        <Link
          href={`/agents/${agent.slug}`}
          className="rounded-full px-3 py-2 text-sm font-medium transition hover:opacity-70"
          style={{ color: PALETTE.forest }}
        >
          Details
        </Link>
      </div>
    </div>
  );
}
