'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Plus } from 'lucide-react';
import {
  AGENTS,
  CAPABILITY_LABELS,
  agentsForKete,
  type Agent,
  type Capability,
} from '@/lib/agents';
import { KETES, type KeteSlug } from '@/lib/kete';

type KeteFilter = KeteSlug | 'all';
type CapabilityFilter = Capability | 'all';
type SortOption = 'popular' | 'alphabetical' | 'legislation';

const KETE_BY_SLUG = Object.fromEntries(KETES.map((k) => [k.slug, k])) as Record<
  KeteSlug,
  (typeof KETES)[number]
>;

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

function AgentCard({
  agent,
  index,
  selected,
  onToggle,
}: {
  agent: Agent;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const kete = KETE_BY_SLUG[agent.kete];
  return (
    <motion.article
      layout
      initial={{ opacity: 0.6, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className={`relative flex h-full flex-col overflow-hidden rounded-card border bg-white/55 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(43,107,87,0.10)] ${
        selected
          ? 'border-[color:var(--assembl-sage-mist)] ring-2 ring-[color:var(--assembl-sage-mist)]'
          : 'border-[rgba(35,33,31,0.10)]'
      }`}
      style={{ ['--kete-accent' as string]: kete.accent }}
    >
      {/* Subtle accent bleed on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background: `radial-gradient(circle, ${kete.accent} 0%, transparent 70%)`,
        }}
      />

      {/* Kete badge */}
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: kete.accent }}
          aria-hidden
        />
        <Link
          href={`/kete/${kete.slug}`}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          {kete.name} · {kete.industry}
        </Link>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-3xl text-[color:var(--text-primary)]">{agent.name}</h3>
        <span className="rounded-full border border-[rgba(43,107,87,0.28)] bg-[rgba(43,107,87,0.08)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
          Live
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-[color:var(--text-secondary)]">{agent.role}</p>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[color:var(--text-body)]">
        {agent.oneLiner}
      </p>

      {agent.legislation.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {agent.legislation.slice(0, 3).map((law) => (
            <span
              key={law}
              className="rounded-full border border-[rgba(35,33,31,0.12)] bg-white/60 px-2.5 py-1 font-mono text-[10px] text-[color:var(--text-secondary)]"
            >
              § {law}
            </span>
          ))}
        </div>
      )}

      {/* Buying options */}
      <div className="mt-5 grid gap-1.5 border-t border-[rgba(35,33,31,0.08)] pt-4 text-xs text-[color:var(--text-body)]">
        {agent.buyingOptions.subscribe && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
              Subscribe
            </span>
            <Check
              className="h-3.5 w-3.5 text-[color:var(--assembl-sage-mist)]"
              aria-hidden
            />
          </div>
        )}
        {agent.buyingOptions.perOutput !== null && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
              Per output
            </span>
            <span className="font-mono text-xs">from NZ${agent.buyingOptions.perOutput}</span>
          </div>
        )}
        {agent.buyingOptions.perResolution !== null && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
              Per resolution
            </span>
            <span className="font-mono text-xs">NZ${agent.buyingOptions.perResolution}</span>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className={`mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-all ${
          selected
            ? 'border-[color:var(--assembl-sage-mist)] bg-[color:var(--assembl-sage-mist)] text-[color:var(--assembl-paper)]'
            : 'border-[rgba(35,33,31,0.18)] bg-white/40 text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]'
        }`}
        aria-pressed={selected}
      >
        {selected ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Added
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" aria-hidden />
            Add agent
          </>
        )}
      </button>
    </motion.article>
  );
}
