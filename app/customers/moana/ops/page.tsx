import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * MOANA — concept ops landing.
 *
 * Same "main event" treatment TOA uses: intro copy left, the LIVE Tide &
 * Weather chat right. Below it, bento cards for the six sections. Everything
 * is illustrative and honest — the chat never fabricates live conditions; it
 * points at the official source (MetService Marine, LINZ, MPI).
 */

const SECTIONS: Array<{
  href: string;
  label: string;
  blurb: string;
}> = [
  {
    href: 'forecast',
    label: 'Forecast',
    blurb: 'Read the marine forecast — wind, swell, visibility — and jump to the live source.',
  },
  {
    href: 'tides',
    label: 'Tides',
    blurb: 'How to read a LINZ tide prediction: highs, lows, spring vs neap.',
  },
  {
    href: 'catch-log',
    label: 'Catch log',
    blurb: 'Log the day’s catch with the Catch Log agent, plus a sample logbook.',
  },
  {
    href: 'knots',
    label: 'Knots',
    blurb: 'The essential knots — bowline, cleat hitch, uni, blood knot, Palomar.',
  },
  {
    href: 'hot-spots',
    label: 'Hot spots',
    blurb: 'Read structure, current and bait — and respect rāhui and marine reserves.',
  },
  {
    href: 'safety',
    label: 'Safety',
    blurb: 'Lifejackets, two forms of comms, log a trip report, VHF Ch 16.',
  },
];

export default function MoanaOpsHome() {
  const config = getBrandConfig('moana');
  if (!config) notFound();
  const base = '/customers/moana/ops';

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />

      {/* The main event: Tide & Weather is live. Ask it anything — it streams a
          real, sourced draft and links the official source; nothing sends. */}
      <section className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-stretch">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">
            ask moana — live
          </p>
          <h1
            className="mt-2 text-3xl font-semibold leading-tight text-[color:var(--brand-surface)]"
            style={{ fontFamily: 'var(--font-brand-display)' }}
          >
            The sea, read for you.
          </h1>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Moana is built on two live assembl agents — Tide &amp; Weather and Catch Log. Ask about
            the marine forecast, tides, a bar crossing, a knot, or the rules. It answers with its
            sources, it never fabricates live conditions, and it points you at the official source.
            It drafts rather than decides — nothing books, nothing sends.
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
            Concept demo. Not a real product or customer. For real decisions on the water, always
            check the official source and use your own judgement.
          </p>
        </div>
        <MoanaChat />
      </section>

      {/* Bento cards → the six sections. */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={`${base}/${s.href}`}
            className="group rounded-2xl border border-[#bfa37a]/40 p-5 transition"
            style={{
              background:
                'linear-gradient(180deg, rgba(242,239,230,0.10), rgba(242,239,230,0.04))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 12px 32px rgba(10,42,67,0.18)',
            }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-surface)]"
              style={{ fontFamily: 'var(--font-brand-display)' }}
            >
              {s.label}
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
              {s.blurb}
            </p>
            <span className="mt-3 inline-block text-[11px] text-[#1E7A8C] group-hover:underline">
              Open →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
