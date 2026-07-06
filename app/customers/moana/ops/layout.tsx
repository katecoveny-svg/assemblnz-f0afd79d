import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { getBrandConfig } from '@/lib/brand/configs';
import {
  ASSEMBL_GOLD,
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  MatarikiCluster,
  ParticulateBackdrop,
} from '@/components/assembl/chrome';

export const metadata: Metadata = {
  title: 'Moana — the sea, read for you (concept pilot) · assembl',
  description:
    'Concept pilot: a NZ recreational boating & fishing assistant built on assembl’s live Tide & Weather and Catch Log agents. Draft-only — it reads the sea and links the official source; nothing books, nothing sends.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * MOANA workspace shell — self-contained (does NOT use OpsShell, so the nav
 * can be boating-specific: Forecast · Tides · Catch log · Knots · Hot spots ·
 * Safety). Same layer stack as the other pilots:
 *
 *   1. assembl OS chrome — paper white, particulate art, lowercase wordmark.
 *   2. Customer surface — deep-sea-navy shell with foam/sand paper cards.
 *   3. Customer accent — safety-orange in exactly two places (the primary CTA
 *      and the live status dot). Never dominant.
 *
 * Concept-demo framing throughout; draft-only; nothing sends or books.
 */
export default function MoanaOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('moana');
  if (!config) notFound();

  const nav = config.nav ?? [];
  const base = '/customers/moana/ops';

  return (
    <BrandThemeProvider config={config}>
      <div className="min-h-screen bg-[color:var(--brand-bg)] text-[color:var(--brand-ink)] font-[family-name:var(--font-brand-body)]">
        <header className="flex items-center gap-4 border-b border-white/10 bg-[color:var(--brand-bg)] px-6 py-3">
          <Link href={base} className="flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: 'rgba(30,122,140,0.22)' }}
              aria-hidden
            >
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path
                  d="M4 24c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4"
                  stroke="#1E7A8C"
                  strokeWidth="2.5"
                />
                <path
                  d="M4 31c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4"
                  stroke="#6E93A6"
                  strokeWidth="2.5"
                />
              </svg>
            </span>
            <span
              className="text-base font-semibold tracking-[0.14em] text-[color:var(--brand-surface)]"
              style={{ fontFamily: 'var(--font-brand-display)' }}
            >
              Moana
            </span>
          </Link>
          <span className="text-[11px] lowercase tracking-[0.08em] text-[color:var(--brand-muted)]">
            {config.taglines?.primary}
          </span>
          <span
            className="ml-auto rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
            style={{ background: 'rgba(225,98,47,0.16)', color: '#F2EFE6' }}
          >
            concept demo
          </span>
        </header>

        <div className="grid grid-cols-12 gap-6 px-6 py-6">
          <aside className="col-span-12 md:col-span-2">
            <nav className="sticky top-6 flex flex-col gap-1 text-sm">
              <Link
                href={base}
                className="rounded-md px-3 py-2 text-[color:var(--brand-muted)] transition-colors hover:bg-white/5 hover:text-[color:var(--brand-surface)]"
              >
                Overview
              </Link>
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={`${base}/${n.href}`}
                  className="rounded-md px-3 py-2 text-[color:var(--brand-muted)] transition-colors hover:bg-white/5 hover:text-[color:var(--brand-surface)]"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="col-span-12 flex flex-col gap-6 md:col-span-10">
            {children}
          </main>
        </div>

        {/* assembl signature band — paper white regardless of tenant palette. */}
        <footer
          className="relative overflow-hidden border-t border-black/5 px-6 pt-12 text-center"
          style={{
            backgroundColor: ASSEMBL_PAPER,
            color: ASSEMBL_INK,
            paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))',
          }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-4">
            <MatarikiCluster size={30} gold />
            <AssemblMotto />
            <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
              <AssemblWordmark /> × Moana · concept pilot · Aotearoa
              <span style={{ color: ASSEMBL_GOLD }}> ·</span>
            </span>
          </div>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
