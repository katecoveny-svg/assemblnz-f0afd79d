import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, IBM_Plex_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { ScrollProgress } from '@/components/site/scroll-progress';
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
    default: 'assembl — quiet intelligence for Aotearoa',
    template: '%s · assembl',
  },
  description:
    'Purpose-built intelligent agents that work alongside your team — citing NZ legislation, producing evidence packs, and waiting for your approval before anything ships. Built in Aotearoa.',
  metadataBase: new URL('https://assembl.co.nz'),
  openGraph: {
    title: 'assembl — less noise, more time',
    description:
      'Intelligent agents that draft, check, and document — so your team gets time back.',
    type: 'website',
    locale: 'en_NZ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'assembl — quiet intelligence for Aotearoa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — less noise, more time',
    description:
      'Intelligent agents that draft, check, and document — so your team gets time back.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
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
