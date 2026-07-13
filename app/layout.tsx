import type { Metadata } from 'next';
import { Cormorant_Garamond, Lato, Space_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { CommandPalette } from '@/components/site/CommandPalette';
import { AssemblConciergeWidget } from '@/components/site/AssemblConciergeWidget';
import { KeteAccentProvider } from '@/components/KeteAccentContext';
import { PwaRegister } from '@/components/site/PwaRegister';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  graph,
  organizationNode,
  dashOrganizationNode,
  personNode,
  websiteNode,
  softwareApplicationNode,
} from '@/lib/seo/schema';
import './globals.css';

// Site-wide entity graph — assembl (Organization), dash (sibling brand), Kate
// Hudson (Person / founder), the WebSite, and the Living Site product. Emitted
// on every page so answer engines read one consistent set of entity signals.
const SITE_GRAPH = graph(
  organizationNode(),
  dashOrganizationNode(),
  personNode(),
  websiteNode(),
  softwareApplicationNode(),
);

// Next 16/Turbopack currently trips a prerender workStore invariant across
// unrelated static routes in this app. Keep this branch on the dynamic path so
// deploys stay reliable while the public-site rebuild is in flight.
export const dynamic = 'force-dynamic';

// Site type system (assembl canon, CANON-LOCKED-2026-06-23):
//   Display / wordmark / headlines → Cormorant Garamond (serif). NOT Lato.
//   Body / UI / buttons             → Lato.
//   Labels / eyebrows / mono        → Space Mono.
// Exposed as the --font-* tokens so the whole token-driven site adopts them.
// The /agents marketplace and /dash sibling brand scope their OWN Lato display
// face (--mk-display / --font-dash-sans), so Cormorant never leaks into them —
// dash keeps its Lato 900 wordmark, which is where the two brands diverge.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'assembl — a Living Site for your New Zealand business. Less admin. More mahi.',
    template: '%s · assembl',
  },
  description:
    'One connected website, customer desk, Business Genome and set of approval-led workflows for your New Zealand business. Built in Aotearoa.',
  metadataBase: new URL('https://www.assembl.co.nz'),
  alternates: { canonical: '/' },
  // og:image comes from the file-convention opengraph-image.tsx per route
  // (new-direction art) — do not pin a static image here or it wins over them.
  openGraph: {
    title: 'assembl — a Living Site for your New Zealand business. Less admin. More mahi.',
    description:
      'A connected website, customer desk, Business Genome and approval-led workflows. Your business stays in control.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — a Living Site for your New Zealand business. Less admin. More mahi.',
    description:
      'A connected website, customer desk, Business Genome and approval-led workflows. Built in Aotearoa.',
  },
  icons: {
    icon: [
      { url: '/icons/assembl-icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/assembl-icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/assembl-icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/assembl-icon-180x180.png',
    shortcut: '/icons/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${cormorant.variable} ${lato.variable} ${spaceMono.variable}`}>

      <body>
        <JsonLd data={SITE_GRAPH} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--assembl-pounamu)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-[#FFF7EC] focus:shadow-brand focus:outline-none focus:ring-2 focus:ring-[color:var(--assembl-pounamu)] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <KeteAccentProvider>
          <ScrollProgress />
          <CommandPalette />
          <div className="hidden md:block">
            <AssemblConciergeWidget />
          </div>
          <PwaRegister />
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="relative z-10 flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </KeteAccentProvider>
      </body>
    </html>
  );
}
