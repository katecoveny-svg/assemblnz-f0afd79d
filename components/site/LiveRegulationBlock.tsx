'use client';

import { useEffect, useState } from 'react';

/**
 * Live regulation — the dark pounamu proof bar.
 *
 * The one dark moment on the home page (Whenua pounamu #2B6B57, cream text),
 * anchored by a single big stat pulled live from /api/regulatory-pulse. The
 * number is the proof: every draft is checked against current NZ government
 * sources before it's written. No timestamps-with-seconds, no dev language —
 * just the count, the payoff, and an honest fallback when the pulse is quiet.
 */
type Pulse = {
  liveSources: number;
  totalDocuments: number;
  changesLastDay: number;
};

function nz(n: number): string {
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

  // Only show the big number once we have a healthy reading. If the pulse is
  // unavailable we keep the claim without a fabricated figure — never "0".
  const hasData = !!pulse && pulse.liveSources > 0;

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-pounamu)] py-24 text-[color:var(--assembl-paper)] lg:py-32">
      {/* Hairline gold threads top and bottom — the only gold on the page. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,168,83,0.55),transparent)]" aria-hidden />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,168,83,0.55),transparent)]" aria-hidden />
      {/* Soft interior bloom so the flat green has depth. */}
      <span
        className="pointer-events-none absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-32 -left-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.14),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center justify-center gap-2 font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--assembl-paper)]/75">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--assembl-gold-thread)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--assembl-gold-thread)]" />
            </span>
            Live NZ regulation
          </p>

          {hasData ? (
            <>
              <p className="mt-10 font-display font-light leading-[0.86] tracking-[-0.02em] text-[color:var(--assembl-paper)] text-[clamp(5rem,15vw,11rem)]">
                {nz(pulse!.liveSources)}
              </p>
              <p className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-light leading-tight text-[color:var(--assembl-paper)]/92">
                live New Zealand government sources, watched in real time.
              </p>
              <p className="mx-auto mt-7 max-w-2xl text-body-md leading-relaxed text-[color:var(--assembl-paper)]/80">
                Every assembl draft is checked against them — the NZ Gazette, the PCO Legislation API,
                Beehive releases, WorkSafe enforcement and more — before it&apos;s written. The agent that
                drafts your reply has read them all.
              </p>
              <p className="mx-auto mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)]/70">
                <span className="text-[color:var(--assembl-paper)]">{nz(pulse!.totalDocuments)} source documents</span>
                <span aria-hidden className="text-[color:var(--assembl-gold-thread)]">·</span>
                <span className="text-[color:var(--assembl-paper)]">
                  {nz(pulse!.changesLastDay)} {pulse!.changesLastDay === 1 ? 'change' : 'changes'} yesterday
                </span>
                <span aria-hidden className="text-[color:var(--assembl-gold-thread)]">·</span>
                <span>Updated overnight</span>
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-8 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-light leading-[1.04] text-[color:var(--assembl-paper)]">
                Checked against current law.
                <br />
                Updated today.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-[color:var(--assembl-paper)]/82">
                Every assembl draft is checked against current New Zealand government sources — the NZ
                Gazette, the PCO Legislation API, Beehive releases, WorkSafe enforcement and more —
                before it&apos;s written. The agent that drafts your reply has read them all.
              </p>
              <p className="mx-auto mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)]/70">
                Updated overnight
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
