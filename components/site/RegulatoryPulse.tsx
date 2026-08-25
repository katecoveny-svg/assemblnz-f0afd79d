'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RegulatoryPulseStats } from '@/lib/regulatory-pulse';
import { LivePulseWidget } from './LivePulseWidget';

interface RegulatoryPulseProps {
  initial: RegulatoryPulseStats;
}

export function RegulatoryPulse({ initial }: RegulatoryPulseProps) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/regulatory-pulse', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as RegulatoryPulseStats;
        setStats(next);
      } catch {
        // Quiet: keep the previous snapshot.
      }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label="Live regulatory pulse"
      className="border-b border-[rgba(35,33,31,0.08)] bg-white/54"
    >
      <div className="container grid gap-10 py-12 md:grid-cols-[0.78fr_1.22fr] md:py-16">
        <div>
          <div className="flex items-center gap-3">
            <PulseDot active={!stats.degraded && stats.liveSources > 0} />
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Live NZ source check · updated {formatTime(stats.capturedAt)}
            </p>
          </div>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(2.4rem,5vw,4.6rem)] font-normal leading-tight text-[color:var(--text-primary)]">
            Checked against current New Zealand sources.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
            assembl checks PCO legislation and trusted NZ government feeds before
            drafting. When a source changes, it is logged and made available to
            the tools and kete that have permission to use it.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <LivePulseWidget initial={stats} compact />
          <div className="space-y-3">
            {stats.latest.length > 0 ? (
              stats.latest.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FFF7EC] p-4"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-pounamu)]">
                      {item.changeType}
                    </p>
                    <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                      {formatDate(item.detectedAt)}
                    </p>
                  </div>
                  <h3 className="mt-2 text-sm font-medium leading-snug text-[color:var(--text-primary)]">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                      {item.sourceName}
                    </p>
                    {item.sourceUrl ? (
                      <Link
                        href={item.sourceUrl}
                        className="inline-flex items-center font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]"
                      >
                        Source
                        <ArrowRight className="ml-1.5 h-3 w-3" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FFF7EC] p-5">
                <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
                  Source checks are running. New legislation and regulator updates
                  will appear here as they are found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PulseDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: active ? 'var(--assembl-pounamu)' : 'var(--text-secondary)' }}
    />
  );
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso)) + ' NZST';
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));
}
