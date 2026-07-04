import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, Lato } from 'next/font/google';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { getBrandConfig } from '@/lib/brand/configs';
import { FilmHero } from '@/components/ops/toa/FilmHero';
import { ViewerFrame } from '@/components/ops/toa/ViewerFrame';
import { CapabilityTray } from '@/components/ops/toa/CapabilityTray';
import { IntegrationsOrbit } from '@/components/ops/toa/IntegrationsOrbit';
import { toaOrbitTools } from '@/lib/customers/toa-architects/demo-data';

/**
 * /demo/toa-architects — the TOA × ARC concept hub.
 *
 * Kate's Enhanced BIM viewer for 16A Hubert Henderson Place, Remuera, IS the
 * demo (embedded verbatim — every AUP/Building Code clause and Te Aranga
 * principle untouched). assembl chrome around it per DIRECTION-LOCKED:
 * Cormorant display, Lato body, champagne gold. ARC rides the viewer as a
 * chat overlay; the six jobs dock below; the integrations orbit closes the
 * operating-system story. Full console: /customers/toa-architects/ops.
 *
 * Framing per the vertical-AI strategy (2026-05-09): ARC is the
 * consent-verifier of the twin-run verification engine — the viewer's
 * PASS / CHECK / NEEDS SPEC table is exactly "verified mode".
 *
 * Auth: this route stays open for the basic-auth + magic-link middleware to
 * pick up (per the brief); noindex like every pitch surface.
 */
export const metadata: Metadata = {
  title: 'TOA × assembl — ARC concept demo',
  robots: { index: false, follow: false },
};

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' });

const CHAMPAGNE = '#bfa37a';

export default function ToaArchitectsDemoHub() {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  return (
    // BrandThemeProvider supplies the --brand-* CSS vars the chat panel and
    // integrations orbit read — without it they render transparent.
    <BrandThemeProvider config={config}>
    <div className={`${lato.className} min-h-screen`} style={{ backgroundColor: '#eff1ee', color: '#161516' }}>
      {/* assembl chrome */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-10">
        {/* the global SiteHeader already carries the assembl wordmark */}
        <span className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#6f6f64' }}>
          toa architects × arc · concept demo
        </span>
        <span
          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
          style={{ borderColor: CHAMPAGNE, color: '#8a744f' }}
        >
          concept · not affiliated with TOA Architects Ltd
        </span>
      </header>

      <main className="flex flex-col gap-8 px-6 pb-14 md:px-10">
        {/* the film — Kate's render of the finished house */}
        <FilmHero />

        {/* title band */}
        <div className="max-w-3xl">
          <h1 className={`${cormorant.className} lowercase text-4xl leading-tight md:text-5xl`}>
            16A hubert henderson place · remuera
          </h1>
          <p className={`${lato.className} mt-3 max-w-2xl text-sm leading-relaxed`} style={{ color: '#363a35' }}>
            residential build, four units. arc is running the consent, spec and
            site reports.
          </p>
        </div>

        {/* the interactive audit — Kate's viewer, verbatim */}
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
              The interactive audit
            </h2>
            <span className="text-xs" style={{ color: '#6f6f64' }}>
              AUP H4 + Building Code, checked against the geometry — every
              claim cites its clause
            </span>
          </div>
          <ViewerFrame />
        </div>

        {/* the six jobs */}
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
              What ARC does — six jobs, all drafts
            </h2>
            <span className="text-xs" style={{ color: '#6f6f64' }}>
              each card opens the job&apos;s actual output
            </span>
          </div>
          <CapabilityTray />
        </div>

        {/* the operating-system story */}
        <IntegrationsOrbit tools={toaOrbitTools} />

        {/* onward */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-6 py-5">
          <p className="text-sm" style={{ color: '#363a35' }}>
            The full operating console — Monday queue, consents ledger, fees,
            site visits — lives one door over.
          </p>
          <Link
            href="/customers/toa-architects/ops"
            className="rounded-full px-5 py-2 text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: '#161516' }}
          >
            open the console →
          </Link>
        </div>
      </main>

      <footer className="border-t border-black/10 px-6 py-4 text-center text-[11px] md:px-10" style={{ color: '#6f6f64' }}>
        what a TOA × assembl operating system could look like · 16A facts from
        the draft RC + April pre-checks · activity and figures are demo ·
        draft-mode enforced — nothing lodges, nothing sends ·{' '}
        <span style={{ color: '#8a744f' }}>assembl</span> · Kate Hudson
      </footer>
    </div>
    </BrandThemeProvider>
  );
}
