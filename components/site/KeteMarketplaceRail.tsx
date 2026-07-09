'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Agent } from '@/lib/agents';
import type { Kete } from '@/lib/kete';
import { KETE_VESSEL_IMAGES } from '@/lib/brand-tokens';

export function KeteMarketplaceRail({ kete, agents }: { kete: Kete; agents: Agent[] }) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    event.currentTarget.scrollBy({
      left: event.key === 'ArrowRight' ? 260 : -260,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/kete/${kete.slug}`}
          className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Image
            src={KETE_VESSEL_IMAGES[kete.slug]}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-sm object-cover transition hover:opacity-90"
          />
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-none text-[color:var(--text-primary)]">
              <span lang="mi">{kete.name}</span>
            </h2>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              {kete.englishName} · {kete.meaning}
            </p>
          </div>
        </Link>
        <Link
          href={`/kete/${kete.slug}`}
          className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)] sm:inline-flex"
        >
          View this pack
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex gap-4 overflow-x-auto pb-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        aria-label={`${kete.name} ${kete.englishName} specialist agents`}
      >
        {agents.map((agent) => (
          <Link
            key={`${kete.slug}-${agent.slug}`}
            href={`/agents/${agent.slug}`}
            className="group relative flex h-[280px] w-[220px] shrink-0 flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/65 transition duration-200 hover:-translate-y-1 hover:shadow-card-hover focus-visible:-translate-y-1 focus-visible:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            <span className="absolute left-0 top-0 h-1.5 w-16" style={{ backgroundColor: kete.accent }} />
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                {agent.phase ?? 'fleet'}
              </p>
              <h3 className="mt-3 line-clamp-2 font-display text-3xl leading-none text-[color:var(--text-primary)]">
                {agent.name}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                {agent.oneLiner}
              </p>
            </div>
            <div className="relative mt-auto h-[42%] overflow-hidden">
              <Image
                src={KETE_VESSEL_IMAGES[kete.slug]}
                alt=""
                fill
                sizes="220px"
                className="object-cover transition duration-300 group-hover:scale-105 group-focus-visible:scale-105"
              />
              <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--assembl-paper)] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                Run a demo
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
