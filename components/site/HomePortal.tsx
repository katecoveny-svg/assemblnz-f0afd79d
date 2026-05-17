'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import type { PearlLiveStats } from '@/lib/pearl-live';
import { AssemblConciergeWidget } from './AssemblConciergeWidget';
import { KeteRotator } from './KeteRotator';

interface HomePortalProps {
  ketes: Kete[];
  pearlLive: PearlLiveStats;
}

export function HomePortal({ ketes }: HomePortalProps) {
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const reduceMotion = useReducedMotion();
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F4EFE7_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,168,83,0.12),transparent_34%),linear-gradient(90deg,rgba(250,247,242,0.98)_0%,rgba(250,247,242,0.92)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF7F2] to-transparent" aria-hidden />
        <motion.div
          className="absolute inset-y-0 left-0 w-2 bg-[color:var(--kete-accent)]"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.7, 1] }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1500px] flex-col justify-center px-6 py-14 md:px-12 xl:px-20">
          <motion.div
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/72 px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
              Built in Aotearoa
            </p>
            <KeteRotator
              ketes={ketes}
              className="mt-6 md:mt-8"
              scale="immersive"
              activeSlug={activeSlug}
              onActiveSlugChange={setActiveSlug}
              actions={(
                <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
                  <Link
                    href="/pilot-sprint"
                    className="cta-primary inline-flex h-12 w-full items-center justify-center px-8 text-base sm:w-auto md:h-14"
                  >
                    Book a pilot
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/evidence-pack"
                    className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/62 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
                  >
                    See proof
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              )}
            />
          </motion.div>

          <div className="mt-12 max-w-5xl md:mt-16">
            <KeteSelector
              ketes={ketes}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <AssemblConciergeWidget />
      </div>
    </main>
  );
}

function KeteSelector({
  ketes,
  activeSlug,
  onSelect,
  reduceMotion,
}: {
  ketes: Kete[];
  activeSlug: KeteSlug;
  onSelect: (slug: KeteSlug) => void;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-9" aria-label="Choose a kete">
      {ketes.map((kete) => {
        const active = kete.slug === activeSlug;
        return (
          <motion.div
            key={kete.slug}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/kete/${kete.slug}`}
              onMouseEnter={() => onSelect(kete.slug)}
              onFocus={() => onSelect(kete.slug)}
              className={[
                'group block rounded-[8px] border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
                'min-h-[86px] py-3 md:min-h-[108px]',
                active
                  ? 'border-[color:var(--tile-accent)] bg-white shadow-[0_8px_24px_rgba(35,33,31,0.08)]'
                  : 'border-[rgba(35,33,31,0.12)] bg-white/45 hover:border-[color:var(--tile-accent)] hover:bg-white/75',
              ].join(' ')}
              aria-current={active ? 'true' : undefined}
            >
              <span
                className="relative mb-3 block h-12 w-full overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)]"
                aria-hidden
              >
                <Image
                  src={kete.heroImage}
                  alt=""
                  fill
                  sizes="170px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--tile-accent)]"
                  aria-hidden
                />
              </span>
              <span className="block font-display text-[1.18rem] font-light leading-none text-[color:var(--text-primary)] md:text-[1.35rem]">
                {kete.name}
              </span>
              <span className="mt-2 block text-[10px] leading-snug text-[color:var(--text-secondary)] md:text-[11px]">
                {kete.industry}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
