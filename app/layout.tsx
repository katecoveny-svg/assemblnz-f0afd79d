import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans, Archivo_Black } from 'next/font/google';
import { GlobalNav, GlobalFooter } from '@/components/site/GlobalChrome';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { CommandPalette } from '@/components/site/CommandPalette';
import { AssemblConciergeWidget } from '@/components/site/AssemblConciergeWidget';
import { KeteAccentProvider } from '@/components/KeteAccentContext';
import { PwaRegister } from '@/components/site/PwaRegister';
import { PublicWatchFrame } from '@/components/site/watch/PublicWatchFrame';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, organizationNode, personNode, websiteNode, softwareApplicationNode } from '@/lib/seo/schema';
import './globals.css';
import './life.css';

// Site-wide current entity graph. Historical concepts such as dash/rewarded
// wait states are deliberately not emitted as current Organisations/products.
const SITE_GRAPH = graph(
  organizationNode(),
  personNode(),
  websiteNode(),
  softwareApplicationNode(),
);

export const dynamic = 'force-dynamic';

const instrumentDisplay = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' });
const instrumentBody = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono', display: 'swap' });

// Legacy/editorial surfaces may still consume this variable. It is not part of
// current company typography and should not be used as new Assembl precedent.
const archivoBlack = Archivo_Black({ subsets: ['latin'], weight: ['400'], variable: '--font-editorial', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'assembl — find it. DO it. show it.', template: '%s · assembl' },
  description: 'Pursuit finds evidence-backed work. DO is the portable agent workforce that gets it moving. Studio turns the result into proof, pitches and experiences. One shared context and factory underneath.',
  metadataBase: new URL('https://www.assembl.co.nz'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'assembl — find it. DO it. show it.',
    description: 'Pursuit finds the work. DO gets it moving. Studio makes it tangible.',
    type: 'website', locale: 'en_NZ', url: 'https://www.assembl.co.nz', siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — find it. DO it. show it.',
    description: 'One shared system for signals, portable agents, execution and proof.',
  },
  icons: {
    icon: [
      { url: '/icons/assembl-icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/assembl-icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/assembl-icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/assembl-icon-180x180.png', shortcut: '/icons/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${instrumentDisplay.variable} ${instrumentBody.variable} ${plexMono.variable} ${archivoBlack.variable}`}>
      <body>
        <JsonLd data={SITE_GRAPH} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--assembl-deep-plum)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-[color:var(--assembl-paper)] focus:shadow-brand focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2">Skip to main content</a>
        <KeteAccentProvider>
          <ScrollProgress />
          <CommandPalette />
          <div className="hidden md:block"><AssemblConciergeWidget /></div>
          <PwaRegister />
          <PublicWatchFrame>
            <GlobalNav />
            <main id="main-content" className="relative z-10 flex-1 outline-none" tabIndex={-1}>{children}</main>
            <GlobalFooter />
          </PublicWatchFrame>
        </KeteAccentProvider>
      </body>
    </html>
  );
}
