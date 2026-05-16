'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  AGENTS,
  CAPABILITY_LABELS,
  agentsForKete,
  type Capability,
} from '@/lib/agents';
import { KETES, type KeteSlug } from '@/lib/kete';
import { AgentCard } from '@/components/site/AgentCard';

type KeteFilter = KeteSlug | 'all';
type CapabilityFilter = Capability | 'all';
type SortOption = 'popular' | 'alphabetical' | 'legislation';

export function AgentMarketplace() {
  const [keteFilter, setKeteFilter] = useState<KeteFilter>('all');
  const [capabilityFilter, setCapabilityFilter] = useState<CapabilityFilter>('all');
  const [sort, setSort] = useState<SortOption>('popular');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = keteFilter === 'all' ? [...AGENTS] : agentsForKete(keteFilter);
    if (capabilityFilter !== 'all') {
      result = result.filter((a) => a.capabilities.includes(capabilityFilter));
    }
    if (sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'legislation') {
      result.sort((a, b) => (b.legislation.length || 0) - (a.legislation.length || 0));
    }
    return result;
  }, [keteFilter, capabilityFilter, sort]);

  const toggleSelected = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const allCapabilities = useMemo(() => {
    const set = new Set<Capability>();
    AGENTS.forEach((a) => a.capabilities.forEach((c) => set.add(c)));
    return Array.from(set);
  }, []);

  // Rough cost estimate from selected agents
  const estimate = useMemo(() => {
    const list = AGENTS.filter((a) => selected.has(a.slug));
    const ketes = new Set(list.map((a) => a.kete));
    const minPerOutput = list
      .map((a) => a.buyingOptions.perOutput ?? Infinity)
      .reduce((acc, n) => Math.min(acc, n), Infinity);
    return {
      count: list.length,
      keteCount: ketes.size,
      minPerOutput: minPerOutput === Infinity ? null : minPerOutput,
    };
  }, [selected]);

  return (
    <>
      {/* Filter bar — sticky at top of section after scroll */}
      <div className="sticky top-16 z-30 -mx-6 mb-12 border-b border-[rgba(35,33,31,0.08)] bg-[rgba(250,247,242,0.85)] px-6 py-5 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
          {/* Kete chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Kete
            </span>
            <FilterChip
              active={keteFilter === 'all'}
              onClick={() => setKeteFilter('all')}
              label="All"
            />
            {KETES.map((k) => (
              <FilterChip
                key={k.slug}
                active={keteFilter === k.slug}
                onClick={() => setKeteFilter(k.slug)}
                label={k.name}
                accent={k.accent}
              />
            ))}
          </div>

          {/* Sort */}
          <label className="flex items-center gap-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-full border border-[rgba(35,33,31,0.12)] bg-white/60 px-3 py-1.5 font-mono text-xs"
            >
              <option value="popular">Most popular</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="legislation">By legislation depth</option>
            </select>
          </label>
        </div>

        {/* Capability chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Capability
          </span>
          <FilterChip
            active={capabilityFilter === 'all'}
            onClick={() => setCapabilityFilter('all')}
            label="All"
          />
          {allCapabilities.map((c) => (
            <FilterChip
              key={c}
              active={capabilityFilter === c}
              onClick={() => setCapabilityFilter(c)}
              label={CAPABILITY_LABELS[c]}
            />
          ))}
        </div>
      </div>

      {/* Agent grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center font-mono text-sm text-[color:var(--text-secondary)]">
          No agents match this filter combination.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent, i) => (
            <AgentCard
              key={agent.slug}
              agent={agent}
              index={i}
              selected={selected.has(agent.slug)}
              onToggle={() => toggleSelected(agent.slug)}
            />
          ))}
        </div>
      )}

      {/* Sticky cart */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(35,33,31,0.10)] bg-[rgba(250,247,242,0.96)] backdrop-blur-xl"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="container py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-lg text-[color:var(--text-primary)]">
                    {estimate.count} {estimate.count === 1 ? 'agent' : 'agents'} selected
                    {estimate.keteCount > 0 && (
                      <span className="ml-2 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        across {estimate.keteCount} {estimate.keteCount === 1 ? 'kete' : 'kete'}
                      </span>
                    )}
                  </p>
                  {estimate.minPerOutput !== null && (
                    <p className="mt-1 font-mono text-xs text-[color:var(--text-secondary)]">
                      from NZ${estimate.minPerOutput} per output · or bundled into a Subscribe plan
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                  >
                    Clear
                  </button>
                  <Link
                    href={`/pricing?selected=${Array.from(selected).join(',')}`}
                    className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                  >
                    Continue to setup
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
        active
          ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
          : 'border-[rgba(35,33,31,0.15)] bg-white/40 text-[color:var(--text-secondary)] hover:border-[rgba(35,33,31,0.35)] hover:text-[color:var(--text-primary)]'
      }`}
    >
      {accent && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      {label}
    </button>
  );
}
