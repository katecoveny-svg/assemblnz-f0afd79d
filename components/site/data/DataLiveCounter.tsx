'use client';

/**
 * DataLiveCounter — the live proof bar for the /data (Data-as-a-Service) page.
 *
 * This counter IS the demo: it polls /api/regulatory-pulse on the same 60s
 * cadence as the home-page pulse and shows the real, current state of the
 * ingest. Honesty rules (mirrors lib/watched-sources.ts + the home page):
 *   - source count: live `liveSources` when the pipeline is healthy, else the
 *     canonical WATCHED_SOURCE_COUNT — a standing fact that is true even when
 *     the pulse is degraded.
 *   - document count: ONLY shown from the live pipeline. We never invent a
 *     document total, so when degraded we show the source count + the last
 *     successful check instead of a fabricated number.
 */

import { useEffect, useState } from 'react';
import { Activity, DatabaseZap, Radio, ShieldCheck } from 'lucide-react';
import type { RegulatoryPulseStats } from '@/lib/regulatory-pulse';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';

interface DataLiveCounterProps {
  initial: RegulatoryPulseStats;
}

export function DataLiveCounter({ initial }: DataLiveCounterProps) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/regulatory-pulse', { cache: 'no-store' });
        if (!res.ok) return;
        setStats((await res.json()) as RegulatoryPulseStats);
      } catch {
        // Keep the last known-good snapshot.
      }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const healthy = !stats.degraded && stats.liveSources > 0;
  const sourceCount = healthy ? stats.liveSources : WATCHED_SOURCE_COUNT;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-[#FAF7F2] shadow-[0_24px_76px_rgba(35,33,31,0.10)]">
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(35,33,31,0.10)] bg-white/55 px-5 py-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                healthy
                  ? 'animate-ping bg-[color:var(--assembl-pounamu)] opacity-35'
                  : 'bg-[color:var(--assembl-gold-thread)] opacity-25'
              }`}
            />
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{
                background: healthy
                  ? 'var(--assembl-pounamu)'
                  : 'var(--assembl-gold-thread)',
              }}
            />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
            {healthy ? 'live ingest' : 'source registry'}
          </p>
        </div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          checked {formatTime(stats.capturedAt)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-[rgba(35,33,31,0.08)] md:grid-cols-4">
        <Metric icon={Radio} value={sourceCount} label="NZ data sources" />
        <Metric
          icon={DatabaseZap}
          value={healthy ? stats.totalDocuments : null}
          label="documents indexed"
        />
        <Metric
          icon={Activity}
          value={healthy ? stats.changesLastDay : null}
          label="changes · 24h"
        />
        <Metric
          icon={ShieldCheck}
          value={healthy ? stats.embeddedChunks : null}
          label="retrieval chunks"
        />
      </dl>

      <p className="px-5 py-4 text-xs leading-relaxed text-[color:var(--text-body)]">
        {healthy ? (
          <>This bar reads straight from the live pipeline — the same feeds the API serves. It updates every minute.</>
        ) : (
          <>{sourceCount} NZ government and authority sources are on the watch list. Live document counts return as soon as the ingest reports in.</>
        )}
      </p>
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Activity;
  value: number | null;
  label: string;
}) {
  return (
    <div className="bg-[#FAF7F2] px-5 py-5">
      <Icon
        className="h-4 w-4 text-[color:var(--assembl-pounamu)]"
        aria-hidden
      />
      <dd className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-none text-[color:var(--text-primary)] tabular-nums">
        {value === null ? '—' : value.toLocaleString('en-NZ')}
      </dd>
      <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        {label}
      </dt>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return (
      new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(iso)) + ' NZST'
    );
  } catch {
    return 'just now';
  }
}
