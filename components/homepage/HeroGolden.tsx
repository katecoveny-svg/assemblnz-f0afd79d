'use client';

/**
 * HeroGolden — the homepage hero, marketplace direction.
 *
 * Editorial gallery split: the left half is the text (left-aligned), the right
 * half is Kate's golden-spheres Three.js scene, framed as a plate. Below the
 * split sits a thin pricing strip.
 *
 * The WebGL scene (GoldenScene) is dynamically imported with `ssr: false` —
 * Three.js + WebGL cannot run on the server. On coarse-pointer or sub-720px
 * viewports, or when the visitor prefers reduced motion, we never mount the
 * scene at all and show a static snapshot instead (public/images/hero/
 * golden-scene-static.jpg). That keeps phones cheap and respects motion prefs.
 *
 * The scene reads its own container's dimensions (ResizeObserver + clientWidth/
 * clientHeight in GoldenScene), so it sits happily inside the right-half plate.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Lato, Space_Mono } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

// Headline set in Lato 900, the Dash brand display weight, in charcoal.
const lato = Lato({ subsets: ['latin'], weight: ['400', '900'], display: 'swap' });
// Eyebrow set in Space Mono, matching the marketplace surfaces.
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' });

const CANARY = '#FFD42A';
const CHARCOAL = '#3A3832';

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
      sizes="(min-width: 1024px) 50vw, 100vw"
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

const PRICING = [
  '$15 per agent',
  '$50 for 5',
  '$90 for 10',
  '$250 all-access',
  'Free demo on every agent',
] as const;

export function HeroGolden() {
  const live = useLiveScene();

  return (
    <section className="border-b border-[rgba(58,56,50,0.10)] bg-white">
      <div className="container py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left — the text */}
          <div className="max-w-xl">
            <p
              className={`${spaceMono.className} text-[12px] uppercase tracking-[0.32em]`}
              style={{ color: CHARCOAL }}
            >
              Built in Aotearoa
            </p>

            <h1
              className={`${lato.className} mt-6 text-[clamp(2.6rem,5.6vw,4.75rem)] font-black leading-[0.98] tracking-[-0.02em]`}
              style={{ color: CHARCOAL }}
            >
              Specialist NZ agents.
              <br />
              One marketplace.
            </h1>

            <p className="mt-6 max-w-lg text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.55] text-[color:var(--text-body)]">
              An app store of agents tuned for New Zealand work — payroll, BCA
              submissions, GP notes, customs entries, family logistics. Install
              one. Or bundle five.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/agents"
                className="cta-charcoal inline-flex h-12 items-center gap-2 px-7 text-[15px]"
              >
                Browse the marketplace <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/how-it-works"
                className="btn-ghost inline-flex h-12 items-center px-6 text-[15px]"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Right — the golden-spheres scene, framed as a plate */}
          <div className="relative h-[340px] overflow-hidden rounded-[26px] border border-[rgba(58,56,50,0.12)] bg-[#FFFDE8] shadow-[0_30px_70px_rgba(58,56,50,0.10)] sm:h-[440px] lg:h-[clamp(460px,60vh,620px)]">
            {live === null ? (
              <StaticScene />
            ) : live ? (
              <GoldenScene className="h-full w-full" />
            ) : (
              <StaticScene />
            )}
          </div>
        </div>

        {/* Below the split — the pricing strip */}
        <div className="mt-12 border-t border-[rgba(58,56,50,0.10)] pt-6">
          <ul
            className={`${spaceMono.className} flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.14em]`}
            style={{ color: CHARCOAL }}
          >
            {PRICING.map((item, i) => (
              <li key={item} className="flex items-center gap-4">
                {i > 0 && (
                  <span aria-hidden style={{ color: CANARY }}>
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
