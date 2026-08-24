'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, DatabaseZap, Scale, ShieldCheck } from 'lucide-react';
import type { RegulatoryPulseStats } from '@/lib/regulatory-pulse';

interface LivePulseWidgetProps {
  initial: RegulatoryPulseStats;
  compact?: boolean;
}

export function LivePulseWidget({ initial, compact = false }: LivePulseWidgetProps) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/regulatory-pulse', { cache: 'no-store' });
        if (!res.ok) return;
        setStats((await res.json()) as RegulatoryPulseStats);
      } catch {
        // Keep the previous known-good pulse.
      }
    };

    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const active = !stats.degraded && stats.liveSources > 0;

  return (
    <aside
      aria-label="Live knowledge pulse"
      className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#FFF7EC]/86 shadow-[0_24px_76px_rgba(35,33,31,0.10)] backdrop-blur"
    >
      <div className="border-b border-[rgba(35,33,31,0.10)] bg-white/46 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="relative flex h-3 w-3"
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  active ? 'animate-ping bg-[color:var(--assembl-pounamu)] opacity-35' : 'bg-[color:var(--text-secondary)] opacity-20'
                }`}
              />
              <span
                className="relative inline-flex h-3 w-3 rounded-full"
                style={{ background: active ? 'var(--assembl-pounamu)' : 'var(--text-secondary)' }}
              />
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              source status
            </p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            {formatTime(stats.capturedAt)}
          </p>
        </div>
        <h3 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-light leading-[0.95] text-[color:var(--text-primary)]">
          Live sources are connected.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          PCO legislation and trusted NZ feeds are checked on schedule. Relevant
          updates can be retrieved by reviewed tools before they draft.
        </p>
      </div>

      <div className={compact ? 'grid grid-cols-2 gap-px bg-[rgba(35,33,31,0.08)]' : 'grid gap-px bg-[rgba(35,33,31,0.08)] md:grid-cols-4'}>
        <PulseMetric icon={Activity} value={stats.changesLastDay} label="updates · 24h" />
        <PulseMetric icon={ShieldCheck} value={stats.liveSources} label="active feeds" />
        <PulseMetric icon={DatabaseZap} value={stats.embeddedChunks} label="retrieval chunks" />
        <PulseMetric icon={Scale} value={stats.pcoSources} label="PCO Acts" />
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <p className="text-xs leading-relaxed text-[color:var(--text-body)]">
          {stats.pendingEmbeds > 0
            ? `${stats.pendingEmbeds.toLocaleString('en-NZ')} source items are being prepared for retrieval.`
            : `${stats.totalDocuments.toLocaleString('en-NZ')} source documents are available for retrieval.`}
          {stats.staleSources > 0
            ? ` ${stats.staleSources.toLocaleString('en-NZ')} feeds are flagged for review.`
            : ' All active sources are fresh.'}
        </p>
        <Link
          href="/regulatory-pulse"
          className="inline-flex h-9 w-fit items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/58 px-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[color:var(--text-primary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]"
        >
          open live watch
          <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}

function PulseMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Activity;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-[#FFF7EC] p-4">
      <Icon className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <p className="mt-4 font-display text-4xl font-light leading-none tabular-nums text-[color:var(--assembl-pounamu)]">
        {value === 0 ? '-' : value.toLocaleString('en-NZ')}
      </p>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function formatTime(iso: string): string {
  return (
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso)) + ' NZT'
  );
}
