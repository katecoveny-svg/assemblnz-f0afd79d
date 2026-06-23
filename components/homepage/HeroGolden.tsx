'use client';

/**
 * HeroGolden — the homepage hero. Kate's golden-spheres Three.js scene fills the
 * section; the brand headline + CTAs + trust row sit on top.
 *
 * The WebGL scene (GoldenScene) is dynamically imported with `ssr: false` —
 * Three.js + WebGL cannot run on the server. On coarse-pointer or sub-720px
 * viewports, or when the visitor prefers reduced motion, we never mount the
 * scene at all and show a static snapshot instead (public/images/hero/
 * golden-scene-static.jpg). That keeps phones cheap and respects motion prefs.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Lato } from 'next/font/google';
import { ArrowRight } from 'lucide-react';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';

// The headline is set in Lato 900, the Dash brand display weight, charcoal.
const lato = Lato({ subsets: ['latin'], weight: ['400', '900'], display: 'swap' });

const GoldenScene = dynamic(() => import('@/components/homepage/GoldenScene'), {
  ssr: false,
  loading: () => <StaticScene />,
});

// Static snapshot of the scene — also the loading state and the mobile /
// reduced-motion fallback.
function StaticScene() {
  return (
    <Image
      src="/images/hero/golden-scene-static.jpg"
      alt=""
      fill
      priority
      sizes="100vw"
      className="select-none object-cover"
    />
  );
}

/**
 * Decide once, on mount, whether this device should run the live scene.
 * Returns null until measured so SSR markup matches the static fallback and we
 * never hydrate a mismatched tree.
 */
function useLiveScene(): boolean | null {
  const [live, setLive] = useState<boolean | null>(null);
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = window.matchMedia('(max-width: 719px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLive(!coarse && !small && !reduced);
  }, []);
  return live;
}

export function HeroGolden() {
  const live = useLiveScene();

  return (
    <section className="relative isolate overflow-hidden bg-[#FFFDE8]">
      {/* Scene layer — fills the hero, sits behind the copy. */}
      <div className="absolute inset-0 -z-10">
        {live === null ? <StaticScene /> : live ? <GoldenScene className="h-full w-full" /> : <StaticScene />}
        {/* Cream scrim: keeps the charcoal headline legible over the bright
            cluster on the left, fades to clear so the spheres show on the right. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#FFFDE8_0%,rgba(255,253,232,0.86)_34%,rgba(255,253,232,0.35)_58%,transparent_78%)]"
        />
      </div>

      <div className="container relative flex min-h-[82vh] flex-col justify-center py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
            Built in Aotearoa
          </p>

          {/* Pointer-events-none so the cursor falls through to the scene. */}
          <h1
            className={`${lato.className} pointer-events-none mt-5 text-[clamp(2.75rem,8.5vw,7rem)] font-black leading-[0.92] tracking-[-0.02em] text-[#23211F]`}
          >
            Less admin.
            <br />
            More mahi.
          </h1>

          <p className="mt-6 max-w-xl text-[clamp(1.15rem,2vw,1.4rem)] font-medium leading-[1.5] text-[color:var(--text-primary)]">
            assembl ships HAPAI — a library of single-purpose NZ tools that get one ordinary job
            done, draft-only, with a downloadable evidence pack.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/agents" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
              Browse the agents <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/hapai" className="btn-ghost inline-flex h-12 items-center px-6">
              Try a free tool
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[rgba(43,107,87,0.18)] pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
              {WATCHED_SOURCE_COUNT} NZ government sources watched
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
              Every output signed off
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
