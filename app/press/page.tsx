import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { MotionAssetView } from '@/components/brand/MotionAssetView';
import { FEATURED_ASSET_ID, getMotionAsset } from '@/lib/brand/motion-assets';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';

export const metadata: Metadata = {
  title: 'Press kit',
  description: 'Logos, wordmarks, and brand assets for media use.',
};

export default function PressPage() {
  const featured = getMotionAsset(FEATURED_ASSET_ID);

  return (
    <>
      <section className="relative overflow-hidden py-24 lg:py-28">
        <PatternBackdrop
          className="absolute inset-0"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="container relative z-10">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
              Media
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.03em] text-[color:var(--assembl-pounamu)]">
              Press kit
            </h1>
            <p className="mt-4 max-w-2xl text-body-md text-[color:var(--text-body)]">
              Logos, wordmarks, and brand assets for media use. Please
              attribute as &quot;assembl&quot; (lowercase). For interviews or commentary, email{' '}
              <a
                href="mailto:assembl@assembl.co.nz"
                className="text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
              >assembl@assembl.co.nz</a>
              .
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
      <section className="mt-12">
        <h2 className="font-display text-display-sm">Wordmarks</h2>
        <div className="mt-6 grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl">assembl wordmark</h3>
            <Image
              src="/img/press/assembl-wordmark.png"
              alt="assembl wordmark"
              width={600}
              height={200}
              className="mt-4 rounded-md bg-[#FFF7EC] p-8"
            />
            <a
              href="/img/press/assembl-wordmark.png"
              download
              className="mt-2 inline-block text-sm underline underline-offset-2"
            >
              Download PNG
            </a>
          </div>
          <div>
            <h3 className="font-display text-2xl">tōro wordmark</h3>
            <Image
              src="/img/press/toro-wordmark.png"
              alt="tōro wordmark"
              width={600}
              height={200}
              className="mt-4 rounded-md bg-[#FFF7EC] p-8"
            />
            <a
              href="/img/press/toro-wordmark.png"
              download
              className="mt-2 inline-block text-sm underline underline-offset-2"
            >
              Download PNG
            </a>
          </div>
        </div>
      </section>

      {featured && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-display-sm">3D motion</h2>
              <p className="mt-3 max-w-2xl text-body-md text-[color:var(--text-body)]">
                Interactive 3D scenes from the assembl Spline library. Free to embed
                in editorial coverage with attribution to &quot;assembl&quot;
                (lowercase).
              </p>
            </div>
            <Link
              href="/press/motion"
              className="shrink-0 text-sm underline underline-offset-2"
            >
              See all motion assets →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr] md:items-start">
            <MotionAssetView asset={featured} />
            <div className="space-y-3 text-sm text-[color:var(--text-body)]">
              <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                {featured.name}
              </p>
              <p>{featured.description}</p>
              {featured.kind === 'glb' && (
                <a
                  href={featured.src}
                  download
                  className="inline-block underline underline-offset-2"
                >
                  Download .glb
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="font-display text-display-sm">One-page pitch</h2>
        <p className="mt-3 max-w-2xl text-body-md text-[color:var(--text-body)]">
          A printable one-pager covering the headline, kete, pricing, and contact
          details.
        </p>
        <a
          href="/downloads/assembl-one-page-pitch.pdf"
          className="mt-3 inline-block text-sm underline underline-offset-2"
        >
          Download PDF
        </a>
      </section>
      </main>
    </>
  );
}
