import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, IBM_Plex_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { CommandPalette } from '@/components/site/CommandPalette';
import { KeteAccentProvider } from '@/components/KeteAccentContext';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'assembl — mahi that earns its proof',
    template: '%s · assembl',
  },
  description:
    'assembl runs operational compliance work in the open: every workflow is grounded in New Zealand legislation, reviewed by a named person on your team, and sealed with an evidence pack you can file, forward, or footnote.',
  metadataBase: new URL('https://assembl.co.nz'),
  openGraph: {
    title: 'assembl — mahi that earns its proof',
    description:
      'Specialist agents. Human review. Evidence packs.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
    images: [
      {
        url: '/og/og-assembl.png',
        width: 1200,
        height: 630,
        alt: 'assembl — Mahi that earns its proof. Specialist agents. Human review. Evidence packs.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — mahi that earns its proof',
    description: 'Specialist agents. Human review. Evidence packs.',
    images: ['/og/og-assembl.png'],
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
    <html lang="en-NZ" className={`${cormorant.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--assembl-pounamu)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-[#FAF7F2] focus:shadow-brand focus:outline-none focus:ring-2 focus:ring-[color:var(--assembl-pounamu)] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <KeteAccentProvider>
          <ScrollProgress />
          <CommandPalette />
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
