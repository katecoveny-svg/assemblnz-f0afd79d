'use client';

import { useMemo, useState } from 'react';
import type { KeteSlug } from '@/lib/kete';
import { KETES } from '@/lib/kete';
import type { Workflow } from '@/lib/workflows';
import { WorkflowCard } from './WorkflowCard';

type SortMode = 'most-installed' | 'newest' | 'time-saved';

export function MarketplaceClient({
  workflows,
  initialKete = 'all',
}: {
  workflows: Workflow[];
  initialKete?: 'all' | KeteSlug;
}) {
  const [query, setQuery] = useState('');
  const [kete, setKete] = useState<'all' | KeteSlug>(initialKete);
  const [sort, setSort] = useState<SortMode>('most-installed');

  const visibleWorkflows = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    return workflows
      .filter((workflow) => kete === 'all' || workflow.kete === kete)
      .filter((workflow) => {
        if (!normalised) return true;
        return `${workflow.title} ${workflow.description}`.toLowerCase().includes(normalised);
      })
      .sort((a, b) => {
        if (sort === 'time-saved') return b.timeSavedMin - a.timeSavedMin;
        if (sort === 'newest') return a.slug.localeCompare(b.slug);
        return b.runsThisMonth - a.runsThisMonth;
      });
  }, [kete, query, sort, workflows]);

  return (
    <>
      <div className="mt-12 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 p-4 backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="sr-only" htmlFor="workflow-search">
            Search workflows
          </label>
          <input
            id="workflow-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workflows..."
            className="h-12 rounded-full border border-[rgba(35,33,31,0.14)] bg-white/78 px-5 text-base outline-none transition focus:border-[color:var(--assembl-pounamu)] focus:ring-2 focus:ring-[rgba(43,107,87,0.14)]"
          />
          <label className="sr-only" htmlFor="workflow-sort">
            Sort workflows
          </label>
          <select
            id="workflow-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="h-12 rounded-full border border-[rgba(35,33,31,0.14)] bg-white/78 px-5 text-sm outline-none"
          >
            <option value="most-installed">Most installed</option>
            <option value="newest">Newest</option>
            <option value="time-saved">Time saved</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setKete('all')}
            className={chipClass(kete === 'all')}
          >
            All
          </button>
          {KETES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setKete(item.slug)}
              className={chipClass(kete === item.slug)}
              title={`${item.name}: ${item.englishName}. ${item.meaning}.`}
            >
              {item.name} · {item.englishName}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleWorkflows.map((workflow) => (
          <WorkflowCard key={workflow.slug} workflow={workflow} />
        ))}
      </div>
    </>
  );
}

function chipClass(active: boolean) {
  return [
    'h-10 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.14em] transition',
    active
      ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-[#FAF7F2]'
      : 'border-[rgba(35,33,31,0.14)] bg-white/68 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
  ].join(' ');
}
