'use client';

import { useEffect, useState } from 'react';

/**
 * Customer-readable "live regulation" proof block for the home page.
 *
 * Pulls live counts from /api/regulatory-pulse and frames them as the
 * customer-facing so-what: every draft is checked against current NZ
 * government sources before it's written. No timestamps-with-seconds, no
 * dev language, no news headlines — just the proof number and the payoff.
 */
type Pulse = {
  liveSources: number;
  totalDocuments: number;
  changesLastDay: number;
};

function useNZFormat(n: number | null): string {
  if (n === null) return '—';
  return new Intl.NumberFormat('en-NZ').format(n);
}

export function LiveRegulationBlock() {
  const [pulse, setPulse] = useState<Pulse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/regulatory-pulse', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) {
          setPulse({
            liveSources: d.liveSources ?? 0,
            totalDocuments: d.totalDocuments ?? 0,
            changesLastDay: d.changesLastDay ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Only show live numbers once we have a healthy reading. If the pulse is
  // unavailable we fall back to the same claim without counts — never "0".
  const hasData = !!pulse && pulse.liveSources > 0;
  const sources = useNZFormat(hasData ? pulse!.liveSources : null);
  const documents = useNZFormat(hasData ? pulse!.totalDocuments : null);
  const changes = hasData ? pulse!.changesLastDay : null;

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="glass-card mx-auto max-w-4xl p-8 text-center sm:p-12">
          <p className="inline-flex items-center justify-center gap-2 font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--assembl-pounamu)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--assembl-pounamu)]" />
            </span>
            Live NZ regulation
          </p>
          <h2 className="mt-5 font-display text-display-md font-light leading-[1.02]">
            Checked against current law. Updated today.
          </h2>
          {hasData ? (
            <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-[color:var(--text-body)]">
              Every assembl draft is checked against {sources} live New Zealand government sources — the
              NZ Gazette, the PCO Legislation API, Beehive releases, WorkSafe enforcement and more —
              before it’s written. Yesterday, {new Intl.NumberFormat('en-NZ').format(changes!)}{' '}
              {changes === 1 ? 'change was' : 'changes were'} captured. The agent that drafts your reply
              has read them all.
            </p>
          ) : (
            <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-[color:var(--text-body)]">
              Every assembl draft is checked against current New Zealand government sources — the NZ
              Gazette, the PCO Legislation API, Beehive releases, WorkSafe enforcement and more —
              before it’s written. The agent that drafts your reply has read them all.
            </p>
          )}
          <p className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            {hasData && (
              <>
                <span className="text-[color:var(--text-primary)]">{sources} live sources</span>
                <span aria-hidden>·</span>
                <span className="text-[color:var(--text-primary)]">{documents} source documents</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>Updated overnight</span>
          </p>
        </div>
      </div>
    </section>
  );
}
