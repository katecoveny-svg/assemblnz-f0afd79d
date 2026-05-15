'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { MessageCircle } from 'lucide-react';
import { agentsForKete, groupedAgentsByPhase } from '@/lib/agents';
import { INDUSTRY_KETES, type KeteSlug } from '@/lib/kete';

export function IndustryPackFleetPicker() {
  const [selected, setSelected] = useState<KeteSlug>('waihanga');
  const kete = INDUSTRY_KETES.find((item) => item.slug === selected) ?? INDUSTRY_KETES[0];
  const groups = useMemo(() => groupedAgentsByPhase(agentsForKete(selected)), [selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {INDUSTRY_KETES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setSelected(item.slug)}
            className={[
              'flex w-full items-center justify-between rounded-[8px] border px-4 py-3 text-left transition-colors',
              selected === item.slug
                ? 'border-[color:var(--text-primary)] bg-white'
                : 'border-[rgba(35,33,31,0.12)] bg-white/50 hover:bg-white',
            ].join(' ')}
          >
            <span>
              <span className="block font-display text-2xl font-light leading-none">
                {item.name}
              </span>
              <span className="mt-1 block text-xs text-[color:var(--text-secondary)]">
                {item.industry}
              </span>
            </span>
            <span
              aria-hidden
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.accent }}
            />
          </button>
        ))}
      </aside>

      <section
        className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-5 md:p-6"
        style={{ '--kete-accent': kete.accent } as CSSProperties}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--kete-accent)]">
              {kete.industry}
            </p>
            <h3 className="mt-2 font-display text-4xl font-light leading-none">
              {kete.name}
            </h3>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            {groups.reduce((sum, group) => sum + group.agents.length, 0)} agents
          </p>
        </div>

        <div className="mt-7 space-y-7">
          {groups.map((group) => (
            <div key={group.phase}>
              <div className="mb-3 flex items-center gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  {group.label}
                </p>
                <div className="h-px flex-1 bg-[rgba(35,33,31,0.10)]" />
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.agents.map((agent) => (
                  <article
                    key={`${group.phase}-${agent.slug}`}
                    className="flex min-h-[150px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[rgba(250,247,242,0.72)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-2xl font-light leading-none">
                          {agent.name}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                          {agent.role}
                        </p>
                      </div>
                      {agent.status === 'draft' ? (
                        <span className="rounded-full border border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.10)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--assembl-gold-thread)]">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                      {agent.oneLiner}
                    </p>
                    <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--kete-accent)]">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                      {agent.status === 'draft' ? 'Coming soon' : 'Live'}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
