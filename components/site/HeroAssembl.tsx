import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BOTTOM_LABELS = ['signal in', 'evidence held', 'decision out', 'trail kept'];

const VESSEL_HERO_SRC = '/img/kete/toro-vessel.png';

export function HeroAssembl() {
  return (
    <section className="relative bg-[color:var(--assembl-paper)]">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-12 md:pb-24 md:pt-16 lg:pt-20">
        {/* Editorial two-column on tablet+ — image left, text right.
            Stacked on mobile (image first, text below) for natural reading order. */}
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-14">
          {/* HERO IMAGE — capped 6 cols on tablet, 7 on desktop. NEVER full viewport. */}
          <div className="md:col-span-6 lg:col-span-7">
            <div className="relative aspect-[4/3] max-h-[80vh] w-full max-w-[540px] overflow-hidden rounded-sm md:aspect-[5/4] lg:aspect-square">
              <Image
                src={VESSEL_HERO_SRC}
                alt="Evidence Vessel — sculptural stack of cream ceramic and pounamu green glass on a slim gold stand."
                fill
                priority
                sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* TEXT — right column, headline + lede + CTAs all above the fold. */}
          <div className="md:col-span-6 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              assembl evidence vessel · Built in Aotearoa
            </p>

            <h1
              className="mt-5 font-display leading-[0.98] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 4.4vw, 4.5rem)' }}
            >
              Mahi that earns its proof.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-[color:var(--text-body)] md:mt-7 md:text-lg">
              assembl runs operational compliance work in the open: every workflow is grounded
              in New Zealand legislation, reviewed by a named person on your team, and sealed
              with an evidence pack you can file, forward, or footnote.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row md:mt-9">
              <Link
                href="/pilot-sprint"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                Book a pilot
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/evidence-pack"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                See an evidence pack
              </Link>
            </div>
          </div>
        </div>

        {/* EVIDENCE PILLARS — full-width band below the hero grid. */}
        <ul
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 md:mt-20 md:grid-cols-4 md:gap-x-10"
          aria-label="evidence pillars"
        >
          {BOTTOM_LABELS.map((label) => (
            <li key={label} className="flex flex-col gap-3">
              <span
                aria-hidden
                className="block h-px w-full"
                style={{ backgroundColor: 'var(--assembl-pounamu)', opacity: 0.55 }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-primary)]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
