'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import {
  CATEGORIES,
  PALETTE,
  priceLabel,
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
          style={{ color: PALETTE.muted }}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents — fridge, tax, captions, meetings…"
          aria-label="Search agents"
          className="w-full rounded-full border bg-white py-3 pl-11 pr-4 text-base outline-none transition focus:border-[color:#FFD42A]"
          style={{ borderColor: PALETTE.hairline, color: PALETTE.ink }}
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
        <p className="py-16 text-center text-base" style={{ color: PALETTE.body }}>
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
      className="rounded-full border px-4 py-1.5 text-sm font-bold transition"
      style={
        active
          ? { backgroundColor: PALETTE.canary, color: PALETTE.ink, borderColor: PALETTE.canary }
          : { backgroundColor: 'transparent', color: PALETTE.ink, borderColor: PALETTE.hairline }
      }
    >
      {children}
    </button>
  );
}

function AgentCard({ agent }: { agent: PublicMarketplaceAgent }) {
  return (
    <div
      className="group relative flex flex-col rounded-[26px] border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(180,150,40,0.12)]"
      style={{ borderColor: PALETTE.hairline }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: agent.accent }}
        >
          <AgentIcon name={agent.icon} tone={agent.tile} className="h-7 w-7" />
        </div>
        <span
          className="mk-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: PALETTE.cream, color: PALETTE.gold }}
        >
          {priceLabel(agent)}
        </span>
      </div>

      <Link href={`/agents/${agent.slug}`} className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3
            className="text-xl leading-tight"
            style={{ fontFamily: 'var(--mk-display), sans-serif', fontWeight: 900, letterSpacing: '-0.02em', color: PALETTE.ink }}
          >
            {agent.name}
          </h3>
          {agent.teReo ? (
            <span className="mk-mono text-[11px]" style={{ color: PALETTE.muted }}>
              {agent.teReo}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
          {agent.description}
        </p>
      </Link>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/agents/${agent.slug}/chat`}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
          style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
        >
          Install
          <ArrowRight size={15} aria-hidden />
        </Link>
        <Link
          href={`/agents/${agent.slug}`}
          className="rounded-full px-3 py-2 text-sm font-bold transition hover:opacity-70"
          style={{ color: PALETTE.ink }}
        >
          Details
        </Link>
      </div>
    </div>
  );
}
