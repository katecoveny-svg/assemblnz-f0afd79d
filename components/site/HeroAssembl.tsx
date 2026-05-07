import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BOTTOM_LABELS = ['signal in', 'evidence held', 'decision out', 'trail kept'];

export function HeroAssembl() {
  return (
    <section className="relative bg-[color:var(--assembl-paper)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src="/img/hero/waihanga-vessel-cream.jpg"
          alt="Sculptural pounamu evidence vessel — silk-organza bloom on a cream backdrop."
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,247,242,0) 0%, rgba(250,247,242,0.55) 65%, rgba(250,247,242,1) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-6 pb-20 md:-mt-24 md:px-12 md:pb-28">
        <div className="max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            assembl · quiet intelligence
          </p>

          <h1
            className="mt-6 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
          >
            quiet intelligence for Aotearoa
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            New Zealanders use AI everywhere. Few of us trust what it does. assembl runs every
            workflow in the open and ends each one with an evidence pack you can file, forward,
            or footnote.
          </p>

          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
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

        <ul
          className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-6 md:mt-20 md:grid-cols-4 md:gap-x-10"
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
