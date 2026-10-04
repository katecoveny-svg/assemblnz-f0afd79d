import { HOME_META } from '@/components/site/assembl-the-work/copy';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { GlobalNav, GlobalFooter } from '@/components/site/GlobalChrome';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { CommandPalette } from '@/components/site/CommandPalette';
import { AssemblConciergeWidget } from '@/components/site/AssemblConciergeWidget';
import { KeteAccentProvider } from '@/components/KeteAccentContext';
import { PwaRegister } from '@/components/site/PwaRegister';
import { PublicWatchFrame } from '@/components/site/watch/PublicWatchFrame';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  graph,
  organizationNode,
  websiteNode,
  softwareApplicationNode,
} from '@/lib/seo/schema';
import '@/lib/fonts/customer-fallbacks.css';
import './globals.css';
import './life.css';

// One current entity graph across the public site: assembl, website and DO.
const SITE_GRAPH = graph(
  organizationNode(),
  websiteNode(),
  softwareApplicationNode(),
);

export const dynamic = 'force-dynamic';

const instrumentDisplay = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const instrumentBody = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

// Retained only for legacy/editorial surfaces that still explicitly consume it.
// Current company UI remains Instrument Sans + IBM Plex Mono per brand canon.
const archivoBlack = localFont({
  src: '../lib/fonts/assets/archivo-black-normal-400.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-editorial',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Archivo Black Build Fallback'],
});

const CURRENT_DESCRIPTION =
  HOME_META.description;

export const metadata: Metadata = {
  title: {
    default: HOME_META.title,
    template: '%s · assembl',
  },
  description: CURRENT_DESCRIPTION,
  metadataBase: new URL('https://www.assembl.co.nz'),
  openGraph: {
    title: HOME_META.title,
    description: CURRENT_DESCRIPTION,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_META.title,
    description: CURRENT_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/icons/assembl-icon-32x32.png?v=glass-v1', sizes: '32x32', type: 'image/png' },
      { url: '/icons/assembl-icon-192x192.png?v=glass-v1', sizes: '192x192', type: 'image/png' },
      { url: '/icons/assembl-icon-512x512.png?v=glass-v1', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/assembl-icon-180x180.png?v=glass-v1',
    shortcut: '/icons/favicon.ico?v=glass-v1',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${instrumentDisplay.variable} ${instrumentBody.variable} ${plexMono.variable} ${archivoBlack.variable}`}>
      <body>
        <JsonLd data={SITE_GRAPH} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--assembl-deep-plum)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-[color:var(--assembl-paper)] focus:shadow-brand focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2"
        >
          Skip to main content
        </a>
        <KeteAccentProvider>
          <ScrollProgress />
          <CommandPalette />
          <AssemblConciergeWidget />
          <PwaRegister />
          <PublicWatchFrame>
            <GlobalNav />
            <main id="main-content" className="relative z-10 flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>
            <GlobalFooter />
          </PublicWatchFrame>
        </KeteAccentProvider>
      </body>
    </html>
  );
}
