import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BOTTOM_LABELS = ['signal in', 'evidence held', 'decision out', 'trail kept'];

// Evidence Vessel — locked canonical asset, hosted on pub.hyperagent.com.
// Material spec: matte cream ceramic top petal, three translucent pounamu green
// glass plates, cream ceramic base, slim gold metal stand. Aesop × Cereal aesthetic.
const VESSEL_HERO_SRC =
  'https://pub.hyperagent.com/api/published/pbf01KQZNN17F_QZ7P4QPVS1EWX8S1/4526e124-051e-4988-8a31-7fdb7e7848fe.png';

export function HeroAssembl() {
  return (
    <section className="relative bg-[color:var(--assembl-paper)]">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-12 md:pb-24 md:pt-16 lg:pt-20">
        {/* Editorial two-column on tablet+ — image left, text right.
            Stacked on mobile (image first, text below) for natural reading order. */}
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-14">
          {/* HERO IMAGE — capped 6 cols on tablet, 7 on desktop. NEVER full viewport. */}
          <div className="md:col-span-6 lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:aspect-[5/4] lg:aspect-[7/5]">
              <Image
                src={VESSEL_HERO_SRC}
                alt="Evidence Vessel — sculptural stack of cream ceramic and pounamu green glass on a slim gold stand."
                fill
                priority
                sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* TEXT — right column, headline + lede + CTAs all above the fold. */}
          <div className="md:col-span-6 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              assembl · quiet intelligence
            </p>

            <h1
              className="mt-5 font-display leading-[0.98] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 4.4vw, 4.5rem)' }}
            >
              quiet intelligence for Aotearoa
            </h1>

            <p className="mt-6 text-base leading-relaxed text-[color:var(--text-body)] md:mt-7 md:text-lg">
              New Zealanders use AI everywhere. Few of us trust what it does. assembl runs every
              workflow in the open and ends each one with an evidence pack you can file, forward,
              or footnote.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row md:mt-9">
              <Link
                href="#scroll-story"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                See it run on a real workflow
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                Read the evidence model
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
