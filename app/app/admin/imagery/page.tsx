import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Code2, Film, Images, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Imagery guide',
  description: 'Where assembl homepage, kete, hero, and vessel imagery is controlled.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const IMAGE_MAP = [
  {
    title: 'Current image source of truth',
    body: 'Hero vessels, kete square images, wide kete images, and hero video posters are mapped in lib/site-config.ts.',
    href: '/app/admin/imagery#source-map',
    cta: 'Read source map',
    icon: Code2,
  },
  {
    title: 'Generate new vessels',
    body: 'Use Vessel Studio to create new visual assets, size them, and prepare route-specific imagery.',
    href: '/dashboard/vessel-studio',
    cta: 'Open vessel studio',
    icon: Palette,
  },
  {
    title: 'Check page video/posters',
    body: 'The heroVideos map controls which route has an MP4 and which route falls back to a poster. The dev-only preview is /dev/hero-preview.',
    href: '/app/admin/imagery#source-map',
    cta: 'Read video map',
    icon: Film,
  },
  {
    title: 'See the public result',
    body: 'The homepage carousel pulls the wide image for the active kete and the kete pages use the same visual canon.',
    href: '/',
    cta: 'Open homepage',
    icon: Images,
  },
] as const;

export default async function ImageryGuidePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/login?redirect=/app/admin/imagery');
  }

  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    redirect('/app/admin');
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/app/admin"
          className="inline-flex items-center font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          Back to admin
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            imagery / source of truth
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.8rem)] font-light leading-[0.92]">
            Update the visuals without guessing.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            Most public imagery is not scattered through the app. It is mapped centrally,
            then reused by homepage, kete pages, hero previews, and the footer.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {IMAGE_MAP.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-5 shadow-[0_10px_32px_rgba(35,33,31,0.06)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
              >
                <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
                <h2 className="mt-4 font-display text-3xl font-light leading-none">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {item.body}
                </p>
                <span className="mt-5 inline-flex items-center font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </section>

        <section id="source-map" className="mt-10 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.56)] p-5">
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            Practical rule
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
            To replace a homepage or kete image, update the matching URL in
            <code className="mx-1 font-mono">lib/site-config.ts</code>. To create a new asset,
            open Vessel Studio first, generate or size the image, then paste the final hosted URL
            back into the map.
          </p>
        </section>
      </div>
    </main>
  );
}
