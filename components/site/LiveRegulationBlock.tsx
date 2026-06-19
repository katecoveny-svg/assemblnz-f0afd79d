'use client';

import { useEffect, useState } from 'react';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';
import { ShaderGradient } from '@/components/site/ShaderGradient';

/**
 * Live regulation — the dark pounamu proof bar.
 *
 * The one dark moment on the home page (Whenua pounamu #2B6B57, cream text),
 * anchored by a single big stat. The number is the proof: every draft is
 * checked against current NZ government sources before it's written.
 *
 * The big number always shows. When the live pipeline is healthy we use the
 * live source count from /api/regulatory-pulse (and add the live document and
 * change figures beneath it). When the pulse is quiet — local dev, or a
 * degraded database — we fall back to the standing count of government sources
 * assembl watches (see lib/watched-sources). We never invent document totals:
 * those only appear when the live data backs them.
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

  // The live pipeline is "healthy" once it reports sources. When it is, the big
  // number and the supporting document/change figures are all live. When it
  // isn't, the big number falls back to the standing count of sources we watch
  // — an honest figure — and we drop the document line rather than fake it.
  const live = !!pulse && pulse.liveSources > 0;
  const sourceCount = live ? pulse!.liveSources : WATCHED_SOURCE_COUNT;

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-pounamu)] py-24 text-[color:var(--assembl-paper)] lg:py-32">
      {/* Signature flowing-gradient, dark variant — the same live motion as the
          hero, kept deep-pounamu so the cream text stays legible. Falls back to
          the flat pounamu background if WebGL is unavailable. */}
      <ShaderGradient variant="dark" className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
      {/* Pounamu wash to tame the brightest filaments under the centred text. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[color:var(--assembl-pounamu)]/35"
      />
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

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center justify-center gap-2 font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--assembl-paper)]/75">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--assembl-gold-thread)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--assembl-gold-thread)]" />
            </span>
            Live NZ regulation
          </p>

          {/* The big number — always present. Live source count when the
              pipeline is healthy, the standing count of watched sources when
              it is quiet. */}
          <p className="mt-10 font-display font-light leading-[0.86] tracking-[-0.02em] text-[color:var(--assembl-paper)] text-[clamp(5rem,15vw,11rem)]">
            {nz(sourceCount)}
          </p>
          <p className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-light leading-tight text-[color:var(--assembl-paper)]/92">
            New Zealand government and authority sources, watched in real time.
          </p>
          <p className="mx-auto mt-7 max-w-2xl text-body-md leading-relaxed text-[color:var(--assembl-paper)]/80">
            Every assembl draft is checked against them — the NZ Gazette, the PCO Legislation API,
            Beehive releases, WorkSafe enforcement and more — before it&apos;s written. The agent that
            drafts your reply has read them all.
          </p>

          {/* Supporting figures only appear when live data backs them — never
              fabricated document totals. */}
          {live ? (
            <p className="mx-auto mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)]/70">
              <span className="text-[color:var(--assembl-paper)]">{nz(pulse!.totalDocuments)} source documents</span>
              <span aria-hidden className="text-[color:var(--assembl-gold-thread)]">·</span>
              <span className="text-[color:var(--assembl-paper)]">
                {nz(pulse!.changesLastDay)} {pulse!.changesLastDay === 1 ? 'change' : 'changes'} yesterday
              </span>
              <span aria-hidden className="text-[color:var(--assembl-gold-thread)]">·</span>
              <span>Updated overnight</span>
            </p>
          ) : (
            <p className="mx-auto mt-9 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)]/70">
              Updated overnight
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
