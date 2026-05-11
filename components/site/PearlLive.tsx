'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { PearlLiveStats } from '@/lib/pearl-live';

interface PearlLiveProps {
  initial: PearlLiveStats;
}

interface CountSpec {
  key: keyof Omit<PearlLiveStats, 'capturedAt' | 'degraded'>;
  value: number;
  label: string;
  sublabel: string;
}

/**
 * PearlLive — homepage live counters.
 * Spec: voyage-evidence-craft.md follow-up. "Right now, X packs are being
 * drafted across Aotearoa. Y sealed in the last hour. Z outcomes today."
 *
 * Restrained on purpose. No badges, no green up-arrows, no exclamation
 * marks. The numbers are large and quiet; the labels are small and
 * specific. Counts animate up on mount (count-up) and refresh every 30s.
 */
export function PearlLive({ initial }: PearlLiveProps) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/pearl-live', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as PearlLiveStats;
        setStats(next);
      } catch {
        // Quiet — keep the prior snapshot.
      }
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const counts: CountSpec[] = [
    {
      key: 'draftingNow',
      value: stats.draftingNow,
      label: 'drafting now',
      sublabel: 'evidence packs in draft across Aotearoa',
    },
    {
      key: 'sealedLastHour',
      value: stats.sealedLastHour,
      label: 'sealed · last hour',
      sublabel: 'packs hash-chained and verifiable',
    },
    {
      key: 'positiveOutcomesToday',
      value: stats.positiveOutcomesToday,
      label: 'positive outcomes today',
      sublabel: 'BCA accepts, Customs clears, invoices paid',
    },
    {
      key: 'draftsInReview',
      value: stats.draftsInReview,
      label: 'in human review',
      sublabel: 'awaiting a named reviewer’s signature',
    },
  ];

  return (
    <section
      aria-label="Pearl Live — live activity across Assembl"
      className="relative border-y border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)]"
    >
      <div className="container py-10 md:py-14">
        <div className="mb-6 flex items-center gap-3 md:mb-8">
          <PulseDot active={!stats.degraded && hasAnyActivity(stats)} />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            Pearl Live · activity across Aotearoa · captured {formatTime(stats.capturedAt)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10">
          {counts.map((c, i) => (
            <CounterCell key={c.key} spec={c} delay={i * 0.08} />
          ))}
        </div>

        {stats.degraded && (
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-tertiary,#8E8A82)]">
            Live ledger warming up — counters return as tenants come online
          </p>
        )}
      </div>
    </section>
  );
}

function CounterCell({ spec, delay }: { spec: CountSpec; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <CountUp value={spec.value} />
      <p
        className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: 'var(--assembl-pounamu, #2B6B57)' }}
      >
        {spec.label}
      </p>
      <p className="mt-2 max-w-[26ch] text-[12px] leading-relaxed text-[color:var(--text-secondary)]">
        {spec.sublabel}
      </p>
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setN(0);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(value * eased));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span
      className="font-display tabular-nums tracking-tight"
      style={{
        fontWeight: 300,
        fontSize: 'clamp(3rem, 6vw, 4.6rem)',
        lineHeight: 1,
        color: 'var(--text-primary, #23211F)',
      }}
    >
      {value === 0 ? '—' : n.toLocaleString('en-NZ')}
    </span>
  );
}

function PulseDot({ active }: { active: boolean }) {
  if (!active) {
    return (
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: '#8E8A82' }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="relative inline-flex h-2 w-2"
    >
      <span
        className="absolute inset-0 animate-ping rounded-full opacity-60"
        style={{ background: 'var(--assembl-pounamu, #2B6B57)' }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: 'var(--assembl-pounamu, #2B6B57)' }}
      />
    </span>
  );
}

function hasAnyActivity(stats: PearlLiveStats): boolean {
  return (
    stats.draftingNow > 0 ||
    stats.sealedLastHour > 0 ||
    stats.positiveOutcomesToday > 0 ||
    stats.draftsInReview > 0
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
