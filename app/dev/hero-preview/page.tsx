import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroVideo } from '@/components/HeroVideo';
import { heroVideos, type HeroVideoKey } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Hero video preview',
  description: 'Internal — preview /components/HeroVideo with the locked heroVideos map.',
  robots: { index: false, follow: false },
};

// Reads heroVideos at request time; never prerender.
export const dynamic = 'force-dynamic';

/**
 * Internal preview page. Lets Kate eyeball every entry in the heroVideos map
 * side-by-side as the per-route MP4s come back from vessel-studio. Production
 * traffic 404s; only renders in dev.
 *
 * The brief asked for `app/(marketing)/_dev/hero-preview/page.tsx`, but
 * Next.js App Router treats `_`-prefixed folders as private (excluded from
 * routing) — so a runtime gate would never run. Path adapted to a flat
 * `app/dev/hero-preview/` with a hard 404 outside development.
 */
export default function HeroPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const entries = Object.entries(heroVideos) as [HeroVideoKey, (typeof heroVideos)[HeroVideoKey]][];

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          dev · hero-preview
        </p>
        <h1
          className="mt-4 font-display leading-[0.95] tracking-tight"
          style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          HeroVideo · all routes
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-body)]">
          Visual check of every <code className="font-mono">heroVideos</code> entry. Toggle
          DevTools → Rendering → Emulate CSS prefers-reduced-motion → reduce to verify the
          poster fallback. Resize to &lt;768px to verify mobile drops to poster-only.
        </p>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {entries.map(([key, entry]) => (
            <article
              key={key}
              className="overflow-hidden rounded-card border border-[rgba(35,33,31,0.12)] bg-white/40"
            >
              <div className="relative aspect-video overflow-hidden">
                {entry.src ? (
                  <HeroVideo
                    src={entry.src}
                    posterSrc={entry.poster}
                    label={`Hero preview · ${key}`}
                  />
                ) : (
                  <img
                    src={entry.poster}
                    alt={`${key} poster (no MP4 yet)`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="border-t border-[rgba(35,33,31,0.08)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                  {key}
                </p>
                <p className="mt-1 font-mono text-[10px] text-[color:var(--text-secondary)]">
                  src: {entry.src ? '✓ MP4' : '— (poster only)'}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Smoke test: deliberately broken URL → onError fallback should show poster. */}
        <section className="mt-16">
          <h2 className="font-display text-2xl text-[color:var(--text-primary)]">
            Error-fallback smoke test
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-body)]">
            Below, the <code className="font-mono">src</code> points at a non-existent MP4.
            The component should swap to the poster image after the load error fires.
          </p>
          <div className="relative mt-4 aspect-video overflow-hidden rounded-card border border-[rgba(35,33,31,0.12)] bg-white/40">
            <HeroVideo
              src="https://pub.hyperagent.com/api/published/_does_not_exist_/broken.mp4"
              posterSrc={heroVideos['pilot-sprint'].poster}
              label="Broken-URL fallback test"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
