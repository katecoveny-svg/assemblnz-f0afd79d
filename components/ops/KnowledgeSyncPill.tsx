'use client';

import { useEffect, useState } from 'react';

/**
 * "customs codes · last updated Xh ago" — the visible proof that the tariff
 * knowledge behind the workspace is a live daily sync, not static seed data.
 * Reads /api/knowledge/tariff-status (sync metadata only). While the source
 * has never synced or has gone stale, it says so instead of pretending —
 * family-pilot honesty over polish.
 */
export function KnowledgeSyncPill({
  label = 'customs codes',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<{
    loaded: boolean;
    hoursSinceSync: number | null;
    stale: boolean;
  }>({ loaded: false, hoursSinceSync: null, stale: false });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/knowledge/tariff-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setState({
          loaded: true,
          hoursSinceSync: typeof j.hoursSinceSync === 'number' ? j.hoursSinceSync : null,
          stale: j.stale === true || j.configured === false,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, hoursSinceSync: null, stale: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state.loaded) return null;

  const fresh = !state.stale && state.hoursSinceSync !== null;
  const when =
    state.hoursSinceSync === null
      ? 'sync pending'
      : state.hoursSinceSync < 1
        ? 'under an hour ago'
        : state.hoursSinceSync < 48
          ? `${Math.round(state.hoursSinceSync)}h ago`
          : `${Math.round(state.hoursSinceSync / 24)}d ago`;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm ${className}`}
      title={
        fresh
          ? 'nz-customs-tariff · Tier A · daily sync of the HS 2022 baseline + NZ Working Tariff effective dates'
          : 'nz-customs-tariff has not synced recently — tariff answers degrade to TRUST SCORE: UNAVAILABLE'
      }
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: fresh ? '#7BC47F' : '#C8622A' }}
      />
      {label} · {fresh ? `last updated ${when}` : when === 'sync pending' ? 'sync pending' : `stale · ${when}`}
      {fresh ? <span className="rounded-sm bg-white/15 px-1 font-semibold">A</span> : null}
    </span>
  );
}
